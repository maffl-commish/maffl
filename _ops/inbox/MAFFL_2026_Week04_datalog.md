# Week 4 data log (robot, Windows runner)

### Append week to gold (ingest_week.py)
```
Appended week 4: 11 matchup rows (CRLF) · 63 top-performer rows (CRLF) · score_sum 3254.31
Stat corrections reported for earlier weeks: 6  → applied next by apply_corrections.py
```  exit 0

### Apply ESPN stat corrections to earlier weeks (apply_corrections.py)
```
# Week 4 — stat corrections applied to gold (robot)
Applied: 6 score change(s) in 6 row(s) · winner flips: 0
- Week 3 · Upper · Bad Attitude Gang 154.22 → 153.72 (vs Happy Valley Hammer Time, result unchanged)
- Week 3 · Upper · The Prodigal Sons 143.78 → 142.78 (vs Jake's Jagoffs, result unchanged)
- Week 3 · Upper · The Big Bang Theory 125.60 → 125.10 (vs Mike Vicks Dog Sitting Co., result unchanged)
- Week 3 · Lower · Fightin Ferrets 137.60 → 138.60 (vs Camp Kes, result unchanged)
- Week 3 · Lower · The Best in The 'Burgh 179.34 → 178.84 (vs The V-Unit, result unchanged)
- Week 3 · Lower · Tony's Talented Team 167.52 → 167.02 (vs Portly Primates, result unchanged)
👻 par changes: none
```  exit 0

### CE-1 generator, check (expect 1 = additions)
```
  corrected NoConsolation: 2026,3,Upper,False,Regular,Tony Trozzo,Tony Trozzo,Happy Valley Hammer Time,169.32,Mike Murello,Michael Murello,Bad Attitude Gang,154.22 -> 2026,3,Upper,False,Regular,Tony Trozzo,Tony Trozzo,Happy Valley Hammer Time,169.32,Mike Murello,Michael Murello,Bad Attitude Gang,153.72
  corrected NoConsolation: 2026,3,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,150.2,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,143.78 -> 2026,3,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,150.2,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,142.78
  corrected NoConsolation: 2026,3,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,127.08,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.6 -> 2026,3,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,127.08,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.1
  corrected NoConsolation: 2026,3,Lower,False,Regular,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,141.06,Todd Trozzo,Todd Trozzo,Fightin Ferrets,137.6 -> 2026,3,Lower,False,Regular,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,141.06,Todd Trozzo,Todd Trozzo,Fightin Ferrets,138.6
  corrected NoConsolation: 2026,3,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,179.34,Chris Johnson,Chris Johnson,The V-Unit,143.76 -> 2026,3,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,178.84,Chris Johnson,Chris Johnson,The V-Unit,143.76
  corrected NoConsolation: 2026,3,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,185.98,Tony Brooks,Tony Brooks,Tony's Talented Team,167.52 -> 2026,3,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,185.98,Tony Brooks,Tony Brooks,Tony's Talented Team,167.02
  corrected matchups-data.js: [2026,3,"U","Tony Trozzo",169.32,"Mike Murello",154.22,"R"] -> [2026,3,"U","Tony Trozzo",169.32,"Mike Murello",153.72,"R"]
  corrected matchups-data.js: [2026,3,"U","Jacob Nickman",150.2,"Jon Murello/ Rick Simmons",143.78,"R"] -> [2026,3,"U","Jacob Nickman",150.2,"Jon Murello/ Rick Simmons",142.78,"R"]
  corrected matchups-data.js: [2026,3,"U","Braiden Snyder",127.08,"Dan Reilly",125.6,"R"] -> [2026,3,"U","Braiden Snyder",127.08,"Dan Reilly",125.1,"R"]
  corrected matchups-data.js: [2026,3,"L","Bob Keslar",141.06,"Todd Trozzo",137.6,"R"] -> [2026,3,"L","Bob Keslar",141.06,"Todd Trozzo",138.6,"R"]
  corrected matchups-data.js: [2026,3,"L","Ben Funari",179.34,"Chris Johnson",143.76,"R"] -> [2026,3,"L","Ben Funari",178.84,"Chris Johnson",143.76,"R"]
  corrected matchups-data.js: [2026,3,"L","Charles Lavrinc",185.98,"Tony Brooks",167.52,"R"] -> [2026,3,"L","Charles Lavrinc",185.98,"Tony Brooks",167.02,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2770 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.67 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x4
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 6 NoConsolation row(s) corrected in season 2026
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2422 -> 2433 rows; append-only drift check passed.
[matchups-data.js] DIFFERS -- 2419 -> 2429 rows (4 Ghost row(s) excluded); append-only drift check passed.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
check-only (no -Write); nothing written.
```  exit 1

### CE-1 generator, write
```
  corrected NoConsolation: 2026,3,Upper,False,Regular,Tony Trozzo,Tony Trozzo,Happy Valley Hammer Time,169.32,Mike Murello,Michael Murello,Bad Attitude Gang,154.22 -> 2026,3,Upper,False,Regular,Tony Trozzo,Tony Trozzo,Happy Valley Hammer Time,169.32,Mike Murello,Michael Murello,Bad Attitude Gang,153.72
  corrected NoConsolation: 2026,3,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,150.2,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,143.78 -> 2026,3,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,150.2,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,142.78
  corrected NoConsolation: 2026,3,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,127.08,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.6 -> 2026,3,Upper,False,Regular,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,127.08,Dan Reilly,Daniel Reilly,The Big Bang Theory,125.1
  corrected NoConsolation: 2026,3,Lower,False,Regular,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,141.06,Todd Trozzo,Todd Trozzo,Fightin Ferrets,137.6 -> 2026,3,Lower,False,Regular,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,141.06,Todd Trozzo,Todd Trozzo,Fightin Ferrets,138.6
  corrected NoConsolation: 2026,3,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,179.34,Chris Johnson,Chris Johnson,The V-Unit,143.76 -> 2026,3,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,178.84,Chris Johnson,Chris Johnson,The V-Unit,143.76
  corrected NoConsolation: 2026,3,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,185.98,Tony Brooks,Tony Brooks,Tony's Talented Team,167.52 -> 2026,3,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,185.98,Tony Brooks,Tony Brooks,Tony's Talented Team,167.02
  corrected matchups-data.js: [2026,3,"U","Tony Trozzo",169.32,"Mike Murello",154.22,"R"] -> [2026,3,"U","Tony Trozzo",169.32,"Mike Murello",153.72,"R"]
  corrected matchups-data.js: [2026,3,"U","Jacob Nickman",150.2,"Jon Murello/ Rick Simmons",143.78,"R"] -> [2026,3,"U","Jacob Nickman",150.2,"Jon Murello/ Rick Simmons",142.78,"R"]
  corrected matchups-data.js: [2026,3,"U","Braiden Snyder",127.08,"Dan Reilly",125.6,"R"] -> [2026,3,"U","Braiden Snyder",127.08,"Dan Reilly",125.1,"R"]
  corrected matchups-data.js: [2026,3,"L","Bob Keslar",141.06,"Todd Trozzo",137.6,"R"] -> [2026,3,"L","Bob Keslar",141.06,"Todd Trozzo",138.6,"R"]
  corrected matchups-data.js: [2026,3,"L","Ben Funari",179.34,"Chris Johnson",143.76,"R"] -> [2026,3,"L","Ben Funari",178.84,"Chris Johnson",143.76,"R"]
  corrected matchups-data.js: [2026,3,"L","Charles Lavrinc",185.98,"Tony Brooks",167.52,"R"] -> [2026,3,"L","Charles Lavrinc",185.98,"Tony Brooks",167.02,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2770 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.67 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x4
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 6 NoConsolation row(s) corrected in season 2026
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2422 -> 2433 rows; append-only drift check passed.
[MAFFL_Matchups_NoConsolation.csv] WROTE.
[matchups-data.js] DIFFERS -- 2419 -> 2429 rows (4 Ghost row(s) excluded); append-only drift check passed.
[matchups-data.js] WROTE.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_By_Season.csv] WROTE.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
[MAFFL_Points_AllTime.csv] WROTE.
```  exit 1

### CE-1 generator, re-check (expect 0 = in sync)
```
[gold] MAFFL_Matchups_Clean.csv: 2770 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.67 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x4
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 0 NoConsolation row(s) corrected in season 2026
[MAFFL_Matchups_NoConsolation.csv] ROUND-TRIP EXACT -- byte-identical (2433 -> 2433 rows).
[matchups-data.js] ROUND-TRIP EXACT -- byte-identical (2429 -> 2429 rows (4 Ghost row(s) excluded)).
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
        K picks 2025+ = 0 (rows=6317)
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
# MAFFL 2026 Week 4 — Pulse facts (computed from gold)
Source: pulse_facts.py v0.1. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).

## Standings (season totals through this week)
**Upper Div A**
- Bad Attitude Gang · 2-2 · points 688.06 · streak +1 · credits 27 · all-play 30-14
- Marco Clair Kardiac Attack · 2-2 · points 563.02 · streak +1 · credits 12 · all-play 21-23
- South Hills FunShiners · 2-2 · points 591.42 · streak -1 · credits 4 · all-play 22-22
**Upper Div B**
- Jake's Jagoffs · 4-0 · points 645.24 · streak +4 · credits 15 · all-play 32-12
- Mike Vicks Dog Sitting Co. · 3-1 · points 592.08 · streak +2 · credits 5 · all-play 26-18
- The Prodigal Sons · 1-3 · points 581.44 · streak -3 · credits 24 · all-play 19-25
**Upper Div C**
- Happy Valley Hammer Time · 3-1 · points 598.20 · streak +3 · credits 17 · all-play 20-24
- The Big Bang Theory · 2-2 · points 539.34 · streak +1 · credits 6 · all-play 18-26
- Reilly's Reindeer · 0-4 · points 517.26 · streak -4 · credits 23 · all-play 9-35
**Upper Div D**
- Hadley's Comets · 3-1 · points 634.24 · streak -1 · credits 7 · all-play 27-17
- Turkey Hat Conglomerate · 2-2 · points 659.94 · streak -1 · credits 7 · all-play 31-13
- Southside Shooters · 0-4 · points 496.90 · streak -4 · credits 7 · all-play 9-35
**Lower** (👻 always listed last on the page)
- Tommy Phamclub · 3-1 · points 653.06 · streak +1 · credits 8 · all-play 18-14
- The Best in The 'Burgh · 3-1 · points 638.50 · streak -1 · credits 6 · all-play 21-11
- Portly Primates · 3-1 · points 638.22 · streak +2 · credits 6 · all-play 20-12
- Steel City Champyinz · 3-1 · points 594.10 · streak +3 · credits 6 · all-play 19-13
- Sarge's Squad · 2-2 · points 567.82 · streak -1 · credits 5 · all-play 12-20
- Fightin Ferrets · 2-2 · points 651.84 · streak +1 · credits 1 · all-play 23-9
- Tony's Talented Team · 1-3 · points 621.14 · streak -2 · credits 10 · all-play 15-17
- Camp Kes · 1-3 · points 549.88 · streak -1 · credits 1 · all-play 10-22
- The V-Unit · 1-3 · points 533.56 · streak -3 · credits 0 · all-play 6-26
- MAFFL Ghost · 1-3 · points 586.44 · streak +1 · credits 0

## Playoff picture (page builds this itself; for prose only)
Upper seeds: 1 Jake's Jagoffs (div) · 2 Happy Valley Hammer Time (div) · 3 Hadley's Comets (div) · 4 Bad Attitude Gang (div) · 5 Mike Vicks Dog Sitting Co. (WC) · 6 Marco Clair Kardiac Attack (WC) · 7 Turkey Hat Conglomerate · 8 The Big Bang Theory · 9 South Hills FunShiners · 10 The Prodigal Sons · 11 Reilly's Reindeer · 12 Southside Shooters
Upper relegation spots (11–12): Reilly's Reindeer, Southside Shooters
Lower order: 1 Tommy Phamclub · 2 The Best in The 'Burgh · 3 Portly Primates · 4 Steel City Champyinz · 5 Sarge's Squad · 6 Fightin Ferrets · 7 Tony's Talented Team · 8 Camp Kes · 9 The V-Unit  (promotion line = top 2)

## Survivor
**Upper** — 8 alive: Bad Attitude Gang, South Hills FunShiners, Jake's Jagoffs, The Prodigal Sons, Mike Vicks Dog Sitting Co., Hadley's Comets, Turkey Hat Conglomerate, Southside Shooters
- Week 4: Reilly's Reindeer out with 104.30
- Week 3: Marco Clair Kardiac Attack out with 114.32
- Week 2: The Big Bang Theory out with 88.72
- Week 1: Happy Valley Hammer Time out with 124.14
  margin: Reilly's Reindeer was 7.88 behind Southside Shooters
**Lower** — 5 alive: Fightin Ferrets, Portly Primates, Sarge's Squad, The Best in The 'Burgh, Tony's Talented Team
- Week 4: Camp Kes out with 124.88
- Week 3: Tommy Phamclub out with 135.94
- Week 2: The V-Unit out with 124.74
- Week 1: Steel City Champyinz out with 116.34
  margin: Camp Kes was 12.78 behind Tony's Talented Team

## Credit Tracker leaders (status 'leading' until the award is mathematically locked)
- Most Team Points Scored — Upper: Bad Attitude Gang · 688.06 through Wk 4 · since 2
- Most Team Points Scored — Lower: Tommy Phamclub · 653.06 through Wk 4 · since 2
- Largest Blowout Victory — Upper: Bad Attitude Gang · 59.14 over The Prodigal Sons (Wk 2) · since 2
- Largest Blowout Victory — Lower: Tommy Phamclub · 60.90 over 👻 (Wk 2) · since 1
- Individual high THIS WEEK — Upper: T. McMillan, Bad Attitude Gang, 31.2  → compare with last week's creditTracker value; the season leader changes only if this is higher.
- Individual high THIS WEEK — Lower: T. McMillan, Camp Kes, 31.2  → compare with last week's creditTracker value; the season leader changes only if this is higher.

## Highest weekly score this week
- Upper: Bad Attitude Gang · 185.86
- Lower: Fightin Ferrets · 176.90

## This week's games (winner first) with context
- Upper: Bad Attitude Gang 185.86 def. South Hills FunShiners 152.36 · margin 33.50
- Upper: Marco Clair Kardiac Attack 172.86 def. Turkey Hat Conglomerate 159.28 · margin 13.58
- Upper: Mike Vicks Dog Sitting Co. 172.68 def. The Prodigal Sons 131.14 · margin 41.54
- Upper: Jake's Jagoffs 154.16 def. Hadley's Comets 139.92 · margin 14.24
- Upper: The Big Bang Theory 150.72 def. Reilly's Reindeer 104.30 · margin 46.42
- Upper: Happy Valley Hammer Time 130.94 def. Southside Shooters 112.18 · margin 18.76
- Lower: Fightin Ferrets 176.90 def. The V-Unit 124.00 · margin 52.90
- Lower: Steel City Champyinz 166.12 def. Sarge's Squad 161.72 · margin 4.40
- Lower: Tommy Phamclub 155.90 def. Tony's Talented Team 137.66 · margin 18.24
- Lower: Portly Primates 148.32 def. The Best in The 'Burgh 146.74 · margin 1.58
- Lower: MAFFL Ghost 145.67 def. Camp Kes 124.88 · margin 20.79

## Week 5 pairings + head-to-head (all MAFFL history, by owner)
- Upper: Bad Attitude Gang at Reilly's Reindeer · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Bad Attitude Gang 2–5 Reilly's Reindeer · regular season Bad Attitude Gang 2–4 Reilly's Reindeer · current regular-season streak: Bad Attitude Gang ×1 · playoff meetings: 2018 Championship won by Reilly's Reindeer 155.46-120.48 · last meeting 2024 Wk 10 (Regular): Bad Attitude Gang 124.42-100.38
- Upper: Southside Shooters at Jake's Jagoffs · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Southside Shooters 2–2 Jake's Jagoffs · regular season Southside Shooters 2–2 Jake's Jagoffs · current regular-season streak: Southside Shooters ×2 · last meeting 2021 Wk 11 (Regular): Johnny Incognito 115.08-73.9
- Upper: Happy Valley Hammer Time at The Prodigal Sons · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Happy Valley Hammer Time 8–8 The Prodigal Sons · regular season Happy Valley Hammer Time 8–6 The Prodigal Sons · current regular-season streak: The Prodigal Sons ×1 · playoff meetings: 2014 Quarterfinal won by The Prodigal Sons 129.8-125.78; 2015 Quarterfinal won by The Prodigal Sons 104.42-65.28 · last meeting 2024 Wk 15 (Consolation): The Prodigal Sons 127.22-95.66
- Upper: The Big Bang Theory at Marco Clair Kardiac Attack · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Big Bang Theory 7–8 Marco Clair Kardiac Attack · regular season The Big Bang Theory 7–6 Marco Clair Kardiac Attack · current regular-season streak: Marco Clair Kardiac Attack ×1 · playoff meetings: 2013 Quarterfinal won by Kardiac Kids 108.92-97.6; 2018 Quarterfinal won by Kardiac Kids 112.14-78.4 · last meeting 2025 Wk 7 (Regular): Kids BadBlood HighSchool 193.7-158.4
- Upper: Mike Vicks Dog Sitting Co. at Hadley's Comets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Mike Vicks Dog Sitting Co. 2–6 Hadley's Comets · regular season Mike Vicks Dog Sitting Co. 2–5 Hadley's Comets · current regular-season streak: Hadley's Comets ×2 · playoff meetings: 2022 Quarterfinal won by Hadley's Comets 128.6-127.44 · last meeting 2025 Wk 9 (Regular): Hadley's Comets 181.42-142.0
- Upper: South Hills FunShiners at Turkey Hat Conglomerate · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) South Hills FunShiners 5–3 Turkey Hat Conglomerate · regular season South Hills FunShiners 5–3 Turkey Hat Conglomerate · current regular-season streak: South Hills FunShiners ×3 · last meeting 2025 Wk 14 (Regular): South Hills FunShiners 176.5-128.92
- Lower: Camp Kes at The V-Unit · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Camp Kes 5–1 The V-Unit · regular season Camp Kes 4–1 The V-Unit · current regular-season streak: Camp Kes ×4 · playoff meetings: 2014 ThirdPlace won by Camp Kes 119.66-96.7 · last meeting 2025 Wk 17 (Consolation): Camp Kes 130.6-130.38
- Lower: Sarge's Squad at MAFFL Ghost · 👻 game
- Lower: Portly Primates at Fightin Ferrets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Portly Primates 0–0 Fightin Ferrets · regular season Portly Primates 0–0 Fightin Ferrets · first meeting
- Lower: Tony's Talented Team at Steel City Champyinz · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tony's Talented Team 0–1 Steel City Champyinz · regular season Tony's Talented Team 0–1 Steel City Champyinz · current regular-season streak: Steel City Champyinz ×1 · last meeting 2025 Wk 8 (Regular): Steel City Champyinz 153.8-146.8
- Lower: Tommy Phamclub at The Best in The 'Burgh · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tommy Phamclub 0–1 The Best in The 'Burgh · regular season Tommy Phamclub 0–1 The Best in The 'Burgh · current regular-season streak: The Best in The 'Burgh ×1 · last meeting 2025 Wk 16 (Consolation): Tommy Phamclub 220.54-135.32
```  exit 0
