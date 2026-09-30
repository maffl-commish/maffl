# Robot rehearsal: re-run the whole Tuesday chain on Week 3, ending in a PR to close

VERSION: none

Date: 2026-09-30 · Author: Claude (chat) · Scope: replace `.github/workflows/pulse-draft.yml` (adds a
`rehearsal` input) and add `.github/workflows/rehearsal.yml`. No pages or data change on `main`.

Why: the commissioner wants to wake up to a real end-to-end draft before Week 4. Week 3 is the only finished
week, and it's already published. So the rehearsal re-pulls it from ESPN and has Claude re-draft it on a
throwaway branch. The PR is titled "REHEARSAL … (close, don't merge)". `rehearsal.yml` fires once on
**Wed Sep 30, 2026, 6:00 AM ET** and also has a Run workflow button. Chat has already updated
`_ops/docs/ROBOT_PULSE_RECIPE.md` to v0.4: the PR summary now carries the full draft as readable text,
and §7 covers rehearsal mode.

Read first: `_ops/STATUS.md`. If anything doesn't match, **stop and ask**. No `*.bak` files.

## Step 1 — Pre-checks

- `.github/workflows/pulse-draft.yml` contains `x-access-token` (the push fix). `rehearsal.yml` doesn't exist yet.
- `Select-String _ops/docs/ROBOT_PULSE_RECIPE.md -Pattern 'VERSION: 0.4'` → 1 hit.
- `.github/workflows/espn-weekly-pull.yml` has inputs `week` and `force`. Leave it unchanged.

## Step 2 — Replace `.github/workflows/pulse-draft.yml` entirely (verbatim)

```yaml
# MAFFL Pulse draft — Step 4 of _ops/docs/WEEKLY_AUTOMATION_PLAN.md
# Runs after "ESPN weekly pull" succeeds (or by hand). Two jobs:
#   1. data  (Windows, no AI): append the week to gold, run the CE-1 generator + validate,
#            compute the facts file, push branch pulse/2026-weekNN.
#   2. write (Linux, Claude): write the Week object in weekly.html per
#            _ops/docs/ROBOT_PULSE_RECIPE.md, then open a pull request for the commissioner.
# Nothing publishes until he merges. Needs secret CLAUDE_CODE_OAUTH_TOKEN and the repo setting
# "Allow GitHub Actions to create and approve pull requests".
# (Claude's GitHub action can't install on Windows runners, hence the split.)
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
      rehearsal:
        description: "Rehearsal: re-draft an already-published week (needs 'week'); opens a REHEARSAL PR to close"
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
  data:
    if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
    runs-on: windows-latest   # CE-1 scripts need Windows PowerShell 5.1
    timeout-minutes: 20
    outputs:
      mode: ${{ steps.pick.outputs.mode }}
      week: ${{ steps.pick.outputs.week }}
      branch: ${{ steps.pick.outputs.branch }}
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
          REHEARSAL: ${{ inputs.rehearsal }}
        run: |
          if ($env:REHEARSAL -eq 'true') {
            if (-not $env:INPUT_WEEK) { Write-Error "Rehearsal needs a week number."; exit 1 }
            "mode=rehearsal" >> $env:GITHUB_OUTPUT
            "week=$([int]$env:INPUT_WEEK)" >> $env:GITHUB_OUTPUT
            $rb = "rehearsal/2026-week{0:D2}-{1}" -f [int]$env:INPUT_WEEK, (Get-Date -Format 'yyyyMMdd-HHmm')
            "branch=$rb" >> $env:GITHUB_OUTPUT
            exit 0
          }
          if ($env:SMOKE -eq 'true') {
            "mode=smoke" >> $env:GITHUB_OUTPUT
            "week=3" >> $env:GITHUB_OUTPUT
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

      - name: Gold data, generator, validate, facts
        if: steps.pick.outputs.mode != 'none'
        shell: pwsh
        run: |
          $ErrorActionPreference = 'Continue'   # native tools report via exit codes; Step() throws on a bad one
          $w = [int]"${{ steps.pick.outputs.week }}"
          $mode = "${{ steps.pick.outputs.mode }}"
          $log = "_ops/inbox/MAFFL_2026_Week{0:D2}_datalog.md" -f $w
          if ($mode -eq 'smoke') { $log = "_ops/inbox/robot-smoke-data.md" }
          git checkout -b "${{ steps.pick.outputs.branch }}"
          function Step($title, [scriptblock]$cmd, [int[]]$ok) {
            Add-Content $log "`n### $title`n``````"
            $out = & $cmd 2>&1 | Out-String
            $code = $LASTEXITCODE
            Add-Content $log ($out.TrimEnd())
            Add-Content $log "``````  exit $code"
            Write-Host $out
            if ($ok -notcontains $code) { throw "$title failed (exit $code). See $log." }
          }
          Set-Content $log "# Week $w data log (robot, Windows runner)"
          if ($mode -eq 'rehearsal') { Add-Content $log "REHEARSAL: Week $w is already in gold, so ingest + generator are skipped. Validate + facts run as normal." }
          if ($mode -eq 'draft') {
            Step "Append week to gold (ingest_week.py)" { python _ops/scripts/ingest_week.py $w } @(0)
            Step "CE-1 generator, check (expect 1 = additions)" { powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 } @(1)
            Step "CE-1 generator, write" { powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 -Write } @(0,1)
            Step "CE-1 generator, re-check (expect 0 = in sync)" { powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 } @(0)
          }
          Step "validate (expect 0 = 8/8)" { powershell -ExecutionPolicy Bypass -File build\validate.ps1 } @(0)
          Step "Facts calculator" { python _ops/scripts/pulse_facts.py $w } @(0)
          if ($mode -eq 'smoke') { Remove-Item ("_ops/inbox/MAFFL_2026_Week{0:D2}_facts.md" -f $w) }
          git config user.name "maffl-pulse-robot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "Week $w data: CE-1 + facts ($mode)"
          git push -u origin HEAD

  write:
    needs: data
    if: needs.data.outputs.mode != 'none' && needs.data.outputs.mode != ''
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - name: Get the draft branch
        uses: actions/checkout@v4
        with:
          ref: ${{ needs.data.outputs.branch }}
          fetch-depth: 0

      - name: Claude writes the Pulse
        if: needs.data.outputs.mode == 'draft'
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            W = ${{ needs.data.outputs.week }}.
            Read _ops/docs/ROBOT_PULSE_RECIPE.md and follow it exactly for Week W of 2026.
            The gold data, CE-1 files and facts file are already done on this branch (see the data log).
            Don't commit, push or open a PR.
          claude_args: |
            --max-turns 150
            --allowedTools "Bash,Read,Edit,Write,Glob,Grep"

      - name: Claude rehearsal (re-draft a published week)
        if: needs.data.outputs.mode == 'rehearsal'
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            W = ${{ needs.data.outputs.week }}. This is a REHEARSAL. It will never be merged.
            Read _ops/docs/ROBOT_PULSE_RECIPE.md and follow it for Week W of 2026, with the changes in its §7 "Rehearsal mode".
            Don't commit, push or open a PR.
          claude_args: |
            --max-turns 150
            --allowedTools "Bash,Read,Edit,Write,Glob,Grep"

      - name: Claude connection test
        if: needs.data.outputs.mode == 'smoke'
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            This is a connection test. Change no file except the one below.
            Read _ops/inbox/robot-smoke-data.md (written by the Windows data job) and _ops/docs/ROBOT_PULSE_RECIPE.md.
            Run: node --version
            Create _ops/inbox/robot-smoke-test_pr.md with: a line "## Robot connection test",
            a 3-line summary of the data log (did validate pass 8/8, did the facts calculator run),
            the node version, and one sentence confirming you read the recipe.
            End with: "This is a test. Close this pull request without merging."
          claude_args: |
            --max-turns 20
            --allowedTools "Bash,Read,Edit,Write,Glob,Grep"

      - name: Commit, push and open the pull request
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MODE: ${{ needs.data.outputs.mode }}
          WEEK: ${{ needs.data.outputs.week }}
          BRANCH: ${{ needs.data.outputs.branch }}
        run: |
          git config user.name "maffl-pulse-robot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          # Claude's action leaves git pointed at its own token, which has expired by now: use ours.
          git config --local --unset-all http.https://github.com/.extraheader || true
          git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
          if [ "$MODE" = "smoke" ]; then
            TITLE="TEST: robot connection test (close, don't merge)"; BODY="_ops/inbox/robot-smoke-test_pr.md"
          elif [ "$MODE" = "rehearsal" ]; then
            TITLE="REHEARSAL: Week $WEEK redo (close, don't merge)"; BODY=$(printf "_ops/inbox/MAFFL_2026_Week%02d_pr.md" "$WEEK")
          else
            TITLE="Weekly Pulse: Week $WEEK draft"; BODY=$(printf "_ops/inbox/MAFFL_2026_Week%02d_pr.md" "$WEEK")
          fi
          git add -A
          git diff --cached --quiet || git commit -m "$TITLE"
          git push origin HEAD
          if [ ! -f "$BODY" ]; then
            BODY="$RUNNER_TEMP/pr-body.md"
            echo "Claude didn't write a summary file. Check the 'Claude' step in this run's log before merging." > "$BODY"
          fi
          gh pr create --base main --head "$BRANCH" --title "$TITLE" --body-file "$BODY"
```

## Step 3 — Create `.github/workflows/rehearsal.yml` (verbatim)

```yaml
# MAFFL rehearsal: the full Tuesday chain on an already-published week, ending in a PR to CLOSE.
#   1. ESPN weekly pull (re-pulls the week from ESPN, force)
#   2. waits for it to finish
#   3. Pulse draft in rehearsal mode (Claude re-drafts the week on a throwaway branch)
# Runs once by schedule (Wed Sep 30, 2026, 6:00 AM ET) and any time from the "Run workflow" button.
name: Rehearsal

on:
  schedule:
    - cron: "0 10 30 9 *"   # Sep 30, 10:00 UTC = 6:00 AM EDT (guarded to 2026 below)
  workflow_dispatch:
    inputs:
      week:
        description: "Already-published week to rehearse"
        required: false
        default: "3"

permissions:
  actions: write
  contents: read

jobs:
  rehearse:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GH_REPO: ${{ github.repository }}
      WEEK: ${{ inputs.week || '3' }}
    steps:
      - name: Only the 2026 schedule date (manual runs always go)
        id: gate
        run: |
          if [ "${{ github.event_name }}" = "schedule" ] && [ "$(date -u +%Y)" != "2026" ]; then
            echo "go=false" >> "$GITHUB_OUTPUT"; echo "Not 2026: nothing to do."
          else
            echo "go=true" >> "$GITHUB_OUTPUT"
          fi

      - name: 1. ESPN pull (week ${{ env.WEEK }}, forced)
        if: steps.gate.outputs.go == 'true'
        run: |
          gh workflow run espn-weekly-pull.yml -f week="$WEEK" -f force=true
          sleep 20
          RUN=$(gh run list --workflow espn-weekly-pull.yml --event workflow_dispatch --limit 1 --json databaseId -q '.[0].databaseId')
          echo "Watching ESPN pull run $RUN"
          gh run watch "$RUN" --exit-status --interval 20

      - name: 2. Pulse draft, rehearsal mode
        if: steps.gate.outputs.go == 'true'
        run: |
          sleep 60   # let the automatic post-pull draft run (a no-op for a published week) get out of the way
          gh workflow run pulse-draft.yml -f week="$WEEK" -f rehearsal=true
          echo "Started. The REHEARSAL pull request appears in about 10 minutes."
```

## Step 4 — Verify

- No tabs in either file. `Select-String .github/workflows/pulse-draft.yml -Pattern 'rehearsal'` → several hits,
  including `mode == 'rehearsal'`. `x-access-token` still present (1 hit).
- `git status`: the two workflow files, STATUS, this prompt's move (plus the recipe if uncommitted).

## Step 5 — Close out

`git mv` this prompt to `_ops/prompts/done/`, update `_ops/STATUS.md`, one commit, and **push tonight** so
the 6:00 AM schedule sees it.

Suggested commit message: `Robot rehearsal: Week 3 end-to-end dry run (scheduled Sep 30 6 AM ET) + readable PR summary`

---

STATUS:
- Recently shipped (top): `2026-09-30 · Rehearsal workflow + pulse-draft rehearsal mode; recipe v0.4 (full draft as readable text in the PR). Week 3 rehearsal scheduled Wed Sep 30 6:00 AM ET: expect a "REHEARSAL: Week 3 redo" PR to review on the phone, then close.`
- Queued prompts: remove this prompt's line.
