# ============================================================
# MAFFL ESPN Inventory: a one-time check of what ESPN still has
# VERSION: 0.1 (2026-09-30)
#
# READ-ONLY. Changes nothing on ESPN or in the repo. It opens every past season of both
# leagues and reports what's there:
#   * Seasons ESPN knows about, teams, owners (ESPN member IDs)
#   * Game results for each season (how many weeks/games, do scores exist)
#   * Draft picks (auction $ / keepers?)
#   * Lineup detail (starters + bench) for a sample week: the raw material for
#     rebuilding Coach of the Week
#   * Lineup slots by year (how many FLEX etc.)
#   * Season transaction totals per team (adds, trades, FAAB spent)
#   * Message board: every post it can reach, searched for "coach" / "COTW"
#
# HOW TO RUN (Google Colab, same as the weekly pull):
#   1. colab.research.google.com -> New notebook -> paste this whole file into a cell -> Run.
#   2. Paste espn_s2 and SWID when asked (same values as the GitHub secrets).
#   3. It takes a few minutes, then downloads two files:
#        MAFFL_ESPN_Inventory.md  (the readable report)
#        MAFFL_ESPN_raw.zip        (everything ESPN returned, for the next phase)
#   4. Save BOTH in a folder OUTSIDE the repo (the repo is public and the message board
#      is private league chatter), e.g. Documents\MAFFL_ESPN_Archive. Tell Claude where.
# ============================================================

LEAGUES = {"Upper": 34467, "Lower": 1587593698}
CURRENT_YEAR = 2026
FALLBACK_YEARS = list(range(2004, CURRENT_YEAR + 1))   # used only if ESPN won't list past seasons
SEARCH = ["coach", "cotw"]                              # message-board search words (not case-sensitive)

import os, sys, subprocess
try:
    import espn_api  # noqa: F401
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "espn-api"], check=True)

import json, zipfile, time, traceback
from datetime import datetime
from zoneinfo import ZoneInfo
from espn_api.requests.espn_requests import EspnFantasyRequests
try:
    from espn_api.football.constant import POSITION_MAP
except Exception:
    POSITION_MAP = {}

ET = ZoneInfo("America/New_York")
IN_COLAB = "google.colab" in sys.modules

ESPN_S2 = os.environ.get("ESPN_S2") or ""
SWID = os.environ.get("SWID") or ""
if not (ESPN_S2 and SWID):
    from getpass import getpass
    print("Paste each value, then press Enter. The box stays blank - that's normal.")
    ESPN_S2 = getpass("espn_s2: ").strip()
    SWID = getpass("SWID (keep the { } braces): ").strip()
COOKIES = {"espn_s2": ESPN_S2, "SWID": SWID}

RAW = {}          # zip path -> JSON-able object
ERRORS = []       # (tier, year, what, message)
HITS = []         # message-board search hits

def req(year, lid):
    return EspnFantasyRequests(sport="nfl", year=year, league_id=lid, cookies=COOKIES)

def attempt(tier, year, what, fn):
    try:
        return fn()
    except Exception as e:
        ERRORS.append((tier, year, what, f"{type(e).__name__}: {str(e)[:160]}"))
        return None

def when(ms):
    try: return datetime.fromtimestamp(int(ms) / 1000, tz=ET).strftime("%Y-%m-%d")
    except Exception: return "?"

def slot_name(i):
    return POSITION_MAP.get(int(i), str(i)) if str(i).lstrip("-").isdigit() else str(i)

# ---------------------------------------------------------------- which seasons exist?
def seasons_for(tier, lid):
    status = attempt(tier, CURRENT_YEAR, "season list",
                     lambda: req(CURRENT_YEAR, lid).league_get(params={"view": "mStatus"}))
    prev = (status or {}).get("status", {}).get("previousSeasons") or []
    years = sorted(set(int(y) for y in prev) | {CURRENT_YEAR})
    if len(years) <= 1:
        years = FALLBACK_YEARS
        ERRORS.append((tier, CURRENT_YEAR, "season list", "ESPN didn't list past seasons; trying every year 2004+"))
    return years

# ---------------------------------------------------------------- message board search
def walk_hits(obj, tier, year, path=""):
    """Find every dict whose own text fields mention a search word."""
    if isinstance(obj, dict):
        text = " ".join(str(v) for k, v in obj.items() if isinstance(v, str))
        low = text.lower()
        if any(w in low for w in SEARCH):
            author = obj.get("author") or obj.get("authorId") or obj.get("memberId") or ""
            title = obj.get("title") or ""
            body = obj.get("content") or obj.get("body") or obj.get("text") or text
            HITS.append((tier, year, when(obj.get("date") or obj.get("dateEdited") or 0),
                         str(author)[:40], str(title)[:80], " ".join(str(body).split())[:400]))
        for v in obj.values(): walk_hits(v, tier, year)
    elif isinstance(obj, list):
        for v in obj: walk_hits(v, tier, year)

def count_messages(board):
    n = 0
    for topics in (board or {}).get("topicsByType", {}).values():
        for t in topics or []:
            n += 1 + len(t.get("messages", []) or [])
    return n

# ---------------------------------------------------------------- one season
def inventory(tier, lid, year):
    r = req(year, lid)
    row = {"year": year}

    base = attempt(tier, year, "season data", lambda: r.league_get(params={
        "view": ["mTeam", "mSettings", "mStatus", "mMatchupScore", "mDraftDetail"]}))
    if not base:
        row["status"] = "not reachable"
        return row
    RAW[f"{tier}/{year}_season.json"] = base
    teams = base.get("teams") or []
    members = base.get("members") or []
    sched = base.get("schedule") or []
    settings = base.get("settings") or {}
    row["teams"] = len(teams)
    row["members"] = len(members)

    # results
    scored = [m for m in sched if "home" in m and "away" in m
              and (m["home"].get("totalPoints") or m["away"].get("totalPoints"))]
    row["games"] = len(scored)
    row["weeks"] = len({m.get("matchupPeriodId") for m in scored})
    row["playoff_games"] = sum(1 for m in scored if m.get("playoffTierType", "NONE") != "NONE")

    # draft
    picks = (base.get("draftDetail") or {}).get("picks") or []
    row["draft_picks"] = len(picks)
    row["auction"] = any((p.get("bidAmount") or 0) > 0 for p in picks)
    row["keepers"] = sum(1 for p in picks if p.get("keeper"))

    # lineup slots (for Coach of the Week: how many FLEX etc.)
    slots = (settings.get("rosterSettings") or {}).get("lineupSlotCounts") or {}
    row["slots"] = ", ".join(f"{slot_name(k)}×{v}" for k, v in sorted(slots.items(), key=lambda kv: int(kv[0]))
                             if v and slot_name(k) not in ("BE", "IR"))
    row["bench"] = next((v for k, v in slots.items() if slot_name(k) == "BE"), "")

    # season transaction totals
    tc = [t.get("transactionCounter") or {} for t in teams]
    row["txn_totals"] = any(tc) and {
        "adds": sum(c.get("acquisitions", 0) for c in tc),
        "trades": sum(c.get("trades", 0) for c in tc),
        "faab": sum(c.get("acquisitionBudgetSpent", 0) for c in tc),
    }

    # lineup detail for one sample week (week 1)
    filt = {"schedule": {"filterMatchupPeriodIds": {"value": [1]}}}
    box = attempt(tier, year, "lineups (week 1)", lambda: r.league_get(
        params={"view": ["mMatchupScore", "mScoreboard"], "scoringPeriodId": 1},
        headers={"x-fantasy-filter": json.dumps(filt)}))
    starters = bench = 0
    for m in (box or {}).get("schedule", []):
        for side in ("home", "away"):
            s = m.get(side) or {}
            ros = s.get("rosterForCurrentScoringPeriod") or s.get("rosterForMatchupPeriod") or {}
            for e in ros.get("entries", []) or []:
                if slot_name(e.get("lineupSlotId", -1)) in ("BE", "IR"): bench += 1
                else: starters += 1
    if box: RAW[f"{tier}/{year}_week1_lineups.json"] = box
    row["lineups_wk1"] = f"{starters} start / {bench} bench" if (starters or bench) else "none"

    # message board: default call, then an explicit "all types" call
    board = attempt(tier, year, "message board", lambda: r.get_league_message_board())
    board2 = attempt(tier, year, "message board (typed)", lambda: r.get_league_message_board(
        ["NOTE", "TOPIC", "POLL", "ACTIVITY_SETTINGS", "ACTIVITY_TRANSACTIONS"]))
    msgs = 0
    for i, b in enumerate((board, board2)):
        if b:
            RAW[f"{tier}/{year}_messageboard_{i}.json"] = b
            msgs = max(msgs, count_messages(b))
    before = len(HITS)
    for b in (board, board2):
        if b: walk_hits(b, tier, year)
    # de-duplicate hits from the two calls
    seen, uniq = set(), []
    for h in HITS[before:]:
        if h not in seen: seen.add(h); uniq.append(h)
    del HITS[before:]; HITS.extend(uniq)
    row["board_msgs"] = msgs if (board or board2) else "n/a"
    row["coach_hits"] = len(uniq)
    RAW[f"{tier}/{year}_members.json"] = members
    return row

# ---------------------------------------------------------------- run
results = {}
for tier, lid in LEAGUES.items():
    years = seasons_for(tier, lid)
    print(f"\n{tier} ({lid}): checking {len(years)} seasons {years[0]}-{years[-1]}")
    results[tier] = []
    for y in years:
        row = inventory(tier, lid, y)
        results[tier].append(row)
        print(f"  {y}: " + ", ".join(f"{k}={v}" for k, v in row.items() if k not in ("year", "slots")))
        time.sleep(0.5)   # be polite to ESPN

# ---------------------------------------------------------------- report
L = ["# MAFFL ESPN Inventory",
     f"maffl_espn_inventory.py v0.1 · run {datetime.now(ET):%Y-%m-%d %I:%M %p} ET · read-only\n"]
for tier, rows in results.items():
    L += [f"## {tier} league ({LEAGUES[tier]})", "",
          "| Year | Teams | Weeks | Games | Playoff g | Draft picks | Auction | Keepers | Wk-1 lineups | Txn totals | Board msgs | Coach hits |",
          "|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for r in rows:
        if r.get("status"):
            L.append(f"| {r['year']} | {r['status']} |||||||||||"); continue
        tx = r.get("txn_totals")
        txs = f"{tx['adds']} adds, {tx['trades']} trades, ${tx['faab']}" if tx else "—"
        L.append(f"| {r['year']} | {r['teams']} | {r['weeks']} | {r['games']} | {r['playoff_games']} | "
                 f"{r['draft_picks']} | {'yes' if r['auction'] else 'no'} | {r['keepers']} | {r['lineups_wk1']} | "
                 f"{txs} | {r['board_msgs']} | {r['coach_hits']} |")
    L += ["", "**Lineup slots by year** (starting spots; bench count in brackets)"]
    last = None
    for r in rows:
        s = r.get("slots")
        if s and s != last:
            L.append(f"- {r['year']}+: {s} [BE×{r.get('bench', '?')}]"); last = s
    L.append("")

L += ["## Message-board posts mentioning " + " / ".join(f'"{w}"' for w in SEARCH), ""]
_u, _seen = [], set()
for h in sorted(HITS, key=lambda h: (h[2], h[1])):   # ESPN may return the same board for every year
    if (h[2], h[5]) not in _seen: _seen.add((h[2], h[5])); _u.append(h)
if _u:
    L.append(f"_{len(_u)} unique posts (the same post seen under several seasons is listed once)._")
    for tier, y, d, a, t, body in _u:
        L.append(f"- **{y} {tier}** · {d} · author {a or '?'}" + (f" · _{t}_" if t else ""))
        L.append(f"  > {body}")
else:
    L.append("- None found.")
L += ["", "## Things ESPN refused or didn't have", ""]
L += [f"- {t} {y} · {w}: {m}" for t, y, w, m in ERRORS] or ["- none"]
report = "\n".join(L)

open("MAFFL_ESPN_Inventory.md", "w", encoding="utf-8").write(report)
with zipfile.ZipFile("MAFFL_ESPN_raw.zip", "w", zipfile.ZIP_DEFLATED) as z:
    for path, obj in RAW.items():
        z.writestr(path, json.dumps(obj, default=str))
    z.writestr("MAFFL_ESPN_Inventory.md", report)

print("\n" + "=" * 60)
print(f"Done. Seasons checked: " + ", ".join(f"{t} {len(r)}" for t, r in results.items()))
print(f"Coach/COTW message-board hits: {len(HITS)} · problems logged: {len(ERRORS)}")
print("Files: MAFFL_ESPN_Inventory.md, MAFFL_ESPN_raw.zip")
if IN_COLAB:
    from google.colab import files
    files.download("MAFFL_ESPN_Inventory.md")
    files.download("MAFFL_ESPN_raw.zip")
    print("Your browser is downloading both now (check Downloads). Chrome may ask to allow multiple downloads.")
