# AUDIT — Career Accolade Reconciliation

**Date:** 2026-06-17 · **Scope:** READ-ONLY. Career accolades (Championships,
Runner-Ups, Playoff Appearances, Division Titles, Third-Place) derived from gold sources
and diffed against every hand-stored copy. **No data files were modified.**

Owner join: every name mapped to `owner_id` via `data/MAFFL_Owner_Registry.csv` aliases
(exact trim match, `*_ESPN` columns ignored). **UNMAPPED names: NONE** in any source
(matchups, division history, cleaned_maffl, Owners Sheet, power-rankings.html,
history.html, stats.html, Power_Rankings.csv, Placements). All 34 `owner_id` slugs resolved.

---

## 1. Gold derivations & bracket structure

### Bracket-game tier breakdown (MAFFL_Matchups_NoConsolation.csv)

| Game_Type | Count | Tier | Years |
|---|---|---|---|
| Championship | 21 | **Upper (100%)** | 2005–2025, 1/yr |
| Semifinal | 42 | **Upper (100%)** | 2 / yr |
| Quarterfinal | 80 | **Upper (100%)** | 2005–2025 |
| ThirdPlace | 20 | **Upper (100%)** | 2006–2025 (none 2005) |

**Every bracket game in gold is Upper-tier — there are NO Lower-tier bracket games.**
This resolves playoff-app flag (b): no Lower-tier games can be missed.

### Division rank-1 rows per year (MAFFL_Division_History_2005_2025.csv)

- **2005–2024: exactly 4 rank-1 rows/yr, all Upper-tier.**
- **2025: 5 rank-1 rows — 4 Upper + 1 Lower.** The lone Lower-tier division winner is
  **Jacob Nickman (Jake's Jagoffs, 9-4, 2025)**. This single row is the entire
  upper-only-vs-all-tier difference (see §3).

### GOLD per owner_id

`CH` = championships incl. pre-2005; `RUN` = championship-game losses (2005+);
`PLAY` = distinct seasons in ≥1 Upper QF/SF/Champ game; `DIV` = Division_Rank=1 rows
Year≥2013 (all-tier default); `DIVu` = same, Upper-tier only; `3RD` = ThirdPlace winners.

| owner_id | CH | RUN | PLAY | DIV | DIVu | 3RD |
|---|---|---|---|---|---|---|
| joe-reilly | 3 | 1 | 12 | 7 | 7 | 2 |
| tony-trozzo | 3 | 1 | 11 | 4 | 4 | 2 |
| jon-rick | 3 | 2 | 10 | 4 | 4 | 0 |
| brian-ron-murello | 2 | 3 | 15 | 4 | 4 | 2 |
| mike-murello | 2 | 2 | 11 | 2 | 2 | 2 |
| chris-johnson | 2 | 1 | 10 | 2 | 2 | 0 |
| jacob-nickman | 2 | 0 | 8 | **2** | **1** | 1 |
| todd-trozzo | 2 | 1 | 7 | 3 | 3 | 2 |
| david-murello | 1 | 2 | 14 | 6 | 6 | 3 |
| bj-funari | 1 | 2 | 13 | 3 | 3 | 1 |
| bob-keslar | 1 | 1 | 7 | 2 | 2 | 2 |
| josh-lavrinc | 1 | 1 | 6 | 2 | 2 | 1 |
| jeff-grace | 1 | 1 | 5 | 0 | 0 | 2 |
| jimmy-crisan | 1 | 0 | 2 | 0 | 0 | 0 |
| dan-reilly | 0 | 0 | 6 | 4 | 4 | 0 |
| jon-fetrow | 0 | 1 | 7 | 2 | 2 | 0 |
| ed-peters | 0 | 0 | 5 | 3 | 3 | 0 |
| sean-ritson | 0 | 2 | 4 | 0 | 0 | 0 |
| marcus-joe-ruby | 0 | 0 | 3 | 0 | 0 | 0 |
| braiden-snyder | 0 | 0 | 2 | 0 | 0 | 0 |
| mike-licciardi | 0 | 0 | 2 | 1 | 1 | 0 |
| josh-farber | 0 | 0 | 1 | 1 | 1 | 0 |
| craig-toth | 0 | 0 | 1 | 0 | 0 | 0 |
| joni-murello | 0 | 0 | 1 | 0 | 0 | 0 |
| tony-brooks | 0 | 0 | 1 | 1 | 1 | 0 |
| matt-brown / kevin-radkowski / ben-funari / charles-lavrinc / sam-lavrinc / nick-yankovich / dominic-nicastro / marcus-ruby / cavalier-nicastro | 0 | 0 | 0 | 0 | 0 | 0 |

Gold totals: CH 25 (21 from 2005–25 brackets + 4 pre-2005 flags, 2002 doubled),
RUN 21, 3RD 20, PLAY bracket-seasons, DIV rank-1 rows Year≥2013.

### Pre-2005 champions (only source: cleaned_maffl_revised.csv, Champ=1, Year≤2004)

| Year | Champion | owner_id |
|---|---|---|
| 2002 | **Josh Lavrinc** | josh-lavrinc |
| 2002 | **Mike Murello** | mike-murello |
| 2003 | Jeff Grace | jeff-grace |
| 2004 | Jimmy Crisan | jimmy-crisan |

⚠ **2002 has TWO champions** (Josh Lavrinc **and** Mike Murello), each a single
un-split row with Champ=1. **Flagged, not resolved** (see §3). Each pre-2005 champ is one
clean row — no split-row consolidation was needed.

---

## 2. Per-source comparison vs GOLD

Sources: **A** = `MAFFL_Owners_Sheet_revised.csv` (cols 5/6/7/8) · **B** =
`power-rankings.html` OWNERS_DATA (rings/runners/playoffApps/divTitles) · **C** =
`history.html` + `stats.html` OWNERS[] (champ/runner/third/playoff/div — **the two files
are byte-identical through the `div` field; C is one shared copy**) · **D** =
`Power_Rankings.csv` (Championships/Runner_Ups/Playoff_Apps/Division_Titles) · **E** =
`MAFFL_Placements_AllTime.csv` (Championships/Runner_Ups/Third_Place_Finishes).
`—` = owner absent from that source. ✗ marks a cell ≠ GOLD (delta shown).

### 2.1 CHAMPIONSHIPS  (GOLD includes pre-2005)

A, B, C, D all match GOLD for **every** owner (all four correctly carry the pre-2005
champs incl. Mike Murello's 2002 co-title → mike=2, josh-lavrinc=1, jeff=1, jimmy=1).

**Only E disagrees — E omits all pre-2005 titles** (E is derived from the 2005–2025
bracket only):

| owner_id | GOLD | E | delta |
|---|---|---|---|
| mike-murello | 2 | 1 ✗ | −1 (missing 2002) |
| josh-lavrinc | 1 | 0 ✗ | −1 (missing 2002) |
| jeff-grace | 1 | 0 ✗ | −1 (missing 2003) |
| jimmy-crisan | 1 | **— ✗** | −1 (owner absent from E; 2004 champ) |

All other owners: A=B=C=D=E=GOLD. **E mismatches: 4.**

### 2.2 RUNNER-UPS  (championship-game losses, 2005+)

A, B, C, E all match GOLD for every owner. **Only D disagrees:**

| owner_id | GOLD | D | delta |
|---|---|---|---|
| joe-reilly | 1 | 2 ✗ | +1 |
| bj-funari | 2 | 1 ✗ | −1 |
| bob-keslar | 1 | 0 ✗ | −1 |

(GOLD runner-ups confirmed from championship losers: joe 2025 only; bj 2006+2016; bob
2021. D's own narrative for Joe says "a 2025 Runner-Up finish" — singular — yet its
numeric field stores 2.) **D mismatches: 3.**

### 2.3 PLAYOFF APPEARANCES  (default = distinct Upper QF/SF/Champ seasons)

A, B, C all match GOLD for every owner. **Only D disagrees, and badly** (D's Playoff_Apps
appears stale / a different metric — it agrees with GOLD for some owners but not others):

| owner_id | GOLD | D | delta |
|---|---|---|---|
| bj-funari | 13 | 6 ✗ | −7 |
| chris-johnson | 10 | 4 ✗ | −6 |
| bob-keslar | 7 | 4 ✗ | −3 |
| jeff-grace | 5 | 2 ✗ | −3 |
| jimmy-crisan | 2 | 1 ✗ | −1 |
| joni-murello | 1 | 0 ✗ | −1 |
| mike-licciardi | 2 | 1 ✗ | −1 |
| sean-ritson | 4 | 3 ✗ | −1 |
| braiden-snyder | 2 | 3 ✗ | +1 |

**D mismatches: 9.** (E has no playoff column.)

### 2.4 DIVISION TITLES

Reported against the **default (all-tier, Year≥2013)**. **Critical convention finding:**
*all four* stored copies (A, B, C, D) record **jacob-nickman = 1**, which equals the
**upper-only** GOLD — none counts his 2025 Lower-tier title. The de-facto stored
convention is therefore **upper-tier only**. Under upper-only GOLD, the jacob row agrees
everywhere; the rows below are the *real* errors that persist under either definition.

| owner_id | GOLD (all-tier) | GOLD (upper) | A | B | C | D |
|---|---|---|---|---|---|---|
| tony-trozzo | 4 | 4 | 5 ✗ +1 | 5 ✗ +1 | 5 ✗ +1 | 5 ✗ +1 |
| mike-murello | 2 | 2 | 1 ✗ −1 | 1 ✗ −1 | 1 ✗ −1 | 1 ✗ −1 |
| josh-farber | 1 | 1 | 0 ✗ −1 | 0 ✗ −1 | 0 ✗ −1 | 0 ✗ −1 |
| tony-brooks | 1 | 1 | 1 ✓ | 2 ✗ +1 | 1 ✓ | 0 ✗ −1 |
| chris-johnson | 2 | 2 | 2 ✓ | 2 ✓ | 2 ✓ | 3 ✗ +1 |
| bj-funari | 3 | 3 | 3 ✓ | 3 ✓ | 3 ✓ | 4 ✗ +1 |
| bob-keslar | 2 | 2 | 2 ✓ | 2 ✓ | 2 ✓ | 3 ✗ +1 |
| josh-lavrinc | 2 | 2 | 2 ✓ | 2 ✓ | 2 ✓ | 0 ✗ −2 |
| jacob-nickman | **2** | **1** | 1 △ | 1 △ | 1 △ | 1 △ |

△ = matches upper-only GOLD (1) but not all-tier default (2). **Three division errors are
SYSTEMIC — present in every hand-stored copy (A,B,C,D):**

1. **tony-trozzo: stored 5, GOLD 4** (phantom +1). Verified rank-1 years ≥2013: 2017,
   2018, 2020, 2022 = 4. (His 2011/2012 titles are pre-2013 and excluded by "From 2013".)
2. **mike-murello: stored 1, GOLD 2** (missing 1). Verified rank-1 years ≥2013: 2016, 2021.
3. **josh-farber: stored 0, GOLD 1** (missing his only title). Farber won the AFC/Kunis
   division in his lone 2020 season — **no source records it.**

Mismatch counts (all-tier default, counting the jacob △ as a definitional diff):
**A = 4, B = 5, C = 4, D = 9.** Under the upper-only convention the stored copies actually
use, jacob drops out and the counts become **A = 3, B = 4, C = 3, D = 8.**

### 2.5 THIRD-PLACE FINISHES  (ThirdPlace winners; stored only in C and E)

**C and E both match GOLD for every owner — 0 mismatches.** (Spot: david 3, joe/tony/
todd/mike/bob/brian/jeff 2, josh-lavrinc/jacob/bj 1, all others 0.) A, B, D do not store
a third-place field.

---

## 3. DEFINITIONAL DECISIONS (flagged choices + count impact)

1. **Playoff-app definition (a): count ThirdPlace-only appearances?**
   *Default = NO (Upper QF/SF/Champ only).* **Count impact: ZERO.** Computed directly:
   there are **no ThirdPlace-only seasons** — every ThirdPlace participant is a
   Semifinal loser, so they already appear in that season's SF. Including ThirdPlace
   leaves every owner's count unchanged.

2. **Playoff-app definition (b): any Lower-tier bracket games to count?**
   **NONE EXIST.** All 163 bracket games (21 Champ + 42 SF + 80 QF + 20 3rd) are
   Upper-tier. No impact possible.

3. **Division titles — "From 2013" cutoff.** Default counts only Year≥2013, per the
   column name. Rank-1 rows DO exist 2005–2012 (e.g. tony-trozzo 2006/2011/2012,
   mike-murello 2006/2007/2011, david 2005/2006/2009, brian 2007/2009) and are excluded.
   Stored copies appear to honor this (jeff-grace & jimmy-crisan, whose only titles are
   pre-2013, are stored as 0 everywhere — consistent). **Confirm the 2013 cutoff is intended.**
   If instead "all years since 2005" were used, totals jump substantially (e.g.
   tony-trozzo 7, david 10, joe 8, mike 5, brian 7).

4. **Division titles — tier scope (upper-only vs all-tier).** Default = all-tier →
   jacob-nickman = 2. **But every stored copy uses upper-only = 1**, excluding his 2025
   Lower-tier title. **Count impact: exactly 1 owner (jacob-nickman), ±1.** Decision
   needed: if upper-only is canonical, GOLD for jacob is 1 and all sources agree; if
   all-tier is canonical, all four sources are −1 on jacob and should be corrected.

5. **Pre-2005 champion source.** 2002–2004 titles exist ONLY in
   `cleaned_maffl_revised.csv` (and the mirrored `csv-seasons` block in history.html).
   A/B/C/D include them (✓); **E (Placements) excludes them** → E is −1 for mike-murello,
   josh-lavrinc, jeff-grace and omits jimmy-crisan entirely. Decide whether Placements
   should be "all-time" (add pre-2005) or is intentionally 2005+ bracket-only.

6. **2002 double-champion (Josh Lavrinc + Mike Murello).** Both carry Champ=1 in 2002 in
   cleaned_maffl and history.html's csv-seasons; draft.html encodes it explicitly as
   `CHAMPS[2002] = [0,4]` (two owners). **Count impact: mike-murello CH = 2 (vs 1 if a
   single 2002 champ were chosen), josh-lavrinc CH = 1 (vs 0).** A, B, C, D all propagate
   the double title. **Flagged for resolution — not resolved here.** If the league later
   designates a single 2002 champion, one of these two CH totals drops by 1 across A/B/C/D
   (and the draft.html CHAMPS array).

---

## 4. Cross-checks of the champion list

- **draft.html `CHAMPS` array:** fully consistent with GOLD. Decoded against draft.html's
  `OWNERS[]` index array, every year matches the matchups/cleaned champion, **including
  `CHAMPS[2002] = [0,4]` = Mike Murello + Josh Lavrinc** (double champ) and the pre-2005
  trio. **No disagreement.**
- **history.html embedded `csv-seasons`:** 25 Champ=1 flags = 21 (2005–25) + 2002×2 +
  2003 + 2004, matching GOLD champion-for-champion. Mike Murello 2002, Josh Lavrinc 2002,
  Jeff Grace 2003, Jimmy Crisan 2004 all flagged. **No disagreement.**

---

## 5. Summary

### Mismatch count — owners affected, per source per accolade

| Accolade | A | B | C | D | E |
|---|---|---|---|---|---|
| Championships | 0 | 0 | 0 | 0 | **4** (pre-2005 omitted) |
| Runner-Ups | 0 | 0 | 0 | **3** | 0 |
| Playoff Apps | 0 | 0 | 0 | **9** | n/a |
| Division Titles (all-tier default) | 4 | 5 | 4 | **9** | n/a |
| Division Titles (upper-only) | 3 | 4 | 3 | **8** | n/a |
| Third Place | n/a | n/a | 0 | n/a | 0 |

### Headline findings

- **Source D (`Power_Rankings.csv`) is the most divergent and appears STALE** — it
  disagrees with GOLD on runner-ups (3), playoff apps (9), and division titles (8–9), and
  also disagrees with the *rendered* `power-rankings.html` (B), which is GOLD-accurate on
  runners and playoff apps. Regenerate `Power_Rankings.csv` from gold.
- **Three SYSTEMIC division-title errors in every hand-stored copy (A,B,C,D):**
  tony-trozzo **5→4** (overcount), mike-murello **1→2** (undercount), josh-farber
  **0→1** (missing his 2020 title). These are the highest-value corrections.
- **B vs A/C single division difference:** tony-brooks — B stores 2 (✗, GOLD 1); A and C
  store 1 (✓).
- **Championships, runner-ups, playoff apps, and third-place are clean in A/B/C** (the
  three user-facing HTML/sheet copies), apart from the systemic division issues.
- **E (`Placements`) is 2005+ bracket-only** — correct for what it covers but understates
  career championships for the 4 pre-2005 champions; third-place and runner-ups are exact.

### UNMAPPED owner names: **NONE** (all sources resolved to the 34 registry owner_ids).

### cleaned_maffl split-row note (for later cleanup)

`cleaned_maffl_revised.csv` contains **15 split owner-year pairs** (two rows for one
owner-season, the `Season=1/0` quirk — e.g. Brian/Ron 2007/2014/2017/2019, David 2018/
2019/2024, Joe 2014/2015, Josh Lavrinc 2018/2019, Sean 2008, etc.). **For the accolades
sourced from this file (pre-2005 championships) the split rows do NOT inflate totals:**
no owner-year carries Champ=1 (or Runner=1) on both halves; file totals are Champ=25 /
Runner=21, exactly matching GOLD. **Caution for future aggregation:** any naive
SUM over rows of the per-row Division / Playoff flags in this file *would* double-count the
15 split seasons — division and playoff accolades must be taken from
`MAFFL_Division_History_2005_2025.csv` and `MAFFL_Matchups_NoConsolation.csv` (as GOLD
does here), never summed from cleaned_maffl rows.

---

*READ-ONLY audit. No `.html`, `.js`, or `.csv` file was modified. This document is the
only file created.*
