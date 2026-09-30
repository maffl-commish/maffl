# Robot recipe — draft the Weekly Pulse from the ESPN pull

VERSION: 0.3 (2026-09-30): adds Coach of the Week (OUTPUT 2e). 0.2 (2026-09-29): data steps moved to the workflow's Windows job; Claude writes prose only · Owner: commissioner (Mike) · Used by `.github/workflows/pulse-draft.yml`

You are Claude Code running unattended in GitHub Actions on the draft branch. The workflow's
Windows job has **already** appended the week to the gold CSVs, run the CE-1 generator and
validate, and written the facts file. Your job is to write the **draft** Week object in
`weekly.html` and a short summary for the commissioner. The workflow commits your changes and opens a pull
request (PR). **Nothing publishes until the commissioner merges it**, so when in doubt, leave a
question in the summary rather than guessing.

The week number is given in your prompt as **W**. Files below use two-digit weeks (`Week04`).

## 0. Read first (in this order)

1. `CLAUDE.md`: binding rules (date/version stamp).
2. `_ops/docs/PULSE_EDITORIAL_GUIDE.md`: every writing rule. Follow it exactly.
3. `MAFFL_HQ_DATA_GOVERNANCE.md` §4: CE-1 and CE-1a.
4. `_ops/inbox/MAFFL_2026_WeekWW_espn.md`: this week's ESPN pull (same shape as capture v2.2).
5. `_ops/inbox/MAFFL_2026_WeekWW_datalog.md`: what the data job did (ingest, generator, validate).
6. `_ops/inbox/MAFFL_2026_WeekWW_facts.md`: every number you need (see §3).
7. The **previous week's object** in `weekly.html` (the first element after `const WEEKS = [`).
   It is your template for field names, order, formatting, owner spellings and comment style.

## 1. Stop conditions (write the summary file and stop; change nothing else)

- The ESPN report's last line isn't `STATUS: READY TO INGEST`.
- The data log or facts file is missing, or the data log shows a failed step.
- Any step below fails a verification. Say which, and paste the error.

## 2. Gold data (already done by the workflow; don't redo it)

The data job ran `_ops/scripts/ingest_week.py`, `build\generate-matchups-data.ps1` (check → write →
re-check) and `build\validate.ps1` on Windows. You're on Linux without Windows PowerShell, so
**don't edit any CSV, `matchups-data.js` or build script.** If the data log says stat corrections were
reported for earlier weeks, they were **not** applied: list them in the summary under "Needs your OK"
(CE-1a is the commissioner's call). **Never run `build.ps1 -Write`.**

## 3. Numbers: copy from the facts file, never do arithmetic yourself

The data job already ran `python _ops/scripts/pulse_facts.py W`. Its output,
`_ops/inbox/MAFFL_2026_WeekWW_facts.md`, has standings (already in page order), all-play,
Survivor, credit leaders with `since`, highest weekly, seeds, and head-to-head facts for next
week's pairings. **Copy numbers from it exactly.** If you need a number it doesn't give, derive it
only from gold CSVs with a short script, and mention that in the summary.

## 4. Write the Week W object in `weekly.html`

Insert it immediately after the line `const WEEKS = [`, so it becomes the first element and ends
with `},`. Mirror the previous week's object field for field.

- `weekNumber: W`, `dateString`: the Tuesday after the week ends, e.g. `"Oct 6, 2026"`.
- **Standings** (`upperTier.divA..divD`, `lowerTier`): the facts file's order and numbers. `points`
  have 2 decimals, `streak` is signed, and `credits` come from the facts file. Copy each team's
  `owner` string exactly from the previous week's object (e.g. `Brian Murello/Ron Murello`,
  `Jon Fetrow`). 👻 row last in `lowerTier`, owner `"—"`.
- **results**: all 11 games, winner first, tier `"U"`/`"L"`, `tag` only for division games
  (`"Div A"` …), scores in gold format. One-sentence note each (editorial §8, §8a). Name the
  deciding player from OUTPUT 2a when one decided it. Player names stay in ESPN's first-initial
  form or last name only. Never expand a first name from memory.
- **survivor** + `survivorNote`: from the facts file. The newest out gets `recent: true`, every
  earlier one `recent: false`. If the facts file shows ⚠️ TIE for lowest, don't pick; ask in the summary.
- **creditTracker**: the six awards, values and `since` from the facts file. Individual High: carry
  the previous week's value unless the facts file's "Individual high THIS WEEK" is higher; then
  the new leader gets `since: W` and the value `"<pts> — <Player>"`. `status: "leading"` (only
  `"locked"` after Week 14 if mathematically settled). `latestChange`: lead with the biggest change.
- **highestWeekly**: prepend this week's entry to the previous list (facts file "Highest weekly").
- **elite5**: rank with editorial §6 (all-play first, then points), using the facts file's all-play.
  Put a comment above it listing the all-play numbers you used, like the previous week does.
- **coachOfWeek**: copy from OUTPUT 2e of the ESPN report (editorial §8b). Shape:
  `coachOfWeek: { upper: { team, owner, leftOnBench, scored, best, runnersUp: [{ team, leftOnBench }] ×2,
  out: [{ team, reason }] }, lower: { … }, note: "…" }`. `owner` = the owner string from the standings;
  numbers exactly as the report prints them; `runnersUp` = the next two teams still in contention;
  `out` = every team knocked out, with the report's reason. If every team in a tier is out,
  `upper: null` (or `lower: null`). If the report has no 2e section, omit `coachOfWeek`.
  `couldHaveWon: [{ team, tier: "U"|"L", opponent, lostBy, leftOnBench }]`: every row the report marks
  "Could have won: YES" (both tiers, biggest bench first; `opponent: "👻"` for the Ghost). Empty list if none.
- **postseasonNote**: optional, one sentence, from the facts file's playoff picture.
- **headline / subhead / newsReel**: editorial §3–§4. 5–6 items, 2–4 sections. Transactions come
  from OUTPUT 2c. **Waiver claims carry ESPN's processing time: never present that as when a
  team picked someone up** (editorial §4 "Waiver times"). "Bench beat every starter" facts
  (OUTPUT 2d) are good Can You Believe This? material.
- **matchupPreviews** (Week W+1): the pairings in the facts file, away team first, **3 Upper + 2 Lower**
  with `highlight: true` (editorial §8), picked for stakes. Featured notes use the head-to-head
  facts. Never repeat the bare series score, since the page adds the ⚔️ strip itself. Every other game
  gets a short note. Comment above it like the previous week's, naming the ESPN pull as the source
  of both tiers' pairings.
- **Stamp**: VERSION none → keep the version pill, set `Last Updated` to the dateString date.
- No `NEEDS COMMISH`, `CONFIRM`, `TODO` or placeholders in the page. Questions go in the summary.

## 5. Self-check (fix, then re-check)

- Editorial guide §9 checklist, item by item.
- JavaScript still parses: copy every inline `<script>` block of `weekly.html` (without the tags)
  into one temp `.js` file outside the repo and run `node --check` on it. It must pass.
- `git status` shows only `weekly.html` and the summary file changed by you. Anything else: undo it.

## 6. Summary for the commissioner → `_ops/inbox/MAFFL_2026_WeekWW_pr.md`

This becomes the PR description he reads on his phone. Plain English, short:

```
## Week W draft — ready for your review
**Headline:** <headline>
**Checks:** 11 games added ✅ · validate 8/8 ✅ (data log) · JS parses ✅ · editorial checklist ✅
**What I did:** <3–5 bullets>
**Needs your OK / questions:** <bullets, or "none">
**LM to-do:** set ESPN 👻 Week W score to <par> (only if the report flagged it)
To change anything, comment on this PR starting with @claude, e.g. "@claude lead with the Reilly game".
When it looks right, click **Merge pull request**. That publishes it.
```

Don't commit, push or open the PR yourself. The workflow does that after you finish.
