# Rivalry upgrade 1 of 3: 2026 schedule data for the Rivalry page

VERSION: none

Date: 2026-09-30 · Author: Claude (chat) · Scope: **data only. No page changes.**
New files: `data/MAFFL_Schedule_2026_Lower.csv`, `_ops/scripts/extract_espn_schedule.py`,
`build/generate-schedule-data.ps1`, `schedule-data.js`. Edited: `MAFFL_HQ_DATA_GOVERNANCE.md` §2.

Read first: `_ops/STATUS.md`, `CLAUDE.md`, `MAFFL_HQ_DATA_GOVERNANCE.md` §2 (the Fixtures row and
the "Fixtures are not results" note), `build/generate-matchups-data.ps1` (copy its conventions).
If an anchor below doesn't match the file exactly, **stop and ask**. No `*.bak` files.

Why: upgrades 2 and 3 turn `rivalry.html` into a game-day page ("This week's rivalries", "Next
meeting" banner, stakes lines). The page can't fetch anything (Self-Contained Output Rule), so it
needs the season's fixtures baked into a generated `.js` file, the same way `matchups-data.js`
works. Upper fixtures already have a gold file. Lower doesn't: its schedule is ESPN's
auto-generated one. The full 14-week Lower schedule is already on disk in the private ESPN
snapshot (`_ops/inbox/MAFFL_ESPN_raw/Lower/2026_season.json`, git-ignored), so extract it once.

Chat pre-checked the snapshot: `schedule[]` has 70 games (14 weeks × 5), and Weeks 1–3 pairings
match gold exactly. Week 4 Lower is Troz v Johnson, Dom v Nick, Ben v Charlie, Sam v Brooks, and
Bo draws 👻.

---

## Step 1: One-time Lower schedule extract

Create `_ops/scripts/extract_espn_schedule.py` (Python 3, stdlib only). Args: `--season-json`
(default `_ops/inbox/MAFFL_ESPN_raw/Lower/2026_season.json`), `--out`
(default `data/MAFFL_Schedule_2026_Lower.csv`), `--write` (without it, print a report and write
nothing).

- Teams: `teams[].id` → `teams[].name`. **Strip whitespace** (`"Portly Primates "` has a trailing space).
- Owner: look up the team name against `data/MAFFL_Owner_Registry.csv` `current_team` (trimmed,
  exact match). `MAFFL Ghost` is deliberately NOT in the registry: write its owner as `MAFFL Ghost`.
  Any other unmatched team name → stop with an error (never fuzzy-match; governance §7.1).
- Rows: one per `schedule[]` entry where `playoffTierType == "NONE"`. Columns are **identical to
  the Upper file's header**:
  `Year,Week,Tier,Week_Type,Game_Class,Division,Away_Team,Away_Owner,Home_Team,Home_Owner`
  with `Year=2026`, `Week=matchupPeriodId`, `Tier=Lower`, `Week_Type=Regular Season`,
  `Game_Class=Open`, `Division` blank. Owner = the registry `canonical_name`.
- Sort by Week, then ESPN matchup `id`. Match the Upper file's format: UTF-8 without BOM, LF endings.

**Gates (all must pass before `--write`):**
1. 70 rows; Weeks 1–14; exactly 5 rows per week.
2. Each of the 9 real Lower owners appears exactly once per week; `MAFFL Ghost` exactly once per week.
3. For every week already in gold (`data/MAFFL_Matchups_NoConsolation.csv`, Year 2026, Lower),
   every extracted pairing matches a gold row (unordered pair; Ghost games match the `Ghost`
   Game_Type rows). Report `N/N weeks matched`.

Run it once with `--write`. The script is committed so next season can re-run it with a new
season JSON. It is **not** part of the weekly robot.

## Step 2: Generator `build/generate-schedule-data.ps1` → `schedule-data.js`

Model it on `generate-matchups-data.ps1`: `param([switch]$Write)` (check-only by default),
`Add-Problem` / `Stop-IfProblems`, the same registry alias lookup (section "2. Owner identity"),
and a UTF-8-with-BOM output + provenance header in the same style as `matchups-data.js`.

- Inputs: `data/MAFFL_Schedule_2026_Upper.csv` and `data/MAFFL_Schedule_2026_Lower.csv`.
- Owner names are resolved through the registry aliases. The Upper file uses ESPN spellings like
  `Brian / Ron Murello`, which are already aliases. Emit `canonical_name`. `MAFFL Ghost` passes
  through unchanged. Any unresolved name is a problem, so stop.
- Output:

```js
/* provenance header: sources (both CSVs + row counts), "Fixtures are not results",
   field list, "Regenerate with build/generate-schedule-data.ps1 -Write; do not hand-edit." */
window.SCHEDULE_DATA = {
  year: 2026,
  games: [
    // [week, tier, awayOwner, homeOwner, gameClass, division]
    [1,"U","Mike Murello","David Murello","Divisional","A"],
    ...
  ]
};
```

  `tier` is `"U"` or `"L"`. `gameClass` is copied verbatim from `Game_Class` (`Divisional`, `Open` or
  `Mirror Match`). `division` is blank for non-division games and for Lower. Sort by week, then
  tier (U first), then source row order.
- Gates: Upper 84 rows (6 per week × 14) and Lower 70; no owner twice in one week+tier; no
  self-pairings.
- Run it with `-Write`.

**Do not** add it to `build.ps1` (build is check-only and drifted; see STATUS). Fixtures change
once a season, so this is run by hand.

## Step 3: Governance §2

In `MAFFL_HQ_DATA_GOVERNANCE.md` §2 Source-of-Truth Registry:

- Upper fixtures row: add `schedule-data.js` (via `build/generate-schedule-data.ps1`) → `rivalry.html`
  to the "Other copies" column.
- Add a new row directly below it:
  `Regular-season **fixtures** — 2026 Lower-Tier (week, home/away)` |
  `data/MAFFL_Schedule_2026_Lower.csv` — **extracted once from ESPN's auto-generated Lower schedule**
  by `_ops/scripts/extract_espn_schedule.py` (snapshot 2026-09-30); re-extract only if ESPN's
  schedule changes | `schedule-data.js` → `rivalry.html` | Seasonal
- In the "Fixtures are not results" paragraph, change the file reference so it covers both schedule
  files. Add one sentence: `rivalry.html reads fixtures only to show upcoming meetings; records,
  streaks and ratings still come only from played results.`

## Verify

- `python _ops/scripts/extract_espn_schedule.py` (no `--write`) → all gates pass and it reports no diff.
- `pwsh build/generate-schedule-data.ps1` (check-only) → no problems, and it reports the file unchanged.
- `node -e "global.window={};require('./schedule-data.js');const g=window.SCHEDULE_DATA.games;console.log(g.length, g.filter(x=>x[0]===4))"`
  → 154 games. Week 4 shows 6 Upper (incl. `Mike Murello` v `BJ Funari` Divisional A, `Joe Reilly` v
  `Dan Reilly` Divisional C) and 5 Lower (incl. `MAFFL Ghost` v `Bob Keslar`).
- `git status`: the private ESPN raw files under `_ops/inbox/` are still ignored, so nothing from
  `MAFFL_ESPN_raw` is staged.
- No page changed: `git diff --stat` lists only the files in Scope, STATUS and this prompt's move.

## Close out

Report the diff summary and the gate output. `git mv` this prompt to `_ops/prompts/done/`, then
update `_ops/STATUS.md` with the block below. Everything goes in one commit.

Suggested commit message: `Rivalry prep: 2026 Lower schedule extracted from ESPN (gold), schedule-data.js generator; governance §2`

---

STATUS:
- Recently shipped (top): `2026-09-30 · Rivalry upgrade 1/3: data/MAFFL_Schedule_2026_Lower.csv (one-time ESPN extract, Wks 1–3 match gold) + build/generate-schedule-data.ps1 → schedule-data.js (both tiers); governance §2 rows. No page changes.`
- Queued prompts: remove this prompt's line.
