# _ops — how MAFFL HQ work gets done

**One source of truth: this repo.** Everything else is a view of it (GitHub, the live site)
or a conversation about it (Claude chat). Nothing gets copied back and forth by hand.

`_ops/` is Jekyll-ignored (leading underscore), so GitHub Pages doesn't publish it. It is
still visible in the GitHub repo itself.

## 1. The loop

**Since 2026-10-06 the usual loop is just a claude.ai chat:** describe the change, and Claude edits the repo in a
cloud workspace, checks it, commits and pushes to `main` (the site updates in a minute or two). Say "PR first" in
the chat to get a pull request to review instead. Rules: `CLAUDE.md` → "Chat sessions". The desktop loop below
still works and is the route for anything that needs the Windows `build\` scripts.

```
 Claude (Cowork chat)            Claude Code (CLI)            GitHub Desktop
 ───────────────────             ─────────────────            ──────────────
 reads live repo files     ──►   runs _ops/prompts/X.md  ──►  review diff, commit, push
 writes _ops/prompts/X.md        moves X.md → done/            → Pages publishes
 updates _ops/STATUS.md          updates _ops/STATUS.md
```

1. **Plan in chat.** Claude reads the real files straight from this folder, so there's no dump or upload.
2. **Claude writes the prompt into `_ops/prompts/`** as `YYYY-MM-DD_short-name.md`.
3. **Tell Claude Code:** `Run _ops/prompts/<file>.md`
4. **Claude Code finishes:** it moves the prompt to `_ops/prompts/done/`, updates `STATUS.md`, and
   reports back.
5. **Commit and push** in GitHub Desktop. The prompt, the change and the status note go in
   one commit, so the history explains itself.

## 2. Folder map

| Path | What lives there | Who writes it |
|---|---|---|
| `_ops/STATUS.md` | **Read this first.** Active work, open items, last shipped. | Both |
| `_ops/prompts/` | Prompts queued for Claude Code | Claude (chat) |
| `_ops/prompts/done/` | Executed prompts, kept as history | Claude Code (moves them) |
| `_ops/docs/` | Lasting reference: editorial guide, capture prompt, design decisions | Either |
| `_ops/inbox/` | Robot output each week: `_espn.md`, `_facts.md`, `_datalog.md`, `_pr.md` (ESPN raw archive is git-ignored) | The robots |
| `_ops/scripts/` | Robot scripts: ESPN pull, ingest, facts calculator | Claude Code prompts |
| `_ops/archive/` | Retired docs worth keeping but not following | Either |
| repo root `CLAUDE.md` | Binding rules for Claude Code | Commish-approved edits |
| repo root `MAFFL_HQ_DATA_GOVERNANCE.md`, `MAFFL_HQ_OPERATIONS_RUNBOOK.md` | Data model + runbook | Commish-approved edits |

## 3. Rules

- **Chat never edits site files.** Claude in chat writes only under `_ops/`. All site code and
  data changes go through a Claude Code prompt.
- **Every prompt has a `VERSION:` line** (per CLAUDE.md) and a `STATUS:` block at the end that
  tells Claude Code what to write into `STATUS.md`.
- **Nothing is "done" until it's committed.** If a prompt ran but isn't pushed, STATUS says so.
- **Don't copy repo files into the Claude project.** If chat needs a file, it reads it here.

## 4. What the claude.ai Project is for now

Only things that are **not** in this repo and rarely change:

- Project instructions (how to work with Mike, pointing here)
- One short pointer doc: `claude/PROJECT_README.md`

No HTML, JS, CSV, or prompts. If you catch yourself uploading a site file to the project,
that's the old workflow.

## 5. Other Claude projects that use docs from here

- **MAFFL Weekly Results Engine** gets its instructions from `_ops/docs/CAPTURE_SYSTEM_PROMPT.md`
  and `_ops/docs/PULSE_EDITORIAL_GUIDE.md`. When either changes here, re-paste it there.
  (Retiring: after the robot's first good Tuesday, this project and the capture prompt go away. See `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`.)
