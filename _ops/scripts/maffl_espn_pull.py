# ============================================================
# MAFFL ESPN Weekly Pull
# VERSION: 0.3.2 (2026-09-29) - waiver claims grouped by ESPN processing run (not pickup times). 0.3.1: same-timestamp waivers fix. 0.3: full week: scores, top 3s, transactions,
#          stat-correction audit, next-week pairings, validation, inbox file.
#
# Runs two ways, same file:
#   * Google Colab: paste into a cell, click Run. Asks for cookies in private boxes.
#   * GitHub Actions (later): cookies come from encrypted repo secrets.
# Output = one "inbox" report shaped like the Results Engine (capture v2.2) reply,
# so everything downstream keeps working unchanged.
# ============================================================

WEEK = 3             # <-- the week to pull. (The Tuesday robot will work this out itself.)
YEAR = 2026
LEAGUES = {"Upper": 34467, "Lower": 1587593698}
WEEK1_TUESDAY = "2026-09-08"   # transactions for week W = the 7 days starting this Tuesday + 7*(W-1)
REPO_RAW = "https://raw.githubusercontent.com/maffl-commish/maffl/{branch}/{path}"

# ---------------------------------------------------------------- setup
import os, sys, subprocess
try:
    import espn_api  # noqa: F401
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "espn-api"], check=True)

import csv, io, difflib, urllib.request
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from zoneinfo import ZoneInfo
from espn_api.football import League

ET = ZoneInfo("America/New_York")
IN_COLAB = "google.colab" in sys.modules
WEEK = int(os.environ.get("MAFFL_WEEK", WEEK))

# ---------------------------------------------------------------- MAFFL team map
# Same table as capture v2.2. ESPN team name -> (Owner, Owner_ESPN, Tier)
TEAM_MAP = {
    "Bad Attitude Gang":          ("Mike Murello", "Michael Murello", "Upper"),
    "Marco Clair Kardiac Attack": ("David Murello", "David Murello / Michael Murello", "Upper"),
    "South Hills FunShiners":     ("BJ Funari", "Bryan Funari", "Upper"),
    "Jake's Jagoffs":             ("Jacob Nickman", "Jacob Nickman", "Upper"),
    "The Prodigal Sons":          ("Jon Murello/ Rick Simmons", "Jon Murello / Rick Simmons", "Upper"),
    "Mike Vicks Dog Sitting Co.": ("Braiden Snyder", "Braiden Snyder", "Upper"),
    "Happy Valley Hammer Time":   ("Tony Trozzo", "Tony Trozzo", "Upper"),
    "The Big Bang Theory":        ("Dan Reilly", "Daniel Reilly", "Upper"),
    "Reilly's Reindeer":          ("Joe Reilly", "Joseph Reilly", "Upper"),
    "Hadley's Comets":            ("Brian Murello/ Ron Murello", "Ron Murello", "Upper"),
    "Turkey Hat Conglomerate":    ("Ed Peters", "Edwin Peters", "Upper"),
    "Southside Shooters":         ("Jon Fetrow/ Casey Trozzo", "John Fetrow / Casey Trozzo", "Upper"),
    "Tommy Phamclub":             ("Sam Lavrinc", "Sam Lavrinc", "Lower"),
    "The Best in The 'Burgh":     ("Ben Funari", "Benjamin Funari", "Lower"),
    "Fightin Ferrets":            ("Todd Trozzo", "Todd Trozzo", "Lower"),
    "Tony's Talented Team":       ("Tony Brooks", "Tony Brooks", "Lower"),
    "Portly Primates":            ("Charles Lavrinc", "Charlie Lavrinc", "Lower"),
    "The V-Unit":                 ("Chris Johnson", "Chris Johnson", "Lower"),
    "Sarge's Squad":              ("Nick Yankovich", "Nick Yankovich", "Lower"),
    "Steel City Champyinz":       ("Dominic Nicastro", "Dominic Nicastro", "Lower"),
    "Camp Kes":                   ("Bob Keslar", "Bob Keslar / Bo Kes", "Lower"),
}
GHOST = "MAFFL Ghost"
TOP3_HEADER = ["Year","Week","Tier","Team","Owner","Rank","Player","Pos","Points"]

# ---------------------------------------------------------------- helpers
blocks, flags, notes = [], [], []     # blocks = reasons for BLOCKED; flags = look at it; notes = FYI
def block(m): blocks.append(m)
def flag(m):  flags.append(m)
def note(m):  notes.append(m)

def norm(s): return " ".join(str(s).replace("’", "'").split()).lower()
NORM_MAP = {norm(k): k for k in TEAM_MAP}
def is_ghost_name(name): return "ghost" in norm(name)

def D(x):  # exact 2-dp decimal, half-up
    return Decimal(repr(float(x))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
def fmt(x):  # gold style: 202.0 / 126.2 / 146.86
    s = f"{D(x):.2f}"
    return s[:-1] if s.endswith("0") else s

def owner_label(team):
    names = []
    for o in (getattr(team, "owners", None) or []):
        n = (f"{o.get('firstName','')} {o.get('lastName','')}".strip() or o.get("displayName","")) if isinstance(o, dict) else str(o)
        if n: names.append(n)
    return " / ".join(names) or "(no owner listed)"

_seen = set()
def team_key(team, tier):
    """ESPN team -> exact MAFFL team name (or GHOST). Maps by team name, never by owner label."""
    raw = str(team.team_name).strip()
    if is_ghost_name(raw): return GHOST
    key = NORM_MAP.get(norm(raw))
    if key is None:
        close = difflib.get_close_matches(norm(raw), NORM_MAP.keys(), n=1, cutoff=0.75)
        hint = f" Likely '{NORM_MAP[close[0]]}'." if close else ""
        msg = f"[UNMAPPED TEAM: \"{raw}\", tier {tier[0]}]{hint} Confirm, then update TEAM_MAP."
        if msg not in _seen: block(msg); _seen.add(msg)
        return raw
    if TEAM_MAP[key][2] != tier and ("tier", key) not in _seen:
        block(f"[TIER MISMATCH: {key} found in {tier}]"); _seen.add(("tier", key))
    lbl = owner_label(team)
    names = lambda s: {n.strip().lower() for n in s.split("/") if n.strip()}
    if names(lbl) != names(TEAM_MAP[key][1]) and ("lbl", key) not in _seen:
        _seen.add(("lbl", key))
        owner = TEAM_MAP[key][0]
        if (owner == "Braiden Snyder" and "funari" in lbl.lower()) or (owner == "BJ Funari" and "snyder" in lbl.lower()):
            flag(f"BRAIDEN/BJ ESPN MIX-UP: {key} is {owner}'s team but ESPN lists '{lbl}'. Credited to {owner} by team name.")
        else:
            note(f"{key}: ESPN owner label '{lbl}' (CSV keeps '{TEAM_MAP[key][1]}').")
    return key

def who(team_name):
    """(Owner, Owner_ESPN) for a MAFFL team name."""
    if team_name == GHOST: return (GHOST, GHOST)
    o = TEAM_MAP.get(team_name)
    return (o[0], o[1]) if o else ("??? " + team_name, "???")

def short_player(name):
    name = str(name).strip()
    if "D/ST" in name or " " not in name: return name
    first, rest = name.split(" ", 1)
    return f"{first[0]}. {rest}"

def fetch_repo_csv(path):
    local = os.path.join(os.getcwd(), path)
    if os.path.exists(local):                       # running inside the repo (GitHub robot)
        return list(csv.reader(open(local, encoding="utf-8-sig")))
    for branch in ("main", "master"):                # Colab: read the public repo
        try:
            with urllib.request.urlopen(REPO_RAW.format(branch=branch, path=path), timeout=20) as r:
                return list(csv.reader(io.StringIO(r.read().decode("utf-8-sig"))))
        except Exception:
            continue
    return None

# ---------------------------------------------------------------- cookies
ESPN_S2 = os.environ.get("ESPN_S2") or ""
SWID = os.environ.get("SWID") or ""
if not (ESPN_S2 and SWID):
    from getpass import getpass
    print("Paste each value, then press Enter. The box stays blank - that's normal.")
    ESPN_S2 = getpass("espn_s2: ").strip()
    SWID = getpass("SWID (keep the { } braces): ").strip()

# ---------------------------------------------------------------- reference files from the repo
gold_all = fetch_repo_csv("data/MAFFL_Matchups_NoConsolation.csv")
gold = [r for r in (gold_all or [])[1:] if r and r[0] == str(YEAR)]
sched_all = fetch_repo_csv("data/MAFFL_Schedule_2026_Upper.csv")
top3_gold_all = fetch_repo_csv("data/MAFFL_Top_Performers_2026.csv")
print(f"Repo reference loaded: gold {YEAR} rows {len(gold)} · Upper schedule rows "
      f"{len(sched_all) - 1 if sched_all else 0} · top-performer rows {len(top3_gold_all) - 1 if top3_gold_all else 0}")
if not gold_all: note("Couldn't load the gold CSV, so the stat-correction audit had nothing to compare to.")

# ---------------------------------------------------------------- pull
games = {}          # week -> list of (tier, playoff, home, home_score, away, away_score, decided)
top3, bench_facts = [], []
tx_lines, tx_bids, trade_count = [], [], 0
next_pairs = {"Upper": [], "Lower": []}
start = datetime.fromisoformat(WEEK1_TUESDAY).replace(tzinfo=ET) + timedelta(days=7 * (WEEK - 1))
end = start + timedelta(days=7)

for tier, lid in LEAGUES.items():
    try:
        lg = League(league_id=lid, year=YEAR, espn_s2=ESPN_S2, swid=SWID)
    except Exception as e:
        raise SystemExit(f"\nCould not open the {tier} league ({lid}). Cookies pasted wrong or expired?\nDetail: {e}")
    print(f"Connected: {tier} = '{lg.settings.name}' ({len(lg.teams)} teams)")
    by_id = {t.team_id: t for t in lg.teams}

    # 1) schedule: every week's scores, and whether ESPN has decided them
    raw = lg.espn_request.league_get(params={"view": "mMatchupScore"})
    for m in raw["schedule"]:
        wk = m["matchupPeriodId"]
        if "home" not in m or "away" not in m: continue
        h, a = by_id.get(m["home"]["teamId"]), by_id.get(m["away"]["teamId"])
        if not h or not a: continue
        hk, ak = team_key(h, tier), team_key(a, tier)
        if wk == WEEK + 1:
            next_pairs[tier].append((ak, hk))
        if wk > WEEK: continue
        games.setdefault(wk, []).append((tier, m.get("playoffTierType", "NONE") != "NONE",
                                         hk, m["home"].get("totalPoints", 0),
                                         ak, m["away"].get("totalPoints", 0),
                                         m.get("winner", "UNDECIDED") != "UNDECIDED"))

    # 2) box scores: top 3 starters per team
    for bx in lg.box_scores(WEEK):
        for side in ("home", "away"):
            t = getattr(bx, f"{side}_team")
            if not t or isinstance(t, int): continue
            k = team_key(t, tier)
            if k == GHOST: continue
            lineup = getattr(bx, f"{side}_lineup") or []
            starters = [p for p in lineup if p.slot_position not in ("BE", "IR")]
            bench = [p for p in lineup if p.slot_position == "BE"]
            if not starters:
                flag(f"[NEEDS TOP 3: {k}] ESPN box score had no starters."); continue
            best = sorted(starters, key=lambda p: -float(p.points))[:3]   # stable sort: ties keep ESPN order
            for i, p in enumerate(best, 1):
                top3.append([str(YEAR), str(WEEK), tier, k, TEAM_MAP.get(k, ("???",))[0], str(i),
                             short_player(p.name), getattr(p, "position", "") or "", fmt(p.points)])
            if bench:
                bb = max(bench, key=lambda p: float(p.points))
                if float(bb.points) > float(best[0].points):
                    bench_facts.append(f"{k}: benched {short_player(bb.name)} scored {fmt(bb.points)}, "
                                       f"more than any starter (best starter {fmt(best[0].points)})")

    # 3) transactions inside this week's window
    seen_acts, offset = set(), 0
    for _ in range(10):
        acts = lg.recent_activity(size=50, offset=offset)
        if not acts: break
        offset += len(acts)
        older = False
        for act in acts:
            when = datetime.fromtimestamp(act.date / 1000, tz=ET)
            if when < start: older = True; continue
            # Waivers all process at the same moment, so the timestamp alone isn't unique.
            sig = (act.date, tuple((getattr(t, "team_id", t), a, str(getattr(p, "name", p)), b)
                                   for (t, a, p, b) in act.actions))
            if when >= end or sig in seen_acts: continue
            seen_acts.add(sig)
            parts, team_name, sent = [], None, {}
            for (t, action, player, bid) in act.actions:
                pname = short_player(getattr(player, "name", player))
                tk = team_key(t, tier) if hasattr(t, "team_name") else str(t)
                if action == "TRADE_SENT":
                    sent[pname] = tk
                elif action == "TRADE_RECEIVED":
                    parts.append(f"TRADE {pname} ({sent.get(pname, '?')} → {tk})"); team_name = team_name or tk
                elif "ADDED" in action:
                    team_name = team_name or tk
                    if action == "WAIVER ADDED":
                        parts.append(f"ADD {pname} (${bid})"); tx_bids.append((int(bid or 0), tk, pname, tier))
                    else:
                        parts.append(f"ADD {pname} (FA)")
                elif action == "DROPPED":
                    team_name = team_name or tk; parts.append(f"DROP {pname}")
            if any(p.startswith("TRADE") for p in parts): trade_count += 1
            if parts:
                is_waiver = any("($" in p for p in parts)
                tx_lines.append((act.date, is_waiver, tier, when, f"{tier} · {team_name} · " + " | ".join(parts)))
        if older: break

# ---------------------------------------------------------------- build gold rows
def build_rows(week_games, wk):
    """Gold-format rows for one week: Upper, then Lower, Ghost last with computed par."""
    rows, par_info, ghost_game = [], None, None
    for tier in ("Upper", "Lower"):
        for (t, po, hk, hs, ak, as_, dec) in [g for g in week_games if g[0] == tier]:
            if GHOST in (hk, ak):
                ghost_game = (ak, as_, hs, po) if hk == GHOST else (hk, hs, as_, po); continue
            if D(hs) == D(as_): block(f"[TIE: {hk} vs {ak}, week {wk}]")
            w, ws, l, ls = (hk, hs, ak, as_) if D(hs) >= D(as_) else (ak, as_, hk, hs)
            rows.append([str(YEAR), str(wk), tier, str(po), "Regular", *who(w), w, fmt(ws), *who(l), l, fmt(ls)])
    lower_real = [D(s) for (t, po, hk, hs, ak, as_, dec) in week_games if t == "Lower"
                  for (k, s) in ((hk, hs), (ak, as_)) if k != GHOST]
    if ghost_game and lower_real:
        srt = sorted(lower_real, reverse=True)
        par = (sum(srt[1:]) / len(srt[1:])).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        real, rs, espn_gs, po = ghost_game
        par_info = (srt, srt[0], sum(srt[1:]), par, D(espn_gs))
        if D(rs) == par: block(f"[TIE: {real} vs 👻, week {wk}]")
        g = (GHOST, GHOST, GHOST)
        if D(rs) > par:
            rows.append([str(YEAR), str(wk), "Lower", str(po), "Ghost", *who(real), real, fmt(rs), *g, fmt(par)])
        else:
            rows.append([str(YEAR), str(wk), "Lower", str(po), "Ghost", *g, fmt(par), *who(real), real, fmt(rs)])
    return rows, par_info

this_games = games.get(WEEK, [])
if not this_games or not all(g[6] for g in this_games):
    open_games = sum(1 for g in this_games if not g[6])
    raise SystemExit(f"\nSTATUS: BLOCKED — Week {WEEK} isn't final on ESPN yet "
                     f"({open_games} of {len(this_games)} games undecided). Nothing written. Try again later.")
rows, par_info = build_rows(this_games, WEEK)

# ---------------------------------------------------------------- validation (capture v2.2 checks)
checks = []
def check(ok, label, blocking=True, why=""):
    checks.append(("✅ " if ok else "❌ ") + label + ("" if ok or not why else f" — {why}"))
    if not ok and blocking: block(f"[CHECK FAILED: {label}]")

up = [r for r in rows if r[2] == "Upper"]; lo = [r for r in rows if r[2] == "Lower"]
gh = [r for r in rows if r[4] == "Ghost"]
check(bool(this_games) and all(g[6] for g in this_games), f"Week {WEEK} is final on ESPN", why="some games still undecided")
check(len(rows) == 11 and len(up) == 6 and len(lo) == 5, "Game count 11 (6 Upper + 5 Lower)", why=f"got {len(up)}+{len(lo)}")
teams_seen = [r[7] for r in rows] + [r[11] for r in rows]
check(sorted(teams_seen) == sorted(list(TEAM_MAP) + [GHOST]), "Every team exactly once",
      why=f"missing {sorted(set(TEAM_MAP) - set(teams_seen))}, dupes {sorted({t for t in teams_seen if teams_seen.count(t) > 1})}")
if sched_all:
    sch = {frozenset((r[6], r[8])) for r in sched_all[1:] if r and r[1] == str(WEEK)}
    got = {frozenset((r[7], r[11])) for r in up}
    check(sch == got, "Upper pairings match MAFFL_Schedule_2026_Upper.csv",
          why=f"[SCHEDULE MISMATCH] ESPN-only {[sorted(x) for x in got - sch]}, file-only {[sorted(x) for x in sch - got]}")
else:
    checks.append("⚠️ Upper schedule file not loaded — pairing check skipped")
check(len(gh) == 1 and par_info is not None, "Exactly one Ghost game with computed par")
check(all(len(r) == 13 for r in rows) and all(D(r[8]) > D(r[12]) for r in rows)
      and not any(x == "0.0" for r in rows for x in (r[8], r[12])), "Format: 13 fields, winner > loser, no 0.0")
if par_info:
    srt, dropped, s8, par, espn_g = par_info
    if espn_g == Decimal("0.00"):
        flag(f"LM to-do: set ESPN 👻 Week {WEEK} score to {par}.")
    elif espn_g != par:
        block(f"[GHOST PAR MISMATCH: ESPN {espn_g} vs computed {par}]")

score_of = {}
for r in rows: score_of[r[7]] = D(r[8]); score_of[r[11]] = D(r[12])
check(len(top3) == 63, "Top performers: 63 rows (21 teams × 3)", blocking=False, why=f"got {len(top3)}")
over = sorted({r[3] for r in top3 if sum(D(x[8]) for x in top3 if x[3] == r[3]) > score_of.get(r[3], Decimal(0))})
check(not over, "Top 3 total ≤ team score", blocking=False, why=str(over))
pts = {}
for r in top3: pts.setdefault(r[6], set()).add(r[8])
cross = sorted(p for p, v in pts.items() if len(v) > 1)
check(not cross, "Same player, same points in both tiers", blocking=False, why=f"[CROSS-TIER MISMATCH: {cross}]")

highs = {}
for tier in ("Upper", "Lower"):
    r1 = [r for r in top3 if r[2] == tier and r[5] == "1"]
    if r1:
        mx = max(D(r[8]) for r in r1)
        highs[tier] = [r for r in r1 if D(r[8]) == mx]

score_sum = sum(D(r[8]) + D(r[12]) for r in rows)
checksum = (f"CHECKSUM · week {WEEK} · rows {len(rows)} · upper {len(up)} · lower {len(lo)} · ghost {len(gh)} · "
            f"score_sum {score_sum:.2f} · top3_rows {len(top3)}")

# ---------------------------------------------------------------- stat-correction audit (earlier weeks vs gold)
audit_blocks, corrections, audit_rows, audit_sum = [], [], 0, Decimal(0)
gold_by_week = {}
for r in gold: gold_by_week.setdefault(r[1], []).append(r)
pair_key = lambda r: (r[2], frozenset((r[7], r[11])))
for wk in range(1, WEEK):
    wrows, _ = build_rows(games.get(wk, []), wk)
    audit_rows += len(wrows); audit_sum += sum(D(r[8]) + D(r[12]) for r in wrows)
    audit_blocks.append((wk, wrows))
    if gold:
        gm = {pair_key(r): r for r in gold_by_week.get(str(wk), [])}
        for r in wrows:
            g = gm.get(pair_key(r))
            if not g:
                corrections.append(f"Week {wk}: {r[7]} vs {r[11]} isn't in gold"); continue
            now = {r[7]: D(r[8]), r[11]: D(r[12])}; was = {g[7]: D(g[8]), g[11]: D(g[12])}
            for team in now:
                if was.get(team) != now[team]:
                    corrections.append(f"Week {wk}: {team} gold {was.get(team)} → ESPN now {now[team]}")
            if r[7] != g[7]:
                corrections.append(f"Week {wk}: ⚠️ WINNER FLIPPED — {g[7]} → {r[7]}")
if corrections:
    flag(f"STAT CORRECTIONS in earlier weeks: {len(corrections)} change(s), see OUTPUT 4.")

# ---------------------------------------------------------------- self-test vs repo (only if this week is already ingested)
selftest = []
if gold_by_week.get(str(WEEK)):
    k = lambda r: tuple(r[2:])
    a = {k(r) for r in gold_by_week[str(WEEK)]}; b = {k(r) for r in rows}
    selftest.append(f"SELF-TEST matchups vs repo: {'ALL MATCH' if a == b else f'{len(a ^ b)} row difference(s)'}")
    for r in sorted(a ^ b)[:6]: selftest.append(f"   {'repo ' if r in a else 'ESPN '} {','.join(r)}")
if top3_gold_all:
    g3 = {(r[3], r[5]): (r[6], r[8]) for r in top3_gold_all[1:] if r and r[1] == str(WEEK)}
    if g3:
        mine = {(r[3], r[5]): (r[6], r[8]) for r in top3}
        diff = [f"{t} #{n}: repo {g3.get((t, n))} vs ESPN {mine.get((t, n))}"
                for (t, n) in sorted(set(g3) | set(mine)) if g3.get((t, n)) != mine.get((t, n))]
        selftest.append(f"SELF-TEST top performers vs repo: {'ALL MATCH' if not diff else f'{len(diff)} difference(s)'}")
        selftest += ["   " + d for d in diff[:15]]

# ---------------------------------------------------------------- write the inbox report
status = "STATUS: READY TO INGEST" if not blocks else "STATUS: BLOCKED — " + "; ".join(blocks)
L = [f"# MAFFL {YEAR} Week {WEEK} — ESPN pull",
     f"Source: maffl_espn_pull.py v0.3.2 · pulled {datetime.now(ET):%Y-%m-%d %I:%M %p} ET · replaces the capture v2.2 screenshot reply\n",
     "## OUTPUT 1 — MATCHUP ROWS", "```", *[",".join(r) for r in rows], "```\n",
     "## OUTPUT 2 — WEEK FACTS", "### 2a. Top performers", "```", ",".join(TOP3_HEADER), *[",".join(r) for r in top3], "```",
     "### 2b. Individual high"]
for tier in ("Upper", "Lower"):
    hs = highs.get(tier, [])
    L.append(f"INDIVIDUAL HIGH — {tier}: " + ("; ".join(f"{r[6]}, {r[3]}, {r[8]}" for r in hs) if hs else "[NEEDS BOX SCORES]"))
L.append(f"\n### 2c. Transactions ({start:%a %m/%d} – {end - timedelta(minutes=1):%a %m/%d})")
L.append("_Waiver claims carry ESPN's **processing** time (every claim in a run gets the same stamp). "
         "That is not when the owner bid, so never write it as a pickup time. Free-agent moves and drops "
         "below carry their real times._")
runs = {}
for d, w, tr, when, line in sorted(tx_lines, key=lambda x: x[0]):
    if w: runs.setdefault((when.strftime("%a %m/%d %I:%M %p"), tr), []).append(line)
for (stamp, tr), lines in runs.items():   # already in time order
    L.append(f"\n**Waiver run — {tr}, processed {stamp}** ({len(lines)} claims)")
    L += ["- " + l.split(" · ", 1)[1] for l in lines]
others = [(when, line) for d, w, tr, when, line in sorted(tx_lines, key=lambda x: x[0]) if not w]
L.append("\n**Free-agent moves, drops and trades** (real times)")
L += [f"- {when:%a %m/%d %I:%M %p} · {line}" for when, line in others] or ["- (none)"]
top_bids = sorted(tx_bids, key=lambda x: -x[0])[:5]
L.append("TOP BIDS: " + (", ".join(f"${b} {p} ({t}, {tr})" for b, t, p, tr in top_bids) or "none") + f" · TRADES: {trade_count}")
if bench_facts:
    L += ["\n### 2d. A bench player beat every starter", *["- " + b for b in bench_facts]]
L += ["\n## OUTPUT 3 — VALIDATION", *checks]
if par_info:
    srt, dropped, s8, par, espn_g = par_info
    L.append(f"👻 par: {', '.join(str(x) for x in srt)} · dropped {dropped} · sum of 8 {s8} · mean {par} · ESPN shows {espn_g}")
L += [checksum, *selftest,
      "\nBLOCKING: " + ("; ".join(blocks) if blocks else "none"),
      "FLAGS: " + (" | ".join(flags) if flags else "none"),
      "NOTES: " + (" | ".join(notes) if notes else "none"),
      "\n## OUTPUT 4 — PRIOR-WEEK SCORE AUDIT",
      "Stat corrections vs gold: " + (f"{len(corrections)}" if corrections else "none")]
L += ["- " + c for c in corrections]
for wk, wrows in audit_blocks:
    L += [f"\nWeek {wk}", "```", *[",".join(r) for r in wrows], "```"]
L.append(f"AUDIT · weeks 1–{WEEK - 1} · rows {audit_rows} · score_sum {audit_sum:.2f}")
L.append(f"\n## OUTPUT 5 — WEEK {WEEK + 1} PAIRINGS (from ESPN)")
for tier in ("Upper", "Lower"):
    L.append(f"**{tier}**")
    L += [f"- {a} at {h}" for a, h in next_pairs[tier]] or ["- (none on ESPN)"]
if sched_all and next_pairs["Upper"]:
    sch = {frozenset((r[6], r[8])) for r in sched_all[1:] if r and r[1] == str(WEEK + 1)}
    got = {frozenset(p) for p in next_pairs["Upper"]}
    nxt_ok = sch == got
    L.append("Upper vs schedule file: " + ("✅ match" if nxt_ok else f"❌ [SCHEDULE MISMATCH] ESPN-only {[sorted(x) for x in got - sch]}"))
    if not nxt_ok: flag(f"Week {WEEK + 1} Upper pairings on ESPN don't match the schedule file.")
L.append("\n" + status)
report = "\n".join(L)

fname = f"MAFFL_{YEAR}_Week{WEEK:02d}_espn.md"
open(fname, "w", encoding="utf-8").write(report)

# ---------------------------------------------------------------- short summary on screen
print("\n" + "-" * 25 + " COPY FROM HERE " + "-" * 25)
print(f"Week {WEEK}: {len(rows)} games · {len(top3)} top-3 rows · {len(tx_lines)} transactions · {trade_count} trades")
print(checksum)
for c in checks: print(c)
for s in selftest: print(s)
print("Stat corrections in earlier weeks: " + (str(len(corrections)) if corrections else "none"))
for c in corrections[:10]: print("  - " + c)
print(f"Week {WEEK + 1} pairings: Upper {len(next_pairs['Upper'])}, Lower {len(next_pairs['Lower'])}")
print("BLOCKING: " + ("; ".join(blocks) if blocks else "none"))
print("FLAGS: " + (" | ".join(flags) if flags else "none"))
print(status)
print("-" * 26 + " TO HERE " + "-" * 31)
print(f"Full report saved as {fname}")
if IN_COLAB:
    from google.colab import files
    files.download(fname)
    print("Your browser is downloading it now (check your Downloads folder).")
