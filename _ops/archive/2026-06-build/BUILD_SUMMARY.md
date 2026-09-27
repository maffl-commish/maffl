# BUILD_SUMMARY.md — MAFFL HQ build pipeline

**Branch:** `build/pipeline` · **Status:** complete through Step 6 + post-review source fixes ·
**Merge gate:** this document. Nothing has been merged or pushed. Every page change is committed
incrementally on the branch and is reproducible by re-running the generators.

**Post-review changes (after commissioner sign-off on the foundation):**
- draft.html 2007 fix **visually confirmed** by the commissioner (2007 shows `—`, non-2007 unchanged).
- The 3 Credit_Log double-space typos were fixed **at the source** in `Credit_Log.csv`, and the
  generator's auto-collapse of free-text whitespace was **removed** (source is where data is
  fixed; the generator no longer silently cleans). Re-verified: validate 8/8 + credits ROUND-TRIP
  EXACT with the collapse rule gone.
- prize.html 2025 payouts: confirmed **left as verified literals**; regenerate the full
  `prize_events` array in one pass once the pre-2025 history CSV exists (June).

---

## 1. What this is

A small, deterministic build pipeline that generates the embedded data blocks of the HQ pages
**from the `./data` CSVs**, so future data changes flow through one source of truth instead of
hand-editing HTML. Each page is **round-trip-proven**: regenerating from the current CSVs
reproduces the committed page byte-for-byte (the sole intended exception is the 2007 draft-price
fix, decision #1).

**Pipeline language:** Windows PowerShell 5.1. This machine has no Node and no real Python (only
the non-functional Microsoft Store `python.exe` stub), so PowerShell — with native `Import-Csv`
(handles quoted multi-line fields) and regex injection — was the only viable choice. All scripts
live in `build/` and are ASCII-only (PS 5.1 reads `.ps1` as ANSI).

### How to run
```
powershell -ExecutionPolicy Bypass -File build\build.ps1          # validate + prove round-trip (writes nothing)
powershell -ExecutionPolicy Bypass -File build\build.ps1 -Write    # validate, then inject any changed page
powershell -ExecutionPolicy Bypass -File build\validate.ps1        # just the 8 gates
```
`build.ps1` runs `validate()` first and **aborts before writing if any gate fails**
(validate-before-write). Latest run: **validate 8/8; all 5 generated pages round-trip clean.**

---

## 2. Per-page status

| Page | Action | Proof | Commit |
|---|---|---|---|
| **stats.html** | `OWNERS[]` regenerated from Owners Sheet | ROUND-TRIP EXACT (byte-identical) | Step 2 |
| **history.html** | 3 `<script type="text/csv">` blocks regenerated | ROUND-TRIP EXACT (all 3) | Step 3 |
| **draft.html** | `OWNERS`/`CHAMPS`/`PICKS` + 2007 fix | OWNERS/CHAMPS exact; PICKS = 256 intended `0→null`, zero other drift; idempotent | Step 4 |
| **credits.html** | balances `<tbody>` ×2 + `REGISTRY_DATA` | ROUND-TRIP EXACT | Step 5 |
| **prize.html** | `dues_2026` generated; 2025 payouts verified | `dues_2026` exact; payouts reconcile to packet+pool | Step 6 |
| power-rankings.html | **SKIPPED** — no source CSV yet | — | — |
| rules.html | **SKIPPED** — fully manual (decision #3) | — | — |
| weekly.html + standalone | **SKIPPED** — separate in-season task | — | — |

Generators are check-only by default and refuse to write on unexpected drift.

---

## 3. Commissioner decisions — how each was applied

1. **2007 blank draft prices → `null`, render `—`.** Done. The 256 2007 picks (all blanks live in
   2007; none elsewhere) now serialize `null` instead of `0`. A line-level classifier proves the
   PICKS array changed **only** in those 256 rows (`,0]`→`,null]`) and nowhere else; OWNERS and
   CHAMPS are byte-identical. Render: `fmtPrice(null)→"—"`, new `fmtDollar()` emits `—` (no `$`)
   for null; **all 13 price-display sites** routed through it so 2007 shows `—` consistently
   (table, $1-heroes, most-drafted range, missed-steals, year-by-year, player-profile peak/low/chart).
   Aggregates (avg/sum/yTotal) are deliberately **unchanged** — in JS `null` coerces to `0`
   exactly as the old literal `0` did, so every computed analytic is identical. Net: only 2007
   `$0`→`—`; everything else round-trips identically, as instructed.
2. **Pre-2025 prize history left as literals.** Done — see §4 for an important wrinkle.
3. **rules.html fully manual.** Skipped entirely; no rule values generated, no prose touched.
4. **credits.html from Credit_Log.csv.** Done. `<tbody>` markers confirmed by inspection (anchored
   on the unique `Upper-Tier`/`Lower-Tier` `<h3>` headings). Owners Sheet credit-balance column is
   now a generated mirror of the Credit_Log sums.

---

## 4. Items for the record (all resolved)

**(a) prize.html — 2025 payouts interleaved with pre-2025 history. → RESOLVED (leave as literals).**
The "computed payouts" (2025) live **inside the same `prize_events` array** as the 2013–2024
history. Per your direction they're **left as verified literals**: `dues_2026` is generated and
round-trips; the 2025 payouts are **verified** — Upper pool = **$1,407 (formula-exact)**, per-owner
totals reconcile to the packet, Lower = **$695** / total **$2,102** (whitelisted $2 weekly
rounding, matching `meta.note_2025_lower`). When the pre-2025 history CSV exists (June), regenerate
the full `prize_events` array (incl. 2025) in one pass.

**(b) Credit_Log.csv sentinel + template rows (filtered).**
Of 435 parsed rows, only **56 carry real data** (season-2025 "Earn", summing to **197** = the
league-wide balance total). The rest: **69 sentinel rows** ("Keep this line to avoid null
values…", incl. placeholder owners *Vincent Cavalier* / *Christian Cavalier*, amount 0) and **310
empty template rows** (blank season, no owner). All are filtered. They net to zero and don't
affect balances — flagging so you know they're intentionally ignored, not lost.

**(c) Credit_Log.csv double-space typos. → RESOLVED (fixed at source).**
`"Mike Vick's  Dog Sitting"` (5 cells: 2 data rows + 3 sentinels) and `"Jonathan Taylor  (47.6)"`
(2 data rows) were collapsed to single spaces **in `Credit_Log.csv` itself**. The generator's
auto-collapse rule was **removed** — fixing data belongs at the source, not silently in the build.
credits.html still ROUND-TRIPS EXACT with the rule gone.

**(d) draft.html browser verification. → RESOLVED (confirmed by commissioner).**
This machine has no JS runtime/static server, so I proved the 2007 fix by the data round-trip
classifier (256 changes, zero drift) + exhaustive static review of every price-display path and JS
null-coercion semantics. You then **visually confirmed**: 2007 shows `—`, non-2007 unchanged.

---

## 5. Validation gates (`validate.ps1`) — 8/8 PASS

1. Championship flags == 25 (2002 co-champ counts as 2). 2. Recomputed W/L/T == published (32/32).
3. Win% == W/(W+L+T). 4. Credit balances == approved Credit_Log sums. 5. Prize pool 67/33 = $2,100
(21 teams). 6. Zero Kickers drafted 2025+. 7. All owner names across 4 files resolve to canonical.
8. Power ranks unique 1..32; rated owners exist.

**Whitelist honored:** 2002 co-championship (25 correct), 2002–04 blank W/L/T, 2007 blank prices,
`Michael Murello`→`Mike Murello`, co-owner pairs as single units, packet "2026 League" mislabel,
and the **$2 Lower-Tier weekly rounding**.

---

## 6. Notes on canonicalization (worth knowing)

Owner names differ across files; the library's `Normalize-Owner` resolves co-owner pairs to the
canonical **`Name A / Name B`** (spaced slash) used by stats/draft/credits. **prize.html is the
exception** — it uses the raw **`Name A/Name B`** (no spaces), so the prize generator reproduces
that form instead. This is intentional and matches the live pages.

---

## 7. Files

**New (pipeline):** `build/maffl-lib.ps1`, `build/validate.ps1`, `build/build.ps1`,
`build/gen-stats.ps1`, `build/gen-history.ps1`, `build/gen-draft.ps1`, `build/gen-credits.ps1`,
`build/gen-prize.ps1`.
**Page content changed:** `draft.html` only (the 2007 fix). stats/history/credits/prize are
byte-identical to before (generators confirm round-trip; no content change written).
**Source data changed:** `data/Credit_Log.csv` — 3 double-space typos collapsed at source (§4c).

---

## 8. Not done / future

- **power-rankings.html** — needs a `Power_Rankings_2026.csv` source before it can be generated.
- **prize.html pre-2025 history** — awaiting the June history CSV; regenerate the full
  `prize_events` array (incl. 2025) once it exists (see §4a).
- **weekly.html** — in-season ESPN-results ingestion, separate task.
