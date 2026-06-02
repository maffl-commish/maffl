# BUILD_NOTES.md — Step 0 inspection (no code written yet)

Branch: `build/pipeline`. This is the "inspect, don't assume" output. It records, for every
HTML page, the **exact** in-file marker where the embedded data block starts and ends, and for
every `./data/` CSV, the exact column names/order. Nothing has been generated or edited yet.

Line numbers are from the current working tree and are for orientation; the build will anchor on
the **string markers**, not line numbers.

---

## 1. Embedded data blocks per HTML page (injection targets)

| Page | Variable / marker | Start marker | End marker | Shape | Notes |
|---|---|---|---|---|---|
| `stats.html` | `OWNERS` | `const OWNERS = [` (L532) | `];` (L565) | Array of 32 objects | One object per owner/co-owner unit. Keys: `name, active, years, champ, runner, playoff, div, wins, losses, ties, ovr, clutch, grind, heat`. `winPct` is computed in-page. **SIMPLEST PAGE — do first.** |
| `power-rankings.html` | `OWNERS_DATA` | `const OWNERS_DATA = [` (L812) | `];` (L1602) | Array of owner-card objects | **Authored** ratings + scout-note prose. No upstream CSV source exists yet (see §3). |
| `prize.html` | `MAFFL` | `const MAFFL = {` (L822) | `};` (L1169) | Single object | Holds dues/status + payouts + pre-2025 all-time history. Mixed sourced/un-sourced (see §3). |
| `draft.html` | `OWNERS`, `CHAMPS`, `PICKS` | `const OWNERS=[` (L2091, one line); `const CHAMPS={` (L2092, one line); `const PICKS=[` (L2093) | `];` for PICKS (L7949) | 3 consts | `OWNERS` = 32-name index array (order ≠ stats.html order). `CHAMPS` = `{year: ownerIndex}` with `2002:[0,4]` co-champ array. `PICKS` = 5,855 rows. Schema decoded in §4. |
| `credits.html` | balance tables + `REGISTRY_DATA` | balances: `<div class="dues-tiers">` (L883) Upper/Lower `<tbody>`; registry: `const REGISTRY_DATA = [` (L1018) | balances: `</div>` closing `.dues-tiers`; registry: `];` (L1075) | HTML `<tbody>` rows **+** JS array | ⚠️ Balances are **hand-coded HTML table rows** (`<tr><td><a…>Name</a></td><td>27</td></tr>`), NOT a JS array. Two tables: Upper-Tier, Lower-Tier. `REGISTRY_DATA` is the transaction list. Both should derive from `Credit_Log.csv`. |
| `history.html` | 3× `<script type="text/csv">` | `<script type="text/csv" id="csv-seasons">` (L891); `id="csv-divisions"` (L1274); `id="csv-drafts"` (L1613) | matching `</script>` (L1273 / L1612 / L7469) | Raw CSV text embedded in `<script>` tags | These are verbatim copies of `cleaned_maffl_revised.csv`, `MAFFL_Division_History_2005_2025.csv`, and `MAFFL_Draft_History_Clean_v3.csv`. Cleanest possible regen target. ⚠️ ghost-row normalization caveat (§3). |
| `rules.html` | (no single block) | `NEWS_FEED` (L1682), `COMING_SOON` (L1695) are **chrome**, not rules data | — | Prose markup | Rule values (times/fees/percentages) are embedded in HTML prose, no clean data array. **Needs decision #7** — which values become structured/generated vs. stay manual prose. |
| `weekly.html` | `IS_OFFSEASON`, `WEEKS` | `const IS_OFFSEASON = false;` (L930); `const WEEKS = [` (L932) | `];` (L1007) | bool + array | In-season Weekly Pulse. Source is "pasted ESPN results" — not yet defined. Leave offseason behavior alone per the prompt. |
| `MAFFL_HQ_Weekly_Week01_2026.html` (standalone) | `pulseData`, `pulseArchive` | `const pulseData = {` (L760); `const pulseArchive = [` (L838) | `};` (L833) for pulseData | object + array | Self-contained Gmail attachment. Same data domain as weekly.html. Out of scope for now per prompt. |
| `index.html` | — | no embedded league-data block found | — | — | Landing page; "24 Seasons" count is the only data-ish literal (site chrome, category H). |

---

## 2. CSV columns (exact names + order) in `./data/`

**`MAFFL_Owners_Sheet_revised.csv`** (34 raw lines / 32 owner units — co-owner names span 2
physical lines via embedded newlines in quoted fields):
```
Owners, Email, Active?, Total Years (From 2002), Total Championships (From 2002),
Total Runner-Ups (From 2005), Total Playoff Appearances (From 2005),
Division Titles (From 2013), Total Regular Season Wins (From 2005),
Total Regular Season Loss (From 2005), Total Regular Season Tie (From 2005),
Career Win % (From 2005), 2026 Power Ranking, 💯 OVR, 🧊 Clutch, 🚜 Grind, 🔥 Heat,
Current Credit Balance, 2025 League, 2026 League
```

**`cleaned_maffl_revised.csv`** (381 data rows; 15 ghost rows where `Season=0`):
```
Owner, YEAR, TEAM, W, L, T, Season, Champ, Runner, Division, Playoff,
Lower-Tier 1st, Lower-Tier Runner Up, Promotion Showdown Winner
```
(W/L/T stored as floats e.g. `7.0`. 2002–2004 W/L/T blank by design.)

**`MAFFL_Division_History_2005_2025.csv`**:
```
Year, Tier, Conference, Division, Division_Rank, Team, Owner, W, L, T
```
(uses `Michael Murello` → normalizes to `Mike Murello`.)

**`MAFFL_Draft_History_Clean_v3.csv`** (5,855 data rows):
```
Year, Owner, Player_Raw, Player, Position_Actual, Draft_Slot, NFL_Team, Price
```
(`Price` is float `15.0`; 2007 prices blank by design. `Player_Raw` and `Draft_Slot` are NOT
carried into draft.html `PICKS[]`.)

**`Credit_Log.csv`** (448 data rows — **file now EXISTS**, contrary to the prompt's "may not
exist yet"):
```
Season, Owner, Team, Credit Category, Credit Type, Credit +/-, Approved?, Notes
```

**`MAFFL League Packet - 2025 Prizes.csv`** (header row is data-shaped):
```
2025, League, Weekly High Scores, 1st / 2nd / Showdown, Division, TOTAL 2025 Prize, (blank),
2026 League Dues, 2026 DRAFT DAY DUES, 2026 Pay Status
```
(dollar values are quoted strings with spaces/parens, e.g. `" $ 386 "`, `" $ (286)"`.)

**`MAFFL League Packet - Credit Overview.csv`**: section-titled (`Earning Credits` … then header
`League, Outcome Category, Finishing Position / Method, Credits Awarded, Notes`). Credit menu —
maps to rules/credits prose.

**`MAFFL League Packet - Division History.csv`** (the "2026 alignment" file with the **mislabel**):
```
(blank), (blank), 2026, ... ; row 2: Owner, 2025, 2025-2026 Offseason Credit Snapshot,
2026 League, 2026 Division, 2026-2027 ..., 2027 League, 2027 Division, 2028 ... 2037
```
⚠️ Standing Exception #6: its `2026 League` column actually holds **2025** data. Resolve real
2026 tier by the `2026 Division` letter (A–D = Upper, N/A = Lower), NOT that column.

**`MAFFL_Rules_revised.csv`**: `MAFFL Rules, Unnamed: 1, 8/17/25, Unnamed: 3` — rulebook prose in
a loose 4-column layout.

**`2025 MAFFL League Status - Sheet1.csv`**: `Owners, Current Credit Balance, 2025 League,
2026 League` — point-in-time snapshot; use only when explicitly asked.

---

## 3. Sources that DON'T exist yet / can't be fully generated

- **Power rankings source** — no `Power_Rankings_2026.csv`. `OWNERS_DATA` in power-rankings.html
  is the only home of the authored ratings + scout notes. Per the prompt: flag that the source
  file still needs creating, and **skip** generating this page until it exists. (Decision #6.)
- **Pre-2025 prize history** (2013–2024 + the `$19,062 all-time` total) lives only inside
  prize.html — no CSV. Stays manual / flagged un-sourced until decision #3.
- **Rules prose** — mostly un-structured markup. Needs decision #7 (which values to generate).
- **Weekly source** — "pasted ESPN results", undefined. Out of scope per prompt (separate task).
- **`Credit_Log.csv` DOES now exist** (448 rows) — so credits.html IS buildable. This updates the
  prompt's assumption; I'll generate credits rather than skip it. The Owners Sheet
  `Current Credit Balance` column becomes a generated mirror.

---

## 4. draft.html `PICKS[]` schema (decoded — needed before generating draft.html)

Field index constants (draft.html L7952):
```
F_Y=0 year | F_O=1 ownerIndex | F_P=2 player | F_PS=3 position | F_T=4 nflTeam | F_PR=5 price | F_C=6 champFlag
```
Example row: `[2005,0,"Carson Palmer","QB","CIN",15,0]`

Generation mapping from `MAFFL_Draft_History_Clean_v3.csv`:
- `F_Y` ← `Year`
- `F_O` ← index of normalized `Owner` in draft.html's `OWNERS` array (its own order, 0 = Mike Murello)
- `F_P` ← `Player` (the cleaned name, not `Player_Raw`)
- `F_PS` ← `Position_Actual`
- `F_T` ← `NFL_Team`
- `F_PR` ← `Price` with `.0` stripped to int. ⚠️ **Blank price (2007) currently serializes to `0`,
  not null.** The page has no special blank handling — `$0` is shown. For round-trip fidelity I
  must reproduce `0`, but flagging that `0` here is a sentinel for "blank/unknown", conflating
  with a genuine $0 pick. (Confirm desired behavior before generating.)
- `F_C` ← **derived**: `1` if this pick's owner was that year's champion (`CHAMPS[year]`), else `0`.
  Used only for the 🏆 trophy display. Draft data starts 2005, so the 2002 co-champ array never
  applies here.
- `Player_Raw` and `Draft_Slot` columns are **dropped** (not present in PICKS).

`CHAMPS` and `OWNERS` (the index array) are one-liners — trivial to regenerate, but `CHAMPS`
encodes the **2002 co-champ as `[0,4]`** (array of two indices) which the validator must honor.

---

## 5. Validation gates (from CHANGE_INVENTORY.md §1 + the Standing Exceptions) — to implement in `validate()`

1. Total championship flags == **25** (2002 co-champ counts as 2; do NOT flag).
2. Each owner's recomputed W/L/T (from `cleaned_maffl_revised.csv`, ghost rows folded in) == published value.
3. Win % == W/(W+L+T) to rounding.
4. Each credit balance == sum of that owner's `Credit_Log.csv` rows.
5. Prize payouts sum to the computed pool (`$100 × teams`, 67/33 split, placement %s).
6. Draft pick count per team matches era roster size; **zero Kickers drafted 2025+**.
7. Every owner name in every file resolves to a canonical name.
8. Power-ranking ranks unique 1..N; every rated owner exists.

**Whitelisted (must NOT fail the build):** 2002 co-championship (25 is correct); 2002–2004 blank
W/L/T; 2007 blank draft prices; `Michael Murello` alias; co-owner pairs as single units; the
credit-packet "2026 League" mislabel; the $2 Lower-Tier weekly rounding.

---

## 6. Open items where I will STOP and ASK before generating (ask-don't-guess)

- **credits.html balances** are HTML `<tbody>` rows, not a JS array — I'll confirm the exact
  `<tbody>` boundary markers (and how co-owner pairs / tier grouping are derived) before injecting.
- **`F_PR` blank→0 sentinel** behavior for 2007 (confirm reproduce-as-0 is intended).
- **rules.html** — which values are structured/generated vs. prose/manual (decision #7).
- **prize.html** — confirm pre-2025 history stays as literal/un-sourced (decision #3).
- **Owner-name canonical format** — spec says `Name A / Name B` (slash + spaces both sides);
  six variants exist across files. Confirmed canonical before writing `normalize_owner`.

---

## Proposed build order (simplest → hardest), matching the prompt

1. **Core library + `validate()`** (no page edits) — run against current CSVs, show result.
2. **stats.html** `OWNERS[]` (career totals recomputed).
3. **history.html** `<script type="text/csv">` blocks (verbatim CSV regen — mechanically clean).
4. **draft.html** `OWNERS`/`CHAMPS`/`PICKS`.
5. **credits.html** balances + registry (Credit_Log.csv exists).
6. **prize.html** dues/status + computed payouts (pre-2025 history flagged manual).
7. **power-rankings.html** — SKIP/flag (no source file yet).
8. **rules.html** — partial/flag per decision #7.
9. **weekly.html + standalone** — out of scope (separate task).

**Stopping here for your review before writing any code, per Step 0.**
