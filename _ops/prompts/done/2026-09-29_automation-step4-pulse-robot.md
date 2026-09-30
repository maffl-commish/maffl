# Weekly automation Step 4: install the Pulse-draft robot and the "@claude" comment helper

VERSION: none

Date: 2026-09-29 · Author: Claude (chat) · Scope: two new files in `.github/workflows/`. No site pages
or data change. Plan: `_ops/docs/WEEKLY_AUTOMATION_PLAN.md` (Step 4).

Read first: `_ops/STATUS.md`, `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`, `_ops/docs/ROBOT_PULSE_RECIPE.md`.
If anything below doesn't match what you find, **stop and ask**. Don't guess. No `*.bak` files.

Context: chat has already written `_ops/docs/ROBOT_PULSE_RECIPE.md` (the robot's weekly instructions)
and `_ops/scripts/pulse_facts.py` (the numbers calculator; it reproduces the published Week 3 object
exactly). The commissioner has added the secret `CLAUDE_CODE_OAUTH_TOKEN`. Never put any token in a file.

---

## Step 1 — Pre-checks

- `Test-Path .github/workflows/pulse-draft.yml` and `Test-Path .github/workflows/claude-mention.yml` → both **False**.
- `Test-Path _ops/docs/ROBOT_PULSE_RECIPE.md` and `Test-Path _ops/scripts/pulse_facts.py` → both **True**.
- `.github/workflows/espn-weekly-pull.yml` exists. Leave it unchanged. Its `name:` must be exactly
  `ESPN weekly pull`, because the new workflow listens for it by that name.

## Step 2 — Create `.github/workflows/pulse-draft.yml` verbatim

```yaml
# MAFFL Pulse draft — Step 4 of _ops/docs/WEEKLY_AUTOMATION_PLAN.md
# After "ESPN weekly pull" succeeds, Claude follows _ops/docs/ROBOT_PULSE_RECIPE.md on a new
# branch and this workflow opens a pull request for the commissioner. Nothing publishes until
# he merges it. Needs secret CLAUDE_CODE_OAUTH_TOKEN and the repo setting
# "Allow GitHub Actions to create and approve pull requests".
name: Pulse draft

on:
  workflow_run:
    workflows: ["ESPN weekly pull"]
    types: [completed]
  workflow_dispatch:
    inputs:
      week:
        description: "Week to draft (blank = newest pulled week that isn't in gold yet)"
        required: false
        default: ""
      smoke_test:
        description: "Connection test only: no data changes, opens a TEST pull request to close"
        type: boolean
        default: false

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

concurrency:
  group: pulse-draft
  cancel-in-progress: false

jobs:
  draft:
    if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
    runs-on: windows-latest   # CE-1 scripts need Windows PowerShell 5.1
    timeout-minutes: 60
    steps:
      - name: Get the repo
        uses: actions/checkout@v4
        with:
          ref: main
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Pick the week
        id: pick
        shell: pwsh
        env:
          INPUT_WEEK: ${{ inputs.week }}
          SMOKE: ${{ inputs.smoke_test }}
        run: |
          if ($env:SMOKE -eq 'true') {
            "mode=smoke" >> $env:GITHUB_OUTPUT
            "week=0" >> $env:GITHUB_OUTPUT
            "branch=robot/smoke-test-$(Get-Date -Format 'yyyyMMdd-HHmm')" >> $env:GITHUB_OUTPUT
            exit 0
          }
          $week = $null
          if ($env:INPUT_WEEK) { $week = [int]$env:INPUT_WEEK }
          else {
            $files = Get-ChildItem _ops/inbox -Filter 'MAFFL_2026_Week*_espn.md' -ErrorAction SilentlyContinue | Sort-Object Name -Descending
            foreach ($f in $files) {
              if ($f.Name -match 'Week(\d+)_espn') {
                $w = [int]$Matches[1]
                if (-not (Select-String -Path data/MAFFL_Matchups_Clean.csv -Pattern "^2026,$w," -Quiet)) { $week = $w; break }
              }
            }
          }
          if (-not $week) { Write-Host "No new week to draft."; "mode=none" >> $env:GITHUB_OUTPUT; exit 0 }
          $branch = "pulse/2026-week{0:D2}" -f $week
          git ls-remote --exit-code --heads origin $branch | Out-Null
          if ($LASTEXITCODE -eq 0) { Write-Host "A draft branch $branch already exists."; "mode=none" >> $env:GITHUB_OUTPUT; exit 0 }
          "mode=draft" >> $env:GITHUB_OUTPUT
          "week=$week" >> $env:GITHUB_OUTPUT
          "branch=$branch" >> $env:GITHUB_OUTPUT
          exit 0

      - name: Make the draft branch
        if: steps.pick.outputs.mode != 'none'
        shell: pwsh
        run: git checkout -b "${{ steps.pick.outputs.branch }}"

      - name: Claude drafts the Pulse
        if: steps.pick.outputs.mode == 'draft'
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            W = ${{ steps.pick.outputs.week }}.
            Read _ops/docs/ROBOT_PULSE_RECIPE.md and follow it exactly for Week W of 2026.
            You are on branch ${{ steps.pick.outputs.branch }}. Don't commit, push or open a PR.
          claude_args: |
            --max-turns 150
            --allowedTools "Bash,Read,Edit,Write,Glob,Grep"

      - name: Claude connection test
        if: steps.pick.outputs.mode == 'smoke'
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            This is a connection test on a Windows runner. Change no file except the one below.
            1. Run: powershell -ExecutionPolicy Bypass -File build\validate.ps1
            2. Run: python _ops/scripts/pulse_facts.py 3   (it writes a facts file; the workflow deletes it afterwards)
            3. Run: python --version ; node --version
            4. Create _ops/inbox/robot-smoke-test_pr.md with: a line "## Robot connection test",
               the validate gate summary, whether pulse_facts.py ran, the two version lines, and one
               sentence confirming you could read _ops/docs/ROBOT_PULSE_RECIPE.md.
               End with: "This is a test. Close this pull request without merging."
          claude_args: |
            --max-turns 30
            --allowedTools "Bash,Read,Edit,Write,Glob,Grep"

      - name: Commit, push and open the pull request
        if: steps.pick.outputs.mode != 'none'
        shell: pwsh
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git config user.name "maffl-pulse-robot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          if ("${{ steps.pick.outputs.mode }}" -eq "smoke") { Remove-Item _ops/inbox/MAFFL_2026_Week03_facts.md -ErrorAction SilentlyContinue }
          git add -A
          if (-not (git status --porcelain)) { Write-Error "Claude made no changes. Open this run's log."; exit 1 }
          if ("${{ steps.pick.outputs.mode }}" -eq "smoke") {
            $title = "TEST: robot connection test (close, don't merge)"
            $body  = "_ops/inbox/robot-smoke-test_pr.md"
          } else {
            $w = "${{ steps.pick.outputs.week }}"
            $title = "Weekly Pulse: Week $w draft"
            $body  = "_ops/inbox/MAFFL_2026_Week{0:D2}_pr.md" -f [int]$w
          }
          git commit -m "$title"
          git push -u origin HEAD
          if (-not (Test-Path $body)) {
            $body = "$env:RUNNER_TEMP\pr-body.md"
            Set-Content $body "Claude didn't write a summary file. Check the 'Claude' step in this run's log before merging."
          }
          gh pr create --base main --head "${{ steps.pick.outputs.branch }}" --title "$title" --body-file "$body"
```

## Step 3 — Create `.github/workflows/claude-mention.yml` verbatim

```yaml
# "@claude" on a pull request or issue → Claude makes the requested change on that branch.
# Only the repo owner/members/collaborators can trigger it (the repo is public).
name: Claude on comments

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

jobs:
  claude:
    if: |
      contains(github.event.comment.body, '@claude') &&
      contains(fromJSON('["OWNER","MEMBER","COLLABORATOR"]'), github.event.comment.author_association)
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Get the repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Claude
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          claude_args: |
            --max-turns 40
            --append-system-prompt "This is the MAFFL HQ repo. For Weekly Pulse drafts, follow _ops/docs/ROBOT_PULSE_RECIPE.md and _ops/docs/PULSE_EDITORIAL_GUIDE.md. Take numbers from _ops/inbox/*_facts.md, never from memory. Never run build/build.ps1 -Write."
```

## Step 4 — Verify

- Neither file has tab characters.
- `Select-String .github/workflows/*.yml -Pattern 'CLAUDE_CODE_OAUTH_TOKEN'` → **3** hits (2 in pulse-draft, 1 in claude-mention).
- If Python is available: `python _ops/scripts/pulse_facts.py 3` runs without error and its Upper Div D line
  for Turkey Hat Conglomerate reads `2-1 · points 500.66`. Then **delete** `_ops/inbox/MAFFL_2026_Week03_facts.md`
  (it was just a test).
- `git status` shows only the two new workflow files, STATUS, this prompt's move, and any uncommitted chat files
  (`_ops/docs/ROBOT_PULSE_RECIPE.md`, `_ops/scripts/pulse_facts.py`, `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`).
- No page changed, so no mobile check is needed.

## Step 5 — Close out

Report the diff summary. `git mv` this prompt to `_ops/prompts/done/`, update `_ops/STATUS.md` with the block
below. One commit.

Suggested commit message: `Automation Step 4: Pulse-draft robot + @claude comment helper, recipe + facts calculator`

---

STATUS:
- Recently shipped (top): `2026-09-29 · Automation Step 4 installed: pulse-draft.yml (runs after the ESPN pull; Windows runner; opens "Weekly Pulse: Week N draft" PR), claude-mention.yml (@claude on PRs, owner-only), ROBOT_PULSE_RECIPE.md, pulse_facts.py (matches published Wk 3). Connection test pending.`
- Now → in the "Weekly automation" bullet, replace `Next: Step 4 (Claude drafts the Pulse as a PR).` with
  `Step 4 installed; run the connection test (Actions → Pulse draft → smoke_test), then Week 4 on Tue Oct 6 is the first real draft PR.`
- Queued prompts: remove this prompt's line.
