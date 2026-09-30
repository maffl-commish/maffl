# Week 3 data log (robot, Windows runner)

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
# MAFFL 2026 Week 3 — Pulse facts (computed from gold)
Source: pulse_facts.py v0.1. Numbers only; copy them exactly. Sort order = rulebook tiebreak (record → credits → points).

## Standings (season totals through this week)
**Upper Div A**
- South Hills FunShiners · 2-1 · points 439.06 · streak +2 · credits 4 · all-play 16-17
- Bad Attitude Gang · 1-2 · points 502.70 · streak -1 · credits 27 · all-play 19-14
- Marco Clair Kardiac Attack · 1-2 · points 390.16 · streak -2 · credits 12 · all-play 11-22
**Upper Div B**
- Jake's Jagoffs · 3-0 · points 491.08 · streak +3 · credits 15 · all-play 25-8
- Mike Vicks Dog Sitting Co. · 2-1 · points 419.40 · streak +1 · credits 5 · all-play 17-16
- The Prodigal Sons · 1-2 · points 451.30 · streak -2 · credits 24 · all-play 16-17
**Upper Div C**
- Happy Valley Hammer Time · 2-1 · points 467.26 · streak +2 · credits 17 · all-play 18-15
- The Big Bang Theory · 1-2 · points 389.12 · streak -2 · credits 6 · all-play 13-20
- Reilly's Reindeer · 0-3 · points 412.96 · streak -3 · credits 23 · all-play 9-24
**Upper Div D**
- Hadley's Comets · 3-0 · points 494.32 · streak +3 · credits 7 · all-play 23-10
- Turkey Hat Conglomerate · 2-1 · points 500.66 · streak +2 · credits 7 · all-play 23-10
- Southside Shooters · 0-3 · points 384.72 · streak -3 · credits 7 · all-play 8-25
**Lower** (👻 always listed last on the page)
- The Best in The 'Burgh · 3-0 · points 492.26 · streak +3 · credits 6 · all-play 18-6
- Tommy Phamclub · 2-1 · points 497.16 · streak -1 · credits 8 · all-play 13-11
- Portly Primates · 2-1 · points 489.90 · streak +1 · credits 6 · all-play 16-8
- Steel City Champyinz · 2-1 · points 427.98 · streak +2 · credits 6 · all-play 12-12
- Sarge's Squad · 2-1 · points 406.10 · streak +2 · credits 5 · all-play 7-17
- Tony's Talented Team · 1-2 · points 483.98 · streak -1 · credits 10 · all-play 13-11
- Fightin Ferrets · 1-2 · points 473.94 · streak -2 · credits 1 · all-play 14-10
- Camp Kes · 1-2 · points 425.00 · streak +1 · credits 1 · all-play 9-15
- The V-Unit · 1-2 · points 409.56 · streak -2 · credits 0 · all-play 6-18
- MAFFL Ghost · 0-3 · points 440.77 · streak -3 · credits 0

## Playoff picture (page builds this itself; for prose only)
Upper seeds: 1 Jake's Jagoffs (div) · 2 Hadley's Comets (div) · 3 Happy Valley Hammer Time (div) · 4 South Hills FunShiners (div) · 5 Turkey Hat Conglomerate (WC) · 6 Mike Vicks Dog Sitting Co. (WC) · 7 Bad Attitude Gang · 8 The Prodigal Sons · 9 Marco Clair Kardiac Attack · 10 The Big Bang Theory · 11 Reilly's Reindeer · 12 Southside Shooters
Upper relegation spots (11–12): Reilly's Reindeer, Southside Shooters
Lower order: 1 The Best in The 'Burgh · 2 Tommy Phamclub · 3 Portly Primates · 4 Steel City Champyinz · 5 Sarge's Squad · 6 Tony's Talented Team · 7 Fightin Ferrets · 8 Camp Kes · 9 The V-Unit  (promotion line = top 2)

## Survivor
**Upper** — 9 alive: Bad Attitude Gang, South Hills FunShiners, Jake's Jagoffs, The Prodigal Sons, Mike Vicks Dog Sitting Co., Reilly's Reindeer, Hadley's Comets, Turkey Hat Conglomerate, Southside Shooters
- Week 3: Marco Clair Kardiac Attack out with 114.32
- Week 2: The Big Bang Theory out with 88.72
- Week 1: Happy Valley Hammer Time out with 124.14
  margin: Marco Clair Kardiac Attack was 8.94 behind Reilly's Reindeer
**Lower** — 6 alive: Camp Kes, Fightin Ferrets, Portly Primates, Sarge's Squad, The Best in The 'Burgh, Tony's Talented Team
- Week 3: Tommy Phamclub out with 135.94
- Week 2: The V-Unit out with 124.74
- Week 1: Steel City Champyinz out with 116.34
  margin: Tommy Phamclub was 1.66 behind Fightin Ferrets

## Credit Tracker leaders (status 'leading' until the award is mathematically locked)
- Most Team Points Scored — Upper: Bad Attitude Gang · 502.70 through Wk 3 · since 2
- Most Team Points Scored — Lower: Tommy Phamclub · 497.16 through Wk 3 · since 2
- Largest Blowout Victory — Upper: Bad Attitude Gang · 59.14 over The Prodigal Sons (Wk 2) · since 2
- Largest Blowout Victory — Lower: Tommy Phamclub · 60.90 over 👻 (Wk 2) · since 1
- Individual high THIS WEEK — Upper: B. Purdy, Happy Valley Hammer Time, 39.28  → compare with last week's creditTracker value; the season leader changes only if this is higher.
- Individual high THIS WEEK — Lower: B. Purdy, The Best in The 'Burgh, 39.28  → compare with last week's creditTracker value; the season leader changes only if this is higher.

## Highest weekly score this week
- Upper: Turkey Hat Conglomerate · 181.80
- Lower: Portly Primates · 185.98

## This week's games (winner first) with context
- Upper: Turkey Hat Conglomerate 181.80 def. Reilly's Reindeer 123.26 · margin 58.54
- Upper: Hadley's Comets 172.02 def. Southside Shooters 130.46 · margin 41.56
- Upper: Happy Valley Hammer Time 169.32 def. Bad Attitude Gang 154.22 · margin 15.10
- Upper: South Hills FunShiners 168.86 def. Marco Clair Kardiac Attack 114.32 · margin 54.54
- Upper: Jake's Jagoffs 150.20 def. The Prodigal Sons 143.78 · margin 6.42
- Upper: Mike Vicks Dog Sitting Co. 127.08 def. The Big Bang Theory 125.60 · margin 1.48
- Lower: Portly Primates 185.98 def. Tony's Talented Team 167.52 · margin 18.46
- Lower: The Best in The 'Burgh 179.34 def. The V-Unit 143.76 · margin 35.58
- Lower: Steel City Champyinz 168.08 def. MAFFL Ghost 151.47 · margin 16.61
- Lower: Camp Kes 141.06 def. Fightin Ferrets 137.60 · margin 3.46
- Lower: Sarge's Squad 138.42 def. Tommy Phamclub 135.94 · margin 2.48

## Week 4 pairings + head-to-head (all MAFFL history, by owner)
- Upper: Bad Attitude Gang at South Hills FunShiners · Div A game · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Bad Attitude Gang 3–3 South Hills FunShiners · regular season Bad Attitude Gang 2–3 South Hills FunShiners · current regular-season streak: South Hills FunShiners ×2 · playoff meetings: 2016 Championship won by Bad Attitude Gang 137.98-131.08 · last meeting 2022 Wk 17 (Consolation): South Hills FunShiners 90.8-76.54
- Upper: The Prodigal Sons at Mike Vicks Dog Sitting Co. · Div B game · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Prodigal Sons 1–3 Mike Vicks Dog Sitting Co. · regular season The Prodigal Sons 1–3 Mike Vicks Dog Sitting Co. · current regular-season streak: The Prodigal Sons ×1 · last meeting 2025 Wk 7 (Regular): The Prodigal Sons 186.96-119.72
- Upper: Marco Clair Kardiac Attack at Turkey Hat Conglomerate · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Marco Clair Kardiac Attack 16–11 Turkey Hat Conglomerate · regular season Marco Clair Kardiac Attack 14–11 Turkey Hat Conglomerate · current regular-season streak: Marco Clair Kardiac Attack ×1 · playoff meetings: 2019 Quarterfinal won by Kardiac Kids 162.04-115.82; 2025 Quarterfinal won by Kids BadBlood HighSchool 208.08-147.54 · last meeting 2025 Wk 15 (Quarterfinal): Kids BadBlood HighSchool 208.08-147.54
- Upper: The Big Bang Theory at Reilly's Reindeer · Div C game · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Big Bang Theory 6–6 Reilly's Reindeer · regular season The Big Bang Theory 6–6 Reilly's Reindeer · current regular-season streak: Reilly's Reindeer ×2 · last meeting 2025 Wk 6 (Regular): Reilly's Reindeer 188.48-129.2
- Upper: Happy Valley Hammer Time at Southside Shooters · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Happy Valley Hammer Time 10–2 Southside Shooters · regular season Happy Valley Hammer Time 9–2 Southside Shooters · current regular-season streak: Happy Valley Hammer Time ×1 · playoff meetings: 2020 Quarterfinal won by Happy Valley Hammer Time 110.32-93.74 · last meeting 2024 Wk 7 (Regular): Happy Valley Hammer Time 94.6-70.58
- Upper: Jake's Jagoffs at Hadley's Comets · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Jake's Jagoffs 11–21 Hadley's Comets · regular season Jake's Jagoffs 10–18 Hadley's Comets · current regular-season streak: Hadley's Comets ×9 · playoff meetings: 2005 Quarterfinal won by Swissvale SkeeDaddies 144.5-107.0; 2006 Semifinal won by Swissvale Flashes 144.0-87.5; 2007 Quarterfinal won by ONE HOUSE DIVIDED 126.0-77.5; 2021 Quarterfinal won by Jake's Jagoffs 103.7-96.1 · last meeting 2024 Wk 15 (Consolation): Hadley's Comets 112.44-102.44
- Lower: MAFFL Ghost at Camp Kes · 👻 game
- Lower: Fightin Ferrets at The V-Unit · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Fightin Ferrets 9–10 The V-Unit · regular season Fightin Ferrets 9–8 The V-Unit · current regular-season streak: Fightin Ferrets ×1 · playoff meetings: 2013 Semifinal won by The V-Unit 97.32-96.46; 2020 Semifinal won by The V-Unit 128.04-82.2 · last meeting 2025 Wk 12 (Regular): U-Town Fightin Ferrets 128.48-114.62
- Lower: Steel City Champyinz at Sarge's Squad · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Steel City Champyinz 0–1 Sarge's Squad · regular season Steel City Champyinz 0–1 Sarge's Squad · current regular-season streak: Sarge's Squad ×1 · last meeting 2025 Wk 17 (Consolation): Steel City Champyinz 125.72-94.54
- Lower: The Best in The 'Burgh at Portly Primates · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) The Best in The 'Burgh 1–0 Portly Primates · regular season The Best in The 'Burgh 1–0 Portly Primates · current regular-season streak: The Best in The 'Burgh ×1 · last meeting 2025 Wk 8 (Regular): The Best in The 'Burgh 149.48-106.38
- Lower: Tommy Phamclub at Tony's Talented Team · all-time (regular + playoffs, no consolation; matches the page's ⚔️ strip) Tommy Phamclub 0–1 Tony's Talented Team · regular season Tommy Phamclub 0–1 Tony's Talented Team · current regular-season streak: Tony's Talented Team ×1 · last meeting 2025 Wk 6 (Regular): Tony's Talented Team 129.76-126.48
```  exit 0
