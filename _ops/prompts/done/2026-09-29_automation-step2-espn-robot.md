# Weekly automation Step 2 — install the ESPN "Tuesday robot" (GitHub Actions workflow)

VERSION: none

Date: 2026-09-29 · Author: Claude (chat) · Scope: one new file, `.github/workflows/espn-weekly-pull.yml`.
No site pages or data files change. Plan: `_ops/docs/WEEKLY_AUTOMATION_PLAN.md` (Step 2).

Read first: `_ops/STATUS.md`, `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`. If anything below doesn't match
what you find, **stop and ask**. Don't guess. No `*.bak` files.

Context: chat has already written `_ops/scripts/maffl_espn_pull.py` **v0.4** (robot mode: finds the
latest completed week, writes `_ops/inbox/MAFFL_2026_WeekNN_espn.md`, skips weeks already pulled,
tells the workflow READY/BLOCKED). This prompt only adds the workflow that runs it on a schedule.
The two ESPN cookies go in as GitHub repository secrets; the commissioner adds those on github.com
himself. **Never** put cookie values in any file.

---

## Step 1 — Pre-checks

- `Test-Path .github/workflows/espn-weekly-pull.yml` → must be **False**. If it exists, stop.
- If `.github/workflows/` already has other files, list them in your report and leave them alone.
- `Select-String _ops/scripts/maffl_espn_pull.py -Pattern '^# VERSION: 0.4'` → **1** hit. If not, stop:
  the script in the repo isn't the robot-ready version.

## Step 2 — Create `.github/workflows/espn-weekly-pull.yml`

Create the folders if needed and write this file **verbatim** (spaces only, no tabs; LF line endings
are fine for YAML):

```yaml
# MAFFL ESPN weekly pull — the "Tuesday robot" (Step 2 of _ops/docs/WEEKLY_AUTOMATION_PLAN.md)
# Runs _ops/scripts/maffl_espn_pull.py and commits the report to _ops/inbox/.
# Needs repository secrets ESPN_S2 and SWID. _ops/ is Jekyll-ignored, so nothing here publishes.
name: ESPN weekly pull

on:
  schedule:
    # GitHub schedules are in UTC. 09:00 UTC = 5:00 AM EDT (4:00 AM after the Nov 1 clock change).
    - cron: "0 9 * * 2"    # Tuesday, first try
    - cron: "0 11 * * 2"   # Tuesday, retry if ESPN hadn't finalized yet
    - cron: "0 9 * * 3"    # Wednesday backstop
  workflow_dispatch:        # adds a "Run workflow" button on the Actions tab
    inputs:
      week:
        description: "Week to pull (leave blank for the latest completed week)"
        required: false
        default: ""
      force:
        description: "Re-pull even if that week's report already exists"
        type: boolean
        default: false

permissions:
  contents: write

concurrency:
  group: espn-weekly-pull
  cancel-in-progress: false

jobs:
  pull:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Get the repo
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install espn-api
        run: pip install espn-api

      - name: Pull the week from ESPN
        id: pull
        env:
          ESPN_S2: ${{ secrets.ESPN_S2 }}
          SWID: ${{ secrets.SWID }}
          MAFFL_WEEK: ${{ inputs.week }}
          MAFFL_FORCE: ${{ inputs.force }}
        run: python _ops/scripts/maffl_espn_pull.py

      - name: Save the report to the repo
        if: steps.pull.outputs.report != ''
        run: |
          git config user.name "maffl-espn-robot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add _ops/inbox/
          if git diff --cached --quiet; then
            echo "Report unchanged; nothing to commit."
          else
            git commit -m "ESPN pull: ${{ steps.pull.outputs.title }}"
            git pull --rebase origin main
            git push origin HEAD:main
          fi

      - name: Stop with an error if the week is BLOCKED
        if: steps.pull.outputs.blocked == 'true'
        run: |
          echo "::error::ESPN pull is BLOCKED. Open ${{ steps.pull.outputs.report }} and read the BLOCKING line."
          exit 1
```

Verify:
- The file has no tab characters: `Select-String .github/workflows/espn-weekly-pull.yml -Pattern "`t"` → **0** hits.
- `Select-String .github/workflows/espn-weekly-pull.yml -Pattern 'secrets\.(ESPN_S2|SWID)'` → **2** hits.
- If Python is available locally: `python -c "import ast; ast.parse(open('_ops/scripts/maffl_espn_pull.py', encoding='utf-8').read())"` exits 0.
- `git status` shows only the new workflow file, plus STATUS and this prompt's move (and
  `_ops/scripts/maffl_espn_pull.py` / `_ops/docs/WEEKLY_AUTOMATION_PLAN.md` if chat's edits are uncommitted).
- No page changed, so no mobile check is needed. Jekyll ignores `.github/`, so the site doesn't change.

## Step 3 — Close out

Report the diff summary. `git mv` this prompt to `_ops/prompts/done/`, update `_ops/STATUS.md` with
the block below. One commit.

Suggested commit message: `Automation Step 2: ESPN weekly pull workflow + pull script v0.4 (robot mode)`

After the commit is pushed, the commissioner will add the two secrets and press "Run workflow" to test.

---

STATUS:
- Recently shipped (top): `2026-09-29 · Automation Step 2 installed: .github/workflows/espn-weekly-pull.yml (Tue 5 & 7 AM ET + Wed backstop) runs pull script v0.4 → _ops/inbox/. Needs secrets ESPN_S2 + SWID; first test run pending`
- Now → replace the "Weekly automation" bullet with: `**Weekly automation (ESPN → drafted Pulse PR).** Plan: `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`. Step 1 ✅. Step 2: workflow installed; add secrets + test run. **New habit: in GitHub Desktop, Fetch/Pull before starting work** (the robot commits to main). Screenshots stay the live process until the robot's first real Tuesday succeeds.`
- Queued prompts: remove this prompt's line.
