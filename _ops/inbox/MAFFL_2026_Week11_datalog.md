# Week 11 data log (robot, Windows runner)

### Append week to gold (ingest_week.py)
```
Appended week 11: 11 matchup rows (CRLF) · 63 top-performer rows (CRLF) · score_sum 3091.69
Stat corrections reported for earlier weeks: 1  → applied next by apply_corrections.py
```  exit 0

### Apply ESPN stat corrections to earlier weeks (apply_corrections.py)
```
# Week 11 — stat corrections applied to gold (robot)
Applied: 1 score change(s) in 1 row(s) · winner flips: 0
- Week 10 · Lower · Sarge's Squad 176.86 → 177.36 (vs The V-Unit, result unchanged)
👻 par changes: none
```  exit 0

### CE-1 generator, check (expect 1 = additions)
```
  corrected NoConsolation: 2026,10,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,176.86,Chris Johnson,Chris Johnson,The V-Unit,169.04 -> 2026,10,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,177.36,Chris Johnson,Chris Johnson,The V-Unit,169.04
  corrected matchups-data.js: [2026,10,"L","Nick Yankovich",176.86,"Chris Johnson",169.04,"R"] -> [2026,10,"L","Nick Yankovich",177.36,"Chris Johnson",169.04,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2847 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.81 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 9 Lower: Chris Johnson W 166.9-147.04 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 10 Lower: Charles Lavrinc L 122.38-147.14 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 11 Lower: Sam Lavrinc L 124.22-133.37 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x11
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 1 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2499 -> 2510 rows; append-only drift check passed.
[matchups-data.js] DIFFERS -- 2489 -> 2499 rows (11 Ghost row(s) excluded); append-only drift check passed.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
check-only (no -Write); nothing written.
```  exit 1

### CE-1 generator, write
```
  corrected NoConsolation: 2026,10,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,176.86,Chris Johnson,Chris Johnson,The V-Unit,169.04 -> 2026,10,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,177.36,Chris Johnson,Chris Johnson,The V-Unit,169.04
  corrected matchups-data.js: [2026,10,"L","Nick Yankovich",176.86,"Chris Johnson",169.04,"R"] -> [2026,10,"L","Nick Yankovich",177.36,"Chris Johnson",169.04,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2847 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.81 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 9 Lower: Chris Johnson W 166.9-147.04 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 10 Lower: Charles Lavrinc L 122.38-147.14 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 11 Lower: Sam Lavrinc L 124.22-133.37 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x11
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 1 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2499 -> 2510 rows; append-only drift check passed.
[MAFFL_Matchups_NoConsolation.csv] WROTE.
[matchups-data.js] DIFFERS -- 2489 -> 2499 rows (11 Ghost row(s) excluded); append-only drift check passed.
[matchups-data.js] WROTE.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_By_Season.csv] WROTE.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
[MAFFL_Points_AllTime.csv] WROTE.
```  exit 1

### CE-1 generator, re-check (expect 0 = in sync)
```
[gold] MAFFL_Matchups_Clean.csv: 2847 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.25 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 7 Lower: Ben Funari W 165.02-145.98 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 8 Lower: Todd Trozzo W 162.02-147.81 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 9 Lower: Chris Johnson W 166.9-147.04 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 10 Lower: Charles Lavrinc L 122.38-147.14 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 11 Lower: Sam Lavrinc L 124.22-133.37 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x11
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 0 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] ROUND-TRIP EXACT -- byte-identical (2510 -> 2510 rows).
[matchups-data.js] ROUND-TRIP EXACT -- byte-identical (2499 -> 2499 rows (11 Ghost row(s) excluded)).
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
# MAFFL 2026 Week 11 — Pulse facts (computed from gold)
Source: pulse_facts.py v0.2. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).

## Standings (season totals through this week)
**Upper Div A**
- Bad Attitude Gang · 7-4 · points 1768.46 · streak +1 · credits 27 · all-play 79-42
- South Hills FunShiners · 7-4 · points 1551.66 · streak +1 · credits 4 · all-play 50-71
- Marco Clair Kardiac Attack · 6-5 · points 1593.16 · streak -1 · credits 12 · all-play 65-56
**Upper Div B**
- Jake's Jagoffs · 7-4 · points 1515.30 · streak +2 · credits 15 · all-play 54-67
- Mike Vicks Dog Sitting Co. · 6-5 · points 1596.84 · streak -4 · credits 5 · all-play 65-56
- The Prodigal Sons · 5-6 · points 1602.84 · streak -1 · credits 24 · all-play 62-59
**Upper Div C**
- Happy Valley Hammer Time · 6-5 · points 1577.46 · streak +1 · credits 17 · all-play 53-68
- The Big Bang Theory · 4-7 · points 1500.76 · streak -4 · credits 6 · all-play 47-74
- Reilly's Reindeer · 3-8 · points 1548.62 · streak -2 · credits 23 · all-play 53-68
**Upper Div D**
- Hadley's Comets · 6-5 · points 1754.92 · streak +2 · credits 7 · all-play 76-45
- Turkey Hat Conglomerate · 5-6 · points 1755.90 · streak +2 · credits 7 · all-play 77-44
- Southside Shooters · 4-7 · points 1474.86 · streak -1 · credits 7 · all-play 45-76
**Lower** (👻 always listed last on the page)
- The Best in The 'Burgh · 9-2 · points 1768.36 · streak +6 · credits 6 · all-play 60-28
- Tommy Phamclub · 7-4 · points 1714.36 · streak -1 · credits 8 · all-play 49-39
- Sarge's Squad · 7-4 · points 1800.00 · streak +3 · credits 5 · all-play 54-34
- Steel City Champyinz · 6-5 · points 1604.06 · streak +1 · credits 6 · all-play 41-47
- The V-Unit · 6-5 · points 1632.68 · streak -2 · credits 0 · all-play 41-47
- Fightin Ferrets · 5-6 · points 1758.40 · streak -3 · credits 1 · all-play 56-32
- Tony's Talented Team · 4-7 · points 1672.32 · streak +2 · credits 10 · all-play 42-46
- Portly Primates · 4-7 · points 1597.52 · streak -4 · credits 6 · all-play 37-51
- Camp Kes · 2-9 · points 1396.00 · streak -3 · credits 1 · all-play 16-72
- MAFFL Ghost · 5-6 · points 1610.92 · streak +2 · credits 0

## Playoff picture (page builds this itself; for prose only)
Upper seeds: 1 Bad Attitude Gang (div) · 2 Jake's Jagoffs (div) · 3 Happy Valley Hammer Time (div) · 4 Hadley's Comets (div) · 5 South Hills FunShiners (WC) · 6 Marco Clair Kardiac Attack (WC) · 7 Mike Vicks Dog Sitting Co. · 8 The Prodigal Sons · 9 Turkey Hat Conglomerate · 10 Southside Shooters · 11 The Big Bang Theory · 12 Reilly's Reindeer
Upper relegation spots (11–12): The Big Bang Theory, Reilly's Reindeer
Lower order: 1 The Best in The 'Burgh · 2 Tommy Phamclub · 3 Sarge's Squad · 4 Steel City Champyinz · 5 The V-Unit · 6 Fightin Ferrets · 7 Tony's Talented Team · 8 Portly Primates · 9 Camp Kes  (promotion line = top 2)

## Survivor
**Upper** — 1 alive: Turkey Hat Conglomerate
- Week 11: Southside Shooters out with 142.44
- Week 10: Mike Vicks Dog Sitting Co. out with 105.40
- Week 9: South Hills FunShiners out with 127.44
- Week 8: The Prodigal Sons out with 124.24
- Week 7: Jake's Jagoffs out with 84.76
- Week 6: Hadley's Comets out with 100.30
- Week 5: Bad Attitude Gang out with 102.24
- Week 4: Reilly's Reindeer out with 103.30
- Week 3: Marco Clair Kardiac Attack out with 114.32
- Week 2: The Big Bang Theory out with 88.72
- Week 1: Happy Valley Hammer Time out with 124.14
  margin: Southside Shooters was 5.68 behind Turkey Hat Conglomerate
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
- Most Team Points Scored — Upper: Bad Attitude Gang · 1768.46 through Wk 11 · since 6
- Most Team Points Scored — Lower: Sarge's Squad · 1800.00 through Wk 11 · since 11
- Largest Blowout Victory — Upper: Turkey Hat Conglomerate · 76.14 over Jake's Jagoffs (Wk 8) · since 8
- Largest Blowout Victory — Lower: The Best in The 'Burgh · 69.22 over Camp Kes (Wk 10) · since 10
- Individual high THIS WEEK — Upper: D. Prescott, Hadley's Comets, 43.9  → compare with last week's creditTracker value; the season leader changes only if this is higher.
- Individual high THIS WEEK — Lower: D. Prescott, Sarge's Squad, 43.9  → compare with last week's creditTracker value; the season leader changes only if this is higher.

## Highest weekly score this week
- Upper: Hadley's Comets · 183.40
- Lower: Sarge's Squad · 215.26

## This week's games (winner first) with context
- Upper: Hadley's Comets 183.40 def. Marco Clair Kardiac Attack 128.68 · margin 54.72
- Upper: Happy Valley Hammer Time 160.90 def. The Prodigal Sons 125.30 · margin 35.60
- Upper: Turkey Hat Conglomerate 148.12 def. The Big Bang Theory 134.72 · margin 13.40
- Upper: Jake's Jagoffs 147.28 def. Southside Shooters 142.44 · margin 4.84
- Upper: Bad Attitude Gang 136.84 def. Reilly's Reindeer 124.62 · margin 12.22
- Upper: South Hills FunShiners 125.14 def. Mike Vicks Dog Sitting Co. 118.64 · margin 6.50
- Lower: Sarge's Squad 215.26 def. Portly Primates 149.58 · margin 65.68
- Lower: The Best in The 'Burgh 163.50 def. Fightin Ferrets 99.92 · margin 63.58
- Lower: Steel City Champyinz 146.86 def. Camp Kes 119.16 · margin 27.70
- Lower: MAFFL Ghost 133.37 def. Tommy Phamclub 124.22 · margin 9.15
- Lower: Tony's Talented Team 132.80 def. The V-Unit 130.94 · margin 1.86

## Week 12 pairings + head-to-head (all MAFFL history, by owner)
- Upper: Southside Shooters at South Hills FunShiners · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Southside Shooters 3–8 South Hills FunShiners · regular season Southside Shooters 3–8 South Hills FunShiners · current regular-season streak: Southside Shooters ×1 · last meeting 2025 Wk 12 (Regular): Southside Shooters 164.92-144.56
- Upper: Marco Clair Kardiac Attack at Bad Attitude Gang · Div A game · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Marco Clair Kardiac Attack 12–8 Bad Attitude Gang · regular season Marco Clair Kardiac Attack 11–7 Bad Attitude Gang · current regular-season streak: Marco Clair Kardiac Attack ×1 · playoff meetings: 2018 Semifinal won by Bad Attitude Gang 90.48-72.46; 2019 Semifinal won by Kardiac Kids 133.12-116.86 · last meeting 2026 Wk 1 (Regular): Marco Clair Kardiac Attack 159.22-138.48
- Upper: Hadley's Comets at Turkey Hat Conglomerate · Div D game · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Hadley's Comets 7–1 Turkey Hat Conglomerate · regular season Hadley's Comets 7–1 Turkey Hat Conglomerate · current regular-season streak: Hadley's Comets ×2 · last meeting 2026 Wk 1 (Regular): Hadley's Comets 158.56-148.4
- Upper: Mike Vicks Dog Sitting Co. at The Prodigal Sons · Div B game · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Mike Vicks Dog Sitting Co. 4–1 The Prodigal Sons · regular season Mike Vicks Dog Sitting Co. 4–1 The Prodigal Sons · current regular-season streak: Mike Vicks Dog Sitting Co. ×1 · last meeting 2026 Wk 4 (Regular): Mike Vicks Dog Sitting Co. 172.68-131.14
- Upper: Reilly's Reindeer at Happy Valley Hammer Time · Div C game · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Reilly's Reindeer 7–9 Happy Valley Hammer Time · regular season Reilly's Reindeer 7–8 Happy Valley Hammer Time · current regular-season streak: Happy Valley Hammer Time ×1 · playoff meetings: 2012 Quarterfinal won by Happy Valley Hammer Time 107.0-103.0 · last meeting 2026 Wk 2 (Regular): Happy Valley Hammer Time 173.8-142.88
- Upper: The Big Bang Theory at Jake's Jagoffs · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Big Bang Theory 3–1 Jake's Jagoffs · regular season The Big Bang Theory 3–1 Jake's Jagoffs · current regular-season streak: The Big Bang Theory ×3 · last meeting 2024 Wk 11 (Regular): The Big Bang Theory 133.64-99.04
- Lower: Fightin Ferrets at Camp Kes · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Fightin Ferrets 3–4 Camp Kes · regular season Fightin Ferrets 2–4 Camp Kes · current regular-season streak: Camp Kes ×4 · playoff meetings: 2020 ThirdPlace won by U-Town Fightin Ferrets 138.74-101.44 · last meeting 2026 Wk 3 (Regular): Camp Kes 141.06-138.6
- Lower: Steel City Champyinz at MAFFL Ghost · 👻 game
- Lower: The Best in The 'Burgh at The V-Unit · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Best in The 'Burgh 1–0 The V-Unit · regular season The Best in The 'Burgh 1–0 The V-Unit · current regular-season streak: The Best in The 'Burgh ×1 · last meeting 2026 Wk 3 (Regular): The Best in The 'Burgh 178.84-143.76
- Lower: Tommy Phamclub at Sarge's Squad · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tommy Phamclub 1–2 Sarge's Squad · regular season Tommy Phamclub 1–2 Sarge's Squad · current regular-season streak: Sarge's Squad ×1 · last meeting 2026 Wk 3 (Regular): Sarge's Squad 138.42-135.94
- Lower: Tony's Talented Team at Portly Primates · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tony's Talented Team 1–1 Portly Primates · regular season Tony's Talented Team 1–1 Portly Primates · current regular-season streak: Portly Primates ×1 · last meeting 2026 Wk 3 (Regular): Portly Primates 185.98-167.02

## Coverage (spread the wealth — editorial §4a)
_Headline + subhead + news reel mentions in Weeks 8–10._
- **Not written about in 3 Pulses (give at least 2 of these a news item this week):** Steel City Champyinz (L)
- **Already heavy (≥3 mentions — needs a record or a first-ever to make the reel again):** Southside Shooters (U) ×4, Turkey Hat Conglomerate (U) ×4, Happy Valley Hammer Time (U) ×3, Jake's Jagoffs (U) ×3, Marco Clair Kardiac Attack (U) ×3, Mike Vicks Dog Sitting Co. (U) ×3, Sarge's Squad (L) ×3, The Best in The 'Burgh (L) ×3, The Prodigal Sons (U) ×3, The V-Unit (L) ×3, Tommy Phamclub (L) ×3
- **In a headline/subhead the last 2 weeks (don't lead with them again unless it's a record):** Bad Attitude Gang (U), Camp Kes (L), Fightin Ferrets (L), Reilly's Reindeer (U), Sarge's Squad (L), South Hills FunShiners (U), The Best in The 'Burgh (L), Turkey Hat Conglomerate (U)

## Story hooks (history from gold; every team has some, so quiet teams get a turn)
_One or two per team are plenty. Use them for news items, Results notes and Coach of the Week notes. Score ranks compare only 2025-on games (scoring changed in 2025). Owner history follows the person across team names. Copy wording loosely, numbers exactly._
- **Bad Attitude Gang** (U, W vs Reilly's Reindeer): all-time series with Reilly's Reindeer (by owner, regular + playoffs) now 3–6 · playoff history: 2018 Championship won by Reilly's Reindeer · best start through Week 11 since 2021 · trophy case: 1 title (last 2016); Lower-Tier title 2025; 5 Upper division titles (last 2021) · won Coach of the Week 11 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Camp Kes** (L, L vs Steel City Champyinz): all-time series with Steel City Champyinz (by owner, regular + playoffs) now 0–2 · lost 3 straight regular-season games (career long: 8) · trophy case: 1 title (last 2023); 2 Upper division titles (last 2019) · won Coach of the Week 6 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Fightin Ferrets** (L, L vs The Best in The 'Burgh): all-time series with The Best in The 'Burgh (by owner, regular + playoffs) now 0–2 · 99.92 is the 3rd-lowest Lower score of 211 since 2025 · lost 4 straight regular-season games (career long: 7) · trophy case: 2 titles (last 2015); 5 Upper division titles (last 2020) · won Coach of the Week 18 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Hadley's Comets** (U, W vs Marco Clair Kardiac Attack): all-time series with Marco Clair Kardiac Attack (by owner, regular + playoffs) now 10–9 · playoff history: 2012 Championship won by Kardiac Kids · trophy case: 2 titles (last 2007); 7 Upper division titles (last 2023) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Happy Valley Hammer Time** (U, W vs The Prodigal Sons): all-time series with The Prodigal Sons (by owner, regular + playoffs) now 9–9 · snapped a 2-game losing run against them; first win over them since 2023 · playoff history: 2014 Quarterfinal won by The Prodigal Sons; 2015 Quarterfinal won by The Prodigal Sons · best start through Week 11 since 2022 · trophy case: 3 titles (last 2017); 7 Upper division titles (last 2022) · won Coach of the Week 13 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Jake's Jagoffs** (U, W vs Southside Shooters): all-time series with Southside Shooters (by owner, regular + playoffs) now 3–3 · snapped a 3-game losing run against them; first win over them since 2018 · best start through Week 11 since 2015 · trophy case: 2 titles (last 2021); 3 Upper division titles (last 2021) · won Coach of the Week 10 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Marco Clair Kardiac Attack** (U, L vs Hadley's Comets): all-time series with Hadley's Comets (by owner, regular + playoffs) now 9–10 · playoff history: 2012 Championship won by Kardiac Kids · trophy case: 1 title (last 2012); 10 Upper division titles (last 2024) · won Coach of the Week 3 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Mike Vicks Dog Sitting Co.** (U, L vs South Hills FunShiners): all-time series with South Hills FunShiners (by owner, regular + playoffs) now 6–4 · loss ended a 2-game winning run against them · playoff history: 2024 Quarterfinal won by South Hills FunShiners · lost 4 straight regular-season games (career long: 4) · no MAFFL title yet · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Portly Primates** (L, L vs Sarge's Squad): all-time series with Sarge's Squad (by owner, regular + playoffs) now 1–3 · lost 3 straight regular-season games (career long: 3) · no MAFFL title yet
- **Reilly's Reindeer** (U, L vs Bad Attitude Gang): all-time series with Bad Attitude Gang (by owner, regular + playoffs) now 6–3 · playoff history: 2018 Championship won by Reilly's Reindeer · trophy case: 3 titles (last 2024); 8 Upper division titles (last 2025) · won Coach of the Week 19 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Sarge's Squad** (L, W vs Portly Primates): all-time series with Portly Primates (by owner, regular + playoffs) now 3–1 · 215.26 is the 1st-highest Lower score of 211 since 2025 · won 3 straight regular-season games (career long: 3) · no MAFFL title yet
- **South Hills FunShiners** (U, W vs Mike Vicks Dog Sitting Co.): all-time series with Mike Vicks Dog Sitting Co. (by owner, regular + playoffs) now 4–6 · snapped a 2-game losing run against them; first win over them since 2024 · playoff history: 2024 Quarterfinal won by South Hills FunShiners · trophy case: 1 title (last 2019); 5 Upper division titles (last 2024) · won Coach of the Week 4 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Southside Shooters** (U, L vs Jake's Jagoffs): all-time series with Jake's Jagoffs (by owner, regular + playoffs) now 3–3 · loss ended a 3-game winning run against them · trophy case: 2 Upper division titles (last 2025) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Steel City Champyinz** (L, W vs Camp Kes): all-time series with Camp Kes (by owner, regular + playoffs) now 2–0 · no MAFFL title yet
- **The Best in The 'Burgh** (L, W vs Fightin Ferrets): all-time series with Fightin Ferrets (by owner, regular + playoffs) now 2–0 · won 5 straight regular-season games (career long: 5) · no MAFFL title yet
- **The Big Bang Theory** (U, L vs Turkey Hat Conglomerate): all-time series with Turkey Hat Conglomerate (by owner, regular + playoffs) now 10–6 · playoff history: 2016 Quarterfinal won by The Big Bang Theory · lost 4 straight regular-season games (career long: 6) · trophy case: 4 Upper division titles (last 2024) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The Prodigal Sons** (U, L vs Happy Valley Hammer Time): all-time series with Happy Valley Hammer Time (by owner, regular + playoffs) now 9–9 · loss ended a 2-game winning run against them · playoff history: 2014 Quarterfinal won by The Prodigal Sons; 2015 Quarterfinal won by The Prodigal Sons · trophy case: 3 titles (last 2025); 5 Upper division titles (last 2025) · won Coach of the Week 5 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The V-Unit** (L, L vs Tony's Talented Team): all-time series with Tony's Talented Team (by owner, regular + playoffs) now 5–5 · trophy case: 2 titles (last 2020); 3 Upper division titles (last 2017) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Tommy Phamclub** (L, L vs 👻): won 3 straight regular-season games (career long: 3) · no MAFFL title yet
- **Tony's Talented Team** (L, W vs The V-Unit): all-time series with The V-Unit (by owner, regular + playoffs) now 5–5 · trophy case: 1 Upper division title (last 2023) · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Turkey Hat Conglomerate** (U, W vs The Big Bang Theory): all-time series with The Big Bang Theory (by owner, regular + playoffs) now 6–10 · playoff history: 2016 Quarterfinal won by The Big Bang Theory · trophy case: 3 Upper division titles (last 2025) · won Coach of the Week 7 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
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
Week 10: 41 missed calls, 1 bench>starters, 63 top performers, 2 highs, 5 bids
Week 11: 33 missed calls, 1 bench>starters, 63 top performers, 2 highs, 5 bids
```  exit 0

### Vault data (gen_vault.py; a failure here never blocks the Pulse)
```
wrote lab/vault-data.js � 24 seasons � 173 KB
```  exit 0
