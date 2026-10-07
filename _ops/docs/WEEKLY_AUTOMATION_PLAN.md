# MAFFL Weekly Robot, on one page

Updated 2026-10-06 · Built 2026-09-29/30 (Mike + Claude) · Replaces the older step-by-step build plan

## What happens every Tuesday (no one lifts a finger)

| When (ET) | What | Where you see it |
|---|---|---|
| **5:07 AM: Claude scheduled task "MAFFL Tuesday Pulse kickoff"** starts the pull on time, watches the chain, re-runs a flaky failure once, and sends you a phone/email report. GitHub's own timers (1:17–7:23 AM, Wed backstop) stay as a backup; on Oct 6 they ran ~7 h late | **ESPN pull**: scores, top-3 scorers, waivers/trades, stat-correction check, next week's pairings, 8 safety checks | `_ops/inbox/MAFFL_2026_WeekNN_espn.md` |
| right after | **Data job** (no AI): adds the week to the gold CSVs, refreshes the matchup files, validate 8/8, computes every number | branch `pulse/2026-weekNN` |
| right after | **Claude** writes the Week object in `weekly.html` using the editorial guide, then opens a pull request | GitHub → **Pull requests** → "Weekly Pulse: Week N draft" |

**Nothing goes on the site until you click Merge.** If anything fails, GitHub emails you and nothing is drafted.

ESPN stat corrections to earlier weeks are applied automatically and listed in the PR under "Stat corrections applied". A ⚠️ at the top means a result flipped: read that before merging.

## Your Tuesday routine

1. Open the pull request (phone is fine). Read Claude's summary: headline, checks, "Needs your OK".
2. Want changes? Comment `@claude …` in plain English (e.g. "@claude lead with the Reilly game"). Claude edits the draft.
3. Happy? Click **Merge pull request**, then **Confirm merge**. The site updates in a minute or two.
4. Nothing to do on the computer. Edits happen in a claude.ai chat, which always starts from the latest `main`. (If you do open the desktop copy, Fetch/Pull first.)
5. **Merge each week's PR before the next Tuesday.** The robot won't draft a week while the previous one is still unmerged. It emails you instead.

**Fallback:** if the robot fails, the 5:07 AM report says why. Ask Claude in chat to fix it, or to draft the Week N Pulse from the inbox.

## If something breaks

| Symptom | Fix |
|---|---|
| Email: ESPN pull failed, "Could not open the league" | ESPN cookies expired (~yearly). Get `espn_s2` + `SWID` again (Chrome F12 → Application → Cookies) and update the two GitHub secrets |
| ESPN pull "BLOCKED" | Open that week's `_espn.md` and read the BLOCKING line (tie, unknown team, Ghost mismatch…). Ask Claude in chat |
| Pulse draft failed at "Claude" | Claude token expired (~yearly). PowerShell: `& "$env:USERPROFILE\.local\bin\claude.exe" setup-token`, then update secret `CLAUDE_CODE_OAUTH_TOKEN` |
| Pulse draft failed and you want to retry it | Open the failed run and click **Re-run failed jobs**. (**Run workflow** does nothing while the `pulse/2026-weekNN` branch exists. Delete that branch first if you want a fresh start.) |
| Email: "Week N−1 isn't in gold on main yet" | Last week's Pulse PR wasn't merged. Merge it. The Wednesday backstop drafts this week by itself, or use Actions → Pulse draft → **Run workflow** (week N). Expect one of these emails per Tuesday retry until you merge. |
| Any other red ✗ | Click the failed step and screenshot the last lines for Claude |
| Need to run by hand | Actions → pick the workflow → **Run workflow** (ESPN pull: week + force; Pulse draft: week, or smoke_test) |

## The parts (everything that matters, nothing else)

- **4 robots** (`.github/workflows/`): `espn-weekly-pull.yml` · `pulse-draft.yml` · `claude-mention.yml` (@claude) · `rehearsal.yml` (re-draft a published week into a PR to close; button only after 2026-09-30)
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
- **Older cleanup (not blocking the robot):** page generators have drifted (never run `build.ps1 -Write`). Fixed 10/6: gen-prize/dues, and `cleaned_maffl_revised.csv` replaced by the generated `MAFFL_Owner_Seasons.csv`.
- **The robot never updates** stats/history/draft/credits/power-rankings pages, only `weekly.html` + matchup data.

## How we got here (for the record)

Phase 1 proved `espn-api` + cookies in Colab (Week 3 matched gold, and caught waiver bids the screenshots
missed). Step 2 put the pull on GitHub Actions. Step 3 fixed validate Gate 2 (it read a quarantined CSV).
Step 4 added the drafting robot. It had to split into a Windows data job + a Linux Claude job, because
Claude's action won't install on Windows. Three test runs fixed: Windows console emoji, the split, and an
expired git token on push. Connection test passed 2026-09-30.
