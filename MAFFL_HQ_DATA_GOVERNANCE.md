# MAFFL HQ — Data Governance, Model & Audit Framework

**Status:** Living reference. First written June 2026 (pre go-live); refreshed 2026-09-30 for the weekly robot and dues ledger.
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
- `MAFFL_Owner_Seasons.csv` (owner, year, team, W/L/T, champ/runner/div/playoff/lower-tier flags) — **since 2026-10-06 DERIVED** from the other two + Matchups + prize.csv by `build/gen-owner-seasons.ps1`; replaced the corrupted `cleaned_maffl_revised.csv`
- `MAFFL_Division_History_2005_2025.csv` (year, tier, conference, division, rank, team, owner, W/L/T)

Three files describe the same grain (owner × season) with overlapping columns and **independent copies of team name and W/L**. That overlap is where drift hides.

---

## 2. Source-of-Truth Registry

For every fact, declare exactly one gold source. Everything else is a copy that must be regenerated, never hand-edited.

| Fact | GOLD source (authoritative) | Other copies that must stay in sync (derived) | Cadence |
|---|---|---|---|
| Game result (W/L, scores) | `MAFFL_Matchups_Clean.csv` | `MAFFL_Matchups_NoConsolation.csv`, `matchups-data.js`, embedded standings/records in history/stats/power-rankings/rivalry/weekly | Weekly (in season) |
| Weekly top-3 scorers per team (2026+) | `data/MAFFL_Top_Performers_2026.csv` — **appended weekly by the robot** (`_ops/scripts/ingest_week.py`, from the ESPN pull's OUTPUT 2a) (`Year,Week,Tier,Team,Owner,Rank,Player,Pos,Points`; ESPN first-initial player names; `Pos` blank until capture supplies it) | None generated. Quoted by hand in weekly.html Pulse prose (Results notes, Credit Tracker Individual High) | Weekly (in season) |
| Regular-season **fixtures** — 2026 Upper-Tier (week, home/away, Week_Type, Game_Class, Division) | `data/MAFFL_Schedule_2026_Upper.csv` — **hand-authored by the commissioner; NOT derived from any other file** | rules.html Schedule Structure (four-block table, 2026 Mirror Pairs list), weekly.html Week 1 Preview, `schedule-data.js` (via `build/generate-schedule-data.ps1`) → `rivalry.html` | Seasonal (set with division alignment) |
| Regular-season **fixtures** — 2026 Lower-Tier (week, home/away) | `data/MAFFL_Schedule_2026_Lower.csv` — **extracted once from ESPN's auto-generated Lower schedule** by `_ops/scripts/extract_espn_schedule.py` (snapshot 2026-09-30); re-extract only if ESPN's schedule changes | `schedule-data.js` → `rivalry.html` | Seasonal |
| Team name by owner×year | `MAFFL_Team_History.csv` | Owners_Sheet "Current Team", **power-rankings.html `recentTeam`+`timeline`**, Matchups Winner/Loser_Team, Division_History "Team", embeds in history/draft/prize | Seasonal (+ ad-hoc renames) |
| Owner W/L/T per season | `MAFFL_Matchups_Clean.csv` (derive) | `MAFFL_Owner_Seasons.csv` (generated), Division_History, power-rankings.html `timeline` | Weekly |
| Owner-season table (team, W/L/T, all finish flags) | DERIVED: `data/MAFFL_Owner_Seasons.csv` via `build/gen-owner-seasons.ps1` from Team_History + Matchups_NoConsolation + Division_History + prize.csv; 2002–2004 rows from hand-kept gold `data/MAFFL_Seasons_2002_2004.csv` (no matchups exist) | history.html csv-seasons, draft.html CHAMPS, validate Gates 1 + 7 | Seasonal (after the Championship) |
| Finish flags — Division Titles | `MAFFL_Division_History_2005_2025.csv` (Tier=Upper, Division_Rank=1, **all years 2005+**) | power-rankings `timeline`+`divTitles`, history.html STATS_DATA `div:` + csv-seasons, Owners_Sheet col 8, Power_Rankings.csv | Seasonal |
| Finish flags — Champ / Runner-Up / Lower-Tier 1st & RU | `prize.csv` (Placement rows) | power-rankings `timeline`, history STATS_DATA, Placements_AllTime, ThirdPlace_ByYear | Seasonal |
| Finish flags — Playoff (made Upper-Tier championship bracket) | `MAFFL_Matchups_NoConsolation.csv` (distinct Upper-Tier `Is_Playoffs=true` participants per year) | power-rankings `timeline` index 8, Power_Rankings.csv | Seasonal |
| Draft picks | `MAFFL_Draft_History_Clean_v3.csv` | `MAFFL_Draft_Summary_ByOwner.csv`, `draft-summary-data.js`, draft.html embed | Seasonal |
| Credit balance | `Credit_Log.csv` (sum of entries) | Owners_Sheet "Current Credit Balance", 2025_League_Status balance, credits.html embed | Weekly/ad-hoc |
| Power ratings (OVR/Clutch/Grind/Heat) + rank | `Power_Rankings.csv` | Owners_Sheet power cols, power-rankings.html embed | Seasonal (you set these) |
| Prizes/payouts | `prize.csv` | prize.html embed, League_Packet prize CSV | Seasonal |
| Dues obligations + payments | `data/Dues_Log.csv` (append-only) | prize.html `dues_seasons` rows (generated by gen-prize.ps1; season status/closed_date/note hand-set; see `_ops/docs/DUES_PROCESS_NOTE.md`) | Ad-hoc |
| Owner roster / active status / aliases | `MAFFL_Owners_Sheet_revised.csv` | every page, every data file (join key) | Rare |
| Rules | `MAFFL_Rules_revised.csv` | rules.html | Rare |

**Fixtures are not results.** `MAFFL_Schedule_2026_Upper.csv` and `MAFFL_Schedule_2026_Lower.csv` hold the
*scheduled* regular season only — who plays whom, in which week, at which slot. They carry no scores and no
W/L. `MAFFL_Matchups_NoConsolation.csv` remains the gold source for **played results**, and every
record, standing and power rating still derives from there. Do not conflate the two, and do not
join one onto the other to fill gaps: a fixture that has not been played yet is absent from the
results file by design, not by omission. rivalry.html reads fixtures only to show upcoming meetings; records,
streaks and ratings still come only from played results.

Owner names in the schedule file are the ESPN-facing display spellings (e.g.
`Brian / Ron Murello`, `Jon Murello / Rick Simmons`). Resolve them through
`data/MAFFL_Owner_Registry.csv` aliases like every other owner join — never fuzzy-match. Any new
spelling introduced by a future season's schedule must be added to the registry first.

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
*In season this runs automatically in the weekly robot (`pulse-draft.yml`): `ingest_week.py` appends gold, then `build\generate-matchups-data.ps1` regenerates the derived files and `validate.ps1` runs. Nothing publishes until the commissioner merges the PR.*
`MAFFL_Matchups_Clean.csv` (append rows)
+ `data/MAFFL_Top_Performers_2026.csv` (append that week's 3 rows per real team — gold, same capture; no derived files)
→ regenerate `MAFFL_Matchups_NoConsolation.csv`
→ regenerate `matchups-data.js`
→ recompute `MAFFL_Points_By_Season.csv` + `MAFFL_Points_AllTime.csv`
→ recompute W/L records used by standings
→ refresh embeds in: `weekly.html`, `stats.html`, `history.html`, `rivalry.html` (auto via JS), `power-rankings.html` (rivals auto via JS; **but timeline W/L is hand-typed → also stale**)

### CE-1a — ESPN stat correction to an already-posted week (in-progress season only)
**Robot path (from 2026-10-06):** in season, pulse-draft applies these automatically: apply_corrections.py edits gold scores (never rows) from the ESPN report's OUTPUT 4, the generator runs with -CorrectSeason, and the robot fixes earlier Week objects' scores and quoted numbers (not their standings snapshots). Every change is listed in the PR; a flipped winner is flagged at the top. The hand steps below remain the method outside the robot.
Edit the affected rows' scores in `MAFFL_Matchups_Clean.csv` (never add or remove rows)
→ recompute that week's 👻 par from the corrected real Lower scores and edit the Ghost row too
→ `build\generate-matchups-data.ps1 -CorrectSeason <year> [-Write]` (the lock stays on for every earlier season)
→ correct every weekly.html week object from the corrected week onward: results, standings points, creditTracker, highestWeekly, and any prose that quotes a changed number
→ LM re-enters the corrected 👻 par in ESPN
Top-performer rows are not re-captured for corrections (player-level corrections aren't visible on the schedule page).

### CE-1b — Finished season corrected against ESPN (added 2026-10-09)
Historic results are byte-locked by the CE-1 generator. When an ESPN check (`_ops/scripts/audit_gold_vs_espn.py`)
proves a finished season's game wrong:
→ fix the row(s) in gold `MAFFL_Matchups_Clean.csv` on a `build-fix/*` branch (rows change in place; never add, drop or reorder)
→ update the Owners Sheet career W/L/T + Win% by hand for the owners whose record moved (validate Gate 2/3 prove it); same for any hand-authored `power-rankings.html` winPct / timeline W/L
→ Actions → **Build write** → Run workflow on that branch with `correct_history` = the years (e.g. `2015,2022,2024`): runs `generate-matchups-data.ps1 -CorrectHistory …`, then `build.ps1 -Write`, re-checks both clean and commits the regenerated files to the branch
→ open a PR; merge publishes. Division_History W/L and finish flags are their own gold: check them too.

### CE-1c — Draft history corrected against ESPN (added 2026-10-09)
`_ops/scripts/rebuild_draft_from_espn.py` (input: the "ESPN draft history pull" Action's `_ops/inbox/MAFFL_ESPN_Drafts.json`) fixes gold
draft player names, wrong-side positions, owners and missing picks (2006 skipped: ESPN lost picks). Then
`python3 _ops/scripts/gen_draft_summary.py --write` (Draft_Summary_ByOwner.csv + draft-summary-data.js), then Build write for draft.html / history csv-drafts.

### CE-2 — Owner renames their team (the Murello chain)
`MAFFL_Team_History.csv` (update the `is_current` TRUE row)
→ `MAFFL_Owners_Sheet_revised.csv` "Current Team"
→ **`power-rankings.html` — `recentTeam` AND the matching `timeline[year][1]`** ← this is the step that was missed
→ any page printing current team: `history.html`, `draft.html`, `prize.html`, `weekly.html`, `index.html` if shown

### CE-3 — Season finishes / playoffs resolve
Finish flags per §7.5: `MAFFL_Division_History_2005_2025.csv` (division ranks) + `prize.csv` (Champ / RU / Lower-Tier placements) + `MAFFL_Matchups_NoConsolation.csv` (playoffs). **Never `cleaned_maffl_revised.csv`.**
→ `MAFFL_Placements_AllTime.csv`, `MAFFL_ThirdPlace_ByYear.csv`
→ `prize.csv` (payouts) → `prize.html`
→ `Power_Rankings.csv` career totals → power-rankings embed + Owners_Sheet
→ `history.html` book entries
→ `MAFFL_Division_History_2005_2025.csv`: fill `Division_Rank` + `W`/`L`/`T` on the season's CE-9 alignment rows (don't add new rows)

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

### CE-7 — Dues paid / adjusted
`data/Dues_Log.csv` (append a Payment row, Approved?=Y; or an Obligation row if the assessment changes)
→ update the open season's rows in `prize.html` `dues_seasons` (owed = Obligation − Payments; status = PAID when owed ≤ 0)
→ `gen-prize.ps1` generates those rows from the log (Windows `-Write`); from chat, hand-sync in the same commit and prove it with the Build check Action (gen-prize CLEAN). See `_ops/docs/DUES_PROCESS_NOTE.md` and `DUES_LEDGER_DESIGN.md`
→ keep `2025_League_Status` / Owners_Sheet 2026 columns in sync manually (parallel, non-runtime sources)

### CE-8 — Power re-rank (you re-score the league)
`Power_Rankings.csv`
→ power-rankings.html embed (rank, ovr/clutch/grind/heat, scout/highlight)
→ Owners_Sheet power cols + "2026 Power Ranking"

### CE-9 — New season begins (promotion/relegation + division alignment set)
Added 2026-09-30. This gap left `rivalry.html` without 2026 divisions: every other CE starts from a result, none from a season start.
`MAFFL_Division_History_2005_2025.csv`: append the new season's alignment rows (Upper Division A–D + Lower Tier), with `Division_Rank` / `W` / `L` / `T` **blank** until CE-3
→ `rivalry.html` `DIVISION_DATA` (same rows, embed spellings; drives same-division and same-tier detection)
→ `data/MAFFL_Schedule_<year>_Upper.csv` (commissioner-authored fixtures carry the same divisions; check they agree)
→ weekly robot: `TEAM_MAP` tiers in `_ops/scripts/maffl_espn_pull.py`, `DIVISIONS` in `_ops/scripts/pulse_facts.py`
→ `weekly.html` standings groups (`upperTier.divA..divD`, `lowerTier`) + Owners_Sheet "<year> League" column
→ `history.html` csv-divisions embed is **not** updated mid-season; it picks the season up at CE-3

---

## 5. Update cadence (frequency of management)

| Cadence | Data | Implication |
|---|---|---|
| **Weekly (in season)** | Matchups, Points, Credits, weekly scores/standings | Needs a fast, low-error pipeline. Automated by the weekly robot (ESPN pull → gold → PR). |
| **Seasonal** | Team names, Division, Drafts, Placements, Prizes, Power Rankings, career totals | Batch once; high blast radius (CE-2/3/5/6/8). Run audit after. |
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
| G-9 | Medium | No chain event for season start, so `rivalry.html` DIVISION_DATA stopped at 2025 (fixed 2026-09-30 via CE-9). Hand-copied embeds go stale silently | `rivalry.html`, Division_History |

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
- **GOLD** (hand-edited): Matchups_Clean, Draft_History_v3, Credit_Log, Dues_Log, prize.csv, Division_History_2005_2025 (division titles), Team_History, Owners_Sheet/Registry, Rules, Power_Rankings (your scores).
- **CORRUPTED — DO NOT USE:** `cleaned_maffl_revised.csv`. It was formerly treated as the finish-flag gold source and carried wrong values (e.g. Mike Murello 2021 division title, 2025 Lower-Tier 1st) into multiple HTML embeds. Derive finish flags from Division_History + prize.csv instead. **Retired 2026-10-06:** nothing reads it; `MAFFL_Owner_Seasons.csv` (generated from gold) replaced it everywhere. Old static page embeds that were once built from it (rivalry, stats, power-rankings comments) are covered by the generator-drift work.
- **DERIVED** (generated, never hand-edited): every `.js` file, every HTML embed, NoConsolation, Points_*, Placements, ThirdPlace, Draft_Summary, Owners_Sheet's computed columns (credit balance, career totals).

### 7.3 Generation pipeline (extend what already works)
Your `.js` files prove the pattern. Extend it so **`power-rankings.html`'s `timeline`/`recentTeam` is generated from Team_History + Division_History + prize.csv + Matchups (§7.5)**, not hand-typed. Same for the other big embeds. A small build step (one script per page, or one shared builder) turns gold CSVs → embedded blocks between marker comments:
```html
<!-- AUTO-GEN:owners-data START — source: Team_History.csv + Division_History + prize.csv — regen YYYY-MM-DD — DO NOT HAND-EDIT -->
... generated array ...
<!-- AUTO-GEN:owners-data END -->
```

### 7.4 Provenance headers everywhere
Every embedded data block and every derived CSV gets a header: source file(s), regenerated date, "DO NOT HAND-EDIT." This single convention is what makes G-1/G-6 stop recurring.

### 7.5 Finish-flag derivation rules (canonical)
These flags are DERIVED — never hand-typed in any HTML embed:
- **Division Title** = `MAFFL_Division_History_2005_2025.csv` where `Tier == "Upper"` AND `Division_Rank == 1`, for **all years 2005+** (NOT 2013+ — that earlier scope was wrong). Divisions exist ONLY in the Upper-Tier; Lower-Tier "division" rows are never titles.
- **Playoff flag** = made the **Upper-Tier championship playoff bracket** that season. Derive per year from `MAFFL_Matchups_NoConsolation.csv`: any owner appearing in an `Is_Playoffs == true`, `Tier == "Upper"` row made the playoffs. The file's playoff rows are championship-bracket only (Quarterfinal / Semifinal / Championship / ThirdPlace) — consolation is already excluded, so the distinct-participant set is exactly the field. **Bracket size varies by era and the flag does NOT encode a fixed top-N:** 6 teams in 2005, **8 teams 2006–2024**, 6 teams from 2025 forward (top-2 seeds bye). Playoffs are Upper-Tier only; Lower-Tier rows never carry this flag. Promotion/relegation series are not playoff games.
- **Lower-Tier finishes** = `prize.csv` Placement rows: Lower-Tier 1st and Lower-Tier Runner-Up only. Lower-Tier top-4 postseason and Upper-Tier non-championship postseason get NO separate timeline marker.
- **Per-owner division-title COUNTS** (`divTitles:` in power-rankings, `div:` in history STATS_DATA) must equal the count of that owner's Upper rank-1 rows in Division_History. They are currently hand-maintained and WILL drift — generate them, don't type them. Until generated, any flag change requires the matching count to be recomputed in the same commit.

---

## 8. Built-in audit (so drift gets caught, not discovered)

A `validate.py` (or node) script run before each commit, plus an optional hidden dev panel on the site. Concrete checks:

1. **Name integrity:** every owner string in every file resolves to an `owner_id` via the registry alias list. Unknown name → FAIL (catches G-2).
2. **Team-name freshness:** for each owner, `power-rankings recentTeam` == latest `is_current` row in Team_History == Owners_Sheet "Current Team". Mismatch → FAIL (would have caught Murello, G-1).
3. **Timeline ↔ gold:** each `timeline[year]` team/W/L matches Team_History + Matchups-derived record. Mismatch → WARN with diff (G-1/G-3).
4. **Credit reconciliation:** `sum(Credit_Log where Approved=Y) per owner` == Owners_Sheet balance == 2025_League_Status balance (G-4).
5. **Career totals:** rings/RU/div/playoff/win% recomputed from Matchups + Division_History + prize.csv == every stored copy (G-5).
6. **Consolation rule:** assert no `Game_Type=Consolation` rows leak into records/points (your standing rule).
7. **Provenance present:** every DERIVED file/embed has a header with a regen date newer than its gold source's mtime; stale → WARN.
8. **Crosswalk gate:** Draft_Summary regen blocked unless name crosswalk has run (CE-5).

Output: a short `AUDIT.md`-style report — counts of PASS/WARN/FAIL with the specific offending rows. Run it as the "Step 0 verification" your prompts already favor.

---

## 9. Phased roadmap to go-live (2026-07-01)
*Historical: the June 2026 go-live plan. Current open work lives in `_ops/STATUS.md`.*

- **Phase 1 — Stop the bleeding (highest ROI):**
  1. Build `MAFFL_Owner_Registry.csv` with aliases (kills G-2, unblocks everything).
  2. Regenerate `power-rankings.html` `recentTeam`+`timeline` from gold; add provenance markers (kills G-1, fixes Murello).
- **Phase 2 — Complete the inventory:** read `history.html`, `draft.html`, `stats.html`, `prize.html`, `credits.html` embeds field-by-field; tag each block GOLD/DERIVED; add provenance headers (closes G-6). *(I have not yet read these line-level — only counted footprint.)*
- **Phase 3 — Pipeline + audit:** stand up the generator for each derived embed + `validate.py` with checks 1–8. After this, weekly/seasonal updates become "edit gold → regen → audit → commit."
- **Phase 4 — Cleanup backlog:** G-3 (merge SEASON-OWNER grain), G-4/G-5 (derive balances/totals), G-8 (playoff points).

Each phase = one or more Claude Code prompts, scoped one concern at a time per your standing rules (data change + parser update ship together; diff-and-confirm on any CSV overwrite).
