# Week 5 data log (robot, Windows runner)

### Append week to gold (ingest_week.py)
```
Appended week 5: 11 matchup rows (CRLF) · 63 top-performer rows (CRLF) · score_sum 3451.70
Stat corrections reported for earlier weeks: 4  → applied next by apply_corrections.py
```  exit 0

### Apply ESPN stat corrections to earlier weeks (apply_corrections.py)
```
# Week 5 — stat corrections applied to gold (robot)
Applied: 4 score change(s) in 4 row(s) · winner flips: 0
- Week 4 · Upper · Reilly's Reindeer 104.30 → 103.30 (vs The Big Bang Theory, result unchanged)
- Week 4 · Lower · Fightin Ferrets 176.90 → 175.90 (vs The V-Unit, result unchanged)
- Week 4 · Lower · Portly Primates 148.32 → 147.32 (vs The Best in The 'Burgh, result unchanged)
- Week 4 · Lower · MAFFL Ghost 145.67 → 145.54 (vs Camp Kes, result unchanged)
👻 par changes: Week 4 145.67 → 145.54 — LM: re-enter in ESPN
```  exit 0

### CE-1 generator, check (expect 1 = additions)
```
  corrected NoConsolation: 2026,4,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,150.72,Joe Reilly,Joseph Reilly,Reilly's Reindeer,104.3 -> 2026,4,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,150.72,Joe Reilly,Joseph Reilly,Reilly's Reindeer,103.3
  corrected NoConsolation: 2026,4,Lower,False,Regular,Todd Trozzo,Todd Trozzo,Fightin Ferrets,176.9,Chris Johnson,Chris Johnson,The V-Unit,124.0 -> 2026,4,Lower,False,Regular,Todd Trozzo,Todd Trozzo,Fightin Ferrets,175.9,Chris Johnson,Chris Johnson,The V-Unit,124.0
  corrected NoConsolation: 2026,4,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,148.32,Ben Funari,Benjamin Funari,The Best in The 'Burgh,146.74 -> 2026,4,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,147.32,Ben Funari,Benjamin Funari,The Best in The 'Burgh,146.74
  corrected NoConsolation: 2026,4,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,145.67,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,124.88 -> 2026,4,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,145.54,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,124.88
  corrected matchups-data.js: [2026,4,"U","Dan Reilly",150.72,"Joe Reilly",104.3,"R"] -> [2026,4,"U","Dan Reilly",150.72,"Joe Reilly",103.3,"R"]
  corrected matchups-data.js: [2026,4,"L","Todd Trozzo",176.9,"Chris Johnson",124.0,"R"] -> [2026,4,"L","Todd Trozzo",175.9,"Chris Johnson",124.0,"R"]
  corrected matchups-data.js: [2026,4,"L","Charles Lavrinc",148.32,"Ben Funari",146.74,"R"] -> [2026,4,"L","Charles Lavrinc",147.32,"Ben Funari",146.74,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2781 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.38-161.96 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x5
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 4 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2433 -> 2444 rows; append-only drift check passed.
[matchups-data.js] DIFFERS -- 2429 -> 2439 rows (5 Ghost row(s) excluded); append-only drift check passed.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
check-only (no -Write); nothing written.
```  exit 1

### CE-1 generator, write
```
  corrected NoConsolation: 2026,4,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,150.72,Joe Reilly,Joseph Reilly,Reilly's Reindeer,104.3 -> 2026,4,Upper,False,Regular,Dan Reilly,Daniel Reilly,The Big Bang Theory,150.72,Joe Reilly,Joseph Reilly,Reilly's Reindeer,103.3
  corrected NoConsolation: 2026,4,Lower,False,Regular,Todd Trozzo,Todd Trozzo,Fightin Ferrets,176.9,Chris Johnson,Chris Johnson,The V-Unit,124.0 -> 2026,4,Lower,False,Regular,Todd Trozzo,Todd Trozzo,Fightin Ferrets,175.9,Chris Johnson,Chris Johnson,The V-Unit,124.0
  corrected NoConsolation: 2026,4,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,148.32,Ben Funari,Benjamin Funari,The Best in The 'Burgh,146.74 -> 2026,4,Lower,False,Regular,Charles Lavrinc,Charlie Lavrinc,Portly Primates,147.32,Ben Funari,Benjamin Funari,The Best in The 'Burgh,146.74
  corrected NoConsolation: 2026,4,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,145.67,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,124.88 -> 2026,4,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,145.54,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,124.88
  corrected matchups-data.js: [2026,4,"U","Dan Reilly",150.72,"Joe Reilly",104.3,"R"] -> [2026,4,"U","Dan Reilly",150.72,"Joe Reilly",103.3,"R"]
  corrected matchups-data.js: [2026,4,"L","Todd Trozzo",176.9,"Chris Johnson",124.0,"R"] -> [2026,4,"L","Todd Trozzo",175.9,"Chris Johnson",124.0,"R"]
  corrected matchups-data.js: [2026,4,"L","Charles Lavrinc",148.32,"Ben Funari",146.74,"R"] -> [2026,4,"L","Charles Lavrinc",147.32,"Ben Funari",146.74,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2781 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.38-161.96 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x5
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 4 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2433 -> 2444 rows; append-only drift check passed.
[MAFFL_Matchups_NoConsolation.csv] WROTE.
[matchups-data.js] DIFFERS -- 2429 -> 2439 rows (5 Ghost row(s) excluded); append-only drift check passed.
[matchups-data.js] WROTE.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_By_Season.csv] WROTE.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
[MAFFL_Points_AllTime.csv] WROTE.
```  exit 1

### CE-1 generator, re-check (expect 0 = in sync)
```
[gold] MAFFL_Matchups_Clean.csv: 2781 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.38-161.96 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x5
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 0 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] ROUND-TRIP EXACT -- byte-identical (2444 -> 2444 rows).
[matchups-data.js] ROUND-TRIP EXACT -- byte-identical (2439 -> 2439 rows (5 Ghost row(s) excluded)).
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
# MAFFL 2026 Week 5 — Pulse facts (computed from gold)
Source: pulse_facts.py v0.2. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).

## Standings (season totals through this week)
**Upper Div A**
- Marco Clair Kardiac Attack · 3-2 · points 699.10 · streak +2 · credits 12 · all-play 24-31
- South Hills FunShiners · 3-2 · points 755.62 · streak +1 · credits 4 · all-play 28-27
- Bad Attitude Gang · 2-3 · points 790.30 · streak -1 · credits 27 · all-play 30-25
**Upper Div B**
- Jake's Jagoffs · 4-1 · points 785.88 · streak -1 · credits 15 · all-play 36-19
- Mike Vicks Dog Sitting Co. · 4-1 · points 781.94 · streak +3 · credits 5 · all-play 37-18
- The Prodigal Sons · 2-3 · points 754.84 · streak +1 · credits 24 · all-play 29-26
**Upper Div C**
- Happy Valley Hammer Time · 3-2 · points 724.48 · streak -1 · credits 17 · all-play 22-33
- The Big Bang Theory · 2-3 · points 649.90 · streak -1 · credits 6 · all-play 19-36
- Reilly's Reindeer · 1-4 · points 687.74 · streak +1 · credits 23 · all-play 18-37
**Upper Div D**
- Hadley's Comets · 3-2 · points 805.18 · streak -2 · credits 7 · all-play 35-20
- Turkey Hat Conglomerate · 2-3 · points 810.68 · streak -2 · credits 7 · all-play 36-19
- Southside Shooters · 1-4 · points 663.72 · streak +1 · credits 7 · all-play 16-39
**Lower** (👻 always listed last on the page)
- Tommy Phamclub · 4-1 · points 835.40 · streak +2 · credits 8 · all-play 24-16
- The Best in The 'Burgh · 3-2 · points 813.28 · streak -2 · credits 6 · all-play 26-14
- Portly Primates · 3-2 · points 771.02 · streak -1 · credits 6 · all-play 20-20
- Steel City Champyinz · 3-2 · points 742.52 · streak -1 · credits 6 · all-play 21-19
- Fightin Ferrets · 3-2 · points 839.38 · streak +2 · credits 1 · all-play 30-10
- Tony's Talented Team · 2-3 · points 811.98 · streak +1 · credits 10 · all-play 23-17
- Sarge's Squad · 2-3 · points 725.20 · streak -2 · credits 5 · all-play 15-25
- The V-Unit · 2-3 · points 697.50 · streak +1 · credits 0 · all-play 10-30
- Camp Kes · 1-4 · points 696.34 · streak -2 · credits 1 · all-play 11-29
- MAFFL Ghost · 2-3 · points 748.27 · streak +2 · credits 0

## Playoff picture (page builds this itself; for prose only)
Upper seeds: 1 Jake's Jagoffs (div) · 2 Happy Valley Hammer Time (div) · 3 Marco Clair Kardiac Attack (div) · 4 Hadley's Comets (div) · 5 Mike Vicks Dog Sitting Co. (WC) · 6 South Hills FunShiners (WC) · 7 Bad Attitude Gang · 8 The Prodigal Sons · 9 Turkey Hat Conglomerate · 10 The Big Bang Theory · 11 Reilly's Reindeer · 12 Southside Shooters
Upper relegation spots (11–12): Reilly's Reindeer, Southside Shooters
Lower order: 1 Tommy Phamclub · 2 The Best in The 'Burgh · 3 Portly Primates · 4 Steel City Champyinz · 5 Fightin Ferrets · 6 Tony's Talented Team · 7 Sarge's Squad · 8 The V-Unit · 9 Camp Kes  (promotion line = top 2)

## Survivor
**Upper** — 7 alive: South Hills FunShiners, Jake's Jagoffs, The Prodigal Sons, Mike Vicks Dog Sitting Co., Hadley's Comets, Turkey Hat Conglomerate, Southside Shooters
- Week 5: Bad Attitude Gang out with 102.24
- Week 4: Reilly's Reindeer out with 103.30
- Week 3: Marco Clair Kardiac Attack out with 114.32
- Week 2: The Big Bang Theory out with 88.72
- Week 1: Happy Valley Hammer Time out with 124.14
  margin: Bad Attitude Gang was 38.40 behind Jake's Jagoffs
**Lower** — 4 alive: Fightin Ferrets, Sarge's Squad, The Best in The 'Burgh, Tony's Talented Team
- Week 5: Portly Primates out with 133.80
- Week 4: Camp Kes out with 124.88
- Week 3: Tommy Phamclub out with 135.94
- Week 2: The V-Unit out with 124.74
- Week 1: Steel City Champyinz out with 116.34
  margin: Portly Primates was 23.58 behind Sarge's Squad

## Credit Tracker leaders (status 'leading' until the award is mathematically locked)
- Most Team Points Scored — Upper: Turkey Hat Conglomerate · 810.68 through Wk 5 · since 5
- Most Team Points Scored — Lower: Fightin Ferrets · 839.38 through Wk 5 · since 5
- Largest Blowout Victory — Upper: Reilly's Reindeer · 69.24 over Bad Attitude Gang (Wk 5) · since 5
- Largest Blowout Victory — Lower: Tommy Phamclub · 60.90 over 👻 (Wk 2) · since 1
- Individual high THIS WEEK — Upper: D. Maye, Mike Vicks Dog Sitting Co., 47.46  → compare with last week's creditTracker value; the season leader changes only if this is higher.
- Individual high THIS WEEK — Lower: J. Goff, Fightin Ferrets, 34.94  → compare with last week's creditTracker value; the season leader changes only if this is higher.

## Highest weekly score this week
- Upper: Mike Vicks Dog Sitting Co. · 189.86
- Lower: Tony's Talented Team · 190.84

## This week's games (winner first) with context
- Upper: Mike Vicks Dog Sitting Co. 189.86 def. Hadley's Comets 170.94 · margin 18.92
- Upper: The Prodigal Sons 173.40 def. Happy Valley Hammer Time 126.28 · margin 47.12
- Upper: Reilly's Reindeer 171.48 def. Bad Attitude Gang 102.24 · margin 69.24
- Upper: Southside Shooters 166.82 def. Jake's Jagoffs 140.64 · margin 26.18
- Upper: South Hills FunShiners 164.20 def. Turkey Hat Conglomerate 150.74 · margin 13.46
- Upper: Marco Clair Kardiac Attack 136.08 def. The Big Bang Theory 110.56 · margin 25.52
- Lower: Tony's Talented Team 190.84 def. Steel City Champyinz 148.42 · margin 42.42
- Lower: Fightin Ferrets 188.54 def. Portly Primates 133.80 · margin 54.74
- Lower: Tommy Phamclub 182.34 def. The Best in The 'Burgh 174.78 · margin 7.56
- Lower: The V-Unit 163.94 def. Camp Kes 146.46 · margin 17.48
- Lower: MAFFL Ghost 161.96 def. Sarge's Squad 157.38 · margin 4.58

## Week 6 pairings + head-to-head (all MAFFL history, by owner)
- Upper: South Hills FunShiners at Hadley's Comets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) South Hills FunShiners 11–17 Hadley's Comets · regular season South Hills FunShiners 11–15 Hadley's Comets · current regular-season streak: Hadley's Comets ×1 · playoff meetings: 2006 Championship won by Swissvale Flashes 147.5-128.5; 2023 Semifinal won by Hadley's Comets 126.04-112.82 · last meeting 2025 Wk 11 (Regular): Hadley's Comets 137.78-105.02
- Upper: Marco Clair Kardiac Attack at Mike Vicks Dog Sitting Co. · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Marco Clair Kardiac Attack 2–2 Mike Vicks Dog Sitting Co. · regular season Marco Clair Kardiac Attack 2–2 Mike Vicks Dog Sitting Co. · current regular-season streak: Mike Vicks Dog Sitting Co. ×1 · last meeting 2025 Wk 13 (Regular): Mike Vicks Dog Sitting Co. 181.12-148.04
- Upper: Happy Valley Hammer Time at Jake's Jagoffs · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Happy Valley Hammer Time 5–3 Jake's Jagoffs · regular season Happy Valley Hammer Time 5–3 Jake's Jagoffs · current regular-season streak: Happy Valley Hammer Time ×2 · last meeting 2025 Wk 13 (Regular): Happy Valley Hammer Time 165.96-149.7
- Upper: Reilly's Reindeer at The Prodigal Sons · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Reilly's Reindeer 5–3 The Prodigal Sons · regular season Reilly's Reindeer 4–2 The Prodigal Sons · current regular-season streak: The Prodigal Sons ×2 · playoff meetings: 2014 Championship won by Reilly's Reindeers 89.8-82.08; 2025 Championship won by The Prodigal Sons 147.92-116.54 · last meeting 2025 Wk 17 (Championship): The Prodigal Sons 147.92-116.54
- Upper: The Big Bang Theory at Turkey Hat Conglomerate · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Big Bang Theory 9–5 Turkey Hat Conglomerate · regular season The Big Bang Theory 8–5 Turkey Hat Conglomerate · current regular-season streak: Turkey Hat Conglomerate ×2 · playoff meetings: 2016 Quarterfinal won by The Big Bang Theory 94.92-76.8 · last meeting 2025 Wk 10 (Regular): Turkey Hat Conglomerate 178.1-169.12
- Upper: Southside Shooters at Bad Attitude Gang · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Southside Shooters 4–8 Bad Attitude Gang · regular season Southside Shooters 4–7 Bad Attitude Gang · current regular-season streak: Southside Shooters ×1 · playoff meetings: 2016 Quarterfinal won by Bad Attitude Gang 132.58-116.48 · last meeting 2024 Wk 4 (Regular): Southside Shooters 110.4-73.32
- Lower: Sarge's Squad at Camp Kes · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Sarge's Squad 0–0 Camp Kes · regular season Sarge's Squad 0–0 Camp Kes · first meeting
- Lower: The V-Unit at Portly Primates · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The V-Unit 0–0 Portly Primates · regular season The V-Unit 0–0 Portly Primates · first meeting
- Lower: MAFFL Ghost at Tony's Talented Team · 👻 game
- Lower: Fightin Ferrets at Tommy Phamclub · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Fightin Ferrets 0–0 Tommy Phamclub · regular season Fightin Ferrets 0–0 Tommy Phamclub · first meeting
- Lower: Steel City Champyinz at The Best in The 'Burgh · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Steel City Champyinz 0–1 The Best in The 'Burgh · regular season Steel City Champyinz 0–1 The Best in The 'Burgh · current regular-season streak: The Best in The 'Burgh ×1 · last meeting 2025 Wk 9 (Regular): The Best in The 'Burgh 186.3-135.1

## Coverage (spread the wealth — editorial §4a)
_Headline + subhead + news reel mentions in Weeks 2–4._
- **Not written about in 3 Pulses (give at least 2 of these a news item this week):** Happy Valley Hammer Time (U), Steel City Champyinz (L), The Prodigal Sons (U), The V-Unit (L), Tony's Talented Team (L)
- **Already heavy (≥3 mentions — needs a record or a first-ever to make the reel again):** Reilly's Reindeer (U) ×6, Bad Attitude Gang (U) ×5, Hadley's Comets (U) ×5, Southside Shooters (U) ×4, Jake's Jagoffs (U) ×3, The Best in The 'Burgh (L) ×3, Tommy Phamclub (L) ×3
- **In a headline/subhead the last 2 weeks (don't lead with them again unless it's a record):** Bad Attitude Gang (U), Hadley's Comets (U), Jake's Jagoffs (U), Reilly's Reindeer (U), Tommy Phamclub (L), Turkey Hat Conglomerate (U)

## Story hooks (history from gold; every team has some, so quiet teams get a turn)
_One or two per team are plenty. Use them for news items, Results notes and Coach of the Week notes. Score ranks compare only 2025-on games (scoring changed in 2025). Owner history follows the person across team names. Copy wording loosely, numbers exactly._
- **Bad Attitude Gang** (U, L vs Reilly's Reindeer): all-time series with Reilly's Reindeer (by owner, regular + playoffs) now 2–6 · playoff history: 2018 Championship won by Reilly's Reindeer · trophy case: 1 title (last 2016); Lower-Tier title 2025; 5 Upper division titles (last 2021) · won Coach of the Week 11 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Camp Kes** (L, L vs The V-Unit): all-time series with The V-Unit (by owner, regular + playoffs) now 4–2 · loss ended a 4-game winning run against them · trophy case: 1 title (last 2023); 2 Upper division titles (last 2019) · won Coach of the Week 6 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Fightin Ferrets** (L, W vs Portly Primates): first-ever meeting with Portly Primates · best start through Week 5 since 2022 · trophy case: 2 titles (last 2015); 5 Upper division titles (last 2020) · won Coach of the Week 18 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Hadley's Comets** (U, L vs Mike Vicks Dog Sitting Co.): all-time series with Mike Vicks Dog Sitting Co. (by owner, regular + playoffs) now 6–3 · loss ended a 2-game winning run against them · playoff history: 2022 Quarterfinal won by Hadley's Comets · trophy case: 2 titles (last 2007); 7 Upper division titles (last 2023) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Happy Valley Hammer Time** (U, L vs The Prodigal Sons): all-time series with The Prodigal Sons (by owner, regular + playoffs) now 8–9 · playoff history: 2014 Quarterfinal won by The Prodigal Sons; 2015 Quarterfinal won by The Prodigal Sons · trophy case: 3 titles (last 2017); 7 Upper division titles (last 2022) · won Coach of the Week 13 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Jake's Jagoffs** (U, L vs Southside Shooters): all-time series with Southside Shooters (by owner, regular + playoffs) now 2–3 · trophy case: 2 titles (last 2021); 3 Upper division titles (last 2021) · won Coach of the Week 10 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Marco Clair Kardiac Attack** (U, W vs The Big Bang Theory): all-time series with The Big Bang Theory (by owner, regular + playoffs) now 9–7 · playoff history: 2013 Quarterfinal won by Kardiac Kids; 2018 Quarterfinal won by Kardiac Kids · best start through Week 5 since 2021 · trophy case: 1 title (last 2012); 10 Upper division titles (last 2024) · won Coach of the Week 3 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Mike Vicks Dog Sitting Co.** (U, W vs Hadley's Comets): all-time series with Hadley's Comets (by owner, regular + playoffs) now 3–6 · snapped a 2-game losing run against them; first win over them since 2024 · playoff history: 2022 Quarterfinal won by Hadley's Comets · 4-1 is this owner's best start through Week 5 in 5 seasons · 189.86 is the 9th-highest Upper score of 228 since 2025 · won 3 straight regular-season games (career long: 6) · no MAFFL title yet · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Portly Primates** (L, L vs Fightin Ferrets): first-ever meeting with Fightin Ferrets · no MAFFL title yet
- **Reilly's Reindeer** (U, W vs Bad Attitude Gang): all-time series with Bad Attitude Gang (by owner, regular + playoffs) now 6–2 · playoff history: 2018 Championship won by Reilly's Reindeer · trophy case: 3 titles (last 2024); 8 Upper division titles (last 2025) · won Coach of the Week 19 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Sarge's Squad** (L, L vs 👻): no MAFFL title yet
- **South Hills FunShiners** (U, W vs Turkey Hat Conglomerate): all-time series with Turkey Hat Conglomerate (by owner, regular + playoffs) now 6–3 · one win from career regular-season win No. 150 (career 149-121) · trophy case: 1 title (last 2019); 5 Upper division titles (last 2024) · won Coach of the Week 4 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Southside Shooters** (U, W vs Jake's Jagoffs): all-time series with Jake's Jagoffs (by owner, regular + playoffs) now 3–2 · trophy case: 2 Upper division titles (last 2025) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Steel City Champyinz** (L, L vs Tony's Talented Team): all-time series with Tony's Talented Team (by owner, regular + playoffs) now 1–1 · no MAFFL title yet
- **The Best in The 'Burgh** (L, L vs Tommy Phamclub): all-time series with Tommy Phamclub (by owner, regular + playoffs) now 1–1 · no MAFFL title yet
- **The Big Bang Theory** (U, L vs Marco Clair Kardiac Attack): all-time series with Marco Clair Kardiac Attack (by owner, regular + playoffs) now 7–9 · playoff history: 2013 Quarterfinal won by Kardiac Kids; 2018 Quarterfinal won by Kardiac Kids · one win from career regular-season win No. 100 (career 99-80) · trophy case: 4 Upper division titles (last 2024) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The Prodigal Sons** (U, W vs Happy Valley Hammer Time): all-time series with Happy Valley Hammer Time (by owner, regular + playoffs) now 9–8 · playoff history: 2014 Quarterfinal won by The Prodigal Sons; 2015 Quarterfinal won by The Prodigal Sons · trophy case: 3 titles (last 2025); 5 Upper division titles (last 2025) · won Coach of the Week 5 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The V-Unit** (L, W vs Camp Kes): all-time series with Camp Kes (by owner, regular + playoffs) now 2–4 · snapped a 4-game losing run against them; first win over them since 2020 · trophy case: 2 titles (last 2020); 3 Upper division titles (last 2017) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Tommy Phamclub** (L, W vs The Best in The 'Burgh): all-time series with The Best in The 'Burgh (by owner, regular + playoffs) now 1–1 · first win over them ever, after a loss · 4-1 is this owner's best start through Week 5 in 2 seasons · no MAFFL title yet
- **Tony's Talented Team** (L, W vs Steel City Champyinz): all-time series with Steel City Champyinz (by owner, regular + playoffs) now 1–1 · first win over them ever, after a loss · 190.84 is the 10th-highest Lower score of 157 since 2025 · trophy case: 1 Upper division title (last 2023) · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Turkey Hat Conglomerate** (U, L vs South Hills FunShiners): all-time series with South Hills FunShiners (by owner, regular + playoffs) now 3–6 · trophy case: 3 Upper division titles (last 2025) · won Coach of the Week 7 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
```  exit 0
