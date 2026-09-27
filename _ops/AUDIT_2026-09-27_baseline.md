# Ops Baseline Audit — 2026-09-27

A read-only look at the three places MAFFL HQ work lives, taken when we switched to the
repo-first workflow described in `_ops/README.md`. Nothing was changed while taking it.

## 1. The three locations

| Location | What it is | State on 2026-09-27 |
|---|---|---|
| **Local repo** `Documents\GitHub\maffl` | The real site. Claude Code edits here, GitHub Desktop pushes it. | **Clean and current.** HEAD = `main`, last commit "Weekly Pulse v6.2: feature 3 Upper + 2 Lower games in Week 3 preview". 78 tracked files. |
| **GitHub** `maffl-commish/maffl` → Pages | The published copy. | Matches local once pushed. |
| **claude.ai Project "MAFFL HQ Ops"** | Chat context. 53 docs + 27 files, 56% of knowledge limit. | **Stale.** It's a 9/22 dump plus chat-written docs. `weekly.html` there is **v6.0**; the repo is at **v6.2**. |
| *(extra)* `Desktop\MAFFL` | An **older copy** of the repo (has its own `.git`, `build`, `data`). | Not in use for commits, **but** `.claude/settings.json` still runs its `check-standalone.ps1` as a hook. |

## 2. Findings

1. **Project drift is real and already happened.** Two versions of `weekly.html` have
   shipped since the last dump. A prompt written from project files would have pointed
   at stale code.
2. **Every one of the 17 `claude/` docs in the project exists only there.** None are in
   the repo. 4 are lasting reference docs (migrated to `_ops/docs/` in this pass). 13 are
   one-time prompts. All 13 have been executed. Each one matches a commit:

   | Prompt | Landed as |
   |---|---|
   | PROMPT_week0_pulse | Week 0 Pulse |
   | PROMPT_2026_schedule_structure, PROMPT_2_mirror_match_revised | "schedule updates" |
   | PROMPT_dues_ledger | `prize.html` now has `dues_seasons` |
   | PROMPT_index_carousel_2026_draft | "draft carousel" |
   | PROMPT_2026_draft_ingest, _identity_and_teams, _fetrow_reconcile, PROMPT_revert_fetrow_naming, PROMPT_power_rankings_2026_draft | "2026 draft data" / "owner updates" / "2026 draft results" / "updates to fetrow and wording" |
   | PROMPT_week2_matchup_append | "matchups with week 2" |
   | PROMPT_week2_pulse | v4.3 |
   | PROMPT_week2_downstream_regen | "updated csvs" |
   | PROMPT_pulse_v5_upgrades | v5.0 |
   | PROMPT_pulse_v6_1_polish | v6.1 |
   | PROMPT_versioning_policy | "CLAUDE.md: reset version pill policy" |

3. **Backups and junk are committed and publicly served.** These are tracked in git and
   deployed to Pages:
   - `history.html.bak_20260604_092640` (445 KB), `history_html.bak_2026-06-10` (842 KB)
   - `matchups-data.js.bak_20260604_000035`
   - `data/*.bak_*` (4 files: Draft_History, Matchups_Clean, Matchups_NoConsolation, cleaned_maffl_revised)
   - `data/desktop.ini` (a Windows/OneDrive system file)
   - `_chunk1.txt` (a stray CSS fragment from 5/31)
   - There is **no `.gitignore`**. `.claude/settings.local.json` (27 KB) is currently untracked, but
     nothing stops it from being committed.
4. **Root is cluttered with finished June build-era docs.** `# MAFFL HQ Project.md`, `AUDIT.md`,
   `AUDIT_Accolades_Recon.md`, `AUDIT_Career_Records_Recon.md`, `BUILD_NOTES.md`,
   `BUILD_SUMMARY.md`, `CHANGES.md`, `CHANGE_INVENTORY.md`, `DOC_SWEEP.md`. They're useful
   history, but not live instructions. `# MAFFL HQ Project.md` still describes a
   `build.py` / July-1 plan that is out of date.
5. **The standalone-check hook points outside the repo.** `.claude/settings.json` runs
   `C:\Users\micha\OneDrive\Desktop\MAFFL\check-standalone.ps1`, the old copy, not the
   `check-standalone.ps1` in this repo. If the Desktop folder is deleted or drifts, the
   hook silently breaks or checks with stale rules.
6. **Known open data issues** (carried from `DUES_PROCESS_NOTE.md` and the runbook, still open):
   - `build.ps1` aborts on **validate Gate 2**, and `gen-prize.ps1` would clobber dues
     stamps. **Don't run the build for dues.**
   - `Dues_Log.csv` lives at repo root, not `data/`, and no generator reads it.
   - Runbook §6 "Known open work (as of 2026-06)" is partly stale (Weekly Capture now exists).
7. **README.md is 19 bytes.** CLAUDE.md is the real orientation doc and it's current.

## 3. File disposition (what the cleanup prompt does)

| File(s) | Action |
|---|---|
| `*.bak*`, `data/*.bak_*`, `data/desktop.ini`, `_chunk1.txt` | `git rm` + `.gitignore` |
| June build-era docs (item 4) | `git mv` → `_ops/archive/2026-06-build/` |
| `CLAUDE.md`, `MAFFL_HQ_DATA_GOVERNANCE.md`, `MAFFL_HQ_OPERATIONS_RUNBOOK.md` | Stay at root (CLAUDE.md and generators reference them by path) |
| `check-standalone.ps1` | Stays; hook repointed to it |
| `.claude/settings.local.json` | Gitignored |
| `Dues_Log.csv` at root | **Not moved.** Open decision, tracked in STATUS |
| `_quarantine/` (empty) | Git doesn't track empty dirs. Leave it or delete it by hand |

## 4. Project disposition

See `_ops/README.md` §4. In short: delete every code, data and one-time prompt item from
the project. Keep only a short pointer doc and the instructions.
