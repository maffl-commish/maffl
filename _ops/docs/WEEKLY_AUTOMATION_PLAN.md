# MAFFL Weekly Robot, on one page

Updated 2026-09-30 · Built 2026-09-29/30 (Mike + Claude) · Replaces the older step-by-step build plan

## What happens every Tuesday (no one lifts a finger)

| When (ET) | What | Where you see it |
|---|---|---|
| 5:00 AM (retry 7:00, Wed backstop) | **ESPN pull**: scores, top-3 scorers, waivers/trades, stat-correction check, next week's pairings, 8 safety checks | `_ops/inbox/MAFFL_2026_WeekNN_espn.md` |
| right after | **Data job** (no AI): adds the week to the gold CSVs, refreshes the matchup files, validate 8/8, computes every number | branch `pulse/2026-weekNN` |
| right after | **Claude** writes the Week object in `weekly.html` using the editorial guide, then opens a pull request | GitHub → **Pull requests** → "Weekly Pulse: Week N draft" |

**Nothing goes on the site until you click Merge.** If anything fails, GitHub emails you and nothing is drafted.

## Your Tuesday routine

1. Open the pull request (phone is fine). Read Claude's summary: headline, checks, "Needs your OK".
2. Want changes? Comment `@claude …` in plain English (e.g. "@claude lead with the Reilly game"). Claude edits the draft.
3. Happy? Click **Merge pull request**, then **Confirm merge**. The site updates in a minute or two.
4. On your computer: in GitHub Desktop, click **Fetch origin**, then **Pull origin**, before any other MAFFL work.

**Fallback:** if the robot fails, start a Cowork chat in MAFFL HQ Ops: "draft the Week N Pulse from the inbox".

## If something breaks

| Symptom | Fix |
|---|---|
| Email: ESPN pull failed, "Could not open the league" | ESPN cookies expired (~yearly). Get `espn_s2` + `SWID` again (Chrome F12 → Application → Cookies) and update the two GitHub secrets |
| ESPN pull "BLOCKED" | Open that week's `_espn.md` and read the BLOCKING line (tie, unknown team, Ghost mismatch…). Ask Claude in chat |
| Pulse draft failed at "Claude" | Claude token expired (~yearly). PowerShell: `& "$env:USERPROFILE\.local\bin\claude.exe" setup-token`, then update secret `CLAUDE_CODE_OAUTH_TOKEN` |
| Any other red ✗ | Click the failed step and screenshot the last lines for Claude |
| Need to run by hand | Actions → pick the workflow → **Run workflow** (ESPN pull: week + force; Pulse draft: week, or smoke_test) |

## The parts (everything that matters, nothing else)

- **3 robots** (`.github/workflows/`): `espn-weekly-pull.yml` · `pulse-draft.yml` · `claude-mention.yml` (@claude)
- **3 scripts** (`_ops/scripts/`): `maffl_espn_pull.py` (ESPN → report) · `ingest_week.py` (report → gold CSVs) · `pulse_facts.py` (gold → every number)
- **2 instruction docs** (`_ops/docs/`): `ROBOT_PULSE_RECIPE.md` (Claude's weekly steps) · `PULSE_EDITORIAL_GUIDE.md` (your writing rules)
- **3 secrets** (GitHub → Settings → Secrets → Actions): `ESPN_S2`, `SWID`, `CLAUDE_CODE_OAUTH_TOKEN`
- **1 inbox** (`_ops/inbox/`): each week's `_espn.md` report, `_facts.md`, `_datalog.md`, `_pr.md`
- To change the schedule or any robot: ask Claude in chat. Don't hand-edit the workflow files.

## Not done yet (honest list)

- **The robot hasn't drafted a real Pulse yet.** Week 4 (Tue Oct 6) is the first. Read that PR closely.
- **@claude revisions are untested** until that first PR.
- **Stat corrections to earlier weeks are flagged, not applied.** CE-1a stays your call.
- **Retire after one good Tuesday:** the Weekly Results Engine project, screenshots, `CAPTURE_SYSTEM_PROMPT.md`, Colab.
- **Older cleanup (not blocking the robot):** page generators have drifted (never run `build.ps1 -Write`); gen-prize/dues; the quarantined `cleaned_maffl_revised.csv` is still read by validate Gates 1/7, gen-history and gen-draft.
- **The robot never updates** stats/history/draft/credits/power-rankings pages, only `weekly.html` + matchup data.

## How we got here (for the record)

Phase 1 proved `espn-api` + cookies in Colab (Week 3 matched gold, and caught waiver bids the screenshots
missed). Step 2 put the pull on GitHub Actions. Step 3 fixed validate Gate 2 (it read a quarantined CSV).
Step 4 added the drafting robot. It had to split into a Windows data job + a Linux Claude job, because
Claude's action won't install on Windows. Three test runs fixed: Windows console emoji, the split, and an
expired git token on push. Connection test passed 2026-09-30.
