# Rivalry upgrade 3 of 3: game-day mode (Week N Rivalries + This Week)

VERSION: none

This ships inside the v2.0 release started by upgrade 2, so don't bump again. If v2.0 was already **pushed**
before this runs, stop and ask (it would be a minor instead).

Date: 2026-10-03 (replaces the 2026-09-30 version) · Author: Claude (chat) · Scope: `rivalry.html` only.
**Depends on** upgrade 1 (`schedule-data.js` exists) and upgrade 2 (hero with `.vs-strip-slot`, `accHtml()`,
the `form` accordion). If either is missing, stop.

Read first: `_ops/STATUS.md`, `CLAUDE.md`, the header of `schedule-data.js`, and the approved mockup
`_ops/docs/RIVALRY_V2_MOCKUP.html` (panel ① and the strip in panel ②). Approved structural change: a
**Week N Rivalries** accordion card at the top of the Head-to-Head tab. No `*.bak` files.

---

## A. Load the schedule and work out "this week"

- Add `<script src="schedule-data.js"></script>` directly after `<script src="matchups-data.js"></script>`.
  Everything below must degrade quietly when `window.SCHEDULE_DATA` is missing: no card, no strip, no errors.
- Near `LAST_COMPLETE_YEAR`:
  ```js
  /* Next unplayed regular-season week of the schedule year, from played results (never the calendar).
     No results that year yet → 1. Past the last scheduled week → null. */
  var SCHED = window.SCHEDULE_DATA || null;
  var CUR_WEEK = (function () { ... })();
  ```
  Played = the max `week` among `MATCHUPS_DATA` rows with `year === SCHED.year && type === "R"`. The weekly robot
  regenerates `matchups-data.js`, so this rolls forward with no manual step. With data through Week 3 it's **4**.
- Helpers:
  - `schedGamesForWeek(w)`.
  - `nextMeeting(k1, k2)`: the first scheduled game with `week >= CUR_WEEK` between the two (compare
    `normalizeName()` keys, either home/away order), or null.
  - Rows with `MAFFL Ghost` are never a rivalry. Skip them in `nextMeeting`.

## B. "Week N Rivalries" card (top of the Head-to-Head tab)

- New `<div id="slateSection"></div>` inside `#tab-h2h`, **before** the "Owner filter" `<section>`. Rendered by
  `renderSlate()` as one `accHtml("slate", "⚔️", "Week 4 Rivalries", "6 Upper · 5 Lower", body, true)` card
  (open by default).
- Visible only when `CUR_WEEK` is set **and** `!sel1`. When it shows, the "Pick Two Owners" label reads
  `Or pick any two owners`; otherwise the label is unchanged. Call `renderSlate()` everywhere `renderVS()` is called.
- Body: two tier toggles styled like `weekly.html`'s `.tier-head` / `.tier-body` (44px, display 13px uppercase,
  chevron). Use new class names `slate-tier` / `slate-tier-body`. `UPPER · 6 GAMES` starts open, `LOWER · 5 GAMES`
  starts closed.
- One **compact row** per game (a button, min-height 56px, rows separated by a 1px border, as in the mockup):
  - Line 1 is a grid `1fr auto 1fr 30px`: away short name (16px bold), the series record from the away owner's view
    (20px display; leader navy, trailer `#a3b0c6`, tied both navy), home short name (right-aligned), and the navy
    rating chip (reuse `.lb-rating-chip` styling).
  - Line 2 (13.5px muted): a `DIV` tag for `gameClass === "Divisional"` or `MIRROR` for `"Mirror Match"` (12px
    display, gold-dark, before the text), then the **first** `stakesLines()` line (section D).
  - Never met: record `new`, no rating chip, line 2 `First-ever meeting.`
  - Tapping a row calls `loadPair(awayKey, homeKey)` (away = Owner 1).
  - Ghost game: a non-button muted row, left `Bo draws 👻`, right `no series`.
- Order within each tier: highest Rivalry Rating first, never-met next, the Ghost row last.
- The card ignores the Active/All filter.

## C. "This Week" in the matchup view

When `nextMeeting(k1, k2)` isn't null:

- **Hero strip:** fill `.vs-strip-slot` with a gold pill (`background: var(--gold); color: var(--navy)`, 13px
  display, letter-spacing .06em, radius 999px, margin-bottom 8px):
  - this week: `🗓️ THIS WEEK · WEEK 4`, plus ` · DIVISION GAME` / ` · MIRROR MATCH` when it applies;
  - later in the season: `🗓️ NEXT MEETING · WEEK 12` (+ class).
- **The `form` accordion becomes "This Week":** icon 🗓️, title `This Week` (or `Next Meeting · Week 12`), still
  open by default. Its preview is the first stakes line. The body starts with up to **3** stakes lines (15px, `▸ `
  prefix, 1px separators, as in the mockup), then the Last-5 strip as before.
- No scheduled meeting means no strip, and the card stays "Recent Form" exactly as upgrade 2 left it.

## D. `stakesLines(p, k1, k2)` returns a string array (priority order, deduped, max 3)

`p` may be undefined (never met). Use `shortName()` throughout. `n` = meetings, `w1`/`w2` = Owner 1 / Owner 2 wins.

1. Never met → `["First-ever meeting."]` and stop.
2. `w1 === w2` → `Series is tied {w}–{w}. The winner takes the lead.`
3. `|w1 − w2| === 1` → `{Trailer} can even the series at {w}–{w}.`
4. `p.curStreakLen >= 2` → `{Holder} goes for {len+1} straight; {Other} is trying to snap a {len}-game skid.`
5. The Hammer is at stake:
   - if a side holds The Hammer (≥75%, n ≥ 8) and one loss would drop it below 75% → `{Nail} can shake The Nail with a win.`
   - if a side is one win from 75% with `n+1 >= 8` → `{Leader} can claim The Hammer with a win.`
6. `n+1` is 10, 20, 25, 30, 40 or 50 → `The {ordinal} all-time meeting.`
7. Only if 2–6 produced nothing → `Last time: {Winner} by {margin} ({year} Wk {week}).`

Expected Week 4 first lines (check them all):

| Game | First line |
|---|---|
| Brian/Ron v Jake | `Brian/Ron goes for 4 straight; Jake is trying to snap a 3-game skid.` |
| Dave v Ed | `Dave goes for 3 straight; Ed is trying to snap a 2-game skid.` |
| Joe v Dan | `Series is tied 6–6. The winner takes the lead.` (2nd line: Joe goes for 3 straight…) |
| Mike v BJ | `Series is tied 3–3. The winner takes the lead.` |
| Tony v Fetrow | `Last time: Tony by 24.02 (2024 Wk 7).` |
| Braiden v Jon/Rick | `Last time: Jon/Rick by 67.24 (2025 Wk 7).` |
| Troz v Johnson | `Troz can even the series at 10–10.` |
| Sam v Brooks | `Sam can even the series at 1–1.` |
| Dom v Nick | `Dom can even the series at 1–1.` |
| Ben v Charlie | `Charlie can even the series at 1–1.` |

## E. Weekly Pulse

No change. Its rivalry strip links `rivalry.html#vs=A,B`, and the strip and This Week card now appear automatically.

## Verify

- `node --check` on the inline scripts passes.
- Fresh load, no hash: the Week 4 Rivalries card is open, Upper shows 6 rows in rating order (Brian/Ron v Jake
  first), Lower is closed and opens to 4 rows plus the `Bo draws 👻` row. Every first line matches the table.
- Tap Mike v BJ: the card hides, the picker collapses, and the hero strip reads `🗓️ THIS WEEK · WEEK 4 · DIVISION GAME`.
  The open card is "This Week" with the tied line, then Last 5. Tap `Change`, clear both owners, and the card returns.
- `#vs=mike murello,jon fetrow` shows `NEXT MEETING · WEEK n` if they're scheduled later in 2026, else no strip
  and "Recent Form".
- Temporarily rename `schedule-data.js` locally: the page behaves exactly like upgrade 2 with no console errors.
  Rename it back.
- Console: `CUR_WEEK = 5; renderSlate();` renders the Week 5 games.
- **Mobile:** 390×844 **and** iOS Home-Screen standalone. Slate rows are ≥56px. `Brian/Ron` / `Jon/Rick` don't
  collide with the record or rating chip. The strip wraps cleanly. `document.documentElement.scrollWidth === 390`.
- `git diff --stat` → `rivalry.html`, STATUS, this prompt's move.

## Close out

Report the diff summary and the Week 4 card text (all rows). `git mv` this prompt to `_ops/prompts/done/`.
Update `_ops/STATUS.md` with the block below. One commit, **then push** (both v2.0 commits go out together).

Suggested commit message: `Rivalry v2.0 (2/2): Week N Rivalries card, This Week strip + stakes lines (reads schedule-data.js)`

---

STATUS:
- Recently shipped (top): `2026-10-03 · Rivalry v2.0 live: scoreboard + accordions, Week N Rivalries card (auto-advances after each ingest), This Week strip + stakes lines. Reads schedule-data.js.`
- Queued prompts: remove this prompt's line.
