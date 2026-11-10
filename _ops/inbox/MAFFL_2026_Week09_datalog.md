# Week 9 data log (robot, Windows runner)

### Append week to gold (ingest_week.py)
```
Appended week 9: 11 matchup rows (CRLF) · 63 top-performer rows (CRLF) · score_sum 3285.26
Stat corrections reported for earlier weeks: 5  → applied next by apply_corrections.py
```  exit 0

### Apply ESPN stat corrections to earlier weeks (apply_corrections.py)
```
# Week 9 — stat corrections applied to gold (robot)
Applied: 5 score change(s) in 5 row(s) · winner flips: 0
- Week 8 · Upper · Southside Shooters 143.80 → 144.30 (vs Marco Clair Kardiac Attack, result unchanged)
- Week 8 · Upper · Hadley's Comets 177.08 → 176.58 (vs Reilly's Reindeer, result unchanged)
- Week 8 · Lower · Portly Primates 144.90 → 145.40 (vs Tommy Phamclub, result unchanged)
- Week 8 · Lower · Sarge's Squad 135.52 → 136.52 (vs The Best in The 'Burgh, result unchanged)
- Week 8 · Lower · MAFFL Ghost 147.62 → 147.81 (vs Fightin Ferrets, result unchanged)
👻 par changes: Week 8 147.62 → 147.81 — LM: re-enter in ESPN
```  exit 0

### CE-1 generator, check (expect 1 = additions)
```
  corrected NoConsolation: 2026,8,Upper,False,Regular,Jon Fetrow/ Casey Trozzo,John Fetrow / Casey Trozzo,Southside Shooters,143.8,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,142.26 -> 2026,8,Upper,False,Regular,Jon Fetrow/ Casey Trozzo,John Fetrow / Casey Trozzo,Southside Shooters,144.3,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,142.26
  corrected NoConsolation: 2026,8,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,177.08,Joe Reilly,Joseph Reilly,Reilly's Reindeer,142.22 -> 2026,8,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,176.58,Joe Reilly,Joseph Reilly,Reilly's Reindeer,142.22
  corrected NoConsolation: 2026,8,Lower,False,Regular,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,147.44,Charles Lavrinc,Charlie Lavrinc,Portly Primates,144.9 -> 2026,8,Lower,False,Regular,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,147.44,Charles Lavrinc,Charlie Lavrinc,Portly Primates,145.4
  corrected NoConsolation: 2026,8,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,169.52,Nick Yankovich,Nick Yankovich,Sarge's Squad,135.52 -> 2026,8,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,169.52,Nick Yankovich,Nick Yankovich,Sarge's Squad,136.52
  corrected NoConsolation: 2026,8,Lower,False,Ghost,Todd Trozzo,Todd Trozzo,Fightin Ferrets,162.02,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,147.62 -> 2026,8,Lower,False,Ghost,Todd Trozzo,Todd Trozzo,Fightin Ferrets,162.02,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,147.81
  corrected matchups-data.js: [2026,8,"U","Jon Fetrow",143.8,"David Murello",142.26,"R"] -> [2026,8,"U","Jon Fetrow",144.3,"David Murello",142.26,"R"]
  corrected matchups-data.js: [2026,8,"U","Brian Murello/ Ron Murello",177.08,"Joe Reilly",142.22,"R"] -> [2026,8,"U","Brian Murello/ Ron Murello",176.58,"Joe Reilly",142.22,"R"]
  corrected matchups-data.js: [2026,8,"L","Sam Lavrinc",147.44,"Charles Lavrinc",144.9,"R"] -> [2026,8,"L","Sam Lavrinc",147.44,"Charles Lavrinc",145.4,"R"]
  corrected matchups-data.js: [2026,8,"L","Ben Funari",169.52,"Nick Yankovich",135.52,"R"] -> [2026,8,"L","Ben Funari",169.52,"Nick Yankovich",136.52,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2825 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.81 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 9 Lower: Chris Johnson W 166.9-147.04 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x9
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 5 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2477 -> 2488 rows; append-only drift check passed.
[matchups-data.js] DIFFERS -- 2469 -> 2479 rows (9 Ghost row(s) excluded); append-only drift check passed.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
check-only (no -Write); nothing written.
```  exit 1

### CE-1 generator, write
```
  corrected NoConsolation: 2026,8,Upper,False,Regular,Jon Fetrow/ Casey Trozzo,John Fetrow / Casey Trozzo,Southside Shooters,143.8,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,142.26 -> 2026,8,Upper,False,Regular,Jon Fetrow/ Casey Trozzo,John Fetrow / Casey Trozzo,Southside Shooters,144.3,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,142.26
  corrected NoConsolation: 2026,8,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,177.08,Joe Reilly,Joseph Reilly,Reilly's Reindeer,142.22 -> 2026,8,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,176.58,Joe Reilly,Joseph Reilly,Reilly's Reindeer,142.22
  corrected NoConsolation: 2026,8,Lower,False,Regular,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,147.44,Charles Lavrinc,Charlie Lavrinc,Portly Primates,144.9 -> 2026,8,Lower,False,Regular,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,147.44,Charles Lavrinc,Charlie Lavrinc,Portly Primates,145.4
  corrected NoConsolation: 2026,8,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,169.52,Nick Yankovich,Nick Yankovich,Sarge's Squad,135.52 -> 2026,8,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,169.52,Nick Yankovich,Nick Yankovich,Sarge's Squad,136.52
  corrected NoConsolation: 2026,8,Lower,False,Ghost,Todd Trozzo,Todd Trozzo,Fightin Ferrets,162.02,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,147.62 -> 2026,8,Lower,False,Ghost,Todd Trozzo,Todd Trozzo,Fightin Ferrets,162.02,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,147.81
  corrected matchups-data.js: [2026,8,"U","Jon Fetrow",143.8,"David Murello",142.26,"R"] -> [2026,8,"U","Jon Fetrow",144.3,"David Murello",142.26,"R"]
  corrected matchups-data.js: [2026,8,"U","Brian Murello/ Ron Murello",177.08,"Joe Reilly",142.22,"R"] -> [2026,8,"U","Brian Murello/ Ron Murello",176.58,"Joe Reilly",142.22,"R"]
  corrected matchups-data.js: [2026,8,"L","Sam Lavrinc",147.44,"Charles Lavrinc",144.9,"R"] -> [2026,8,"L","Sam Lavrinc",147.44,"Charles Lavrinc",145.4,"R"]
  corrected matchups-data.js: [2026,8,"L","Ben Funari",169.52,"Nick Yankovich",135.52,"R"] -> [2026,8,"L","Ben Funari",169.52,"Nick Yankovich",136.52,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2825 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.81 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 9 Lower: Chris Johnson W 166.9-147.04 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x9
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 5 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2477 -> 2488 rows; append-only drift check passed.
[MAFFL_Matchups_NoConsolation.csv] WROTE.
[matchups-data.js] DIFFERS -- 2469 -> 2479 rows (9 Ghost row(s) excluded); append-only drift check passed.
[matchups-data.js] WROTE.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_By_Season.csv] WROTE.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
[MAFFL_Points_AllTime.csv] WROTE.
```  exit 1

### CE-1 generator, re-check (expect 0 = in sync)
```
[gold] MAFFL_Matchups_Clean.csv: 2825 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.81 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 9 Lower: Chris Johnson W 166.9-147.04 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x9
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 0 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] ROUND-TRIP EXACT -- byte-identical (2488 -> 2488 rows).
[matchups-data.js] ROUND-TRIP EXACT -- byte-identical (2479 -> 2479 rows (9 Ghost row(s) excluded)).
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
# MAFFL 2026 Week 9 — Pulse facts (computed from gold)
Source: pulse_facts.py v0.2. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).

## Standings (season totals through this week)
**Upper Div A**
- Bad Attitude Gang · 6-3 · points 1427.60 · streak +4 · credits 27 · all-play 64-35
- South Hills FunShiners · 6-3 · points 1321.12 · streak -1 · credits 4 · all-play 48-51
- Marco Clair Kardiac Attack · 5-4 · points 1300.14 · streak +1 · credits 12 · all-play 53-46
**Upper Div B**
- Mike Vicks Dog Sitting Co. · 6-3 · points 1372.80 · streak -2 · credits 5 · all-play 64-35
- Jake's Jagoffs · 5-4 · points 1240.34 · streak -3 · credits 15 · all-play 42-57
- The Prodigal Sons · 4-5 · points 1327.18 · streak +1 · credits 24 · all-play 52-47
**Upper Div C**
- Happy Valley Hammer Time · 5-4 · points 1266.08 · streak +2 · credits 17 · all-play 37-62
- The Big Bang Theory · 4-5 · points 1238.40 · streak -2 · credits 6 · all-play 39-60
- Reilly's Reindeer · 3-6 · points 1283.86 · streak +1 · credits 23 · all-play 47-52
**Upper Div D**
- Hadley's Comets · 4-5 · points 1365.94 · streak -1 · credits 7 · all-play 55-44
- Turkey Hat Conglomerate · 3-6 · points 1380.34 · streak -1 · credits 7 · all-play 57-42
- Southside Shooters · 3-6 · points 1215.04 · streak +2 · credits 7 · all-play 36-63
**Lower** (👻 always listed last on the page)
- The Best in The 'Burgh · 7-2 · points 1438.52 · streak +4 · credits 6 · all-play 48-24
- Tommy Phamclub · 6-3 · points 1416.78 · streak +2 · credits 8 · all-play 40-32
- The V-Unit · 6-3 · points 1332.70 · streak +5 · credits 0 · all-play 32-40
- Steel City Champyinz · 5-4 · points 1321.50 · streak +1 · credits 6 · all-play 34-38
- Sarge's Squad · 5-4 · points 1407.38 · streak +1 · credits 5 · all-play 38-34
- Fightin Ferrets · 5-4 · points 1505.92 · streak -1 · credits 1 · all-play 53-19
- Portly Primates · 4-5 · points 1326.06 · streak -2 · credits 6 · all-play 30-42
- Tony's Talented Team · 2-7 · points 1378.94 · streak -4 · credits 10 · all-play 34-38
- Camp Kes · 2-7 · points 1179.22 · streak -1 · credits 1 · all-play 15-57
- MAFFL Ghost · 3-6 · points 1330.41 · streak -3 · credits 0

## Playoff picture (page builds this itself; for prose only)
Upper seeds: 1 Bad Attitude Gang (div) · 2 Mike Vicks Dog Sitting Co. (div) · 3 Happy Valley Hammer Time (div) · 4 Hadley's Comets (div) · 5 South Hills FunShiners (WC) · 6 Jake's Jagoffs (WC) · 7 Marco Clair Kardiac Attack · 8 The Prodigal Sons · 9 The Big Bang Theory · 10 Reilly's Reindeer · 11 Turkey Hat Conglomerate · 12 Southside Shooters
Upper relegation spots (11–12): Turkey Hat Conglomerate, Southside Shooters
Lower order: 1 The Best in The 'Burgh · 2 Tommy Phamclub · 3 The V-Unit · 4 Steel City Champyinz · 5 Sarge's Squad · 6 Fightin Ferrets · 7 Portly Primates · 8 Tony's Talented Team · 9 Camp Kes  (promotion line = top 2)

## Survivor
**Upper** — 3 alive: Mike Vicks Dog Sitting Co., Turkey Hat Conglomerate, Southside Shooters
- Week 9: South Hills FunShiners out with 126.44
- Week 8: The Prodigal Sons out with 124.24
- Week 7: Jake's Jagoffs out with 84.76
- Week 6: Hadley's Comets out with 100.30
- Week 5: Bad Attitude Gang out with 102.24
- Week 4: Reilly's Reindeer out with 103.30
- Week 3: Marco Clair Kardiac Attack out with 114.32
- Week 2: The Big Bang Theory out with 88.72
- Week 1: Happy Valley Hammer Time out with 124.14
  margin: South Hills FunShiners was 8.04 behind Turkey Hat Conglomerate
**Lower** — 1 alive: The Best in The 'Burgh
- Week 8: Sarge's Squad out with 136.52
- Week 7: Fightin Ferrets out with 145.96
- Week 6: Tony's Talented Team out with 134.44
- Week 5: Portly Primates out with 133.80
- Week 4: Camp Kes out with 124.88
- Week 3: Tommy Phamclub out with 135.94
- Week 2: The V-Unit out with 124.74
- Week 1: Steel City Champyinz out with 116.34

## Credit Tracker leaders (status 'leading' until the award is mathematically locked)
- Most Team Points Scored — Upper: Bad Attitude Gang · 1427.60 through Wk 9 · since 6
- Most Team Points Scored — Lower: Fightin Ferrets · 1505.92 through Wk 9 · since 5
- Largest Blowout Victory — Upper: Turkey Hat Conglomerate · 76.14 over Jake's Jagoffs (Wk 8) · since 8
- Largest Blowout Victory — Lower: Tommy Phamclub · 60.90 over 👻 (Wk 2) · since 1
- Individual high THIS WEEK — Upper: C. Stroud, Marco Clair Kardiac Attack, 44.36  → compare with last week's creditTracker value; the season leader changes only if this is higher.
- Individual high THIS WEEK — Lower: C. Stroud, Sarge's Squad, 44.36  → compare with last week's creditTracker value; the season leader changes only if this is higher.

## Highest weekly score this week
- Upper: The Prodigal Sons · 176.76
- Lower: Sarge's Squad · 194.06

## This week's games (winner first) with context
- Upper: The Prodigal Sons 176.76 def. Hadley's Comets 153.02 · margin 23.74
- Upper: Bad Attitude Gang 163.26 def. Mike Vicks Dog Sitting Co. 155.62 · margin 7.64
- Upper: Reilly's Reindeer 157.96 def. South Hills FunShiners 126.44 · margin 31.52
- Upper: Marco Clair Kardiac Attack 152.06 def. Jake's Jagoffs 123.74 · margin 28.32
- Upper: Happy Valley Hammer Time 148.06 def. Turkey Hat Conglomerate 134.48 · margin 13.58
- Upper: Southside Shooters 144.28 def. The Big Bang Theory 132.18 · margin 12.10
- Lower: Sarge's Squad 194.06 def. Fightin Ferrets 186.56 · margin 7.50
- Lower: The V-Unit 166.90 def. MAFFL Ghost 147.04 · margin 19.86
- Lower: The Best in The 'Burgh 155.62 def. Tony's Talented Team 131.28 · margin 24.34
- Lower: Tommy Phamclub 152.80 def. Camp Kes 123.58 · margin 29.22
- Lower: Steel City Champyinz 136.20 def. Portly Primates 123.36 · margin 12.84

## Week 10 pairings + head-to-head (all MAFFL history, by owner)
- Upper: Bad Attitude Gang at Turkey Hat Conglomerate · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Bad Attitude Gang 6–6 Turkey Hat Conglomerate · regular season Bad Attitude Gang 6–6 Turkey Hat Conglomerate · current regular-season streak: Turkey Hat Conglomerate ×2 · last meeting 2024 Wk 17 (Consolation): Turkey Hat Conglomerate 119.58-101.18
- Upper: Marco Clair Kardiac Attack at Reilly's Reindeer · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Marco Clair Kardiac Attack 8–14 Reilly's Reindeer · regular season Marco Clair Kardiac Attack 7–13 Reilly's Reindeer · current regular-season streak: Reilly's Reindeer ×3 · playoff meetings: 2005 Quarterfinal won by Kardiac Kids 151.5-127.5; 2025 Semifinal won by Reilly's Reindeer 175.94-162.48 · last meeting 2025 Wk 16 (Semifinal): Reilly's Reindeer 175.94-162.48
- Upper: The Prodigal Sons at The Big Bang Theory · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Prodigal Sons 5–8 The Big Bang Theory · regular season The Prodigal Sons 5–8 The Big Bang Theory · current regular-season streak: The Prodigal Sons ×1 · last meeting 2025 Wk 12 (Regular): The Prodigal Sons 154.98-116.98
- Upper: Mike Vicks Dog Sitting Co. at Southside Shooters · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Mike Vicks Dog Sitting Co. 1–3 Southside Shooters · regular season Mike Vicks Dog Sitting Co. 1–3 Southside Shooters · current regular-season streak: Southside Shooters ×2 · last meeting 2025 Wk 10 (Regular): Southside Shooters 135.5-100.92
- Upper: Jake's Jagoffs at South Hills FunShiners · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Jake's Jagoffs 8–8 South Hills FunShiners · regular season Jake's Jagoffs 6–8 South Hills FunShiners · current regular-season streak: South Hills FunShiners ×3 · playoff meetings: 2015 Quarterfinal won by Jake's Jagoffs 111.7-102.96; 2021 Semifinal won by Jake's Jagoffs 121.32-106.2 · last meeting 2024 Wk 7 (Regular): South Hills FunShiners 99.68-84.84
- Upper: Happy Valley Hammer Time at Hadley's Comets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Happy Valley Hammer Time 3–3 Hadley's Comets · regular season Happy Valley Hammer Time 3–3 Hadley's Comets · current regular-season streak: Happy Valley Hammer Time ×1 · last meeting 2021 Wk 8 (Regular): Happy Valley Hammer Time 127.26-94.96
- Lower: The Best in The 'Burgh at Camp Kes · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Best in The 'Burgh 1–0 Camp Kes · regular season The Best in The 'Burgh 1–0 Camp Kes · current regular-season streak: The Best in The 'Burgh ×1 · last meeting 2026 Wk 1 (Regular): The Best in The 'Burgh 160.04-145.08
- Lower: Tommy Phamclub at Steel City Champyinz · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tommy Phamclub 2–1 Steel City Champyinz · regular season Tommy Phamclub 2–1 Steel City Champyinz · current regular-season streak: Tommy Phamclub ×1 · last meeting 2026 Wk 1 (Regular): Tommy Phamclub 162.3-116.34
- Lower: Tony's Talented Team at Fightin Ferrets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tony's Talented Team 1–4 Fightin Ferrets · regular season Tony's Talented Team 1–4 Fightin Ferrets · current regular-season streak: Fightin Ferrets ×3 · last meeting 2026 Wk 1 (Regular): Fightin Ferrets 194.82-189.82
- Lower: Portly Primates at MAFFL Ghost · 👻 game
- Lower: Sarge's Squad at The V-Unit · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Sarge's Squad 0–1 The V-Unit · regular season Sarge's Squad 0–1 The V-Unit · current regular-season streak: The V-Unit ×1 · last meeting 2026 Wk 1 (Regular): The V-Unit 141.06-126.9

## Coverage (spread the wealth — editorial §4a)
_Headline + subhead + news reel mentions in Weeks 6–8._
- **Not written about in 3 Pulses (give at least 2 of these a news item this week):** none
- **Already heavy (≥3 mentions — needs a record or a first-ever to make the reel again):** Marco Clair Kardiac Attack (U) ×4, Sarge's Squad (L) ×4, Tony's Talented Team (L) ×4, Camp Kes (L) ×3, Fightin Ferrets (L) ×3, Happy Valley Hammer Time (U) ×3, Jake's Jagoffs (U) ×3, South Hills FunShiners (U) ×3, The Best in The 'Burgh (L) ×3, The Prodigal Sons (U) ×3, Turkey Hat Conglomerate (U) ×3
- **In a headline/subhead the last 2 weeks (don't lead with them again unless it's a record):** Hadley's Comets (U), Happy Valley Hammer Time (U), Jake's Jagoffs (U), Marco Clair Kardiac Attack (U), Mike Vicks Dog Sitting Co. (U), Steel City Champyinz (L), The Big Bang Theory (U), The Prodigal Sons (U), Turkey Hat Conglomerate (U)

## Story hooks (history from gold; every team has some, so quiet teams get a turn)
_One or two per team are plenty. Use them for news items, Results notes and Coach of the Week notes. Score ranks compare only 2025-on games (scoring changed in 2025). Owner history follows the person across team names. Copy wording loosely, numbers exactly._
- **Bad Attitude Gang** (U, W vs Mike Vicks Dog Sitting Co.): first-ever meeting with Mike Vicks Dog Sitting Co. · best start through Week 9 since 2022 · that was career regular-season win No. 150 (career 150-135) · won 4 straight regular-season games (career long: 19) · trophy case: 1 title (last 2016); Lower-Tier title 2025; 5 Upper division titles (last 2021) · won Coach of the Week 11 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Camp Kes** (L, L vs Tommy Phamclub): first-ever meeting with Tommy Phamclub · trophy case: 1 title (last 2023); 2 Upper division titles (last 2019) · won Coach of the Week 6 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Fightin Ferrets** (L, L vs Sarge's Squad): first-ever meeting with Sarge's Squad · best start through Week 9 since 2020 · trophy case: 2 titles (last 2015); 5 Upper division titles (last 2020) · won Coach of the Week 18 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Hadley's Comets** (U, L vs The Prodigal Sons): all-time series with The Prodigal Sons (by owner, regular + playoffs) now 14–9 · loss ended a 2-game winning run against them · playoff history: 2010 Quarterfinal won by Swissvale GallopingGhosts; 2012 Quarterfinal won by Swissvale Griffins III; 2022 Championship won by The Prodigal Sons · trophy case: 2 titles (last 2007); 7 Upper division titles (last 2023) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Happy Valley Hammer Time** (U, W vs Turkey Hat Conglomerate): all-time series with Turkey Hat Conglomerate (by owner, regular + playoffs) now 6–8 · snapped a 4-game losing run against them; first win over them since 2021 · playoff history: 2022 Quarterfinal won by Turkey Hat Conglomerate · best start through Week 9 since 2022 · trophy case: 3 titles (last 2017); 7 Upper division titles (last 2022) · won Coach of the Week 13 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Jake's Jagoffs** (U, L vs Marco Clair Kardiac Attack): all-time series with Marco Clair Kardiac Attack (by owner, regular + playoffs) now 2–4 · best start through Week 9 since 2021 · lost 3 straight regular-season games (career long: 10) · trophy case: 2 titles (last 2021); 3 Upper division titles (last 2021) · won Coach of the Week 10 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Marco Clair Kardiac Attack** (U, W vs Jake's Jagoffs): all-time series with Jake's Jagoffs (by owner, regular + playoffs) now 4–2 · trophy case: 1 title (last 2012); 10 Upper division titles (last 2024) · won Coach of the Week 3 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Mike Vicks Dog Sitting Co.** (U, L vs Bad Attitude Gang): first-ever meeting with Bad Attitude Gang · best start through Week 9 since 2022 · no MAFFL title yet · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Portly Primates** (L, L vs Steel City Champyinz): all-time series with Steel City Champyinz (by owner, regular + playoffs) now 2–1 · loss ended a 2-game winning run against them · no MAFFL title yet
- **Reilly's Reindeer** (U, W vs South Hills FunShiners): all-time series with South Hills FunShiners (by owner, regular + playoffs) now 16–10 · playoff history: 2019 Quarterfinal won by Fort Myers Sunshiners; 2022 Quarterfinal won by Reilly's Reindeer; 2024 Semifinal won by Reilly's Reindeer · trophy case: 3 titles (last 2024); 8 Upper division titles (last 2025) · won Coach of the Week 19 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Sarge's Squad** (L, W vs Fightin Ferrets): first-ever meeting with Fightin Ferrets · 194.06 is the 8th-highest Lower score of 193 since 2025 · no MAFFL title yet
- **South Hills FunShiners** (U, L vs Reilly's Reindeer): all-time series with Reilly's Reindeer (by owner, regular + playoffs) now 10–16 · playoff history: 2019 Quarterfinal won by Fort Myers Sunshiners; 2022 Quarterfinal won by Reilly's Reindeer; 2024 Semifinal won by Reilly's Reindeer · trophy case: 1 title (last 2019); 5 Upper division titles (last 2024) · won Coach of the Week 4 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Southside Shooters** (U, W vs The Big Bang Theory): all-time series with The Big Bang Theory (by owner, regular + playoffs) now 7–9 · playoff history: 2023 Quarterfinal won by The Big Bang Theory; 2024 Quarterfinal won by Southside Shooters · that was career regular-season win No. 75 (career 75-95) · trophy case: 2 Upper division titles (last 2025) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Steel City Champyinz** (L, W vs Portly Primates): all-time series with Portly Primates (by owner, regular + playoffs) now 1–2 · first win over them ever, after 2 losses · no MAFFL title yet
- **The Best in The 'Burgh** (L, W vs Tony's Talented Team): all-time series with Tony's Talented Team (by owner, regular + playoffs) now 2–1 · won 3 straight regular-season games (career long: 4) · no MAFFL title yet
- **The Big Bang Theory** (U, L vs Southside Shooters): all-time series with Southside Shooters (by owner, regular + playoffs) now 9–7 · playoff history: 2023 Quarterfinal won by The Big Bang Theory; 2024 Quarterfinal won by Southside Shooters · trophy case: 4 Upper division titles (last 2024) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The Prodigal Sons** (U, W vs Hadley's Comets): all-time series with Hadley's Comets (by owner, regular + playoffs) now 9–14 · snapped a 2-game losing run against them; first win over them since 2023 · playoff history: 2010 Quarterfinal won by Swissvale GallopingGhosts; 2012 Quarterfinal won by Swissvale Griffins III; 2022 Championship won by The Prodigal Sons · trophy case: 3 titles (last 2025); 5 Upper division titles (last 2025) · won Coach of the Week 5 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The V-Unit** (L, W vs 👻): won 4 straight regular-season games (career long: 8) · trophy case: 2 titles (last 2020); 3 Upper division titles (last 2017) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Tommy Phamclub** (L, W vs Camp Kes): first-ever meeting with Camp Kes · no MAFFL title yet
- **Tony's Talented Team** (L, L vs The Best in The 'Burgh): all-time series with The Best in The 'Burgh (by owner, regular + playoffs) now 1–2 · lost 3 straight regular-season games (career long: 5) · trophy case: 1 Upper division title (last 2023) · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Turkey Hat Conglomerate** (U, L vs Happy Valley Hammer Time): all-time series with Happy Valley Hammer Time (by owner, regular + playoffs) now 8–6 · loss ended a 4-game winning run against them · playoff history: 2022 Quarterfinal won by Turkey Hat Conglomerate · trophy case: 3 Upper division titles (last 2025) · won Coach of the Week 7 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
```  exit 0

### Lab week facts for the quiz cards (gen_lab_weekfacts.py)
```
Week 1: 46 missed calls, 1 bench>starters, 63 top performers, 2 highs, 5 bids
Week 2: 51 missed calls, 4 bench>starters, 63 top performers, 2 highs, 5 bids
Week 3: 0 missed calls, 5 bench>starters, 63 top performers, 2 highs, 5 bids
Week 4: 56 missed calls, 4 bench>starters, 63 top performers, 2 highs, 5 bids
Week 5: 41 missed calls, 2 bench>starters, 63 top performers, 2 highs, 5 bids
Week 6: 39 missed calls, 2 bench>starters, 63 top performers, 2 highs, 5 bids
Week 7: 40 missed calls, 2 bench>starters, 63 top performers, 2 highs, 5 bids
Week 8: 39 missed calls, 2 bench>starters, 63 top performers, 2 highs, 5 bids
Week 9: 45 missed calls, 2 bench>starters, 63 top performers, 2 highs, 5 bids
```  exit 0

### Vault data (gen_vault.py; a failure here never blocks the Pulse)
```
wrote lab/vault-data.js � 24 seasons � 173 KB
```  exit 0
