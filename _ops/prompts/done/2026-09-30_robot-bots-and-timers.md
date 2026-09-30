# Robot fixes: let our own bot start Claude, and pull earlier with more retries

VERSION: none

Date: 2026-09-30 · Author: Claude (chat) · Scope: small edits to `.github/workflows/pulse-draft.yml` and
`.github/workflows/espn-weekly-pull.yml`. No pages or data change.

Why (from the Week 3 rehearsal, 9/30):
1. **The schedule ran 6 hours late** (set for 10:00 UTC, started ~16:20 UTC). GitHub's timer is best-effort,
   and on-the-hour jobs queue the longest. Fix: start the Tuesday pull at 1:17 AM ET, at odd minutes, with
   retries through the morning. Extra runs are harmless: a week that's already pulled, or not final yet, just
   exits quietly.
2. **Claude refused to run** in the rehearsal draft: `non-human actor: github-actions (type: Bot). Add bot to
   allowed_bots`. When the robot chain starts the Pulse draft, the actor is our own `github-actions` bot. Fix:
   allow that one bot.

Read first: `_ops/STATUS.md`. If an anchor doesn't match exactly, **stop and ask**. No `*.bak` files.

## Step 1 — `.github/workflows/pulse-draft.yml`: allow our bot (3 places)

The line `          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` appears **exactly 3 times**
(Claude writes the Pulse / Claude rehearsal / Claude connection test). Directly after **each** of the 3, add
this line at the same indentation:

```
          allowed_bots: "github-actions"
```

Don't change `claude-mention.yml`. That one is started by human comments and stays owner-only.

## Step 2 — `.github/workflows/espn-weekly-pull.yml`: earlier, off-the-hour timers

Find (exactly once):

```
    # GitHub schedules are in UTC. 09:00 UTC = 5:00 AM EDT (4:00 AM after the Nov 1 clock change).
    - cron: "0 9 * * 2"    # Tuesday, first try
    - cron: "0 11 * * 2"   # Tuesday, retry if ESPN hadn't finalized yet
    - cron: "0 9 * * 3"    # Wednesday backstop
```

Replace with:

```
    # GitHub schedules are in UTC and can start hours late (on-the-hour slots are busiest), so we use
    # odd minutes and several tries. Times below are EDT (one hour earlier ET after the Nov 1 clock change).
    # Each run exits quietly if the week is already pulled or not final yet.
    - cron: "17 5 * * 2"   # Tue 1:17 AM
    - cron: "47 6 * * 2"   # Tue 2:47 AM
    - cron: "13 8 * * 2"   # Tue 4:13 AM
    - cron: "37 9 * * 2"   # Tue 5:37 AM
    - cron: "23 11 * * 2"  # Tue 7:23 AM
    - cron: "41 9 * * 3"   # Wed 5:41 AM backstop
```

Change nothing else in that file.

## Step 3 — Verify

- `Select-String .github/workflows/pulse-draft.yml -Pattern 'allowed_bots'` → **3** hits.
- `Select-String .github/workflows/espn-weekly-pull.yml -Pattern 'cron:'` → **6** hits. No tabs in either file.
- `git status`: the two workflow files, STATUS, this prompt's move (plus the one-pager if chat's edit is uncommitted).

## Step 4 — Close out

`git mv` this prompt to `_ops/prompts/done/`, update `_ops/STATUS.md`, commit, **push**.

Suggested commit message: `Robot: allow github-actions bot to start Claude; Tuesday pull 1:17 AM ET + retries`

---

STATUS:
- Recently shipped (top): `2026-09-30 · Rehearsal findings fixed: pulse-draft allows the github-actions bot (Claude had refused a bot-started run); ESPN pull now tries Tue 1:17/2:47/4:13/5:37/7:23 AM ET + Wed backstop (the one-off 6 AM schedule ran 6 h late). Re-run Actions → Rehearsal to confirm.`
- Queued prompts: remove this prompt's line.
