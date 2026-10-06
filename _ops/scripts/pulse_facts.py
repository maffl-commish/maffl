# ============================================================
# MAFFL Pulse facts calculator
# VERSION: 0.2 (2026-10-06): adds Coverage + Story hooks (pulse_history.py). 0.1.1 (2026-09-29): UTF-8 console output for Windows runners. 0.1 — verified: reproduces the published Week 3 object exactly
#
# Computes every NUMBER the weekly Pulse needs, straight from gold, so the drafter
# (Claude, human or robot) writes prose and never does arithmetic:
#   standings (record, season points, streak, credits, sorted by the rulebook tiebreak),
#   all-play, Survivor, credit-award leaders + "since", highest weekly, playoff seeds,
#   and head-to-head history for next week's pairings.
#
# Usage (repo root):  python _ops/scripts/pulse_facts.py 4
#   -> writes _ops/inbox/MAFFL_2026_Week04_facts.md  (and prints it)
# Reads: data/MAFFL_Matchups_Clean.csv (gold, must already contain week N),
#        data/MAFFL_Owners_Sheet_revised.csv (credit balances; they don't move in season),
#        data/MAFFL_Top_Performers_2026.csv, data/MAFFL_Schedule_2026_Upper.csv,
#        _ops/inbox/MAFFL_2026_WeekNN_espn.md (next-week pairings).
# ============================================================
import csv, json, os, re, sys
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

# Windows runners print with a legacy code page that can't show 👻 or →; force UTF-8 output.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

YEAR = 2026
GHOST = "MAFFL Ghost"
DIVISIONS = {
    "A": ["Bad Attitude Gang", "Marco Clair Kardiac Attack", "South Hills FunShiners"],
    "B": ["Jake's Jagoffs", "The Prodigal Sons", "Mike Vicks Dog Sitting Co."],
    "C": ["Happy Valley Hammer Time", "The Big Bang Theory", "Reilly's Reindeer"],
    "D": ["Hadley's Comets", "Turkey Hat Conglomerate", "Southside Shooters"],
}
UPPER = [t for d in DIVISIONS.values() for t in d]
DIV_OF = {t: d for d, ts in DIVISIONS.items() for t in ts}
# Owner name as the gold CSV writes it -> Owners Sheet name (for credit balances)
SHEET_NAME = {"Brian Murello/ Ron Murello": "Brian Murello / Ron Murello",
              "Jon Murello/ Rick Simmons": "Jon Murello / Rick Simmons",
              "Jon Fetrow/ Casey Trozzo": "Jon Fetrow"}

def D(x): return Decimal(str(x)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
def f2(x): return f"{D(x):.2f}"
def norm(s): return re.sub(r"\s+", " ", s or "").strip()

def load(path):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))

def main(week):
    root = os.getcwd()
    games = [r for r in load(os.path.join(root, "data", "MAFFL_Matchups_Clean.csv"))
             if r["Year"] == str(YEAR) and r["Game_Type"] in ("Regular", "Ghost") and int(r["Week"]) <= week]
    if not any(int(r["Week"]) == week for r in games):
        raise SystemExit(f"Week {week} isn't in MAFFL_Matchups_Clean.csv yet. Append it (CE-1) first.")
    all_hist = load(os.path.join(root, "data", "MAFFL_Matchups_Clean.csv"))
    sheet = {norm(r["Owners"]).replace("/ ", " / ").replace(" /", " /"): r
             for r in load(os.path.join(root, "data", "MAFFL_Owners_Sheet_revised.csv")) if norm(r["Owners"])}
    sheet = {re.sub(r"\s*/\s*", " / ", k): v for k, v in sheet.items()}

    tier_of, owner_of = {}, {}
    for r in games:
        for s in ("Winner", "Loser"):
            tier_of[r[s + "_Team"]] = r["Tier"]; owner_of[r[s + "_Team"]] = r[s + "_Owner"]
    lower = sorted(t for t, tr in tier_of.items() if tr == "Lower" and t != GHOST)

    def credits(team):
        if team == GHOST: return 0
        o = SHEET_NAME.get(owner_of[team], owner_of[team])
        o = re.sub(r"\s*/\s*", " / ", o)
        row = sheet.get(o)
        return int(float(row["Current Credit Balance"])) if row and row["Current Credit Balance"].strip() else 0

    # per-week results
    wk_scores = defaultdict(dict)       # week -> team -> score
    wk_result = defaultdict(dict)       # week -> team -> (W/L/T, opp, margin)
    for r in games:
        w = int(r["Week"]); a, b = r["Winner_Team"], r["Loser_Team"]
        sa, sb = D(r["Winner_Score"]), D(r["Loser_Score"])
        wk_scores[w][a] = sa; wk_scores[w][b] = sb
        res = "T" if sa == sb else "W"
        wk_result[w][a] = (res, b, sa - sb); wk_result[w][b] = ("T" if sa == sb else "L", a, sb - sa)
    weeks = sorted(wk_scores)

    def record_through(k):
        rec = {}
        for t in tier_of:
            w = l = tt = 0; pts = Decimal(0); seq = []
            for wk in weeks:
                if wk > k or t not in wk_result[wk]: continue
                res = wk_result[wk][t][0]; pts += wk_scores[wk][t]; seq.append(res)
                w += res == "W"; l += res == "L"; tt += res == "T"
            streak = 0
            for res in reversed(seq):
                if res == "T": break
                if streak == 0: streak = 1 if res == "W" else -1
                elif (res == "W") == (streak > 0): streak += 1 if streak > 0 else -1
                else: break
            rec[t] = dict(w=w, l=l, t=tt, points=pts, streak=streak, credits=credits(t))
        return rec

    rec = record_through(week)
    key = lambda t: (-rec[t]["w"], -rec[t]["credits"], -rec[t]["points"])   # rulebook: record -> credits -> points

    # all-play (real teams only, within tier)
    allplay = {}
    for t in tier_of:
        if t == GHOST: continue
        peers = [p for p in tier_of if tier_of[p] == tier_of[t] and p not in (t, GHOST)]
        w = l = 0
        for wk in weeks:
            if t not in wk_scores[wk]: continue
            for p in peers:
                if p in wk_scores[wk]:
                    w += wk_scores[wk][t] > wk_scores[wk][p]; l += wk_scores[wk][t] < wk_scores[wk][p]
        allplay[t] = (w, l)

    # Survivor: each week the single lowest real score among active teams goes out
    surv = {}
    for tier, pool in (("Upper", UPPER), ("Lower", lower)):
        active, out = list(pool), []
        for wk in weeks:
            cands = [t for t in active if t in wk_scores[wk]]
            if len(active) <= 1 or not cands: break
            low = min(cands, key=lambda t: wk_scores[wk][t])
            ties = [t for t in cands if wk_scores[wk][t] == wk_scores[wk][low]]
            out.append((wk, low, wk_scores[wk][low], ties if len(ties) > 1 else None))
            active.remove(low)
        surv[tier] = (active, out)

    # credit-award leaders with "since" (leader after each week; since = start of current run)
    def leaders(fn):
        hist = [(k, fn(k)) for k in weeks]
        cur = hist[-1][1]; since = hist[-1][0]
        for k, v in reversed(hist):
            if v and cur and v[0] == cur[0]: since = k
            else: break
        return cur, since
    def most_points(tier):
        def f(k):
            r = record_through(k); pool = [t for t in r if tier_of[t] == tier and t != GHOST]
            t = max(pool, key=lambda t: r[t]["points"]); return (t, r[t]["points"])
        return leaders(f)
    def blowout(tier):
        def f(k):
            best = None
            for wk in weeks:
                if wk > k: continue
                for t, (res, opp, m) in wk_result[wk].items():
                    if res == "W" and t != GHOST and tier_of[t] == tier and (best is None or m > best[1]):
                        best = (t, m, opp, wk)
            return best
        return leaders(f)
    top3_path = os.path.join(root, "data", "MAFFL_Top_Performers_2026.csv")
    top3 = [r for r in load(top3_path) if r["Year"] == str(YEAR)] if os.path.exists(top3_path) else []
    ind_high = {}
    for tier in ("Upper", "Lower"):
        r1 = [r for r in top3 if r["Tier"] == tier and r["Rank"] == "1" and int(r["Week"]) == week]
        if r1:
            mx = max(D(r["Points"]) for r in r1)
            ind_high[tier] = [(r["Player"], r["Team"], r["Points"]) for r in r1 if D(r["Points"]) == mx]

    # seeds
    div_rank = {d: sorted(ts, key=key) for d, ts in DIVISIONS.items()}
    winners = sorted([v[0] for v in div_rank.values()], key=key)
    rest = sorted([t for t in UPPER if t not in winners], key=key)
    upper_seeds = winners + rest
    lower_seeds = sorted(lower, key=key)

    # next week pairings (from the ESPN pull report) + head-to-head history
    pairs = {"Upper": [], "Lower": []}
    inbox = os.path.join(root, "_ops", "inbox", f"MAFFL_{YEAR}_Week{week:02d}_espn.md")
    if os.path.exists(inbox):
        txt = open(inbox, encoding="utf-8").read()
        m = re.search(r"## OUTPUT 5.*?\n(.*?)(?:\nUpper vs schedule|\nSTATUS|\Z)", txt, re.S)
        tier = None
        for line in (m.group(1).splitlines() if m else []):
            if line.startswith("**Upper"): tier = "Upper"
            elif line.startswith("**Lower"): tier = "Lower"
            elif line.startswith("- ") and " at " in line and tier:
                a, h = line[2:].split(" at ", 1); pairs[tier].append((a.strip(), h.strip()))
    # owner identity across years via the Owner Registry aliases (e.g. "Jon Fetrow" == "Jon Fetrow/ Casey Trozzo")
    slash = lambda o: re.sub(r"\s*/\s*", "/", norm(o)).lower()
    alias_to_id = {}
    for r in load(os.path.join(root, "data", "MAFFL_Owner_Registry.csv")):
        for a in [r["canonical_name"]] + r["aliases"].split("|"):
            if a.strip(): alias_to_id[slash(a)] = r["owner_id"]
    def owner_key(o): return alias_to_id.get(slash(o), slash(o))
    def h2h(a, b):
        ka, kb = owner_key(owner_of.get(a, a)), owner_key(owner_of.get(b, b))
        return [r for r in all_hist if {owner_key(r["Winner_Owner"]), owner_key(r["Loser_Owner"])} == {ka, kb}]

    # ------------------------------------------------------------ output
    L = [f"# MAFFL {YEAR} Week {week} — Pulse facts (computed from gold)",
         f"Source: pulse_facts.py v0.2. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).\n"]
    L.append("## Standings (season totals through this week)")
    for d, ts in div_rank.items():
        L.append(f"**Upper Div {d}**")
        for t in ts:
            r = rec[t]; ap = allplay[t]
            L.append(f"- {t} · {r['w']}-{r['l']}" + (f"-{r['t']}" if r['t'] else "") +
                     f" · points {f2(r['points'])} · streak {r['streak']:+d} · credits {r['credits']} · all-play {ap[0]}-{ap[1]}")
    L.append("**Lower** (👻 always listed last on the page)")
    for t in lower_seeds + [GHOST]:
        r = rec[t]; ap = allplay.get(t)
        L.append(f"- {t} · {r['w']}-{r['l']}" + (f"-{r['t']}" if r['t'] else "") +
                 f" · points {f2(r['points'])} · streak {r['streak']:+d} · credits {r['credits']}" +
                 (f" · all-play {ap[0]}-{ap[1]}" if ap else ""))
    L.append("\n## Playoff picture (page builds this itself; for prose only)")
    L.append("Upper seeds: " + " · ".join(f"{i+1} {t}" + (" (div)" if i < 4 else " (WC)" if i < 6 else "") for i, t in enumerate(upper_seeds)))
    L.append(f"Upper relegation spots (11–12): {upper_seeds[10]}, {upper_seeds[11]}")
    L.append("Lower order: " + " · ".join(f"{i+1} {t}" for i, t in enumerate(lower_seeds)) + "  (promotion line = top 2)")
    L.append("\n## Survivor")
    for tier in ("Upper", "Lower"):
        active, out = surv[tier]
        L.append(f"**{tier}** — {len(active)} alive: " + ", ".join(active))
        for wk, t, s, ties in reversed(out):
            L.append(f"- Week {wk}: {t} out with {f2(s)}" + ("  ⚠️ TIE for lowest: " + ", ".join(ties) if ties else ""))
        if out and out[-1][0] == week:
            wk_real = sorted((wk_scores[week][t], t) for t in active + [out[-1][1]] if t in wk_scores[week])
            if len(wk_real) > 1: L.append(f"  margin: {out[-1][1]} was {f2(wk_real[1][0] - wk_real[0][0])} behind {wk_real[1][1]}")
    L.append("\n## Credit Tracker leaders (status 'leading' until the award is mathematically locked)")
    for tier in ("Upper", "Lower"):
        (t, pts), since = most_points(tier)
        L.append(f"- Most Team Points Scored — {tier}: {t} · {f2(pts)} through Wk {week} · since {since}")
    for tier in ("Upper", "Lower"):
        (t, m, opp, wk), since = blowout(tier)
        L.append(f"- Largest Blowout Victory — {tier}: {t} · {f2(m)} over {'👻' if opp == GHOST else opp} (Wk {wk}) · since {since}")
    for tier in ("Upper", "Lower"):
        h = ind_high.get(tier)
        L.append(f"- Individual high THIS WEEK — {tier}: " + ("; ".join(f"{p}, {t}, {pts}" for p, t, pts in h) if h else "n/a") +
                 "  → compare with last week's creditTracker value; the season leader changes only if this is higher.")
    L.append("\n## Highest weekly score this week")
    for tier in ("Upper", "Lower"):
        pool = [(s, t) for t, s in wk_scores[week].items() if t != GHOST and tier_of[t] == tier]
        s, t = max(pool); L.append(f"- {tier}: {t} · {f2(s)}")
    L.append("\n## This week's games (winner first) with context")
    for tier in ("Upper", "Lower"):
        for t, (res, opp, m) in sorted(wk_result[week].items(), key=lambda kv: -wk_scores[week][kv[0]]):
            if tier_of[t] != tier or res != "W": continue
            L.append(f"- {tier}: {t} {f2(wk_scores[week][t])} def. {opp} {f2(wk_scores[week][opp])} · margin {f2(m)}")
    L.append(f"\n## Week {week + 1} pairings + head-to-head (all MAFFL history, by owner)")
    if not any(pairs.values()): L.append("(no pairings found in the ESPN pull report)")
    for tier in ("Upper", "Lower"):
        for a, h in pairs[tier]:
            if GHOST in (a, h):
                L.append(f"- {tier}: {a} at {h} · 👻 game"); continue
            rows = h2h(a, h)
            ka = owner_key(owner_of.get(a, a))
            reg = [r for r in rows if r["Game_Type"] == "Regular"]
            po = [r for r in rows if r["Game_Type"] not in ("Regular", "Consolation", "Ghost")]
            aw = sum(owner_key(r["Winner_Owner"]) == ka for r in reg)
            streak_team, streak_n = None, 0
            for r in sorted(reg, key=lambda r: (int(r["Year"]), int(r["Week"])), reverse=True):
                wn = r["Winner_Team"] if owner_key(r["Winner_Owner"]) == ka else "other"
                if streak_team is None: streak_team, streak_n = wn, 1
                elif wn == streak_team: streak_n += 1
                else: break
            same_div = tier == "Upper" and DIV_OF.get(a) == DIV_OF.get(h)
            last = max(rows, key=lambda r: (int(r["Year"]), int(r["Week"]))) if rows else None
            L.append(f"- {tier}: {a} at {h}" + (f" · Div {DIV_OF[a]} game" if same_div else "") +
                     f" · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) {a} {aw + sum(owner_key(r['Winner_Owner']) == ka for r in po)}–{len(reg) + len(po) - aw - sum(owner_key(r['Winner_Owner']) == ka for r in po)} {h}" +
                     f" · regular season {a} {aw}–{len(reg) - aw} {h}" +
                     (f" · current regular-season streak: {'%s' % (a if streak_team != 'other' else h)} ×{streak_n}" if reg else " · first meeting") +
                     (" · playoff meetings: " + "; ".join(f"{r['Year']} {r['Game_Type']} won by {r['Winner_Team']} {r['Winner_Score']}-{r['Loser_Score']}" for r in po) if po else "") +
                     (f" · last meeting {last['Year']} Wk {last['Week']} ({last['Game_Type']}): {last['Winner_Team']} {last['Winner_Score']}-{last['Loser_Score']}" if last else ""))
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from pulse_history import history_sections
        L.append(history_sections(root, YEAR, week, owner_key))
    except Exception as e:      # history is a bonus: never let it block the week
        L.append(f"\n## Story hooks\n(history hooks failed: {type(e).__name__}: {e})")
    out = "\n".join(L) + "\n"
    dest = os.path.join(root, "_ops", "inbox", f"MAFFL_{YEAR}_Week{week:02d}_facts.md")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, "w", encoding="utf-8").write(out)
    print(out)

if __name__ == "__main__":
    if len(sys.argv) < 2: raise SystemExit("Usage: python _ops/scripts/pulse_facts.py <week>")
    main(int(sys.argv[1]))
