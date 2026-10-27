# Week 7 data log (robot, Windows runner)

### Append week to gold (ingest_week.py)
```
Appended week 7: 11 matchup rows (CRLF) · 63 top-performer rows (CRLF) · score_sum 3139.79
Stat corrections reported for earlier weeks: 7  → applied next by apply_corrections.py
```  exit 0

### Apply ESPN stat corrections to earlier weeks (apply_corrections.py)
```
# Week 7 — stat corrections applied to gold (robot)
Applied: 7 score change(s) in 6 row(s) · winner flips: 0
- Week 6 · Upper · Mike Vicks Dog Sitting Co. 151.06 → 151.56 (vs Marco Clair Kardiac Attack, result unchanged)
- Week 6 · Upper · The Prodigal Sons 160.32 → 159.32 (vs Reilly's Reindeer, result unchanged)
- Week 6 · Upper · The Big Bang Theory 125.86 → 125.36 (vs Turkey Hat Conglomerate, result unchanged)
- Week 6 · Upper · Turkey Hat Conglomerate 107.68 → 106.68 (vs The Big Bang Theory, result unchanged)
- Week 6 · Lower · Sarge's Squad 178.70 → 178.20 (vs Camp Kes, result unchanged)
- Week 6 · Lower · Fightin Ferrets 171.50 → 172.00 (vs Tommy Phamclub, result unchanged)
- Week 6 · Lower · MAFFL Ghost 141.19 → 141.25 (vs Tony's Talented Team, result unchanged)
👻 par changes: Week 6 141.19 → 141.25 — LM: re-enter in ESPN
```  exit 0

### CE-1 generator, check (expect 1 = additions)
```
  corrected NoConsolation: 2026,6,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,151.06,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,150.58 -> 2026,6,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,151.56,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,150.58
  corrected NoConsolation: 2026,6,Upper,False,Regular,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,160.32,Joe Reilly,Joseph Reilly,Reilly's Reindeer,134.56 -> 2026,6,Upper,False,Regular,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,159.32,Joe Reilly,Joseph Reilly,Reilly's Reindeer,134.56
  corrected NoConsolation: 2026,6,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.86,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,107.68 -> 2026,6,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.36,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,106.68
  corrected NoConsolation: 2026,6,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,178.7,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,122.9 -> 2026,6,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,178.2,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,122.9
  corrected NoConsolation: 2026,6,Lower,False,Regular,Todd Trozzo,Todd Trozzo,Fightin Ferrets,171.5,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,151.24 -> 2026,6,Lower,False,Regular,Todd Trozzo,Todd Trozzo,Fightin Ferrets,172.0,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,151.24
  corrected NoConsolation: 2026,6,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,141.19,Tony Brooks,Tony Brooks,Tony's Talented Team,134.44 -> 2026,6,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,141.25,Tony Brooks,Tony Brooks,Tony's Talented Team,134.44
  corrected matchups-data.js: [2026,6,"U","Braiden Snyder",151.06,"David Murello",150.58,"R"] -> [2026,6,"U","Braiden Snyder",151.56,"David Murello",150.58,"R"]
  corrected matchups-data.js: [2026,6,"U","Jon Murello/ Rick Simmons",160.32,"Joe Reilly",134.56,"R"] -> [2026,6,"U","Jon Murello/ Rick Simmons",159.32,"Joe Reilly",134.56,"R"]
  corrected matchups-data.js: [2026,6,"U","Dan Reilly",125.86,"Ed Peters",107.68,"R"] -> [2026,6,"U","Dan Reilly",125.36,"Ed Peters",106.68,"R"]
  corrected matchups-data.js: [2026,6,"L","Nick Yankovich",178.7,"Bob Keslar",122.9,"R"] -> [2026,6,"L","Nick Yankovich",178.2,"Bob Keslar",122.9,"R"]
  corrected matchups-data.js: [2026,6,"L","Todd Trozzo",171.5,"Sam Lavrinc",151.24,"R"] -> [2026,6,"L","Todd Trozzo",172.0,"Sam Lavrinc",151.24,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2803 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.73 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x7
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 6 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2455 -> 2466 rows; append-only drift check passed.
[matchups-data.js] DIFFERS -- 2449 -> 2459 rows (7 Ghost row(s) excluded); append-only drift check passed.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
check-only (no -Write); nothing written.
```  exit 1

### CE-1 generator, write
```
  corrected NoConsolation: 2026,6,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,151.06,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,150.58 -> 2026,6,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,151.56,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,150.58
  corrected NoConsolation: 2026,6,Upper,False,Regular,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,160.32,Joe Reilly,Joseph Reilly,Reilly's Reindeer,134.56 -> 2026,6,Upper,False,Regular,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,159.32,Joe Reilly,Joseph Reilly,Reilly's Reindeer,134.56
  corrected NoConsolation: 2026,6,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.86,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,107.68 -> 2026,6,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.36,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,106.68
  corrected NoConsolation: 2026,6,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,178.7,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,122.9 -> 2026,6,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,178.2,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,122.9
  corrected NoConsolation: 2026,6,Lower,False,Regular,Todd Trozzo,Todd Trozzo,Fightin Ferrets,171.5,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,151.24 -> 2026,6,Lower,False,Regular,Todd Trozzo,Todd Trozzo,Fightin Ferrets,172.0,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,151.24
  corrected NoConsolation: 2026,6,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,141.19,Tony Brooks,Tony Brooks,Tony's Talented Team,134.44 -> 2026,6,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,141.25,Tony Brooks,Tony Brooks,Tony's Talented Team,134.44
  corrected matchups-data.js: [2026,6,"U","Braiden Snyder",151.06,"David Murello",150.58,"R"] -> [2026,6,"U","Braiden Snyder",151.56,"David Murello",150.58,"R"]
  corrected matchups-data.js: [2026,6,"U","Jon Murello/ Rick Simmons",160.32,"Joe Reilly",134.56,"R"] -> [2026,6,"U","Jon Murello/ Rick Simmons",159.32,"Joe Reilly",134.56,"R"]
  corrected matchups-data.js: [2026,6,"U","Dan Reilly",125.86,"Ed Peters",107.68,"R"] -> [2026,6,"U","Dan Reilly",125.36,"Ed Peters",106.68,"R"]
  corrected matchups-data.js: [2026,6,"L","Nick Yankovich",178.7,"Bob Keslar",122.9,"R"] -> [2026,6,"L","Nick Yankovich",178.2,"Bob Keslar",122.9,"R"]
  corrected matchups-data.js: [2026,6,"L","Todd Trozzo",171.5,"Sam Lavrinc",151.24,"R"] -> [2026,6,"L","Todd Trozzo",172.0,"Sam Lavrinc",151.24,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2803 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.73 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x7
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 6 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2455 -> 2466 rows; append-only drift check passed.
[MAFFL_Matchups_NoConsolation.csv] WROTE.
[matchups-data.js] DIFFERS -- 2449 -> 2459 rows (7 Ghost row(s) excluded); append-only drift check passed.
[matchups-data.js] WROTE.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_By_Season.csv] WROTE.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
[MAFFL_Points_AllTime.csv] WROTE.
```  exit 1

### CE-1 generator, re-check (expect 0 = in sync)
```
[gold] MAFFL_Matchups_Clean.csv: 2803 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.73 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x7
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 0 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] ROUND-TRIP EXACT -- byte-identical (2466 -> 2466 rows).
[matchups-data.js] ROUND-TRIP EXACT -- byte-identical (2459 -> 2459 rows (7 Ghost row(s) excluded)).
[MAFFL_Points_By_Season.csv] ROUND-TRIP EXACT -- byte-identical (358 -> 358 rows).
[MAFFL_Points_AllTime.csv] ROUND-TRIP EXACT -- byte-identical (34 -> 34 rows, 0 updated).
```  exit 0

### validate (expect 0 = 8/8)
```

==================== MAFFL validate() -- Step 1 ====================
[PASS] Gate 1: Championship flags == 25
        sum(Champ)=25 (expected 25; 2002 co-champ counts as 2 -- whitelisted)
[PASS] Gate 2: Recomputed W/L/T == published
        all 34 owners match (Matchups_Clean, Regular, 2005-2025)
[PASS] Gate 3: Win% == W/(W+L+T)
        all match within 1pt
[PASS] Gate 4: Credit balance == sum(Credit_Log approved)
        all sheeted balances reconcile
[PASS] Gate 5: Prize pool 67/33 split reconciles
        teams=21 pool=USD2100 -> Upper(67pct)=USD1407 + Lower(33pct)=USD693
[PASS] Gate 6: Zero Kickers drafted 2025+
        K picks 2025+ = 0 (rows=6336)
[PASS] Gate 7: All owner names resolve to canonical
        all names across 4 files resolve
[PASS] Gate 8: Power ranks unique 1..N; owners exist
        ranks=32 unique=True contiguous=True badNames=0
--------------------------------------------------------------------
ALL GATES PASS (8/8)
====================================================================
```  exit 0

### Facts calculator
```
# MAFFL 2026 Week 7 — Pulse facts (computed from gold)
Source: pulse_facts.py v0.2. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).

## Standings (season totals through this week)
**Upper Div A**
- South Hills FunShiners · 5-2 · points 1035.00 · streak +3 · credits 4 · all-play 39-38
- Bad Attitude Gang · 4-3 · points 1092.48 · streak +2 · credits 27 · all-play 45-32
- Marco Clair Kardiac Attack · 4-3 · points 1005.82 · streak +1 · credits 12 · all-play 41-36
**Upper Div B**
- Mike Vicks Dog Sitting Co. · 6-1 · points 1080.66 · streak +5 · credits 5 · all-play 54-23
- Jake's Jagoffs · 5-2 · points 1006.16 · streak -1 · credits 15 · all-play 42-35
- The Prodigal Sons · 3-4 · points 1026.18 · streak -1 · credits 24 · all-play 40-37
**Upper Div C**
- The Big Bang Theory · 4-3 · points 963.00 · streak +2 · credits 6 · all-play 33-44
- Happy Valley Hammer Time · 3-4 · points 981.26 · streak -3 · credits 17 · all-play 29-48
- Reilly's Reindeer · 2-5 · points 983.68 · streak +1 · credits 23 · all-play 33-44
**Upper Div D**
- Hadley's Comets · 3-4 · points 1036.34 · streak -4 · credits 7 · all-play 38-39
- Turkey Hat Conglomerate · 2-5 · points 1059.28 · streak -4 · credits 7 · all-play 43-34
- Southside Shooters · 1-6 · points 926.46 · streak -2 · credits 7 · all-play 25-52
**Lower** (👻 always listed last on the page)
- The Best in The 'Burgh · 5-2 · points 1113.38 · streak +2 · credits 6 · all-play 35-21
- Tommy Phamclub · 4-3 · points 1116.54 · streak -2 · credits 8 · all-play 31-25
- Portly Primates · 4-3 · points 1056.80 · streak +1 · credits 6 · all-play 26-30
- Steel City Champyinz · 4-3 · points 1046.22 · streak +1 · credits 6 · all-play 30-26
- Sarge's Squad · 4-3 · points 1076.80 · streak +2 · credits 5 · all-play 30-26
- Fightin Ferrets · 4-3 · points 1157.34 · streak -1 · credits 1 · all-play 40-16
- The V-Unit · 4-3 · points 996.52 · streak +3 · credits 0 · all-play 19-37
- Tony's Talented Team · 2-5 · points 1105.68 · streak -2 · credits 10 · all-play 30-26
- Camp Kes · 1-6 · points 913.42 · streak -4 · credits 1 · all-play 11-45
- MAFFL Ghost · 3-4 · points 1035.31 · streak -1 · credits 0

## Playoff picture (page builds this itself; for prose only)
Upper seeds: 1 Mike Vicks Dog Sitting Co. (div) · 2 South Hills FunShiners (div) · 3 The Big Bang Theory (div) · 4 Hadley's Comets (div) · 5 Jake's Jagoffs (WC) · 6 Bad Attitude Gang (WC) · 7 Marco Clair Kardiac Attack · 8 The Prodigal Sons · 9 Happy Valley Hammer Time · 10 Reilly's Reindeer · 11 Turkey Hat Conglomerate · 12 Southside Shooters
Upper relegation spots (11–12): Turkey Hat Conglomerate, Southside Shooters
Lower order: 1 The Best in The 'Burgh · 2 Tommy Phamclub · 3 Portly Primates · 4 Steel City Champyinz · 5 Sarge's Squad · 6 Fightin Ferrets · 7 The V-Unit · 8 Tony's Talented Team · 9 Camp Kes  (promotion line = top 2)

## Survivor
**Upper** — 5 alive: South Hills FunShiners, The Prodigal Sons, Mike Vicks Dog Sitting Co., Turkey Hat Conglomerate, Southside Shooters
- Week 7: Jake's Jagoffs out with 84.76
- Week 6: Hadley's Comets out with 100.30
- Week 5: Bad Attitude Gang out with 102.24
- Week 4: Reilly's Reindeer out with 103.30
- Week 3: Marco Clair Kardiac Attack out with 114.32
- Week 2: The Big Bang Theory out with 88.72
- Week 1: Happy Valley Hammer Time out with 124.14
  margin: Jake's Jagoffs was 27.26 behind The Prodigal Sons
**Lower** — 2 alive: Sarge's Squad, The Best in The 'Burgh
- Week 7: Fightin Ferrets out with 145.96
- Week 6: Tony's Talented Team out with 134.44
- Week 5: Portly Primates out with 133.80
- Week 4: Camp Kes out with 124.88
- Week 3: Tommy Phamclub out with 135.94
- Week 2: The V-Unit out with 124.74
- Week 1: Steel City Champyinz out with 116.34
  margin: Fightin Ferrets was 19.06 behind The Best in The 'Burgh

## Credit Tracker leaders (status 'leading' until the award is mathematically locked)
- Most Team Points Scored — Upper: Bad Attitude Gang · 1092.48 through Wk 7 · since 6
- Most Team Points Scored — Lower: Fightin Ferrets · 1157.34 through Wk 7 · since 5
- Largest Blowout Victory — Upper: Reilly's Reindeer · 69.74 over Bad Attitude Gang (Wk 5) · since 5
- Largest Blowout Victory — Lower: Tommy Phamclub · 60.90 over 👻 (Wk 2) · since 1
- Individual high THIS WEEK — Upper: J. Burrow, Hadley's Comets, 36.88  → compare with last week's creditTracker value; the season leader changes only if this is higher.
- Individual high THIS WEEK — Lower: J. Burrow, The V-Unit, 36.88  → compare with last week's creditTracker value; the season leader changes only if this is higher.

## Highest weekly score this week
- Upper: The Big Bang Theory · 187.74
- Lower: Steel City Champyinz · 175.52

## This week's games (winner first) with context
- Upper: The Big Bang Theory 187.74 def. Hadley's Comets 130.86 · margin 56.88
- Upper: Reilly's Reindeer 160.88 def. Southside Shooters 116.80 · margin 44.08
- Upper: Marco Clair Kardiac Attack 156.14 def. The Prodigal Sons 112.02 · margin 44.12
- Upper: Mike Vicks Dog Sitting Co. 147.16 def. Turkey Hat Conglomerate 141.92 · margin 5.24
- Upper: South Hills FunShiners 145.18 def. Happy Valley Hammer Time 135.00 · margin 10.18
- Upper: Bad Attitude Gang 134.22 def. Jake's Jagoffs 84.76 · margin 49.46
- Lower: Steel City Champyinz 175.52 def. Fightin Ferrets 145.96 · margin 29.56
- Lower: Sarge's Squad 172.90 def. Tony's Talented Team 159.26 · margin 13.64
- Lower: The Best in The 'Burgh 165.02 def. MAFFL Ghost 145.73 · margin 19.29
- Lower: The V-Unit 154.84 def. Tommy Phamclub 129.90 · margin 24.94
- Lower: Portly Primates 143.80 def. Camp Kes 94.18 · margin 49.62

## Week 8 pairings + head-to-head (all MAFFL history, by owner)
- Upper: Jake's Jagoffs at Turkey Hat Conglomerate · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Jake's Jagoffs 1–3 Turkey Hat Conglomerate · regular season Jake's Jagoffs 1–3 Turkey Hat Conglomerate · current regular-season streak: Turkey Hat Conglomerate ×3 · last meeting 2021 Wk 8 (Regular): Turkey Hat Conglomerate 118.62-93.5
- Upper: South Hills FunShiners at The Prodigal Sons · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) South Hills FunShiners 8–4 The Prodigal Sons · regular season South Hills FunShiners 8–4 The Prodigal Sons · current regular-season streak: The Prodigal Sons ×2 · last meeting 2025 Wk 5 (Regular): The Prodigal Sons 153.24-145.06
- Upper: Bad Attitude Gang at The Big Bang Theory · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Bad Attitude Gang 12–14 The Big Bang Theory · regular season Bad Attitude Gang 10–14 The Big Bang Theory · current regular-season streak: The Big Bang Theory ×4 · playoff meetings: 2015 Quarterfinal won by Bad Attitude Gang 112.7-86.12; 2016 Semifinal won by Bad Attitude Gang 114.92-70.44 · last meeting 2024 Wk 12 (Regular): The Big Bang Theory 96.92-80.32
- Upper: Marco Clair Kardiac Attack at Southside Shooters · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Marco Clair Kardiac Attack 14–11 Southside Shooters · regular season Marco Clair Kardiac Attack 13–11 Southside Shooters · current regular-season streak: Marco Clair Kardiac Attack ×1 · playoff meetings: 2021 Quarterfinal won by Kardiac Kids 105.28-102.56 · last meeting 2025 Wk 17 (Consolation): Southside Shooters 177.42-137.08
- Upper: Reilly's Reindeer at Hadley's Comets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Reilly's Reindeer 10–10 Hadley's Comets · regular season Reilly's Reindeer 9–9 Hadley's Comets · current regular-season streak: Hadley's Comets ×1 · playoff meetings: 2017 Quarterfinal won by Reilly's Reindeers 118.22-102.44; 2022 Semifinal won by Hadley's Comets 112.8-105.3 · last meeting 2025 Wk 14 (Regular): Hadley's Comets 184.32-156.66
- Upper: Mike Vicks Dog Sitting Co. at Happy Valley Hammer Time · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Mike Vicks Dog Sitting Co. 0–0 Happy Valley Hammer Time · regular season Mike Vicks Dog Sitting Co. 0–0 Happy Valley Hammer Time · first meeting · last meeting 2023 Wk 16 (Consolation): Motown Ballers 86.4-77.24
- Lower: Tony's Talented Team at Camp Kes · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tony's Talented Team 3–0 Camp Kes · regular season Tony's Talented Team 3–0 Camp Kes · current regular-season streak: Tony's Talented Team ×3 · last meeting 2024 Wk 9 (Regular): Number 2 Tony 118.82-90.0
- Lower: Portly Primates at Tommy Phamclub · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Portly Primates 1–1 Tommy Phamclub · regular season Portly Primates 1–1 Tommy Phamclub · current regular-season streak: Portly Primates ×1 · last meeting 2025 Wk 17 (Consolation): Portly Primates 152.44-132.3
- Lower: Sarge's Squad at The Best in The 'Burgh · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Sarge's Squad 1–1 The Best in The 'Burgh · regular season Sarge's Squad 1–1 The Best in The 'Burgh · current regular-season streak: The Best in The 'Burgh ×1 · last meeting 2025 Wk 11 (Regular): The Best in The 'Burgh 133.72-122.8
- Lower: The V-Unit at Steel City Champyinz · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The V-Unit 0–0 Steel City Champyinz · regular season The V-Unit 0–0 Steel City Champyinz · first meeting
- Lower: MAFFL Ghost at Fightin Ferrets · 👻 game

## Coverage (spread the wealth — editorial §4a)
_Headline + subhead + news reel mentions in Weeks 4–6._
- **Not written about in 3 Pulses (give at least 2 of these a news item this week):** Steel City Champyinz (L)
- **Already heavy (≥3 mentions — needs a record or a first-ever to make the reel again):** Camp Kes (L) ×3, Fightin Ferrets (L) ×3, Mike Vicks Dog Sitting Co. (U) ×3, Portly Primates (L) ×3, Reilly's Reindeer (U) ×3, Turkey Hat Conglomerate (U) ×3
- **In a headline/subhead the last 2 weeks (don't lead with them again unless it's a record):** Camp Kes (L), Mike Vicks Dog Sitting Co. (U), Portly Primates (L), Reilly's Reindeer (U), Sarge's Squad (L), The V-Unit (L)

## Story hooks (history from gold; every team has some, so quiet teams get a turn)
_One or two per team are plenty. Use them for news items, Results notes and Coach of the Week notes. Score ranks compare only 2025-on games (scoring changed in 2025). Owner history follows the person across team names. Copy wording loosely, numbers exactly._
- **Bad Attitude Gang** (U, W vs Jake's Jagoffs): all-time series with Jake's Jagoffs (by owner, regular + playoffs) now 11–8 · snapped a 2-game losing run against them; first win over them since 2024 · playoff history: 2006 Quarterfinal won by Jake's Jagoffs; 2011 Semifinal won by Jake's Jagoffs · best start through Week 7 since 2022 · trophy case: 1 title (last 2016); Lower-Tier title 2025; 5 Upper division titles (last 2021) · won Coach of the Week 11 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Camp Kes** (L, L vs Portly Primates): first-ever meeting with Portly Primates · 94.18 is the 1st-lowest Lower score of 175 since 2025 · lost 3 straight regular-season games (career long: 8) · trophy case: 1 title (last 2023); 2 Upper division titles (last 2019) · won Coach of the Week 6 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Fightin Ferrets** (L, L vs Steel City Champyinz): first-ever meeting with Steel City Champyinz · best start through Week 7 since 2022 · trophy case: 2 titles (last 2015); 5 Upper division titles (last 2020) · won Coach of the Week 18 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Hadley's Comets** (U, L vs The Big Bang Theory): all-time series with The Big Bang Theory (by owner, regular + playoffs) now 2–5 · lost 4 straight regular-season games (career long: 7) · trophy case: 2 titles (last 2007); 7 Upper division titles (last 2023) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Happy Valley Hammer Time** (U, L vs South Hills FunShiners): all-time series with South Hills FunShiners (by owner, regular + playoffs) now 12–9 · loss ended a 4-game winning run against them · playoff history: 2006 Quarterfinal won by Wilkinsburg N'@s · lost 3 straight regular-season games (career long: 6) · trophy case: 3 titles (last 2017); 7 Upper division titles (last 2022) · won Coach of the Week 13 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Jake's Jagoffs** (U, L vs Bad Attitude Gang): all-time series with Bad Attitude Gang (by owner, regular + playoffs) now 8–11 · loss ended a 2-game winning run against them · playoff history: 2006 Quarterfinal won by Jake's Jagoffs; 2011 Semifinal won by Jake's Jagoffs · best start through Week 7 since 2021 · 84.76 is the 3rd-lowest Upper score of 252 since 2025 · trophy case: 2 titles (last 2021); 3 Upper division titles (last 2021) · won Coach of the Week 10 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Marco Clair Kardiac Attack** (U, W vs The Prodigal Sons): all-time series with The Prodigal Sons (by owner, regular + playoffs) now 17–13 · playoff history: 2013 Semifinal won by The Prodigal Sons · trophy case: 1 title (last 2012); 10 Upper division titles (last 2024) · won Coach of the Week 3 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Mike Vicks Dog Sitting Co.** (U, W vs Turkey Hat Conglomerate): all-time series with Turkey Hat Conglomerate (by owner, regular + playoffs) now 5–1 · 6-1 is this owner's best start through Week 7 in 5 seasons · won 5 straight regular-season games (career long: 6) · no MAFFL title yet · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Portly Primates** (L, W vs Camp Kes): first-ever meeting with Camp Kes · no MAFFL title yet
- **Reilly's Reindeer** (U, W vs Southside Shooters): all-time series with Southside Shooters (by owner, regular + playoffs) now 5–0 · playoff history: 2024 Championship won by Reilly's Reindeer · trophy case: 3 titles (last 2024); 8 Upper division titles (last 2025) · won Coach of the Week 19 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Sarge's Squad** (L, W vs Tony's Talented Team): all-time series with Tony's Talented Team (by owner, regular + playoffs) now 1–2 · first win over them ever, after 2 losses · 4-3 is this owner's best start through Week 7 in 2 seasons · no MAFFL title yet
- **South Hills FunShiners** (U, W vs Happy Valley Hammer Time): all-time series with Happy Valley Hammer Time (by owner, regular + playoffs) now 9–12 · snapped a 4-game losing run against them; first win over them since 2013 · playoff history: 2006 Quarterfinal won by Wilkinsburg N'@s · won 3 straight regular-season games (career long: 9) · trophy case: 1 title (last 2019); 5 Upper division titles (last 2024) · won Coach of the Week 4 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Southside Shooters** (U, L vs Reilly's Reindeer): all-time series with Reilly's Reindeer (by owner, regular + playoffs) now 0–5 · playoff history: 2024 Championship won by Reilly's Reindeer · trophy case: 2 Upper division titles (last 2025) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Steel City Champyinz** (L, W vs Fightin Ferrets): first-ever meeting with Fightin Ferrets · no MAFFL title yet
- **The Best in The 'Burgh** (L, W vs 👻): no MAFFL title yet
- **The Big Bang Theory** (U, W vs Hadley's Comets): all-time series with Hadley's Comets (by owner, regular + playoffs) now 5–2 · trophy case: 4 Upper division titles (last 2024) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The Prodigal Sons** (U, L vs Marco Clair Kardiac Attack): all-time series with Marco Clair Kardiac Attack (by owner, regular + playoffs) now 13–17 · playoff history: 2013 Semifinal won by The Prodigal Sons · trophy case: 3 titles (last 2025); 5 Upper division titles (last 2025) · won Coach of the Week 5 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The V-Unit** (L, W vs Tommy Phamclub): first-ever meeting with Tommy Phamclub · won 3 straight regular-season games (career long: 8) · trophy case: 2 titles (last 2020); 3 Upper division titles (last 2017) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Tommy Phamclub** (L, L vs The V-Unit): first-ever meeting with The V-Unit · 4-3 is this owner's best start through Week 7 in 2 seasons · no MAFFL title yet
- **Tony's Talented Team** (L, L vs Sarge's Squad): all-time series with Sarge's Squad (by owner, regular + playoffs) now 2–1 · loss ended a 2-game winning run against them · trophy case: 1 Upper division title (last 2023) · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Turkey Hat Conglomerate** (U, L vs Mike Vicks Dog Sitting Co.): all-time series with Mike Vicks Dog Sitting Co. (by owner, regular + playoffs) now 1–5 · lost 4 straight regular-season games (career long: 7) · trophy case: 3 Upper division titles (last 2025) · won Coach of the Week 7 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
```  exit 0
