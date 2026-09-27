# AUDIT — Career Records Reconciliation

**Type:** READ-ONLY audit. No `.html`, `.js`, or `.csv` was modified. This file is the
only artifact created.
**Date:** 2026-06-14
**Gold source:** `data/MAFFL_Matchups_NoConsolation.csv` (2,226 Regular + 163 playoff
rows; consolation already excluded). Owner identity joined via
`data/MAFFL_Owner_Registry.csv` (exact alias match after trim — the `*_ESPN` columns
were ignored as instructed).

---

## STEP 0 — Tie representation (finding)

**Ties ARE cleanly derivable from the matchup file.** A tie is stored as a normal
Winner/Loser row whose `Winner_Score == Loser_Score`. There is **no** special
`Game_Type` and ties are **not** absent.

There are exactly **6 such rows, all `Is_Playoffs=False` (Regular season)** — **0
playoff ties**:

| Year | Week | Winner_Owner (clean) | Loser_Owner (clean) | Score |
|------|------|----------------------|---------------------|-------|
| 2006 | 11 | Brian Murello/ Ron Murello | Josh Lavrinc | 82.0–82.0 |
| 2010 | 7 | Chris Johnson | Matt Brown | 87.0–87.0 |
| 2010 | 9 | Joni Murello | Sean Ritson | 105.5–105.5 |
| 2011 | 3 | Marcus Ruby / Joe Ruby | Mike Murello | 88.5–88.5 |
| 2011 | 7 | Tony Trozzo | Marcus Ruby / Joe Ruby | 82.5–82.5 |
| 2012 | 9 | Brian Murello/ Ron Murello | Matt Brown | 94.0–94.0 |

Per-owner tie counts derived this way: **Brian/Ron = 2, Mike Murello = 1** (matches the
expected values stated in the task), plus Matt Brown = 2, Marcus/Joe Ruby = 2, Josh
Lavrinc = 1, Chris Johnson = 1, Joni Murello = 1, Sean Ritson = 1, Tony Trozzo = 1.

**Method note:** For each row, if `Winner_Score == Loser_Score` it was counted as a TIE
for BOTH owner_ids (and excluded from W/L); otherwise a Win for `Winner_Owner` and a
Loss for `Loser_Owner`. **Tie numbers in this report are computed directly from the
matchup gold — `cleaned_maffl_revised.csv` was NOT needed.**

---

## STEP 1 — GOLD per owner_id

All 34 owner_ids in the registry mapped successfully. **UNMAPPED list: (none).** Every
`Winner_Owner` / `Loser_Owner` value resolved to exactly one owner_id via the alias
list. (The known `Marcus Ruby` collision lives only in the `*_ESPN` columns, which were
ignored; in the clean columns, bare `Marcus Ruby` → `marcus-ruby` and the slash forms →
`marcus-joe-ruby`, with no overlap.)

Sanity checks: regular decisive games = 2,226 − 6 ties = 2,220 → Σreg_W = Σreg_L =
2,220 ✓. Playoff games = 163, 0 ties → Σpo_W = Σpo_L = 163 ✓.

---

## STEP 3 — Per-owner reconciliation

GOLD = computed from matchup gold. **hist/stats** = `history.html` OWNERS[] (verified
**byte-for-byte identical** to `stats.html` OWNERS[] — see assertion below).
**OwnersSheet** = `data/MAFFL_Owners_Sheet_revised.csv`. Cells that disagree with GOLD
are marked ✗ with the delta.

Ordered by GOLD regular-season wins (desc).

| owner_id | GOLD reg W-L-T | hist/stats W-L-T | OwnersSheet W-L-T | GOLD po W-L | hist/stats pW-pL | Match vs GOLD |
|----------|----------------|------------------|-------------------|-------------|------------------|---------------|
| brian-ron-murello | 163-113-2 | 163-113-2 | **164-112-2** | 17-14 | 17-14 | hist ✓ · OS ✗ +1W/−1L |
| joe-reilly | 152-126-0 | 152-126-0 | **151-127-0** | 14-9 | 14-9 | hist ✓ · OS ✗ −1W/+1L |
| david-murello | 151-127-0 | 151-127-0 | 151-127-0 | 15-14 | 15-14 | ✓ all |
| tony-trozzo | 148-127-1 | 148-127-1 | **147-128-1** | 15-8 | 15-8 | hist ✓ · OS ✗ −1W/+1L |
| bj-funari | 146-119-0 | 146-119-0 | 146-119-0 | 11-14 | 11-14 | ✓ all |
| mike-murello | 145-131-1 | 145-131-1 | **144-132-1** | 12-11 | 12-11 | hist ✓ · OS ✗ −1W/+1L |
| jacob-nickman | 131-146-0 | 131-146-0 | **132-145-0** | 9-7 | 9-7 | hist ✓ · OS ✗ +1W/−1L |
| jon-rick | 131-134-0 | 131-134-0 | 131-134-0 | 13-8 | 13-8 | ✓ all |
| todd-trozzo | 131-147-0 | 131-147-0 | 131-147-0 | 12-6 | 12-6 | ✓ all |
| chris-johnson | 118-159-1 | 118-159-1 | 118-159-1 | 12-12 | 12-12 | ✓ all |
| josh-lavrinc | 104-117-1 | 104-117-1 | 104-117-1 | 5-7 | 5-7 | ✓ all |
| dan-reilly | 96-78-0 | 96-78-0 | **97-77-0** | 2-8 | 2-8 | hist ✓ · OS ✗ +1W/−1L |
| bob-keslar | 84-77-0 | 84-77-0 | 84-77-0 | 11-8 | 11-8 | ✓ all |
| ed-peters | 76-98-0 | 76-98-0 | 76-98-0 | 1-6 | 1-6 | ✓ all |
| jon-fetrow | 72-89-0 | 72-89-0 | 72-89-0 | 3-7 | 3-7 | ✓ all |
| sean-ritson | 52-38-1 | 52-38-1 | 52-38-1 | 4-4 | 4-4 | ✓ all |
| jeff-grace | 40-25-0 | 40-25-0 | 40-25-0 | 6-6 | 6-6 | ✓ all |
| braiden-snyder | 31-25-0 | 31-25-0 | 31-25-0 | 0-2 | 0-2 | ✓ all |
| tony-brooks | 31-37-0 | 31-37-0 | 31-37-0 | 0-1 | 0-1 | ✓ all |
| jimmy-crisan | 31-47-0 | 31-47-0 | **42-75-0** | 0-2 | 0-2 | hist ✓ · OS ✗ +11W/+28L |
| marcus-joe-ruby | 29-34-2 | 29-34-2 | **40-49-2** | 1-4 | 1-4 | hist ✓ · OS ✗ +11W/+15L |
| mike-licciardi | 29-49-0 | 29-49-0 | 29-49-0 | 0-2 | 0-2 | ✓ all |
| craig-toth | 23-29-0 | 23-29-0 | 23-29-0 | 0-1 | 0-1 | ✓ all |
| matt-brown | 23-27-2 | 23-27-2 | 23-27-2 | 0-0 | 0-0 | ✓ all |
| joni-murello | 20-31-1 | 20-31-1 | 20-31-1 | 0-1 | 0-1 | ✓ all |
| cavalier-nicastro | 11-28-0 | 11-28-0 | **(absent)** | 0-0 | 0-0 | hist ✓ · OS ✗ no row |
| marcus-ruby | 11-15-0 | 11-15-0 | **(absent)** | 0-0 | 0-0 | hist ✓ · OS ✗ no row |
| josh-farber | 9-4-0 | 9-4-0 | 9-4-0 | 0-1 | 0-1 | ✓ all |
| kevin-radkowski | 7-6-0 | 7-6-0 | 7-6-0 | 0-0 | 0-0 | ✓ all |
| ben-funari | 6-6-0 | 6-6-0 | 6-6-0 | 0-0 | 0-0 | ✓ all |
| charles-lavrinc | 5-7-0 | 5-7-0 | 5-7-0 | 0-0 | 0-0 | ✓ all |
| sam-lavrinc | 5-8-0 | 5-8-0 | 5-8-0 | 0-0 | 0-0 | ✓ all |
| nick-yankovich | 5-8-0 | 5-8-0 | 5-8-0 | 0-0 | 0-0 | ✓ all |
| dominic-nicastro | 4-8-0 | 4-8-0 | 4-8-0 | 0-0 | 0-0 | ✓ all |

**Assertion A == B:** `history.html` OWNERS[] and `stats.html` OWNERS[] are
**byte-for-byte identical** across all 34 rows (`diff` of the two arrays returns no
differences). No per-owner divergence to flag.

**Key takeaways from the table:**
- **`history.html` / `stats.html` agree with GOLD on every single owner** — all 34 rows,
  W-L-T *and* playoff pW-pL. These two pages are the trustworthy copies.
- **`MAFFL_Owners_Sheet_revised.csv` is the source of the disagreement** flagged in the
  task brief (Brian/Ron 164-112 vs GOLD 163-113; Mike 144-132 vs GOLD 145-131).

---

## Win % reconciliation

**GOLD win% definition used:** `reg_W / (reg_W + reg_L + reg_T)` — **regular-season
only, with ties in the denominator** (ties not counted as half-wins). This is the
convention the stored values use, confirmed against a tie-owner (Sean Ritson 52-38-1 →
52/91 = 57.1% → 57%, matching both stored sources). Apples-to-apples.

Sources compared: `power-rankings.html` OWNERS_DATA[] `winPct` (in-page array, 34 owners)
and `data/Power_Rankings.csv` `Win_Pct` (32 owners — `marcus-ruby` and
`cavalier-nicastro` have no row). Flag threshold: **|stored − GOLD%| > 1.0 pp**.

### OWNERS_DATA.winPct vs GOLD — **1 mismatch**

| owner_id | GOLD% (reg) | OWNERS_DATA.winPct | Δ |
|----------|-------------|--------------------|---|
| jimmy-crisan | 39.74 | 36 | **−3.74 pp ✗** |

All other 33 owners are within ±1.0 pp (rounding-level). OWNERS_DATA.winPct is otherwise
consistent with GOLD.

### Power_Rankings.csv Win_Pct vs GOLD — **9 mismatches** (+ 2 owners absent)

| owner_id | GOLD% (reg) | Power_Rankings Win_Pct | Δ |
|----------|-------------|------------------------|---|
| joni-murello | 38.46 | 48% | **+9.54 pp ✗** |
| mike-licciardi | 37.18 | 44% | **+6.82 pp ✗** |
| jacob-nickman | 47.29 | 43% | **−4.29 pp ✗** |
| matt-brown | 44.23 | 40% | **−4.23 pp ✗** |
| jimmy-crisan | 39.74 | 36% | **−3.74 pp ✗** |
| bj-funari | 55.09 | 58% | **+2.91 pp ✗** |
| craig-toth | 44.23 | 47% | **+2.77 pp ✗** |
| josh-lavrinc | 46.85 | 49% | **+2.15 pp ✗** |
| marcus-joe-ruby | 44.62 | 46% | **+1.38 pp ✗** |

Absent from `Power_Rankings.csv` (no Win_Pct to compare): `marcus-ruby` (GOLD 42.31%),
`cavalier-nicastro` (GOLD 28.21%).

**Note:** OWNERS_DATA.winPct and Power_Rankings.csv Win_Pct **disagree with each other**
for 8 owners (jacob-nickman 48 vs 43, bj-funari 55 vs 58, josh-lavrinc 47 vs 49,
mike-licciardi 37 vs 44, craig-toth 44 vs 47, joni-murello 38 vs 48, matt-brown 44 vs
40, marcus-joe-ruby 44 vs 46). The in-page OWNERS_DATA array is the closer of the two to
GOLD.

---

## SUMMARY

### Records (W-L-T and playoff)
- **history.html / stats.html: 0 owners mismatch GOLD** (all 34 ✓), and the two are
  byte-for-byte identical to each other. These pages are correct.
- **MAFFL_Owners_Sheet_revised.csv: 8 owners mismatch GOLD on regular-season record,
  plus 2 owners missing entirely.**
  - Six **±1-win** offsets (a small set of individual games miscredited):
    `joe-reilly` (−1W/+1L), `brian-ron-murello` (+1W/−1L), `tony-trozzo` (−1W/+1L),
    `mike-murello` (−1W/+1L), `jacob-nickman` (+1W/−1L), `dan-reilly` (+1W/−1L).
  - Two **large** offsets:
    `jimmy-crisan` (OS 42-75 vs GOLD 31-47 → +11W/+28L) and
    `marcus-joe-ruby` (OS 40-49-2 vs GOLD 29-34-2 → +11W/+15L). The marcus-joe-ruby
    inflation (+11W/+15L) exactly equals `marcus-ruby`'s GOLD record (11-15) — strong
    evidence the OwnersSheet **folded the separate `marcus-ruby` franchise into
    `marcus-joe-ruby`**, which also explains why `marcus-ruby` has no OwnersSheet row.
  - Two **missing rows**: `cavalier-nicastro` and `marcus-ruby` are absent from the
    OwnersSheet.
- The task's specific examples are confirmed: GOLD says **Brian/Ron 163-113-2** and
  **Mike 145-131-1** — i.e., `history.html`/`stats.html` are right and the OwnersSheet
  (164-112-2 / 144-132-1) is wrong.

### Win %
- **OWNERS_DATA.winPct vs GOLD:** 1 mismatch >1pp (`jimmy-crisan`).
- **Power_Rankings.csv Win_Pct vs GOLD:** 9 mismatches >1pp, plus 2 owners with no row.
- The two win% sources also disagree with each other for 8 owners.

### UNMAPPED list
**(none)** — all Winner/Loser names mapped to a single owner_id via the registry.

### Tie-method note (Step 0)
Ties taken **directly from the matchup gold** (`Winner_Score == Loser_Score`): 6 rows,
all regular-season, 0 playoff ties. `cleaned_maffl_revised.csv` was not required.

### Minor / out-of-scope observation (not part of the numeric reconciliation)
`Power_Rankings.csv` narrative prose for BJ Funari cites "115 wins and a 58% career win
rate," which is internally inconsistent with both GOLD (146-119, 55%) and the same file's
own structured `Win_Pct` semantics. Prose only — flagged for awareness, not counted as a
data mismatch above.
