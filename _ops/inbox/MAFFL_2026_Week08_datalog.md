# Week 8 data log (robot, Windows runner)

### Append week to gold (ingest_week.py)
```
Appended week 8: 11 matchup rows (CRLF) · 63 top-performer rows (CRLF) · score_sum 3270.74
Stat corrections reported for earlier weeks: 5  → applied next by apply_corrections.py
```  exit 0

### Apply ESPN stat corrections to earlier weeks (apply_corrections.py)
```
# Week 8 — stat corrections applied to gold (robot)
Applied: 5 score change(s) in 5 row(s) · winner flips: 0
- Week 7 · Upper · Bad Attitude Gang 134.22 → 134.72 (vs Jake's Jagoffs, result unchanged)
- Week 7 · Upper · The Big Bang Theory 187.74 → 189.24 (vs Hadley's Comets, result unchanged)
- Week 7 · Lower · Portly Primates 143.80 → 144.30 (vs Camp Kes, result unchanged)
- Week 7 · Lower · Tony's Talented Team 159.26 → 160.76 (vs Sarge's Squad, result unchanged)
- Week 7 · Lower · MAFFL Ghost 145.73 → 145.98 (vs The Best in The 'Burgh, result unchanged)
👻 par changes: Week 7 145.73 → 145.98 — LM: re-enter in ESPN
```  exit 0

### CE-1 generator, check (expect 1 = additions)
```
  corrected NoConsolation: 2026,7,Upper,False,Regular,Mike Murello,Michael Murello,Bad Attitude Gang,134.22,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,84.76 -> 2026,7,Upper,False,Regular,Mike Murello,Michael Murello,Bad Attitude Gang,134.72,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,84.76
  corrected NoConsolation: 2026,7,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,187.74,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,130.86 -> 2026,7,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,189.24,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,130.86
  corrected NoConsolation: 2026,7,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,143.8,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,94.18 -> 2026,7,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,144.3,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,94.18
  corrected NoConsolation: 2026,7,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,172.9,Tony Brooks,Tony Brooks,Tony's Talented Team,159.26 -> 2026,7,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,172.9,Tony Brooks,Tony Brooks,Tony's Talented Team,160.76
  corrected NoConsolation: 2026,7,Lower,False,Ghost,Ben Funari,Benjamin Funari,The Best in The 'Burgh,165.02,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,145.73 -> 2026,7,Lower,False,Ghost,Ben Funari,Benjamin Funari,The Best in The 'Burgh,165.02,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,145.98
  corrected matchups-data.js: [2026,7,"U","Mike Murello",134.22,"Jacob Nickman",84.76,"R"] -> [2026,7,"U","Mike Murello",134.72,"Jacob Nickman",84.76,"R"]
  corrected matchups-data.js: [2026,7,"U","Dan Reilly",187.74,"Brian Murello/ Ron Murello",130.86,"R"] -> [2026,7,"U","Dan Reilly",189.24,"Brian Murello/ Ron Murello",130.86,"R"]
  corrected matchups-data.js: [2026,7,"L","Charles Lavrinc",143.8,"Bob Keslar",94.18,"R"] -> [2026,7,"L","Charles Lavrinc",144.3,"Bob Keslar",94.18,"R"]
  corrected matchups-data.js: [2026,7,"L","Nick Yankovich",172.9,"Tony Brooks",159.26,"R"] -> [2026,7,"L","Nick Yankovich",172.9,"Tony Brooks",160.76,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2814 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.62 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x8
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 5 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2466 -> 2477 rows; append-only drift check passed.
[matchups-data.js] DIFFERS -- 2459 -> 2469 rows (8 Ghost row(s) excluded); append-only drift check passed.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
check-only (no -Write); nothing written.
```  exit 1

### CE-1 generator, write
```
  corrected NoConsolation: 2026,7,Upper,False,Regular,Mike Murello,Michael Murello,Bad Attitude Gang,134.22,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,84.76 -> 2026,7,Upper,False,Regular,Mike Murello,Michael Murello,Bad Attitude Gang,134.72,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,84.76
  corrected NoConsolation: 2026,7,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,187.74,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,130.86 -> 2026,7,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,189.24,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,130.86
  corrected NoConsolation: 2026,7,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,143.8,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,94.18 -> 2026,7,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,144.3,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,94.18
  corrected NoConsolation: 2026,7,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,172.9,Tony Brooks,Tony Brooks,Tony's Talented Team,159.26 -> 2026,7,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,172.9,Tony Brooks,Tony Brooks,Tony's Talented Team,160.76
  corrected NoConsolation: 2026,7,Lower,False,Ghost,Ben Funari,Benjamin Funari,The Best in The 'Burgh,165.02,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,145.73 -> 2026,7,Lower,False,Ghost,Ben Funari,Benjamin Funari,The Best in The 'Burgh,165.02,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,145.98
  corrected matchups-data.js: [2026,7,"U","Mike Murello",134.22,"Jacob Nickman",84.76,"R"] -> [2026,7,"U","Mike Murello",134.72,"Jacob Nickman",84.76,"R"]
  corrected matchups-data.js: [2026,7,"U","Dan Reilly",187.74,"Brian Murello/ Ron Murello",130.86,"R"] -> [2026,7,"U","Dan Reilly",189.24,"Brian Murello/ Ron Murello",130.86,"R"]
  corrected matchups-data.js: [2026,7,"L","Charles Lavrinc",143.8,"Bob Keslar",94.18,"R"] -> [2026,7,"L","Charles Lavrinc",144.3,"Bob Keslar",94.18,"R"]
  corrected matchups-data.js: [2026,7,"L","Nick Yankovich",172.9,"Tony Brooks",159.26,"R"] -> [2026,7,"L","Nick Yankovich",172.9,"Tony Brooks",160.76,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2814 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.62 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x8
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 5 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2466 -> 2477 rows; append-only drift check passed.
[MAFFL_Matchups_NoConsolation.csv] WROTE.
[matchups-data.js] DIFFERS -- 2459 -> 2469 rows (8 Ghost row(s) excluded); append-only drift check passed.
[matchups-data.js] WROTE.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_By_Season.csv] WROTE.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
[MAFFL_Points_AllTime.csv] WROTE.
```  exit 1

### CE-1 generator, re-check (expect 0 = in sync)
```
[gold] MAFFL_Matchups_Clean.csv: 2814 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.62 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x8
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 0 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] ROUND-TRIP EXACT -- byte-identical (2477 -> 2477 rows).
[matchups-data.js] ROUND-TRIP EXACT -- byte-identical (2469 -> 2469 rows (8 Ghost row(s) excluded)).
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
# MAFFL 2026 Week 8 — Pulse facts (computed from gold)
Source: pulse_facts.py v0.2. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).

## Standings (season totals through this week)
**Upper Div A**
- South Hills FunShiners · 6-2 · points 1194.68 · streak +4 · credits 4 · all-play 47-41
- Bad Attitude Gang · 5-3 · points 1264.34 · streak +3 · credits 27 · all-play 54-34
- Marco Clair Kardiac Attack · 4-4 · points 1148.08 · streak -1 · credits 12 · all-play 47-41
**Upper Div B**
- Mike Vicks Dog Sitting Co. · 6-2 · points 1217.18 · streak -1 · credits 5 · all-play 56-32
- Jake's Jagoffs · 5-3 · points 1116.60 · streak -2 · credits 15 · all-play 42-46
- The Prodigal Sons · 3-5 · points 1150.42 · streak -2 · credits 24 · all-play 41-47
**Upper Div C**
- Happy Valley Hammer Time · 4-4 · points 1118.02 · streak +1 · credits 17 · all-play 32-56
- The Big Bang Theory · 4-4 · points 1106.22 · streak -1 · credits 6 · all-play 37-51
- Reilly's Reindeer · 2-6 · points 1125.90 · streak -1 · credits 23 · all-play 38-50
**Upper Div D**
- Hadley's Comets · 4-4 · points 1213.42 · streak +1 · credits 7 · all-play 48-40
- Turkey Hat Conglomerate · 3-5 · points 1245.86 · streak +1 · credits 7 · all-play 54-34
- Southside Shooters · 2-6 · points 1070.26 · streak +1 · credits 7 · all-play 32-56
**Lower** (👻 always listed last on the page)
- The Best in The 'Burgh · 6-2 · points 1282.90 · streak +3 · credits 6 · all-play 43-21
- Tommy Phamclub · 5-3 · points 1263.98 · streak +1 · credits 8 · all-play 36-28
- Fightin Ferrets · 5-3 · points 1319.36 · streak +1 · credits 1 · all-play 46-18
- The V-Unit · 5-3 · points 1165.80 · streak +4 · credits 0 · all-play 26-38
- Portly Primates · 4-4 · points 1202.20 · streak -1 · credits 6 · all-play 30-34
- Steel City Champyinz · 4-4 · points 1185.30 · streak -1 · credits 6 · all-play 31-33
- Sarge's Squad · 4-4 · points 1212.32 · streak -1 · credits 5 · all-play 30-34
- Tony's Talented Team · 2-6 · points 1247.66 · streak -3 · credits 10 · all-play 32-32
- Camp Kes · 2-6 · points 1055.64 · streak +1 · credits 1 · all-play 14-50
- MAFFL Ghost · 3-5 · points 1183.18 · streak -2 · credits 0

## Playoff picture (page builds this itself; for prose only)
Upper seeds: 1 Mike Vicks Dog Sitting Co. (div) · 2 South Hills FunShiners (div) · 3 Happy Valley Hammer Time (div) · 4 Hadley's Comets (div) · 5 Bad Attitude Gang (WC) · 6 Jake's Jagoffs (WC) · 7 Marco Clair Kardiac Attack · 8 The Big Bang Theory · 9 The Prodigal Sons · 10 Turkey Hat Conglomerate · 11 Reilly's Reindeer · 12 Southside Shooters
Upper relegation spots (11–12): Reilly's Reindeer, Southside Shooters
Lower order: 1 The Best in The 'Burgh · 2 Tommy Phamclub · 3 Fightin Ferrets · 4 The V-Unit · 5 Portly Primates · 6 Steel City Champyinz · 7 Sarge's Squad · 8 Tony's Talented Team · 9 Camp Kes  (promotion line = top 2)

## Survivor
**Upper** — 4 alive: South Hills FunShiners, Mike Vicks Dog Sitting Co., Turkey Hat Conglomerate, Southside Shooters
- Week 8: The Prodigal Sons out with 124.24
- Week 7: Jake's Jagoffs out with 84.76
- Week 6: Hadley's Comets out with 100.30
- Week 5: Bad Attitude Gang out with 102.24
- Week 4: Reilly's Reindeer out with 103.30
- Week 3: Marco Clair Kardiac Attack out with 114.32
- Week 2: The Big Bang Theory out with 88.72
- Week 1: Happy Valley Hammer Time out with 124.14
  margin: The Prodigal Sons was 12.28 behind Mike Vicks Dog Sitting Co.
**Lower** — 1 alive: The Best in The 'Burgh
- Week 8: Sarge's Squad out with 135.52
- Week 7: Fightin Ferrets out with 145.96
- Week 6: Tony's Talented Team out with 134.44
- Week 5: Portly Primates out with 133.80
- Week 4: Camp Kes out with 124.88
- Week 3: Tommy Phamclub out with 135.94
- Week 2: The V-Unit out with 124.74
- Week 1: Steel City Champyinz out with 116.34
  margin: Sarge's Squad was 34.00 behind The Best in The 'Burgh

## Credit Tracker leaders (status 'leading' until the award is mathematically locked)
- Most Team Points Scored — Upper: Bad Attitude Gang · 1264.34 through Wk 8 · since 6
- Most Team Points Scored — Lower: Fightin Ferrets · 1319.36 through Wk 8 · since 5
- Largest Blowout Victory — Upper: Turkey Hat Conglomerate · 76.14 over Jake's Jagoffs (Wk 8) · since 8
- Largest Blowout Victory — Lower: Tommy Phamclub · 60.90 over 👻 (Wk 2) · since 1
- Individual high THIS WEEK — Upper: J. Burrow, Hadley's Comets, 46.48  → compare with last week's creditTracker value; the season leader changes only if this is higher.
- Individual high THIS WEEK — Lower: J. Burrow, The V-Unit, 46.48  → compare with last week's creditTracker value; the season leader changes only if this is higher.

## Highest weekly score this week
- Upper: Turkey Hat Conglomerate · 186.58
- Lower: The Best in The 'Burgh · 169.52

## This week's games (winner first) with context
- Upper: Turkey Hat Conglomerate 186.58 def. Jake's Jagoffs 110.44 · margin 76.14
- Upper: Hadley's Comets 177.08 def. Reilly's Reindeer 142.22 · margin 34.86
- Upper: Bad Attitude Gang 171.36 def. The Big Bang Theory 141.72 · margin 29.64
- Upper: South Hills FunShiners 159.68 def. The Prodigal Sons 124.24 · margin 35.44
- Upper: Southside Shooters 143.80 def. Marco Clair Kardiac Attack 142.26 · margin 1.54
- Upper: Happy Valley Hammer Time 136.76 def. Mike Vicks Dog Sitting Co. 136.52 · margin 0.24
- Lower: The Best in The 'Burgh 169.52 def. Sarge's Squad 135.52 · margin 34.00
- Lower: The V-Unit 169.28 def. Steel City Champyinz 139.08 · margin 30.20
- Lower: Fightin Ferrets 162.02 def. MAFFL Ghost 147.62 · margin 14.40
- Lower: Tommy Phamclub 147.44 def. Portly Primates 144.90 · margin 2.54
- Lower: Camp Kes 142.22 def. Tony's Talented Team 140.48 · margin 1.74

## Week 9 pairings + head-to-head (all MAFFL history, by owner)
- Upper: Happy Valley Hammer Time at Turkey Hat Conglomerate · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Happy Valley Hammer Time 5–8 Turkey Hat Conglomerate · regular season Happy Valley Hammer Time 5–7 Turkey Hat Conglomerate · current regular-season streak: Turkey Hat Conglomerate ×3 · playoff meetings: 2022 Quarterfinal won by Turkey Hat Conglomerate 126.16-75.92 · last meeting 2024 Wk 6 (Regular): Turkey Hat Conglomerate 115.6-92.86
- Upper: Reilly's Reindeer at South Hills FunShiners · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Reilly's Reindeer 15–10 South Hills FunShiners · regular season Reilly's Reindeer 11–9 South Hills FunShiners · current regular-season streak: Reilly's Reindeer ×1 · playoff meetings: 2014 Quarterfinal won by Reilly's Reindeers 109.02-93.46; 2018 Quarterfinal won by Reilly's Reindeer 142.28-88.4; 2019 Quarterfinal won by Fort Myers Sunshiners 130.1-103.04; 2022 Quarterfinal won by Reilly's Reindeer 136.84-109.68; 2024 Semifinal won by Reilly's Reindeer 129.9-86.96 · last meeting 2025 Wk 8 (Regular): Reilly's Reindeer 163.84-91.5
- Upper: Jake's Jagoffs at Marco Clair Kardiac Attack · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Jake's Jagoffs 2–3 Marco Clair Kardiac Attack · regular season Jake's Jagoffs 2–3 Marco Clair Kardiac Attack · current regular-season streak: Marco Clair Kardiac Attack ×1 · last meeting 2023 Wk 15 (Consolation): Kardiac Kids 103.66-102.52
- Upper: Southside Shooters at The Big Bang Theory · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Southside Shooters 6–9 The Big Bang Theory · regular season Southside Shooters 5–8 The Big Bang Theory · current regular-season streak: The Big Bang Theory ×1 · playoff meetings: 2023 Quarterfinal won by The Big Bang Theory 81.56-79.34; 2024 Quarterfinal won by Southside Shooters 142.26-107.36 · last meeting 2025 Wk 4 (Regular): The Big Bang Theory 175.44-136.58
- Upper: Bad Attitude Gang at Mike Vicks Dog Sitting Co. · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Bad Attitude Gang 0–0 Mike Vicks Dog Sitting Co. · regular season Bad Attitude Gang 0–0 Mike Vicks Dog Sitting Co. · first meeting · last meeting 2022 Wk 16 (Consolation): Motown Ballers 111.46-92.54
- Upper: Hadley's Comets at The Prodigal Sons · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Hadley's Comets 14–8 The Prodigal Sons · regular season Hadley's Comets 12–7 The Prodigal Sons · current regular-season streak: Hadley's Comets ×2 · playoff meetings: 2010 Quarterfinal won by Swissvale GallopingGhosts 105.5-104.0; 2012 Quarterfinal won by Swissvale Griffins III 139.5-120.0; 2022 Championship won by The Prodigal Sons 140.4-93.46 · last meeting 2025 Wk 13 (Regular): Hadley's Comets 172.6-146.9
- Lower: Camp Kes at Tommy Phamclub · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Camp Kes 0–0 Tommy Phamclub · regular season Camp Kes 0–0 Tommy Phamclub · first meeting
- Lower: The Best in The 'Burgh at Tony's Talented Team · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Best in The 'Burgh 1–1 Tony's Talented Team · regular season The Best in The 'Burgh 1–1 Tony's Talented Team · current regular-season streak: The Best in The 'Burgh ×1 · last meeting 2025 Wk 13 (Regular): The Best in The 'Burgh 184.46-162.86
- Lower: Steel City Champyinz at Portly Primates · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Steel City Champyinz 0–2 Portly Primates · regular season Steel City Champyinz 0–2 Portly Primates · current regular-season streak: Portly Primates ×2 · last meeting 2025 Wk 12 (Regular): Portly Primates 148.8-146.36
- Lower: Fightin Ferrets at Sarge's Squad · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Fightin Ferrets 0–0 Sarge's Squad · regular season Fightin Ferrets 0–0 Sarge's Squad · first meeting
- Lower: MAFFL Ghost at The V-Unit · 👻 game

## Coverage (spread the wealth — editorial §4a)
_Headline + subhead + news reel mentions in Weeks 5–7._
- **Not written about in 3 Pulses (give at least 2 of these a news item this week):** Bad Attitude Gang (U), Southside Shooters (U)
- **Already heavy (≥3 mentions — needs a record or a first-ever to make the reel again):** Fightin Ferrets (L) ×4, Camp Kes (L) ×3, Mike Vicks Dog Sitting Co. (U) ×3, Sarge's Squad (L) ×3, South Hills FunShiners (U) ×3, The Prodigal Sons (U) ×3, Tony's Talented Team (L) ×3, Turkey Hat Conglomerate (U) ×3
- **In a headline/subhead the last 2 weeks (don't lead with them again unless it's a record):** Camp Kes (L), Hadley's Comets (U), Marco Clair Kardiac Attack (U), Portly Primates (L), Sarge's Squad (L), Steel City Champyinz (L), The Big Bang Theory (U), The Prodigal Sons (U), The V-Unit (L)

## Story hooks (history from gold; every team has some, so quiet teams get a turn)
_One or two per team are plenty. Use them for news items, Results notes and Coach of the Week notes. Score ranks compare only 2025-on games (scoring changed in 2025). Owner history follows the person across team names. Copy wording loosely, numbers exactly._
- **Bad Attitude Gang** (U, W vs The Big Bang Theory): all-time series with The Big Bang Theory (by owner, regular + playoffs) now 13–14 · snapped a 4-game losing run against them; first win over them since 2022 · playoff history: 2015 Quarterfinal won by Bad Attitude Gang; 2016 Semifinal won by Bad Attitude Gang · best start through Week 8 since 2022 · one win from career regular-season win No. 150 (career 149-135) · won 3 straight regular-season games (career long: 19) · trophy case: 1 title (last 2016); Lower-Tier title 2025; 5 Upper division titles (last 2021) · won Coach of the Week 11 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Camp Kes** (L, W vs Tony's Talented Team): all-time series with Tony's Talented Team (by owner, regular + playoffs) now 1–3 · first win over them ever, after 3 losses · trophy case: 1 title (last 2023); 2 Upper division titles (last 2019) · won Coach of the Week 6 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Fightin Ferrets** (L, W vs 👻): best start through Week 8 since 2016 · trophy case: 2 titles (last 2015); 5 Upper division titles (last 2020) · won Coach of the Week 18 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Hadley's Comets** (U, W vs Reilly's Reindeer): all-time series with Reilly's Reindeer (by owner, regular + playoffs) now 11–10 · playoff history: 2017 Quarterfinal won by Reilly's Reindeers; 2022 Semifinal won by Hadley's Comets · trophy case: 2 titles (last 2007); 7 Upper division titles (last 2023) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Happy Valley Hammer Time** (U, W vs Mike Vicks Dog Sitting Co.): first-ever meeting with Mike Vicks Dog Sitting Co. · trophy case: 3 titles (last 2017); 7 Upper division titles (last 2022) · won Coach of the Week 13 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Jake's Jagoffs** (U, L vs Turkey Hat Conglomerate): all-time series with Turkey Hat Conglomerate (by owner, regular + playoffs) now 1–4 · best start through Week 8 since 2021 · trophy case: 2 titles (last 2021); 3 Upper division titles (last 2021) · won Coach of the Week 10 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Marco Clair Kardiac Attack** (U, L vs Southside Shooters): all-time series with Southside Shooters (by owner, regular + playoffs) now 14–12 · playoff history: 2021 Quarterfinal won by Kardiac Kids · trophy case: 1 title (last 2012); 10 Upper division titles (last 2024) · won Coach of the Week 3 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Mike Vicks Dog Sitting Co.** (U, L vs Happy Valley Hammer Time): first-ever meeting with Happy Valley Hammer Time · 6-2 is this owner's best start through Week 8 in 5 seasons · no MAFFL title yet · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Portly Primates** (L, L vs Tommy Phamclub): all-time series with Tommy Phamclub (by owner, regular + playoffs) now 1–2 · no MAFFL title yet
- **Reilly's Reindeer** (U, L vs Hadley's Comets): all-time series with Hadley's Comets (by owner, regular + playoffs) now 10–11 · playoff history: 2017 Quarterfinal won by Reilly's Reindeers; 2022 Semifinal won by Hadley's Comets · trophy case: 3 titles (last 2024); 8 Upper division titles (last 2025) · won Coach of the Week 19 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Sarge's Squad** (L, L vs The Best in The 'Burgh): all-time series with The Best in The 'Burgh (by owner, regular + playoffs) now 1–2 · no MAFFL title yet
- **South Hills FunShiners** (U, W vs The Prodigal Sons): all-time series with The Prodigal Sons (by owner, regular + playoffs) now 9–4 · snapped a 2-game losing run against them; first win over them since 2024 · won 4 straight regular-season games (career long: 9) · trophy case: 1 title (last 2019); 5 Upper division titles (last 2024) · won Coach of the Week 4 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Southside Shooters** (U, W vs Marco Clair Kardiac Attack): all-time series with Marco Clair Kardiac Attack (by owner, regular + playoffs) now 12–14 · playoff history: 2021 Quarterfinal won by Kardiac Kids · one win from career regular-season win No. 75 (career 74-95) · trophy case: 2 Upper division titles (last 2025) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Steel City Champyinz** (L, L vs The V-Unit): first-ever meeting with The V-Unit · no MAFFL title yet
- **The Best in The 'Burgh** (L, W vs Sarge's Squad): all-time series with Sarge's Squad (by owner, regular + playoffs) now 2–1 · no MAFFL title yet
- **The Big Bang Theory** (U, L vs Bad Attitude Gang): all-time series with Bad Attitude Gang (by owner, regular + playoffs) now 14–13 · loss ended a 4-game winning run against them · playoff history: 2015 Quarterfinal won by Bad Attitude Gang; 2016 Semifinal won by Bad Attitude Gang · trophy case: 4 Upper division titles (last 2024) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The Prodigal Sons** (U, L vs South Hills FunShiners): all-time series with South Hills FunShiners (by owner, regular + playoffs) now 4–9 · loss ended a 2-game winning run against them · trophy case: 3 titles (last 2025); 5 Upper division titles (last 2025) · won Coach of the Week 5 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The V-Unit** (L, W vs Steel City Champyinz): first-ever meeting with Steel City Champyinz · won 4 straight regular-season games (career long: 8) · trophy case: 2 titles (last 2020); 3 Upper division titles (last 2017) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Tommy Phamclub** (L, W vs Portly Primates): all-time series with Portly Primates (by owner, regular + playoffs) now 2–1 · 5-3 is this owner's best start through Week 8 in 2 seasons · no MAFFL title yet
- **Tony's Talented Team** (L, L vs Camp Kes): all-time series with Camp Kes (by owner, regular + playoffs) now 3–1 · loss ended a 3-game winning run against them · trophy case: 1 Upper division title (last 2023) · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Turkey Hat Conglomerate** (U, W vs Jake's Jagoffs): all-time series with Jake's Jagoffs (by owner, regular + playoffs) now 4–1 · trophy case: 3 Upper division titles (last 2025) · won Coach of the Week 7 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
```  exit 0
