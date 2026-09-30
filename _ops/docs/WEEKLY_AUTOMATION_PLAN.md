# Weekly Automation Plan — "Wake up to a drafted Pulse"

Date: 2026-09-29 · Author: Claude (chat) · Status: approved direction, Steps 1–2 done, Step 3 next

## Goal

Every Tuesday morning a draft Weekly Pulse is waiting as a GitHub **pull request** (a proposed
change that isn't live yet). Mike reads it, gives the approach in plain-English comments, Claude
revises, and Mike clicks **Merge** to publish.

## What we proved (2026-09-29)

- `_ops/scripts/maffl_espn_pull.py` with the open-source `espn-api` library and Mike's
  `espn_s2`/`SWID` cookies reads both leagues (Upper 34467, Lower 1587593698).
- Live Week 3 pull matched gold on all 11 games and the 👻 par (151.47).
- ESPN quirks seen: trailing space on "Portly Primates ", co-owner order/case differs,
  "Bo Kes" and "David Murello" alone as owner labels. The script maps by **team name** only, so
  these can't mis-credit a game.

## Where each piece runs

| Place | ESPN? | Schedule? | Role |
|---|---|---|---|
| Claude in Cowork (cloud) | Blocked | Yes, but can't reach GitHub either | Review/steer conversations, write prompts |
| Google Colab | Works | Not on free tier | Testing and manual backup |
| **GitHub Actions** | Expected to work | Yes | The Tuesday robot |

## What gets automated

| Pulse ingredient | Source |
|---|---|
| Gold matchup rows, 👻 par | ESPN schedule (proven) |
| Top 3 starters per team, individual high | ESPN box scores |
| Waivers with FAAB $, FA adds, drops, trades | ESPN recent activity |
| Stat-correction audit of earlier weeks | ESPN schedule vs gold |
| Next week's pairings (both tiers) | ESPN schedule; Upper checked vs schedule file |
| Standings, all-play, Survivor, credits | Existing generators from gold CSVs |
| Headline, news reel, Elite 5, notes, featured games | Claude, per `PULSE_EDITORIAL_GUIDE.md` |
| Commish rulings, relegation insurance, dues | Mike, in PR comments |

"League news" = transactions and trades (confirmed by Mike). Message board not needed.

## Build order

1. ✅ **Grow the script** — full week in one report shaped like capture v2.2 output, plus
   next-week pairings. v0.3.1 matched Week 3 gold and found waiver claims the screenshots missed.
2. ✅ **GitHub robot, data only** (test run 2026-09-29 green) — `.github/workflows/espn-weekly-pull.yml` runs
   script v0.4 Tue 09:00 + 11:00 UTC and Wed 09:00 UTC (5/7 AM EDT), plus a manual "Run workflow"
   button (week + force inputs). Cookies in repo secrets `ESPN_S2`, `SWID`. Writes
   `_ops/inbox/MAFFL_2026_WeekNN_espn.md`, skips weeks already pulled, fails (GitHub emails Mike)
   on BLOCKED, missing secrets or expired cookies. The robot commits to `main`, so Mike fetches/pulls
   in GitHub Desktop before starting work. Retires screenshots and the Weekly Results Engine once a
   real Tuesday succeeds.
3. **Fix `build.ps1` Gate 2** so generators can run unattended.
4. **Claude drafting + PR** — Claude Code on GitHub (token from Mike's Claude subscription)
   appends gold, runs CE-1, writes the Pulse week object, opens a PR. Mike comments, merges.

## Decisions / caveats

- House-rule change at Step 4: the robot's Claude Code edits site files, and Mike approves the
  PR diff instead of running a prompt himself. Approved in principle 2026-09-29.
- Cookies expire (roughly yearly): the robot fails loudly; refresh the two repo secrets.
- The repo is public: drafts and inbox files are visible on GitHub before merge. Secrets aren't.
- Tuesday scores can still get NFL stat corrections; the next week's audit catches them (as today).
- Top performers now include `Pos` (e.g. QB); existing Week 3 rows have it blank.
