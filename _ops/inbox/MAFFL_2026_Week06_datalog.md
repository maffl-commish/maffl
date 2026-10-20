# Week 6 data log (robot, Windows runner)

### Append week to gold (ingest_week.py)
```
Appended week 6: 11 matchup rows (CRLF) · 63 top-performer rows (CRLF) · score_sum 3085.15
Stat corrections reported for earlier weeks: 3  → applied next by apply_corrections.py
```  exit 0

### Apply ESPN stat corrections to earlier weeks (apply_corrections.py)
```
# Week 6 — stat corrections applied to gold (robot)
Applied: 3 score change(s) in 2 row(s) · winner flips: 0
- Week 5 · Upper · Reilly's Reindeer 171.48 → 171.98 (vs Bad Attitude Gang, result unchanged)
- Week 5 · Lower · MAFFL Ghost 161.96 → 162.02 (vs Sarge's Squad, result unchanged)
- Week 5 · Lower · Sarge's Squad 157.38 → 157.88 (vs MAFFL Ghost, result unchanged)
👻 par changes: Week 5 161.96 → 162.02 — LM: re-enter in ESPN
```  exit 0

### CE-1 generator, check (expect 1 = additions)
```
  corrected NoConsolation: 2026,5,Upper,False,Regular,Joe Reilly,Joseph Reilly,Reilly's Reindeer,171.48,Mike Murello,Michael Murello,Bad Attitude Gang,102.24 -> 2026,5,Upper,False,Regular,Joe Reilly,Joseph Reilly,Reilly's Reindeer,171.98,Mike Murello,Michael Murello,Bad Attitude Gang,102.24
  corrected NoConsolation: 2026,5,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,161.96,Nick Yankovich,Nick Yankovich,Sarge's Squad,157.38 -> 2026,5,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,162.02,Nick Yankovich,Nick Yankovich,Sarge's Squad,157.88
  corrected matchups-data.js: [2026,5,"U","Joe Reilly",171.48,"Mike Murello",102.24,"R"] -> [2026,5,"U","Joe Reilly",171.98,"Mike Murello",102.24,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2792 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.19 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x6
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 2 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2444 -> 2455 rows; append-only drift check passed.
[matchups-data.js] DIFFERS -- 2439 -> 2449 rows (6 Ghost row(s) excluded); append-only drift check passed.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
check-only (no -Write); nothing written.
```  exit 1

### CE-1 generator, write
```
  corrected NoConsolation: 2026,5,Upper,False,Regular,Joe Reilly,Joseph Reilly,Reilly's Reindeer,171.48,Mike Murello,Michael Murello,Bad Attitude Gang,102.24 -> 2026,5,Upper,False,Regular,Joe Reilly,Joseph Reilly,Reilly's Reindeer,171.98,Mike Murello,Michael Murello,Bad Attitude Gang,102.24
  corrected NoConsolation: 2026,5,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,161.96,Nick Yankovich,Nick Yankovich,Sarge's Squad,157.38 -> 2026,5,Lower,False,Ghost,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,162.02,Nick Yankovich,Nick Yankovich,Sarge's Squad,157.88
  corrected matchups-data.js: [2026,5,"U","Joe Reilly",171.48,"Mike Murello",102.24,"R"] -> [2026,5,"U","Joe Reilly",171.98,"Mike Murello",102.24,"R"]
[gold] MAFFL_Matchups_Clean.csv: 2792 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.19 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x6
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 2 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] DIFFERS -- 2444 -> 2455 rows; append-only drift check passed.
[MAFFL_Matchups_NoConsolation.csv] WROTE.
[matchups-data.js] DIFFERS -- 2439 -> 2449 rows (6 Ghost row(s) excluded); append-only drift check passed.
[matchups-data.js] WROTE.
[MAFFL_Points_By_Season.csv] DIFFERS -- 358 -> 358 rows; append-only drift check passed.
[MAFFL_Points_By_Season.csv] WROTE.
[MAFFL_Points_AllTime.csv] DIFFERS -- 34 -> 34 rows, 21 updated; append-only drift check passed.
[MAFFL_Points_AllTime.csv] WROTE.
```  exit 1

### CE-1 generator, re-check (expect 0 = in sync)
```
[gold] MAFFL_Matchups_Clean.csv: 2792 rows, 2005-2026, all owner strings resolved.
  Ghost row: 2026 wk 1 Lower: Charles Lavrinc W 168.72-151.28 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 2 Lower: Sam Lavrinc W 198.92-138.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 3 Lower: Dominic Nicastro W 168.08-151.47 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 4 Lower: Bob Keslar L 124.88-145.54 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 5 Lower: Nick Yankovich L 157.88-162.02 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Ghost row: 2026 wk 6 Lower: Tony Brooks L 134.44-141.19 vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)
  Registry-resolved spelling: 'Jon Fetrow/ Casey Trozzo' -> 'Jon Fetrow' (jon-fetrow) x6
  G-8: 164 owner-season(s) <= 2025 carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed).
[correct] 0 NoConsolation row(s) corrected in season(s) 2026; 0 finished-season By_Season row(s)
[MAFFL_Matchups_NoConsolation.csv] ROUND-TRIP EXACT -- byte-identical (2455 -> 2455 rows).
[matchups-data.js] ROUND-TRIP EXACT -- byte-identical (2449 -> 2449 rows (6 Ghost row(s) excluded)).
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
# MAFFL 2026 Week 6 — Pulse facts (computed from gold)
Source: pulse_facts.py v0.2. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).

## Standings (season totals through this week)
**Upper Div A**
- South Hills FunShiners · 4-2 · points 889.82 · streak +2 · credits 4 · all-play 32-34
- Bad Attitude Gang · 3-3 · points 958.26 · streak +1 · credits 27 · all-play 41-25
- Marco Clair Kardiac Attack · 3-3 · points 849.68 · streak -1 · credits 12 · all-play 32-34
**Upper Div B**
- Jake's Jagoffs · 5-1 · points 921.40 · streak +1 · credits 15 · all-play 42-24
- Mike Vicks Dog Sitting Co. · 5-1 · points 933.00 · streak +4 · credits 5 · all-play 46-20
- The Prodigal Sons · 3-3 · points 915.16 · streak +2 · credits 24 · all-play 39-27
**Upper Div C**
- Happy Valley Hammer Time · 3-3 · points 846.26 · streak -2 · credits 17 · all-play 24-42
- The Big Bang Theory · 3-3 · points 775.76 · streak +1 · credits 6 · all-play 22-44
- Reilly's Reindeer · 1-5 · points 822.80 · streak -1 · credits 23 · all-play 23-43
**Upper Div D**
- Hadley's Comets · 3-3 · points 905.48 · streak -3 · credits 7 · all-play 35-31
- Turkey Hat Conglomerate · 2-4 · points 918.36 · streak -3 · credits 7 · all-play 37-29
- Southside Shooters · 1-5 · points 809.66 · streak -1 · credits 7 · all-play 23-43
**Lower** (👻 always listed last on the page)
- Tommy Phamclub · 4-2 · points 986.64 · streak -1 · credits 8 · all-play 30-18
- The Best in The 'Burgh · 4-2 · points 948.36 · streak +1 · credits 6 · all-play 29-19
- Fightin Ferrets · 4-2 · points 1010.88 · streak +3 · credits 1 · all-play 37-11
- Portly Primates · 3-3 · points 913.00 · streak -2 · credits 6 · all-play 24-24
- Steel City Champyinz · 3-3 · points 870.70 · streak -2 · credits 6 · all-play 22-26
- Sarge's Squad · 3-3 · points 904.40 · streak +1 · credits 5 · all-play 23-25
- The V-Unit · 3-3 · points 841.68 · streak +2 · credits 0 · all-play 15-33
- Tony's Talented Team · 2-4 · points 946.42 · streak -1 · credits 10 · all-play 25-23
- Camp Kes · 1-5 · points 819.24 · streak -3 · credits 1 · all-play 11-37
- MAFFL Ghost · 3-3 · points 889.52 · streak +3 · credits 0

## Playoff picture (page builds this itself; for prose only)
Upper seeds: 1 Jake's Jagoffs (div) · 2 South Hills FunShiners (div) · 3 Happy Valley Hammer Time (div) · 4 Hadley's Comets (div) · 5 Mike Vicks Dog Sitting Co. (WC) · 6 Bad Attitude Gang (WC) · 7 The Prodigal Sons · 8 Marco Clair Kardiac Attack · 9 The Big Bang Theory · 10 Turkey Hat Conglomerate · 11 Reilly's Reindeer · 12 Southside Shooters
Upper relegation spots (11–12): Reilly's Reindeer, Southside Shooters
Lower order: 1 Tommy Phamclub · 2 The Best in The 'Burgh · 3 Fightin Ferrets · 4 Portly Primates · 5 Steel City Champyinz · 6 Sarge's Squad · 7 The V-Unit · 8 Tony's Talented Team · 9 Camp Kes  (promotion line = top 2)

## Survivor
**Upper** — 6 alive: South Hills FunShiners, Jake's Jagoffs, The Prodigal Sons, Mike Vicks Dog Sitting Co., Turkey Hat Conglomerate, Southside Shooters
- Week 6: Hadley's Comets out with 100.30
- Week 5: Bad Attitude Gang out with 102.24
- Week 4: Reilly's Reindeer out with 103.30
- Week 3: Marco Clair Kardiac Attack out with 114.32
- Week 2: The Big Bang Theory out with 88.72
- Week 1: Happy Valley Hammer Time out with 124.14
  margin: Hadley's Comets was 7.38 behind Turkey Hat Conglomerate
**Lower** — 3 alive: Fightin Ferrets, Sarge's Squad, The Best in The 'Burgh
- Week 6: Tony's Talented Team out with 134.44
- Week 5: Portly Primates out with 133.80
- Week 4: Camp Kes out with 124.88
- Week 3: Tommy Phamclub out with 135.94
- Week 2: The V-Unit out with 124.74
- Week 1: Steel City Champyinz out with 116.34
  margin: Tony's Talented Team was 0.64 behind The Best in The 'Burgh

## Credit Tracker leaders (status 'leading' until the award is mathematically locked)
- Most Team Points Scored — Upper: Bad Attitude Gang · 958.26 through Wk 6 · since 6
- Most Team Points Scored — Lower: Fightin Ferrets · 1010.88 through Wk 6 · since 5
- Largest Blowout Victory — Upper: Reilly's Reindeer · 69.74 over Bad Attitude Gang (Wk 5) · since 5
- Largest Blowout Victory — Lower: Tommy Phamclub · 60.90 over 👻 (Wk 2) · since 1
- Individual high THIS WEEK — Upper: T. Lawrence, Southside Shooters, 34.34  → compare with last week's creditTracker value; the season leader changes only if this is higher.
- Individual high THIS WEEK — Lower: T. Lawrence, The V-Unit, 34.34  → compare with last week's creditTracker value; the season leader changes only if this is higher.

## Highest weekly score this week
- Upper: Bad Attitude Gang · 167.96
- Lower: Sarge's Squad · 178.70

## This week's games (winner first) with context
- Upper: Bad Attitude Gang 167.96 def. Southside Shooters 145.94 · margin 22.02
- Upper: The Prodigal Sons 160.32 def. Reilly's Reindeer 134.56 · margin 25.76
- Upper: Mike Vicks Dog Sitting Co. 151.06 def. Marco Clair Kardiac Attack 150.58 · margin 0.48
- Upper: Jake's Jagoffs 135.52 def. Happy Valley Hammer Time 121.78 · margin 13.74
- Upper: South Hills FunShiners 134.20 def. Hadley's Comets 100.30 · margin 33.90
- Upper: The Big Bang Theory 125.86 def. Turkey Hat Conglomerate 107.68 · margin 18.18
- Lower: Sarge's Squad 178.70 def. Camp Kes 122.90 · margin 55.80
- Lower: Fightin Ferrets 171.50 def. Tommy Phamclub 151.24 · margin 20.26
- Lower: The V-Unit 144.18 def. Portly Primates 141.98 · margin 2.20
- Lower: MAFFL Ghost 141.19 def. Tony's Talented Team 134.44 · margin 6.75
- Lower: The Best in The 'Burgh 135.08 def. Steel City Champyinz 128.18 · margin 6.90

## Week 7 pairings + head-to-head (all MAFFL history, by owner)
- Upper: Bad Attitude Gang at Jake's Jagoffs · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Bad Attitude Gang 10–8 Jake's Jagoffs · regular season Bad Attitude Gang 10–6 Jake's Jagoffs · current regular-season streak: Jake's Jagoffs ×2 · playoff meetings: 2006 Quarterfinal won by Jake's Jagoffs 166.5-110.0; 2011 Semifinal won by Jake's Jagoffs 141.0-84.0 · last meeting 2025 Wk 17 (Consolation): Bad Attitude Gang 183.46-140.6
- Upper: Marco Clair Kardiac Attack at The Prodigal Sons · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Marco Clair Kardiac Attack 16–13 The Prodigal Sons · regular season Marco Clair Kardiac Attack 16–12 The Prodigal Sons · current regular-season streak: Marco Clair Kardiac Attack ×1 · playoff meetings: 2013 Semifinal won by The Prodigal Sons 122.54-95.12 · last meeting 2025 Wk 8 (Regular): Kids BadBlood HighSchool 209.64-159.9
- Upper: South Hills FunShiners at Happy Valley Hammer Time · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) South Hills FunShiners 8–12 Happy Valley Hammer Time · regular season South Hills FunShiners 7–12 Happy Valley Hammer Time · current regular-season streak: Happy Valley Hammer Time ×4 · playoff meetings: 2006 Quarterfinal won by Wilkinsburg N'@s 160.0-96.0 · last meeting 2022 Wk 16 (Consolation): Happy Valley Hammer Time 92.9-82.86
- Upper: Reilly's Reindeer at Southside Shooters · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Reilly's Reindeer 4–0 Southside Shooters · regular season Reilly's Reindeer 3–0 Southside Shooters · current regular-season streak: Reilly's Reindeer ×2 · playoff meetings: 2024 Championship won by Reilly's Reindeer 129.66-81.88 · last meeting 2025 Wk 7 (Regular): Reilly's Reindeer 167.44-137.16
- Upper: Mike Vicks Dog Sitting Co. at Turkey Hat Conglomerate · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Mike Vicks Dog Sitting Co. 4–1 Turkey Hat Conglomerate · regular season Mike Vicks Dog Sitting Co. 4–1 Turkey Hat Conglomerate · current regular-season streak: Turkey Hat Conglomerate ×1 · last meeting 2025 Wk 5 (Regular): Turkey Hat Conglomerate 144.68-138.64
- Upper: The Big Bang Theory at Hadley's Comets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Big Bang Theory 4–2 Hadley's Comets · regular season The Big Bang Theory 4–2 Hadley's Comets · current regular-season streak: The Big Bang Theory ×3 · last meeting 2025 Wk 5 (Regular): The Big Bang Theory 124.26-112.94
- Lower: Camp Kes at Portly Primates · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Camp Kes 0–0 Portly Primates · regular season Camp Kes 0–0 Portly Primates · first meeting
- Lower: Tony's Talented Team at Sarge's Squad · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tony's Talented Team 2–0 Sarge's Squad · regular season Tony's Talented Team 2–0 Sarge's Squad · current regular-season streak: Tony's Talented Team ×2 · last meeting 2025 Wk 10 (Regular): Tony's Talented Team 189.5-153.72
- Lower: Tommy Phamclub at The V-Unit · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tommy Phamclub 0–0 The V-Unit · regular season Tommy Phamclub 0–0 The V-Unit · first meeting
- Lower: The Best in The 'Burgh at MAFFL Ghost · 👻 game
- Lower: Steel City Champyinz at Fightin Ferrets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Steel City Champyinz 0–0 Fightin Ferrets · regular season Steel City Champyinz 0–0 Fightin Ferrets · first meeting

## Coverage (spread the wealth — editorial §4a)
_Headline + subhead + news reel mentions in Weeks 3–5._
- **Not written about in 3 Pulses (give at least 2 of these a news item this week):** South Hills FunShiners (U), Steel City Champyinz (L), The Big Bang Theory (U), Tony's Talented Team (L)
- **Already heavy (≥3 mentions — needs a record or a first-ever to make the reel again):** Reilly's Reindeer (U) ×5, Hadley's Comets (U) ×3, Southside Shooters (U) ×3, Tommy Phamclub (L) ×3
- **In a headline/subhead the last 2 weeks (don't lead with them again unless it's a record):** Bad Attitude Gang (U), Hadley's Comets (U), Jake's Jagoffs (U), Mike Vicks Dog Sitting Co. (U), Reilly's Reindeer (U)

## Story hooks (history from gold; every team has some, so quiet teams get a turn)
_One or two per team are plenty. Use them for news items, Results notes and Coach of the Week notes. Score ranks compare only 2025-on games (scoring changed in 2025). Owner history follows the person across team names. Copy wording loosely, numbers exactly._
- **Bad Attitude Gang** (U, W vs Southside Shooters): all-time series with Southside Shooters (by owner, regular + playoffs) now 9–4 · playoff history: 2016 Quarterfinal won by Bad Attitude Gang · trophy case: 1 title (last 2016); Lower-Tier title 2025; 5 Upper division titles (last 2021) · won Coach of the Week 11 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Camp Kes** (L, L vs Sarge's Squad): first-ever meeting with Sarge's Squad · trophy case: 1 title (last 2023); 2 Upper division titles (last 2019) · won Coach of the Week 6 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Fightin Ferrets** (L, W vs Tommy Phamclub): first-ever meeting with Tommy Phamclub · best start through Week 6 since 2016 · won 3 straight regular-season games (career long: 8) · trophy case: 2 titles (last 2015); 5 Upper division titles (last 2020) · won Coach of the Week 18 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Hadley's Comets** (U, L vs South Hills FunShiners): all-time series with South Hills FunShiners (by owner, regular + playoffs) now 17–12 · playoff history: 2006 Championship won by Swissvale Flashes; 2023 Semifinal won by Hadley's Comets · lost 3 straight regular-season games (career long: 7) · trophy case: 2 titles (last 2007); 7 Upper division titles (last 2023) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Happy Valley Hammer Time** (U, L vs Jake's Jagoffs): all-time series with Jake's Jagoffs (by owner, regular + playoffs) now 5–4 · loss ended a 2-game winning run against them · trophy case: 3 titles (last 2017); 7 Upper division titles (last 2022) · won Coach of the Week 13 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Jake's Jagoffs** (U, W vs Happy Valley Hammer Time): all-time series with Happy Valley Hammer Time (by owner, regular + playoffs) now 4–5 · snapped a 2-game losing run against them; first win over them since 2024 · trophy case: 2 titles (last 2021); 3 Upper division titles (last 2021) · won Coach of the Week 10 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Marco Clair Kardiac Attack** (U, L vs Mike Vicks Dog Sitting Co.): all-time series with Mike Vicks Dog Sitting Co. (by owner, regular + playoffs) now 2–3 · trophy case: 1 title (last 2012); 10 Upper division titles (last 2024) · won Coach of the Week 3 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Mike Vicks Dog Sitting Co.** (U, W vs Marco Clair Kardiac Attack): all-time series with Marco Clair Kardiac Attack (by owner, regular + playoffs) now 3–2 · 5-1 is this owner's best start through Week 6 in 5 seasons · won 4 straight regular-season games (career long: 6) · no MAFFL title yet · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Portly Primates** (L, L vs The V-Unit): first-ever meeting with The V-Unit · no MAFFL title yet
- **Reilly's Reindeer** (U, L vs The Prodigal Sons): all-time series with The Prodigal Sons (by owner, regular + playoffs) now 5–4 · playoff history: 2014 Championship won by Reilly's Reindeers; 2025 Championship won by The Prodigal Sons · trophy case: 3 titles (last 2024); 8 Upper division titles (last 2025) · won Coach of the Week 19 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Sarge's Squad** (L, W vs Camp Kes): first-ever meeting with Camp Kes · no MAFFL title yet
- **South Hills FunShiners** (U, W vs Hadley's Comets): all-time series with Hadley's Comets (by owner, regular + playoffs) now 12–17 · playoff history: 2006 Championship won by Swissvale Flashes; 2023 Semifinal won by Hadley's Comets · that was career regular-season win No. 150 (career 150-121) · trophy case: 1 title (last 2019); 5 Upper division titles (last 2024) · won Coach of the Week 4 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Southside Shooters** (U, L vs Bad Attitude Gang): all-time series with Bad Attitude Gang (by owner, regular + playoffs) now 4–9 · playoff history: 2016 Quarterfinal won by Bad Attitude Gang · trophy case: 2 Upper division titles (last 2025) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Steel City Champyinz** (L, L vs The Best in The 'Burgh): all-time series with The Best in The 'Burgh (by owner, regular + playoffs) now 0–2 · no MAFFL title yet
- **The Best in The 'Burgh** (L, W vs Steel City Champyinz): all-time series with Steel City Champyinz (by owner, regular + playoffs) now 2–0 · no MAFFL title yet
- **The Big Bang Theory** (U, W vs Turkey Hat Conglomerate): all-time series with Turkey Hat Conglomerate (by owner, regular + playoffs) now 10–5 · snapped a 2-game losing run against them; first win over them since 2023 · playoff history: 2016 Quarterfinal won by The Big Bang Theory · that was career regular-season win No. 100 (career 100-80) · trophy case: 4 Upper division titles (last 2024) · won Coach of the Week 9 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The Prodigal Sons** (U, W vs Reilly's Reindeer): all-time series with Reilly's Reindeer (by owner, regular + playoffs) now 4–5 · playoff history: 2014 Championship won by Reilly's Reindeers; 2025 Championship won by The Prodigal Sons · trophy case: 3 titles (last 2025); 5 Upper division titles (last 2025) · won Coach of the Week 5 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **The V-Unit** (L, W vs Portly Primates): first-ever meeting with Portly Primates · trophy case: 2 titles (last 2020); 3 Upper division titles (last 2017) · won Coach of the Week 12 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Tommy Phamclub** (L, L vs Fightin Ferrets): first-ever meeting with Fightin Ferrets · 4-2 is this owner's best start through Week 6 in 2 seasons · no MAFFL title yet
- **Tony's Talented Team** (L, L vs 👻): trophy case: 1 Upper division title (last 2023) · won Coach of the Week once back in 2013–22 (old award; it's bragging rights only now, so never mention money)
- **Turkey Hat Conglomerate** (U, L vs The Big Bang Theory): all-time series with The Big Bang Theory (by owner, regular + playoffs) now 5–10 · loss ended a 2-game winning run against them · playoff history: 2016 Quarterfinal won by The Big Bang Theory · lost 3 straight regular-season games (career long: 7) · trophy case: 3 Upper division titles (last 2025) · won Coach of the Week 7 times back in 2013–22 (old award; it's bragging rights only now, so never mention money)
```  exit 0
