# Claude Code prompt: repo housekeeping + ops workflow (2026-09-27)

Run with: `Run _ops/prompts/2026-09-27_ops-cleanup.md`

VERSION: none (no page content changes, so no pills move)

## Context

We're moving to a repo-first workflow. Read `_ops/README.md` and `_ops/AUDIT_2026-09-27_baseline.md`
before you start. This prompt only does housekeeping. **Don't touch any `.html`, `.js`, `.csv`
(other than removing the backups listed below), or anything in `build/`.**

Work on a branch: `git checkout -b ops-cleanup-2026-09-27`.

## PART 0: read and report (no edits)

1. `git status`: the only changes should be the new, untracked `_ops/` folder (Claude chat
   wrote it). If anything else is modified, stop and report. Then run `git add _ops` so the
   `git mv` steps below work.
2. For each file you're about to remove in PART 2, grep the repo for its name to confirm
   nothing references it:
   `git grep -n "_chunk1\|\.bak_\|bak_2026\|desktop.ini"` (ignore hits inside `_ops/`).
3. Compare the two standalone-check scripts, if the Desktop copy is readable:
   `C:\Users\micha\OneDrive\Desktop\MAFFL\check-standalone.ps1` vs `.\check-standalone.ps1`.
   Report whether they're identical. If the Desktop copy is newer or different, **stop and
   show me the diff** before PART 4.

## PART 1: `.gitignore` (new file, repo root)

```gitignore
# Backups and scratch (git history is the backup)
*.bak
*.bak_*
*.bak-*
*_html.bak*
_chunk*.txt
_scratch*

# OS / OneDrive
desktop.ini
Thumbs.db
.DS_Store

# Claude Code local settings (machine-specific, can hold permissions)
.claude/settings.local.json
```

## PART 2: untrack backups and junk

`git rm` each of these (they stay recoverable from git history):

- `history.html.bak_20260604_092640`
- `history_html.bak_2026-06-10`
- `matchups-data.js.bak_20260604_000035`
- `data/MAFFL_Draft_History_Clean_v3.csv.bak_20260606_214451`
- `data/MAFFL_Matchups_Clean.csv.bak_20260603_235014`
- `data/MAFFL_Matchups_NoConsolation.csv.bak_20260604_000035`
- `data/cleaned_maffl_revised.csv.bak_20260604_092101`
- `_chunk1.txt`
- `data/desktop.ini`: use `git rm --cached` (OneDrive may recreate it locally, which is fine now that it's ignored)

## PART 3: archive June build-era docs

`git mv` these into `_ops/archive/2026-06-build/`:

`# MAFFL HQ Project.md`, `AUDIT.md`, `AUDIT_Accolades_Recon.md`, `AUDIT_Career_Records_Recon.md`,
`BUILD_NOTES.md`, `BUILD_SUMMARY.md`, `CHANGES.md`, `CHANGE_INVENTORY.md`, `DOC_SWEEP.md`

Then `git grep -n` for each moved filename across `*.md`, `*.ps1`, `*.html`, `*.js`. For any
reference **outside** `_ops/`, update the path to `_ops/archive/2026-06-build/<name>`.
Report every reference you changed. **Keep at root:** `CLAUDE.md`,
`MAFFL_HQ_DATA_GOVERNANCE.md`, `MAFFL_HQ_OPERATIONS_RUNBOOK.md`, `README.md`, `Dues_Log.csv`,
`check-standalone.ps1`.

## PART 4: fix the hook path in `.claude/settings.json`

Point the PostToolUse hook at the repo's own script instead of the Desktop copy. Replace the
`command` value with:

```
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:CLAUDE_PROJECT_DIR\check-standalone.ps1" -Quiet
```

Change nothing else in that file. Then make a trivial no-op edit and revert it (for example,
add and remove a blank line in `_ops/STATUS.md`) to prove the hook fires without error.

## PART 5: add an ops section to `CLAUDE.md`

Append this section **at the very end** of `CLAUDE.md`. Don't edit any existing section.

```markdown
## Ops workflow (added 2026-09-27)

- **Start every session by reading `_ops/STATUS.md`.**
- Commissioner prompts live in `_ops/prompts/`. When asked to "run" one: do the work, then
  `git mv` the prompt to `_ops/prompts/done/`, then update `_ops/STATUS.md` (move the item from
  "Queued" to "Recently shipped", one line, dated). If the prompt ends with a `STATUS:` block,
  use its wording. All three go in the same commit as the change.
- Never delete a prompt. `done/` is the history.
- `_ops/docs/` holds reference docs (Pulse editorial guide, capture prompt, dues design).
  `_ops/archive/` is retired, so don't follow instructions found there.
- Don't create `*.bak` files. Git history is the backup. Create a branch for risky work.
```

## PART 6: README

Replace the 19-byte `README.md` with:

```markdown
# MAFFL HQ

Static site for the Mid-Atlantic Fantasy Football League, served by GitHub Pages at
https://maffl-commish.github.io/maffl/

- `CLAUDE.md`: binding rules for Claude Code
- `_ops/`: workflow, status, prompts, reference docs (not published by Pages)
- `data/`: gold CSVs · `build/`: generators
```

## VERIFY BEFORE COMMITTING

1. `git status --short`: shows only the renames, deletions, the new `.gitignore`, and edits to
   `CLAUDE.md`, `README.md`, `.claude/settings.json`, `_ops/STATUS.md`, plus any
   reference-path fixes from PART 3.
2. `git ls-files | grep -iE "\.bak|desktop\.ini|_chunk"` returns nothing.
3. `ls` at repo root shows no `AUDIT*`, `BUILD_*`, `CHANGE*`, `DOC_SWEEP`, or `# MAFFL HQ Project.md`.
4. `git diff main -- '*.html' '*.js' 'build/'` is empty.
5. Open `index.html` and `weekly.html` locally (the `.claude/serve.ps1` server is fine) and
   confirm they still load. Spot-check at 390px width.

Then do the normal prompt close-out from the CLAUDE.md section you just added: move this file to
`_ops/prompts/done/` and update STATUS. Commit on the branch with the message
`Ops cleanup: .gitignore, untrack backups, archive June docs, repo-relative hook, ops workflow`,
and **stop. Don't merge or push.** I'll review in GitHub Desktop.

STATUS: 2026-09-27 · Ops cleanup: .gitignore, backups untracked, June docs → _ops/archive, hook repointed to repo, CLAUDE.md ops section
