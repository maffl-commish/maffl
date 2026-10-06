# Robot recipe — draft the Weekly Pulse from the ESPN pull

VERSION: 0.6 (2026-10-06): check_pulse_week.py must pass (Week 4 shipped without its Coach of the Week); editorial §4a spread the wealth; facts file adds Coverage + Story hooks. 0.5 (2026-10-06): stat corrections are applied to gold by the data job; Claude updates earlier Week objects to match and lists every change. 0.4 (2026-09-30): PR summary carries the full draft in plain English; §7 rehearsal mode. 0.3 (2026-09-30): adds Coach of the Week (OUTPUT 2e). 0.2 (2026-09-29): data steps moved to the workflow's Windows job; Claude writes prose only · Owner: commissioner (Mike) · Used by `.github/workflows/pulse-draft.yml`

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
5a. `_ops/inbox/MAFFL_2026_WeekWW_corrections.md` **if it exists**: stat corrections the data job
   already applied to gold.
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
**don't edit any CSV, `matchups-data.js` or build script.** **Never run `build.ps1 -Write`.**

If `_ops/inbox/MAFFL_2026_WeekWW_corrections.md` exists, the data job has **already applied** those ESPN
stat corrections to gold, and the facts file is built from the corrected gold. Your part (CE-1a, robot
path):
- In each **earlier** Week object in `weekly.html`, change each corrected score (`scoreA` / `scoreB`) to
  the new value, and fix any prose in that object that quotes a changed number (a score, a margin like
  "by 3.46", a running total). Recompute a margin only by subtracting the two corrected scores as written
  in the corrections file; show your arithmetic in the summary.
- **Don't** rewrite earlier weeks' standings, creditTracker or highestWeekly snapshots. They stay as
  published; this week's object (from the facts file) carries the corrected season totals.
  Exception: if a correction changes who holds `highestWeekly` or flips a winner, say so under
  "Needs your OK" and leave it for the commissioner.
- Don't mention corrections in this week's prose unless a winner flipped.
- `git status` may show `weekly.html` edits in earlier objects; that's expected.

## 3. Numbers: copy from the facts file, never do arithmetic yourself

The data job already ran `python _ops/scripts/pulse_facts.py W`. Its output,
`_ops/inbox/MAFFL_2026_WeekWW_facts.md`, has standings (already in page order), all-play,
Survivor, credit leaders with `since`, highest weekly, seeds, head-to-head facts for next
week's pairings, **Coverage** (who the last 3 Pulses skipped) and **Story hooks** (history for every
team: series, streaks, best/worst starts, era-top scores, milestones, trophies). **Copy numbers from it exactly.** If you need a number it doesn't give, derive it
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
- **headline / subhead / newsReel**: editorial §3–§4a. 5–6 items, 2–4 sections. **Start from the facts
  file's Coverage section**: at least 2 items on teams it lists as not written about, at least 2 items
  mentioning a Lower team, no team in more than 2 items, and don't lead with a team from the last two
  headlines unless it's a record. Pull history from the Story hooks, never from memory. Transactions come
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

- **Run `python3 _ops/scripts/check_pulse_week.py W` and fix every ❌ line, then run it again.** It reads
  the page itself, so it catches a section you meant to add but didn't (Week 4: Coach of the Week was in
  the summary but not the page). Fix ⚠️ lines too unless the story demands otherwise; if you keep one,
  say why under "Needs your OK". The workflow runs it again after you and flags the PR if it fails.

- Editorial guide §9 checklist, item by item.
- JavaScript still parses: copy every inline `<script>` block of `weekly.html` (without the tags)
  into one temp `.js` file outside the repo and run `node --check` on it. It must pass.
- `git status` shows only `weekly.html` and the summary file changed by you. Anything else: undo it.

## 6. Summary for the commissioner → `_ops/inbox/MAFFL_2026_WeekWW_pr.md`

This becomes the PR description he reads on his phone. **Write "The draft, as readers will see it" by
reading the Week W object back out of `weekly.html`, not from your notes.** Anything that isn't in the
page doesn't go in the summary. He must be able to approve the week **without
opening the code diff**, so it carries the whole draft as readable text. Use this shape:

```
## Week W draft — ready for your review
**Stat corrections applied (ESPN):** <copy the bullets from the corrections file, then list every weekly.html edit you made for them, or "none">
**Headline:** <headline>
**Checks:** 11 games added ✅ · validate 8/8 ✅ (data log) · JS parses ✅ · check_pulse_week ✅ (paste its Result line) · editorial checklist ✅
**What I did:** <3–5 bullets>
**Needs your OK / questions:** <bullets, or "none">
**LM to-do:** set ESPN 👻 Week W score to <par> (only if the report flagged it)

---
### The draft, as readers will see it
**<headline>**
<subhead>

**News reel**
- 🤯 <each item, exactly as written, grouped under its section name>

**Elite 5:** 1. <Team (Short)>: <note> … 5. …
**Coach of the Week:** <Upper / Lower lines, if any>
**Survivor:** <one line: who went out in each tier>
**Credit Tracker:** <latestChange line>

**Results** (one line each): <Team A> <score> def. <Team B> <score>: <note>
**Week W+1 featured games:** <the 5 highlighted pairings, each with its note>
---

To change anything, comment on this PR starting with @claude, e.g. "@claude lead with the Reilly game".
When it looks right, click **Merge pull request**. That publishes it.
```

If the corrections file has a ⚠️ WINNER FLIPPED line, put `⚠️ A stat correction flipped a result. Check
before merging.` as the **first** line of the summary, above the heading. If the 👻 par changed (the
corrections file's 👻 line isn't "none"), add the LM re-entry to "Needs your OK".

Don't commit, push or open the PR yourself. The workflow does that after you finish.

## 7. Rehearsal mode (only when your prompt says REHEARSAL)

A rehearsal re-drafts a week that is **already published**, so the commissioner can see the robot's work
next to the real thing. It is never merged.

- §1: ignore the "already in gold" stop condition. The data log will say ingest was skipped on purpose.
- §4: don't insert a new object. **Replace the existing Week W object** in `weekly.html` with your own
  draft. Write it fresh from the facts file and the ESPN report, and **don't reuse its prose**. Use the Week
  W−1 object as your template and for carry-forward values (Individual High, `since`, highestWeekly).
- §6: title line `## REHEARSAL: Week W redo (close, don't merge)`. Add a short "Compared with what was
  published" section: 3–5 bullets on where your draft differs in picks, emphasis or numbers.
