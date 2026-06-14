# MAFFL HQ — Data Governance, Model & Audit Framework

**Status:** First-pass audit (pre go-live, target 2026-07-01)
**Coverage:** Full data layer (all CSVs + 2 JS data files) reconciled; `power-rankings.html` embed audited line-level; remaining HTML embeds inventoried at a high level (not yet read field-by-field — see Phase 2).
**Author note:** This is the "where does everything live, what overlaps, what breaks what" map you asked for. Fixes are deliberately *not* applied here — each becomes its own Claude Code prompt when you're ready.

---

## 0. TL;DR — the two findings that matter most

1. **Stale embedded snapshots are the real risk, not the CSVs.** Your gold CSVs are mostly right. The Murello team-name bug was *not* a CSV error — `MAFFL_Team_History.csv` and `MAFFL_Owners_Sheet_revised.csv` both correctly say `Kids BadBlood HighSchool`. The wrong value lives in a **hand-typed `timeline` array inside `power-rankings.html`** that re-encodes team names, W/L/T, and finish flags independently of the CSVs. David Murello's whole timeline is frozen at `Kardiac Kids` for all 24 seasons (missing 2024 `Kids Mixon with Lamar` and 2025 `Kids BadBlood HighSchool`), and `recentTeam` is also stale. Anywhere a fact is hand-copied into a page, it *will* drift.

2. **Owner name is your join key and it is not stable.** The same franchise is spelled **five+ different ways** across files. The co-owned team appears as:
   - `Brian Murello/ Ron Murello` — Team_History, Matchups, cleaned_maffl, Points_AllTime
   - `Brian Murello/Ron Murello` — Division_History (no spaces)
   - `Brian Murello / Ron Murello` — Draft_Summary (spaces around slash)
   - `Brian and Ron Murello` — Power_Rankings
   - `Brian Murello & Ron Murello` — power-rankings.html embed
   - `Brian Murello/⏎Ron Murello` — Owners_Sheet (literal newline inside the cell)

   Every cross-file join is currently a fuzzy string match held together by `normalizeName()` and the `DIVISION_NAME_FIXUP` map. That works until it silently doesn't.

Everything below is the structural fix for these two patterns.

---

## 1. Data model (entity map)

MAFFL HQ is effectively a small star schema. Naming the entities makes the "single source of truth" question answerable.

```
                         ┌──────────────────────┐
                         │       OWNER          │  ← master/dimension
                         │  (franchise/manager) │     NEEDS a stable ID
                         └──────────┬───────────┘
                                    │ owner_id
        ┌───────────────┬───────────┼────────────┬───────────────┐
        │               │           │            │               │
  ┌─────▼─────┐  ┌──────▼─────┐ ┌───▼──────┐ ┌───▼──────┐  ┌─────▼──────┐
  │ MATCHUP   │  │ DRAFT PICK │ │ CREDIT   │ │ PRIZE    │  │ SEASON-    │
  │ (game)    │  │            │ │ LEDGER   │ │ RECORD   │  │ OWNER      │
  │  FACT     │  │  FACT      │ │  FACT    │ │  FACT    │  │ (per yr)   │
  └───────────┘  └────────────┘ └──────────┘ └──────────┘  └────────────┘
   gold: Matchups  gold: Draft   gold:        gold:          team name,
   _Clean.csv      _History_     Credit_      prize.csv      tier, div,
                   v3.csv        Log.csv                     W/L/T, finish
                                                             flags
   DERIVED SNAPSHOTS (regenerate, never hand-edit):
   • Power_Rankings (current OVR/Clutch/Grind/Heat + rank)  ← snapshot
   • Points_By_Season / Points_AllTime  ← derived from Matchups
   • Placements_AllTime, ThirdPlace_ByYear  ← derived
   • Draft_Summary_ByOwner  ← rolled up from Draft_History
```

**Key insight:** "SEASON-OWNER" (one row per owner per year carrying team name + record + finish) is currently **smeared across three CSVs** that should logically be one table:
- `MAFFL_Team_History.csv` (owner, year, team_name, is_current)
- `cleaned_maffl_revised.csv` (owner, year, team, W/L/T, champ/runner/div/playoff flags)
- `MAFFL_Division_History_2005_2025.csv` (year, tier, conference, division, rank, team, owner, W/L/T)

Three files describe the same grain (owner × season) with overlapping columns and **independent copies of team name and W/L**. That overlap is where drift hides.

---

## 2. Source-of-Truth Registry

For every fact, declare exactly one gold source. Everything else is a copy that must be regenerated, never hand-edited.

| Fact | GOLD source (authoritative) | Other copies that must stay in sync (derived) | Cadence |
|---|---|---|---|
| Game result (W/L, scores) | `MAFFL_Matchups_Clean.csv` | `MAFFL_Matchups_NoConsolation.csv`, `matchups-data.js`, embedded standings/records in history/stats/power-rankings/rivalry/weekly | Weekly (in season) |
| Team name by owner×year | `MAFFL_Team_History.csv` | Owners_Sheet "Current Team", **power-rankings.html `recentTeam`+`timeline`**, Matchups Winner/Loser_Team, Division_History "Team", embeds in history/draft/prize | Seasonal (+ ad-hoc renames) |
| Owner W/L/T per season | `MAFFL_Matchups_Clean.csv` (derive) | `cleaned_maffl_revised.csv`, Division_History, power-rankings.html `timeline` | Weekly |
| Finish flags (champ/RU/div/playoff) | `cleaned_maffl_revised.csv` | Placements_AllTime, ThirdPlace_ByYear, Power_Rankings, power-rankings embed, prize.csv | Seasonal |
| Draft picks | `MAFFL_Draft_History_Clean_v3.csv` | `MAFFL_Draft_Summary_ByOwner.csv`, `draft-summary-data.js`, draft.html embed | Seasonal |
| Credit balance | `Credit_Log.csv` (sum of entries) | Owners_Sheet "Current Credit Balance", 2025_League_Status balance, credits.html embed | Weekly/ad-hoc |
| Power ratings (OVR/Clutch/Grind/Heat) + rank | `Power_Rankings.csv` | Owners_Sheet power cols, power-rankings.html embed | Seasonal (you set these) |
| Prizes/payouts | `prize.csv` | prize.html embed, League_Packet prize CSV | Seasonal |
| Owner roster / active status / aliases | `MAFFL_Owners_Sheet_revised.csv` | every page, every data file (join key) | Rare |
| Rules | `MAFFL_Rules_revised.csv` | rules.html | Rare |

**The pattern to enforce:** GOLD is hand-edited; every "other copy" column gets a provenance header and is regenerated by script. Your two `.js` files already do this correctly ("Regenerate from CSV; do not hand-edit"). The HTML embeds do not — that's the gap.

---

## 3. Duplication / overlap map (where the same fact lives in N places)

| Fact | # of live copies | Verified problem? |
|---|---|---|
| Team name (owner×year) | **5** (Team_History, Owners_Sheet, power-rankings embed, Matchups, Division_History) | **YES** — power-rankings embed stale (Murello) |
| Owner name spelling (join key) | **6+ formats** across files | **YES** — no canonical ID |
| Owner W/L/T per season | 4 (Matchups-derived, cleaned_maffl, Division_History, power-rankings embed) | At risk |
| Power ratings | 3 (Power_Rankings, Owners_Sheet, power-rankings embed) | At risk |
| Credit balance | 3 (Credit_Log sum, Owners_Sheet, 2025_League_Status) | At risk |
| Career totals (rings/RU/div/playoff/win%) | 4 (Owners_Sheet, Power_Rankings, Placements, power-rankings embed) | At risk |

---

## 4. Chain-Event Matrix — "when I change X, what else must update"

This is the table you asked for. Read it as: *trigger → propagate in this order.*

### CE-1 — New week of results posted (most frequent)
`MAFFL_Matchups_Clean.csv` (append rows)
→ regenerate `MAFFL_Matchups_NoConsolation.csv`
→ regenerate `matchups-data.js`
→ recompute `MAFFL_Points_By_Season.csv` + `MAFFL_Points_AllTime.csv`
→ recompute W/L records used by standings
→ refresh embeds in: `weekly.html`, `stats.html`, `history.html`, `rivalry.html` (auto via JS), `power-rankings.html` (rivals auto via JS; **but timeline W/L is hand-typed → also stale**)

### CE-2 — Owner renames their team (the Murello chain)
`MAFFL_Team_History.csv` (update the `is_current` TRUE row)
→ `MAFFL_Owners_Sheet_revised.csv` "Current Team"
→ **`power-rankings.html` — `recentTeam` AND the matching `timeline[year][1]`** ← this is the step that was missed
→ any page printing current team: `history.html`, `draft.html`, `prize.html`, `weekly.html`, `index.html` if shown

### CE-3 — Season finishes / playoffs resolve
`cleaned_maffl_revised.csv` (finish flags)
→ `MAFFL_Placements_AllTime.csv`, `MAFFL_ThirdPlace_ByYear.csv`
→ `prize.csv` (payouts) → `prize.html`
→ `Power_Rankings.csv` career totals → power-rankings embed + Owners_Sheet
→ `history.html` book entries

### CE-4 — Credit awarded/spent
`Credit_Log.csv` (append entry, Approved?=Y)
→ recompute balance → `MAFFL_Owners_Sheet_revised.csv` + `2025_League_Status`
→ `credits.html` embed

### CE-5 — New draft year
`MAFFL_Draft_History_Clean_v3.csv` (append picks)
→ **run player name crosswalk FIRST** (`MAFFL_Player_Name_Crosswalk.csv`)
→ regenerate `MAFFL_Draft_Summary_ByOwner.csv` → `draft-summary-data.js` → `draft.html`

### CE-6 — New owner joins / owner goes inactive / co-ownership changes
`MAFFL_Owners_Sheet_revised.csv` (roster + active + **canonical name/alias**)
→ touches EVERYTHING (it's the dimension). New owner must be seeded into Team_History, Power_Rankings, power-rankings embed (`key`, `name`, `recentTeam`, `timeline`), and every page's owner list.
→ *This is the highest-blast-radius change and the one most needing a stable ID.*

### CE-7 — Power re-rank (you re-score the league)
`Power_Rankings.csv`
→ power-rankings.html embed (rank, ovr/clutch/grind/heat, scout/highlight)
→ Owners_Sheet power cols + "2026 Power Ranking"

---

## 5. Update cadence (frequency of management)

| Cadence | Data | Implication |
|---|---|---|
| **Weekly (in season)** | Matchups, Points, Credits, weekly scores/standings | Needs a fast, low-error pipeline. This is where your Fable screenshot→CSV flow lives. Automate hard. |
| **Seasonal** | Team names, Division, Drafts, Placements, Prizes, Power Rankings, career totals | Batch once; high blast radius (CE-2/3/5/6/7). Run audit after. |
| **Rare** | Owner roster, Rules, aliases | Manual, but each change is a CE-6 (big ripple). |

---

## 6. Gotcha register (concrete, with severity)

| # | Severity | Finding | Where |
|---|---|---|---|
| G-1 | **High** | Hand-typed `timeline` re-encodes team names + W/L + flags; drifts from gold. David Murello frozen at "Kardiac Kids" all 24 yrs; `recentTeam` stale | `power-rankings.html` |
| G-2 | **High** | Owner name (the join key) has 6+ spellings; no canonical ID. One typo = silent missing join | All files |
| G-3 | Medium | "SEASON-OWNER" grain split across 3 CSVs with overlapping team/W-L columns; copies can disagree | Team_History / cleaned_maffl / Division_History |
| G-4 | Medium | Credit balance stored in 3 places, none auto-derived from the ledger | Credit_Log / Owners_Sheet / 2025_League_Status |
| G-5 | Medium | Career totals (rings/RU/div/playoff/win%) stored in 4 places | Owners_Sheet / Power_Rankings / Placements / embed |
| G-6 | Medium | HTML embeds (esp. `history.html`, 885 KB, ~755 owner-string hits) have no provenance header or "do not hand-edit" marker; safe to edit by hand = will be edited by hand | history/draft/stats/prize/credits |
| G-7 | Low | Owners_Sheet stores co-owner names across a literal in-cell newline — fragile to parse | Owners_Sheet |
| G-8 | Low (known) | Playoff point totals undercounted in `MAFFL_Points_AllTime.csv`; matchup-derived values correct | Points_AllTime (already on your radar) |

---

## 7. Recommended governance model (the "next level")

### 7.1 Establish a canonical Owner ID
Add an **Owner Registry** as the single dimension table. You already have the raw materials: `Short Name` in Owners_Sheet and the `key:"david-murello"` slugs in power-rankings.html. Standardize one slug as `owner_id`.

Proposed file: `MAFFL_Owner_Registry.csv`
```
owner_id, canonical_name, short_name, active, team_structure, current_team_id, aliases
david-murello, David Murello, Dave, Y, Single, ..., "David Murello|Dave Murello"
brian-ron-murello, Brian Murello / Ron Murello, Brian/Ron, Y, Co-Owner, ...,
  "Brian Murello/ Ron Murello|Brian Murello/Ron Murello|Brian and Ron Murello|Brian Murello & Ron Murello"
```
`aliases` captures every spelling currently in the wild, so `normalizeName()` becomes a **lookup against a declared list** instead of fuzzy guessing. New file? Reject it at audit time until its name is registered.

### 7.2 Tier the data explicitly: GOLD vs DERIVED
- **GOLD** (hand-edited): Matchups_Clean, Draft_History_v3, Credit_Log, prize.csv, cleaned_maffl (finish flags), Team_History, Owners_Sheet/Registry, Rules, Power_Rankings (your scores).
- **DERIVED** (generated, never hand-edited): every `.js` file, every HTML embed, NoConsolation, Points_*, Placements, ThirdPlace, Draft_Summary, Owners_Sheet's computed columns (credit balance, career totals).

### 7.3 Generation pipeline (extend what already works)
Your `.js` files prove the pattern. Extend it so **`power-rankings.html`'s `timeline`/`recentTeam` is generated from Team_History + cleaned_maffl**, not hand-typed. Same for the other big embeds. A small build step (one script per page, or one shared builder) turns gold CSVs → embedded blocks between marker comments:
```html
<!-- AUTO-GEN:owners-data START — source: Team_History.csv + cleaned_maffl.csv — regen YYYY-MM-DD — DO NOT HAND-EDIT -->
... generated array ...
<!-- AUTO-GEN:owners-data END -->
```

### 7.4 Provenance headers everywhere
Every embedded data block and every derived CSV gets a header: source file(s), regenerated date, "DO NOT HAND-EDIT." This single convention is what makes G-1/G-6 stop recurring.

---

## 8. Built-in audit (so drift gets caught, not discovered)

A `validate.py` (or node) script run before each commit, plus an optional hidden dev panel on the site. Concrete checks:

1. **Name integrity:** every owner string in every file resolves to an `owner_id` via the registry alias list. Unknown name → FAIL (catches G-2).
2. **Team-name freshness:** for each owner, `power-rankings recentTeam` == latest `is_current` row in Team_History == Owners_Sheet "Current Team". Mismatch → FAIL (would have caught Murello, G-1).
3. **Timeline ↔ gold:** each `timeline[year]` team/W/L matches Team_History + Matchups-derived record. Mismatch → WARN with diff (G-1/G-3).
4. **Credit reconciliation:** `sum(Credit_Log where Approved=Y) per owner` == Owners_Sheet balance == 2025_League_Status balance (G-4).
5. **Career totals:** rings/RU/div/playoff/win% recomputed from cleaned_maffl/Matchups == every stored copy (G-5).
6. **Consolation rule:** assert no `Game_Type=Consolation` rows leak into records/points (your standing rule).
7. **Provenance present:** every DERIVED file/embed has a header with a regen date newer than its gold source's mtime; stale → WARN.
8. **Crosswalk gate:** Draft_Summary regen blocked unless name crosswalk has run (CE-5).

Output: a short `AUDIT.md`-style report — counts of PASS/WARN/FAIL with the specific offending rows. Run it as the "Step 0 verification" your prompts already favor.

---

## 9. Phased roadmap to go-live (2026-07-01)

- **Phase 1 — Stop the bleeding (highest ROI):**
  1. Build `MAFFL_Owner_Registry.csv` with aliases (kills G-2, unblocks everything).
  2. Regenerate `power-rankings.html` `recentTeam`+`timeline` from gold; add provenance markers (kills G-1, fixes Murello).
- **Phase 2 — Complete the inventory:** read `history.html`, `draft.html`, `stats.html`, `prize.html`, `credits.html` embeds field-by-field; tag each block GOLD/DERIVED; add provenance headers (closes G-6). *(I have not yet read these line-level — only counted footprint.)*
- **Phase 3 — Pipeline + audit:** stand up the generator for each derived embed + `validate.py` with checks 1–8. After this, weekly/seasonal updates become "edit gold → regen → audit → commit."
- **Phase 4 — Cleanup backlog:** G-3 (merge SEASON-OWNER grain), G-4/G-5 (derive balances/totals), G-8 (playoff points).

Each phase = one or more Claude Code prompts, scoped one concern at a time per your standing rules (data change + parser update ship together; diff-and-confirm on any CSV overwrite).
