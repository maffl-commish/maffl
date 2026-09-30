# Pulse-draft robot: fix the final push (restore the workflow's own git login)

VERSION: none

Date: 2026-09-29 · Author: Claude (chat) · Scope: one small edit in `.github/workflows/pulse-draft.yml`.

Why: connection test #3 passed the data job and Claude's step, then failed at the last push with
`remote: Invalid username or token … fatal: Authentication failed` (exit 128). Claude's GitHub action
points git at its own short-lived token, which expires when the action step ends. Before pushing,
we reset git to the workflow's `GITHUB_TOKEN`.

Read first: `_ops/STATUS.md`. If the anchor doesn't match exactly, **stop and ask**. No `*.bak` files.

## Step 1 — Edit `.github/workflows/pulse-draft.yml`

In the **write** job's last step ("Commit, push and open the pull request"), find this block (exactly once;
the `if [ "$MODE"` line makes it unique, since the data job has the same two `git config` lines in PowerShell):

```
          git config user.name "maffl-pulse-robot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          if [ "$MODE" = "smoke" ]; then
```

Replace with:

```
          git config user.name "maffl-pulse-robot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          # Claude's action leaves git pointed at its own token, which has expired by now: use ours.
          git config --local --unset-all http.https://github.com/.extraheader || true
          git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
          if [ "$MODE" = "smoke" ]; then
```

Change nothing else.

## Step 2 — Verify

- `Select-String .github/workflows/pulse-draft.yml -Pattern 'x-access-token'` → **1** hit. No tab characters.
- `git status`: only the workflow file, STATUS, and this prompt's move.

## Step 3 — Close out

`git mv` this prompt to `_ops/prompts/done/`, update `_ops/STATUS.md` with the block below. One commit.

Suggested commit message: `Pulse-draft robot: reset git auth before the final push`

---

STATUS:
- Recently shipped (top): `2026-09-29 · Pulse-draft robot: data job ✅ and Claude ✅ on test #3; final push failed on expired action token, fixed by resetting git auth to GITHUB_TOKEN. Re-run the connection test.`
- Queued prompts: remove this prompt's line.
