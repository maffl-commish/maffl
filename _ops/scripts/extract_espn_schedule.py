#!/usr/bin/env python3
"""
extract_espn_schedule.py -- one-time Lower-Tier fixtures extract from an ESPN season snapshot

The Lower-Tier regular season is ESPN's auto-generated schedule (the Upper one is
hand-authored in data/MAFFL_Schedule_<year>_Upper.csv). This reads the private ESPN
snapshot (git-ignored, under _ops/inbox/MAFFL_ESPN_raw/) and writes the fixtures as a
gold CSV with the Upper file's columns:

  Year,Week,Tier,Week_Type,Game_Class,Division,Away_Team,Away_Owner,Home_Team,Home_Owner

Run once per season, by hand. NOT part of the weekly robot.

  python _ops/scripts/extract_espn_schedule.py            # report only, write nothing
  python _ops/scripts/extract_espn_schedule.py --write    # write the CSV (gates must pass)

Owners: the ESPN team name (whitespace-stripped) must match exactly one registry
current_team (data/MAFFL_Owner_Registry.csv); the row carries that owner's
canonical_name. MAFFL Ghost is deliberately NOT in the registry and passes through
as "MAFFL Ghost". Any other unmatched name stops the run (never fuzzy-match;
governance 7.1).

Gates (all must pass before --write):
  1. 70 rows; Weeks 1-14; exactly 5 rows per week.
  2. Each of the 9 real Lower owners once per week; MAFFL Ghost once per week.
  3. Every week already in gold (MAFFL_Matchups_NoConsolation.csv, this year, Lower)
     matches the extracted pairings (unordered; Ghost games vs Game_Type Ghost rows).

Exit 0 = gates pass (and, with --write, file written or already identical);
1 = gates pass but the file differs (check-only); 2 = refused.
"""
import argparse
import csv
import io
import json
import os
import sys
from collections import Counter, defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REGISTRY = os.path.join(REPO, "data", "MAFFL_Owner_Registry.csv")
NOCONS = os.path.join(REPO, "data", "MAFFL_Matchups_NoConsolation.csv")

HEADER = ["Year", "Week", "Tier", "Week_Type", "Game_Class", "Division",
          "Away_Team", "Away_Owner", "Home_Team", "Home_Owner"]
GHOST = "MAFFL Ghost"
TIER = "Lower"
WEEKS = 14
GAMES_PER_WEEK = 5
REAL_OWNERS = 9


def fail(problems):
    print(f"REFUSED -- {len(problems)} problem(s):")
    for p in problems[:25]:
        print(f"  - {p}")
    print("Nothing written.")
    sys.exit(2)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--season-json", default=os.path.join(REPO, "_ops", "inbox", "MAFFL_ESPN_raw", "Lower", "2026_season.json"))
    ap.add_argument("--out", default=os.path.join(REPO, "data", "MAFFL_Schedule_2026_Lower.csv"))
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    with open(args.season_json, encoding="utf-8") as f:
        season = json.load(f)
    year = int(season["seasonId"])

    # Registry: current_team -> canonical_name (exact, trimmed; a name on two rows is ambiguous)
    team_owner, team_dupes = {}, set()
    with open(REGISTRY, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            t = (r["current_team"] or "").strip()
            if not t:
                continue
            if t in team_owner and team_owner[t] != r["canonical_name"]:
                team_dupes.add(t)
            team_owner[t] = r["canonical_name"]

    problems = []
    teams = {}
    for t in season["teams"]:
        name = (t.get("name") or "").strip()
        if name == GHOST:
            owner = GHOST
        elif name in team_dupes:
            problems.append(f"team '{name}' is the current_team of more than one registry owner")
            continue
        elif name in team_owner:
            owner = team_owner[name]
        else:
            problems.append(f"team '{name}' (ESPN id {t['id']}) matches no registry current_team -- fix the registry, never fuzzy-match")
            continue
        teams[t["id"]] = (name, owner)
    if problems:
        fail(problems)

    games = [g for g in season["schedule"] if g.get("playoffTierType") == "NONE"]
    games.sort(key=lambda g: (g["matchupPeriodId"], g["id"]))
    rows = []
    for g in games:
        away_name, away_owner = teams[g["away"]["teamId"]]
        home_name, home_owner = teams[g["home"]["teamId"]]
        rows.append([str(year), str(g["matchupPeriodId"]), TIER, "Regular Season", "Open", "",
                     away_name, away_owner, home_name, home_owner])

    # Gate 1: shape
    by_week = defaultdict(list)
    for r in rows:
        by_week[int(r[1])].append(r)
    if len(rows) != WEEKS * GAMES_PER_WEEK:
        problems.append(f"gate 1: {len(rows)} rows, expected {WEEKS * GAMES_PER_WEEK}")
    if sorted(by_week) != list(range(1, WEEKS + 1)):
        problems.append(f"gate 1: weeks {sorted(by_week)}, expected 1-{WEEKS}")
    for w, rs in sorted(by_week.items()):
        if len(rs) != GAMES_PER_WEEK:
            problems.append(f"gate 1: week {w} has {len(rs)} games, expected {GAMES_PER_WEEK}")

    # Gate 2: every owner once per week
    real = sorted({o for _, o in teams.values() if o != GHOST})
    if len(real) != REAL_OWNERS:
        problems.append(f"gate 2: {len(real)} real Lower owners, expected {REAL_OWNERS}")
    for w, rs in sorted(by_week.items()):
        c = Counter([r[7] for r in rs] + [r[9] for r in rs])
        for o in real + [GHOST]:
            if c[o] != 1:
                problems.append(f"gate 2: week {w}: {o} appears {c[o]} time(s)")
        for o in c:
            if o not in real and o != GHOST:
                problems.append(f"gate 2: week {w}: unexpected owner {o}")

    # Gate 3: weeks already played must match gold pairings
    gold = defaultdict(set)
    with open(NOCONS, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            if r["Year"] == str(year) and r["Tier"] == TIER and r["Game_Type"] in ("Regular", "Ghost"):
                gold[int(r["Week"])].add(frozenset((r["Winner_Owner"], r["Loser_Owner"])))
    matched = 0
    for w in sorted(gold):
        ext = {frozenset((r[7], r[9])) for r in by_week.get(w, [])}
        if ext == gold[w]:
            matched += 1
        else:
            problems.append(f"gate 3: week {w} pairings differ from gold: extracted-only {sorted(map(sorted, ext - gold[w]))}, gold-only {sorted(map(sorted, gold[w] - ext))}")
    if problems:
        fail(problems)

    print(f"[extract] {args.season_json}: {len(rows)} regular-season games, {year} {TIER}")
    print(f"[gate 1] PASS -- {len(rows)} rows, weeks 1-{WEEKS}, {GAMES_PER_WEEK} per week")
    print(f"[gate 2] PASS -- {len(real)} owners + {GHOST} once per week")
    print(f"[gate 3] PASS -- {matched}/{len(gold)} weeks matched gold")

    buf = io.StringIO()
    csv.writer(buf, lineterminator="\n").writerows([HEADER] + rows)
    text = buf.getvalue()
    current = None
    if os.path.exists(args.out):
        with open(args.out, encoding="utf-8", newline="") as f:
            current = f.read().replace("\r\n", "\n")  # a Windows checkout may carry CRLF
    if current == text:
        print(f"[{os.path.basename(args.out)}] unchanged -- no diff.")
        return 0
    print(f"[{os.path.basename(args.out)}] {'new file' if current is None else 'DIFFERS'}.")
    if not args.write:
        print("check-only (no --write); nothing written.")
        return 1
    with open(args.out, "w", encoding="utf-8", newline="") as f:
        f.write(text)
    print(f"[{os.path.basename(args.out)}] WROTE.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
