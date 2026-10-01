# Rivalry upgrade 3 of 3: game-day mode (This Week's Rivalries + Next Meeting + stakes)

VERSION: none

(This ships inside the v2.0 release started by upgrade 2. Don't bump again. If `rivalry.html` v2.0
was already **pushed** live before this runs, stop and ask: it would be a minor instead.)

Date: 2026-09-30 · Author: Claude (chat) · Scope: `rivalry.html` only.
**Depends on** upgrade 1 (`schedule-data.js` exists) and upgrade 2 (v2.0 hero/tiles), both committed.
If either is missing, stop.

Read first: `_ops/STATUS.md`, `CLAUDE.md`, the header of `schedule-data.js`, and the v2.0
`renderVS()` / `renderStatus()`. Mockup: `_ops/docs/RIVALRY_V2_MOCKUP.html` (the Slate and Banner
panels). Approved structural change: a new **This Week** section at the top of the Head-to-Head tab.
No `*.bak` files.

---

## A. Load the schedule and work out "this week"

- Add `<script src="schedule-data.js"></script>` right after the `matchups-data.js` script tag.
  Everything below must degrade quietly when `window.SCHEDULE_DATA` is missing: no section, no
  banner, no errors.
- Add near `DATA_MAX_YEAR`:
  ```js
  /* Next unplayed regular-season week of the schedule year, from played results (never from the
     calendar). Preseason (no results that year) → 1. Past the last scheduled week → null. */
  var SCHED = window.SCHEDULE_DATA || null;
  var CUR_WEEK = (function () { ... })();
  ```
  Played = max `week` among `MATCHUPS_DATA` rows with `year === SCHED.year` and `type === "R"`.
  Because the weekly robot regenerates `matchups-data.js` after each ingest, this rolls forward with
  no manual step. Today it should be **4**.
- Helpers: `schedGamesForWeek(w)` → rows for that week; `nextMeeting(k1, k2)` → the first scheduled game
  with `week >= CUR_WEEK` between the two (compare `normalizeName()` keys, either home/away order), or null.
- Rows involving `MAFFL Ghost` are never a rivalry: skip them in `nextMeeting`, and show them
  as muted rows in the slate (see B).

## B. "This Week's Rivalries" section (new, top of the Head-to-Head tab)

Markup: a new `<section id="slateSection" aria-label="This week's rivalries">` placed **between the
`.portal-tabs` div and the "Owner filter" section** inside `#tab-h2h`. Rendered by `renderSlate()`.

- Visible only when `CUR_WEEK` is set **and** no owner is picked (`!sel1`). Otherwise hidden. When it
  shows, the "Pick Two Owners" label reads `Or pick any two owners`. Otherwise it keeps the current text.
- Header: `⚔️ Week 4 Rivalries` (section-label style, 14px), then per tier a sub-label `UPPER` / `LOWER`.
- One card-button per game (min-height 72px, surface card, radius 12px, full width, 10px gap):
  - Line 1: `Mike` **3–3** `BJ`. The short names sit left and right (`shortName()`, 17px bold), and the
    series record is centered from the away owner's view (22px Barlow Condensed). Leader in navy,
    trailer muted, tied both navy.
  - Line 2 is the chips: a `Division game` chip for `gameClass === "Divisional"`, `Mirror Match` for
    `"Mirror Match"`, nothing for `Open`. Then the navy rating chip (reuse `.lb-rating-chip`) and the
    badge emojis.
  - Line 3 is the **first** stakes line from `stakesLines()` (section D), 14px muted.
  - Tapping it loads the pair with away = Owner 1 via `loadPair(awayKey, homeKey)`.
  - Never met: record shows `—` and line 3 reads `First-ever meeting.`
  - Ghost game: a non-button muted row, `Bo draws 👻, so nothing on the line in the series.`
- Order within each tier: highest Rivalry Rating first; never-met pairs last; the Ghost row at the bottom.
- The slate ignores the Active/All filter (everyone scheduled is active).
- Re-render the slate from the same places that call `renderVS()` (so it hides and shows on pick,
  clear and hash).

## C. "Next meeting" banner (inside the v2.0 hero)

In `renderVS()`, when `nextMeeting(k1, k2)` isn't null, add a top row to the hero card
(before the names grid):

- A gold strip: `background: var(--gold); color: var(--navy)`, radius 999px, 14px bold, centered.
  - Same week as `CUR_WEEK`: `🗓️ THIS WEEK · Week 4 · Division game` (or `· Mirror Match`, or nothing).
  - Later: `🗓️ NEXT MEETING · Week 12` (+ class).
- Under the strip, up to **3** stakes lines (`stakesLines()`), 14px, `rgba(255,255,255,.88)`, each
  starting with `▸`.
- No scheduled meeting → no strip, and the hero looks exactly like upgrade 2.

## D. `stakesLines(p, k1, k2, game)` → array of strings (priority order, dedupe, max 3)

`p` may be undefined (never met). Use `shortName()` everywhere. `n` = meetings so far, `w1`/`w2`
= wins from Owner 1 / Owner 2.

1. Never met → `First-ever meeting.` (return just this line).
2. `w1 === w2` → `Series is tied {w}–{w}. The winner takes the lead.`
3. `|w1 − w2| === 1` → `{Trailer} can even the series at {w}–{w}.`
4. `p.curStreakLen >= 2` → `{Holder} goes for {n+1} straight; {Other} is trying to snap a {n}-game skid.`
   (use the streak length for both numbers)
5. The Hammer is at stake. If a side currently holds The Hammer (≥75%, n ≥ 8) and a loss would drop them
   below 75%: `{Nail} can shake The Nail with a win.` If a side is one win from reaching 75% with
   `n+1 >= 8`: `{Leader} can claim The Hammer with a win.`
6. A milestone: when `n + 1` is 10, 20, 25, 30, 40 or 50 → `The {ordinal} all-time meeting.`
7. Only when rules 2–6 produced nothing, fall back to the last game:
   `Last time: {Winner} by {margin} ({year} Wk {week}).`

Expected for Week 4 (check them):
- Mike vs BJ → `Series is tied 3–3. The winner takes the lead.`
- Joe vs Dan → tied 6–6 line first, then `Joe goes for 3 straight; Dan is trying to snap a 2-game skid.`
- Brian/Ron vs Jake → `Brian/Ron goes for 4 straight; Jake is trying to snap a 3-game skid.`
- Dom vs Nick → `Dom can even the series at 1–1.`

## E. Weekly Pulse

Nothing to change. Its rivalry strip already links `rivalry.html#vs=A,B`, and the banner in C now
shows up automatically for this week's games.

## Verify

- `node --check` on the inline script passes.
- Fresh load, no hash: the Week 4 slate shows 6 Upper + 5 Lower rows (1 Ghost row), and the stakes lines
  match section D's expected list.
- Tap Mike vs BJ: the slate hides, the picker collapses, and the hero shows `THIS WEEK · Week 4 · Division game`
  plus stakes. Tap `Change` and clear both owners: the slate returns.
- `#vs=mike murello,jon fetrow` (not scheduled Week 4): the banner shows the next 2026 meeting if one is
  scheduled, otherwise no banner.
- Temporarily rename `schedule-data.js` locally: the page works exactly like upgrade 2, with no console
  errors. Rename it back.
- Simulated roll-forward: in the console, `CUR_WEEK = 5; renderSlate();` renders the Week 5 games.
- **Mobile:** 390×844 **and** iOS Home-Screen standalone: slate cards are ≥44px tap targets, long team
  short names ("Brian/Ron", "Jon/Rick") don't collide with the record, the banner strip wraps cleanly,
  and `document.documentElement.scrollWidth === 390`.
- `git diff --stat` → `rivalry.html`, STATUS, this prompt's move.

## Close out

Report the diff summary and the Week 4 slate text (all 11 rows). `git mv` this prompt to
`_ops/prompts/done/`, then update `_ops/STATUS.md` with the block below. Everything goes in one commit.
**Then push** (both v2.0 commits go out together).

Suggested commit message: `Rivalry v2.0 (2/2): This Week's Rivalries slate, Next Meeting banner, stakes lines (reads schedule-data.js)`

---

STATUS:
- Recently shipped (top): `2026-09-30 · Rivalry v2.0 live: Week N rivalry slate (auto-advances after each ingest), Next Meeting banner + stakes lines in the hero. Reads schedule-data.js.`
- Queued prompts: remove this prompt's line.
