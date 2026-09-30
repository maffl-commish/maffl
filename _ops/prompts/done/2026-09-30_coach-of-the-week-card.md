# Weekly Pulse — add the Coach of the Week card

VERSION: minor

Date: 2026-09-30 · Author: Claude (chat) · Scope: `weekly.html` only (renderer + one new card).
No week object changes. Weeks 1–3 must look exactly the same after this.

Read first: `_ops/STATUS.md`, `CLAUDE.md` (date/version stamp rule),
`_ops/docs/PULSE_EDITORIAL_GUIDE.md` §8b, `_ops/docs/ROBOT_PULSE_RECIPE.md` (the `coachOfWeek`
bullet in §4). If an anchor below doesn't match the file exactly, **stop and ask**. No `*.bak` files.

Why (commissioner ruling 2026-09-30): Coach of the Week was a long-running MAFFL award. It's
coming back in the Pulse from Week 4 as bragging rights only (no money, no credits, so
`prize.html` and dues aren't touched). Chat already wrote the pieces under `_ops/`:
ESPN pull v0.5.1 computes it (report OUTPUT 2e), editorial guide §8b, robot recipe v0.3.
This prompt is only the page side.

**The rule, for the card's footer text:** fewest points left on the bench wins (best legal lineup
minus what you started). A starter on bye, an empty slot or a zero-point starter knocks you out.
One winner per tier. 🔄 Could have won = lost by less than you left on the bench.

---

## Step 1 — Data shape (document it)

In the big comment above `const WEEKS = [` (the "Optional `results`…" list, around line 1440),
add one line in the same style:

```
 * Optional `coachOfWeek`: { upper, lower, couldHaveWon, note } — see renderCoachCard. upper/lower =
 *   { team, owner, leftOnBench, scored, best, runnersUp:[{team,leftOnBench}], out:[{team,reason}] } or null;
 *   couldHaveWon = [{ team, tier, opponent, lostBy, leftOnBench }].
```

Example object (for testing only, **don't commit it into any week**):

```js
coachOfWeek: {
  upper: { team: "Jake's Jagoffs", owner: "Jacob Nickman", leftOnBench: 0.0, scored: 150.2, best: 150.2,
           runnersUp: [{ team: "Hadley's Comets", leftOnBench: 4.36 }, { team: "Turkey Hat Conglomerate", leftOnBench: 7.1 }],
           out: [{ team: "Bad Attitude Gang", reason: "T. Hill on bye" }] },
  lower: { team: "Portly Primates", owner: "Charles Lavrinc", leftOnBench: 2.4, scored: 185.98, best: 188.38,
           runnersUp: [{ team: "Camp Kes", leftOnBench: 5.9 }, { team: "Sarge's Squad", leftOnBench: 12.2 }],
           out: [] },
  couldHaveWon: [
    { team: "Bad Attitude Gang", tier: "U", opponent: "Happy Valley Hammer Time", lostBy: 15.1, leftOnBench: 17.4 },
    { team: "Tommy Phamclub", tier: "L", opponent: "👻", lostBy: 2.36, leftOnBench: 9.8 }
  ],
  note: "Tony's Talented Team (Brooks) sat Gibbs' 34.4 and missed the Lower crown by a mile."
}
```

## Step 2 — `renderCoachCard(week)`

Add it next to the other card renderers (e.g. right after `renderPreviewCard`). Use `cardShell`
and the page's existing helpers (`esc`, the short-name lookup `SHORT_NAMES`, and whatever
the Results card uses to show a team name + short owner). Mirror the Results card's type scale
and muted styles; add no new colors, only reuse existing CSS variables/classes.

- Return `""` when `!week.coachOfWeek`.
- id `"coach"`, icon `📋`, title `Coach of the Week`.
- **Preview (collapsed):** two short lines, one per tier:
  `Upper · Jake's Jagoffs (Jake) · 0.0 left on the bench` (and "perfect lineup" when leftOnBench is 0).
  A null tier reads `Upper · nobody — every lineup had a hole`.
- **Body (expanded), per tier:** winner line with `scored` of a possible `best`; runners-up as a
  compact "Next closest" line; knocked-out teams as a muted "Out of contention" line with reasons
  (omit the line when `out` is empty).
- **🔄 Could have won** (the commissioner's favorite part; give it room): below both tiers, a
  short list, one row per team: `🔄 Bad Attitude Gang (Mike) lost to Happy Valley Hammer Time by
  15.1 and left 17.4 on the bench.` Use a small pill/tag style the page already has for the 🔄 label
  (like the Results card's tags). Omit the section when the list is empty. In the collapsed preview,
  add a third short line when the list isn't empty: `🔄 3 teams could have won`.
- Then `note` (if present) once, at the bottom.
- **Footer (muted, small):** `A MAFFL classic, back in 2026. Fewest points left on the bench wins;
  a bye, an empty slot or a zero-point starter knocks you out.`
- Numbers print exactly as given (don't reformat 0.0 to 0).

## Step 3 — Layout

- Add `"coach"` to `FULL_WIDTH_CARDS`.
- In `renderPage`, weekly (non-Week-0) branch: insert `renderCoachCard(week)` **after**
  `renderPreviewCard(week)` and **before** the Elite 5 entry. Week 0 branch: unchanged.
- The tile pairs (Standings | Post-Season, Survivor | Credit Tracker, Results | Preview) must stay paired.

## Step 4 — Stamp

VERSION minor → `v6.2` → `v6.3`; Last Updated = today's date.

## Verify

- `node --check` on all inline `<script>` blocks (copied into one temp file outside the repo) passes.
- Weeks 0–3 render identically to before (no `coachOfWeek` in any week → no card).
- In DevTools, set the example object on `WEEKS[0]` and call `renderPage(WEEKS[0])`. The card
  appears full-width between Results/Preview and Elite 5, collapses/expands like the others,
  and a `lower: null` variant shows the "nobody" line without errors; an empty `couldHaveWon`
  hides the 🔄 section and its preview line. Don't save this.
- **Mobile:** DevTools iPhone 12 Pro (390×844) and iOS Home-Screen standalone width. Card
  collapsed and expanded: long team names wrap, nothing clips, and
  `document.documentElement.scrollWidth === 390`.
- `git diff --stat` → `weekly.html`, STATUS, this prompt's move. Chat-written files under `_ops/`
  (pull script v0.5, editorial guide, recipe, `_ops/inbox/.gitignore`) may also be uncommitted.
  Include them in this commit.

## Close out

Report the diff summary. `git mv` this prompt to `_ops/prompts/done/`, update `_ops/STATUS.md`
with the block below. One commit.

Suggested commit message: `Pulse v6.3: Coach of the Week card; ESPN pull v0.5.1 computes it (2e) incl. 🔄 Could have won; editorial §8b; recipe v0.3`

---

STATUS:
- Recently shipped (top): `2026-09-30 · Coach of the Week is back (bragging rights): ESPN pull v0.5.1 computes fewest points left on the bench per tier + 🔄 Could have won (OUTPUT 2e); Pulse v6.3 card; editorial §8b; robot recipe v0.3. First appears Week 4.`
- Queued prompts: remove this prompt's line.
