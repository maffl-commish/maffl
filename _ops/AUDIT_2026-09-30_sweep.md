# Ops Sweep Audit — 2026-09-30

Read-only. Nothing in the repo was changed. Follows up `_ops/AUDIT_2026-09-27_baseline.md`.

**Scope:** full file listing (≈1,900 entries incl. `.git`), every instruction doc (CLAUDE.md, governance,
runbook, `_ops/README`, STATUS, all 7 `_ops/docs`), all 4 workflows, all 4 robot scripts, `build/validate.ps1`,
`generate-matchups-data.ps1`, all 13 HTML pages (pattern checks, not line-by-line), `.gitignore`s, hook settings.
Not read line-by-line: the data CSVs, the page generators other than validate/matchups, raw ESPN JSON.

## Verdict

**In good shape.** The repo-first loop is working as designed: the project is a pointer, STATUS is current
(updated today), the prompt queue is empty, and every executed prompt sits in `done/` with its VERSION and
STATUS lines. The robot's safety design is sound. The drift is in the *older reference docs*, not in the
live instructions — and one robot edge case is worth closing before it bites.

## What's solid

- **Baseline (9/27) findings are closed:** backups/junk gone, `.gitignore` in place, June docs archived,
  README real, standalone hook now points at the in-repo `check-standalone.ps1`.
- **All 13 pages:** iOS standalone tags ✅, GA tag ✅, zero runtime `fetch()` (the one hit in `draft.html`
  is a comment saying it never fetches) ✅.
- **Robot guardrails:** nothing publishes without Merge; ingest refuses duplicates, bad row counts and
  checksum mismatches; stat corrections are flagged, never auto-applied; `build.ps1 -Write` is banned in
  every prompt; `@claude` is owner/collaborator-only; all arithmetic comes from `pulse_facts.py`.
- **Private data stays private:** ESPN raw zip/JSON are git-ignored (repo is public).
- **Pulse live:** `weekly.html` v6.3, `PULSE_STATE = "live"`, Last Updated Sep 30.

## Fix before Week 4 (Tue Oct 6)

1. **Unmerged-PR gap (robot).** If a week's Pulse PR is still open the next Tuesday, `pulse-draft.yml`
   picks the newest pulled week not in gold on `main` — so it drafts Week N+1 on a `main` that's missing
   Week N. `ingest_week.py` and `pulse_facts.py` only check that week N+1 itself is present, and validate's
   Gate 2 reads 2005–2025 only, so standings would be wrong with **no error**.
   *Fix:* in "Pick the week", stop with a clear error if week W−1 isn't in gold (or a
   `pulse/2026-week(W−1)` branch is still open). *Until then:* merge or close each Pulse PR before the next Tuesday.
2. **Re-running a failed draft.** If the Claude step fails, the `pulse/2026-weekNN` branch already exists,
   so Actions → **Run workflow** silently does nothing ("A draft branch … already exists"). Use
   **Re-run failed jobs** on the failed run instead (or delete the branch first). Add that row to the
   "If something breaks" table in `WEEKLY_AUTOMATION_PLAN.md`.
3. **Rehearsal outcome isn't recorded.** The forced Week 3 re-pull ran today 1:31 PM ET (so the re-run
   happened), but STATUS still says "Re-run … to confirm." Record whether the REHEARSAL PR opened and read well.

## Instruction drift (the docs a fresh Claude Code session might follow)

4. **Runbook is the riskiest doc — it contradicts CLAUDE.md/STATUS.** §0–§1 and the Quick reference say
   run `build.ps1 -Write` (now banned); §2 names `cleaned_maffl_revised.csv` as authoritative (now
   CORRUPTED/quarantined), dues source as the League Packet CSV (now `Dues_Log.csv` → `dues_seasons`),
   the power-rankings CSV as "to be created" (exists), weekly as "workflow TBD"; says "no working Python";
   its companion docs all point into `_ops/archive/` (which CLAUDE.md says not to follow); §6 is June-era.
   *Fix:* rewrite §0–§2, Event 5, §6 and the Quick reference, or at minimum a top banner:
   "Build is check-only; see STATUS for what's safe."
5. **Governance doc:** header still says "pre go-live, target 2026-07-01"; §2 says Top Performers are
   "hand-appended from capture v2.1" (robot does it now); **CE-3 (season end) still sources finish flags
   from `cleaned_maffl_revised.csv`** — contradicts §7.2 and CLAUDE.md, and it's the event you'll run in
   January; CE-7 says `dues_2026` (now `dues_seasons`; DUES_PROCESS_NOTE supersedes it).
6. **CLAUDE.md has no robot section.** Local Claude Code doesn't know that weeks arrive via the robot's PR,
   that `_ops/inbox/` is robot-written, or not to hand-append a week / edit `weekly.html` while a Pulse PR
   is open (a guaranteed merge conflict, painful on a phone). Add ~5 lines.
7. **Results Engine references** (editorial guide intro, `_ops/README` §5, `CAPTURE_SYSTEM_PROMPT.md`)
   still describe the screenshot flow as the consumer. Already scheduled to retire after one good Tuesday;
   fold these edits into that retirement prompt.

## Housekeeping (low, whenever)

- `draftday.html` is still published (planned retirement after Labor Day); only the preseason CTA in
  `weekly.html` links to it.
- `data/MAFFL_2026_append.csv` is the draft-ingest staging file, already folded into Draft_History. Archive or delete.
- `overview.html` has no version/date pills (CLAUDE.md: add one when missing).
- `.claude/settings.local.json` (local-only, git-ignored) still has 22 old `Desktop\MAFFL` paths; the
  `Desktop\MAFFL` copy itself is still waiting to be archived (STATUS).
- `rehearsal.yml`'s schedule is a 2026 one-shot; keep it for the manual button.

## Already tracked in STATUS (no new action)

gen-prize/dues shape · page generators drifted (never `-Write`) · quarantined CSV still read by validate
Gates 1/7, gen-history, gen-draft · `Dues_Log.csv` at root · 👻 LM to-do.

## Suggested next step

One Claude Code prompt, `VERSION: none`, docs + one workflow guard: items 1, 2, 4, 5, 6 (+ STATUS note for 3).
