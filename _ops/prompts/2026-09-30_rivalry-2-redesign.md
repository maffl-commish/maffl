# Rivalry upgrade 2 of 3: head-to-head redesign (bigger, fuller, more story)

VERSION: major

Date: 2026-09-30 · Author: Claude (chat) · Scope: `rivalry.html` only.
Commissioner call (2026-09-30): the page reads small and doesn't fill the space. Approved:
larger type, a scoreboard hero, stat tiles, a recent-form strip, a Series Lead chart, and
collapsing the owner picker once a matchup is loaded. **These are approved structural layout
changes.** Don't make any others.

Read first: `_ops/STATUS.md`, `CLAUDE.md` (stamp rule). Anchors below are from the file as of
v1.1 (Last Updated July 2, 2026). If one doesn't match, **stop and ask**. No `*.bak` files.
Mockup reviewed in chat: `_ops/docs/RIVALRY_V2_MOCKUP.html`. Match its look. The spec below wins if
the two disagree.

Worked example for checking your output: **Brian/Ron vs Jake** (`#vs=brian murello / ron
murello,jacob nickman`) is 21–11 all time (Regular Season 18–10, Postseason 3–1), and Brian/Ron has
won the last 3. Last 5 from Brian/Ron's view, oldest→newest: W(2021 Wk 6) L(2021 Q) W(2022) W(2023) W(2024).
Series lead: Jake led 2–0 after 2005 Wk 13, Brian/Ron first took the lead in 2006 Wk 8 (back to even in 2012 Wk 2, then ahead ever since),
largest lead +10 (2024). **1 lead change** (ties in 2006 and 2012 don't count).

---

## A. Rating fix: season anchor (logic)

The newest year in the data is now 2026 (in-season). So `ratingRaw()` recency cut every pair
that met in 2025 from 15 to 10, while pairs that happened to meet in Weeks 1–3 kept 15. Ratings
will now jump around week to week.

- After `DATA_MAX_YEAR` (≈ line 1478), add:
  ```js
  /* Last season with a Championship game in the data. Ratings anchor here so they don't
     swing week to week during an in-progress season. */
  var LAST_COMPLETE_YEAR = (function () {
    var mx = 0;
    (window.MATCHUPS_DATA || []).forEach(function (r) { if (r[7] === "C" && r[0] > mx) mx = r[0]; });
    return mx || DATA_MAX_YEAR;
  })();
  ```
- `ratingRaw()`: replace `DATA_MAX_YEAR` with `LAST_COMPLETE_YEAR` in all three recency tests.
  (A meeting this season is `>=` the anchor, so it still gets the full 15.)
- `renderLeaderboards()` "budding": `firstY >= DATA_MAX_YEAR - 2` → `firstY >= LAST_COMPLETE_YEAR - 2`.
- Keep `DATA_MAX_YEAR` everywhere else ("present" in Shared History).
- `explainerHtml()` Recency bullet: `"met this season or last (up to 15 pts)"`.

## B. Type scale: nothing on this page under 12px

Keep the tokens (navy/gold/Barlow). Change these sizes in the `<style>` block:

| Selector | Now | New |
|---|---|---|
| `.vs-stat__label` | 11px | 12.5px |
| `.vs-stat__value` | 15px | 16px |
| `.vs-stat__sub` | 13px | 14px |
| `.vs-blurb` | 13.5px italic muted | 16px, weight 500, `color: var(--navy)`, not italic |
| `.gamelog-row` | 12.5px | 14px |
| `.h2h-axis`, `.h2h-legend` | 11px | 12.5px |
| `.po-line .po-years` | 13px | 14px |
| `.badge-chip` | 12.5px | 14px, `min-height: 36px` |
| `.badge-desc` | 12.5px | 14px |
| `.tl-caption` | 12px | 14px |
| `.field-row` / `.field-rec` / `.field-last` / `.field-emoji` | 13 / 13 / 11 / 13 | 15 / 14 / 12.5 / 14 |
| `.field-head` | 18px | 20px |
| `.owner-pill` / `.op-rec` / `.op-badge` | 13.5 / 11 / 11 | 14.5 / 12 / 12 |
| `.owner-status .os-tag` / `.os-name` / `.os-empty` | 10 / 16 / 13 | 12 / 18 / 14 |
| `.filter-count` | 11px | 12px |
| `.lb-row__names` / `.lb-vs` / `.lb-note` / `.lb-emoji` | 13.5 / 11 / 12 / 13 | 15 / 12 / 13 / 14 |
| `.vs-msg` | 14px | 15px |

Floor rule: after this step, `grep -nE "font-size:\s*(9|10|11)(\.[0-9]+)?px" rivalry.html` returns
nothing.

## C. Scoreboard hero (rebuild `.vs-head` in `renderVS()`)

Replace the `var head = ...` markup and the `.vs-head*` CSS. Keep `.vs-share` and its wiring
(`wireVSInteractions` finds `.vs-share`, so the class must stay).

- Card: `background: linear-gradient(160deg, #243a62 0%, #1a2e50 55%, #0f1d34 100%)`,
  `color: #fff`, radius 14px, padding 18px 14px 16px.
- Row 1 is a 3-column grid `1fr auto 1fr`:
  - Left: Owner 1 **full name** (Barlow Condensed 700, 18px, wraps to max 2 lines, centered),
    then Owner 1's win count in huge numerals (Barlow Condensed 700, **56px**, line-height 1).
  - Middle: `VS` (12px, letter-spacing .12em, 60% white).
  - Right: the same for Owner 2.
  - Numeral color: the series leader's number is `var(--gold)`; the trailer's is `rgba(255,255,255,.72)`;
    if tied, both are gold. The Owner 1 name stays gold-tinted (`#f7c46a`) and the Owner 2 name white,
    matching the picker's 1 = gold, 2 = navy convention.
- Row 2 is the split line, centered, 14px, `rgba(255,255,255,.8)`, bold values in white:
  `Regular Season 18–10 · Postseason 3–1` plus the tier split line when it applies (keep that logic).
- Row 3 holds the Rating pill (gold border, `background: rgba(245,166,35,.16)`, number 18px white) with
  the badge emojis, and the Share button restyled as a ghost button (1px `rgba(255,255,255,.5)`
  border, white text, min-height 44px). They sit side by side and wrap on narrow screens.
- Delete the `vs-head-rec` winRateColor pill (the numerals replace it). Keep `winRateColor()`, since
  pills and field rows still use it.
- ≥768px: numerals 72px, names 22px.

The blurb (`.vs-blurb`) sits directly under the hero.

## D. Recent-form strip (new, under the blurb)

New function `formStripHtml(p, k1)`. It covers the last 5 meetings (fewer if the series is shorter),
**oldest → newest, left to right**, from Owner 1's view.

- Label row: `LAST 5` (stat-label style) + right-aligned `{Owner1 short}'s view` (12.5px muted).
- Each chip is a button: 44×44px, radius 10px, bold `W`/`L` in 18px Barlow Condensed, white on
  `var(--win)` / `var(--loss)`, with a postseason round letter (`Q`/`S`/`C`/`3rd`) in a tiny corner tag
  when not regular season. Below each chip: `'24` (12.5px muted).
- Tapping a chip shows a caption line below the strip. Reuse the timeline title format:
  `2024 Wk6 · 99.96–82.22 (+17.74)`. Tap again to hide. Only one open at a time.
- Wire it in `wireVSInteractions`.

## E. Stat tiles (restyle `.vs-stats` + restructure the small blocks)

- `.vs-stats` becomes `display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px;`
  and ≥768px `repeat(4, minmax(0,1fr))`.
- `.vs-stat` becomes a tile: `background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 12px;` (drop the bottom-border list style).
- Add a `.vs-stat--wide { grid-column: 1 / -1; }` modifier. Give `statBlock()` an optional 3rd
  arg `wide`. **Wide:** Postseason by Round, Shared History, Series Lead (F), Margin Timeline,
  All Meetings. **Small:** Streaks, Biggest Blowout, Heartbreaker, Nail-Biters (new). Total Points is **wide** too, so the four small tiles pair up 2 × 2 on a phone.
- Small-tile value layout: one big display number (Barlow Condensed 700, 28px, navy), then a
  one-line "who" (15px bold), then a sub line (14px muted).
  - **Streaks:** big `3` · `straight for Brian/Ron` · `Longest: Brian/Ron 6 · Jake 4`
    (1 → `won the last meeting`).
  - **Biggest Blowout:** big `62.5` · `Jake` · `146–83.5 · 2011 Wk 12`.
  - **Heartbreaker:** big `1.5` · `Brian/Ron` · `112–110.5 · 2009 Wk 11`.
  - **Total Points (wide):** big `3632.56 vs 3346.12` (the `vs` at 18px muted) · sub `Brian/Ron vs Jake · avg margin 27.43`.
  - **Nail-Biters (new):** big `p.nailbiters` · `games decided by ≤ 3 pts` · sub = the count won by each
    side (Brian/Ron vs Jake: big `1`, sub `Brian/Ron 1 · Jake 0`). Show `0` when there are none; don't hide the tile.
- The gold `champ-callout` stays full width above the grid.
- Keep the render order: Postseason by Round, the small tiles, Shared History, Series Lead,
  Margin Timeline, All Meetings.

## F. Series Lead chart (new wide tile, above Margin Timeline)

New `seriesLeadHtml(p, k1, k2)`. Series lead after meeting i = Owner 1 wins − Owner 2 wins so far.

- SVG `viewBox="0 0 340 140"`, width 100%. Draw a step line through each meeting (x evenly spaced).
  Scale y to the **actual** range `[min(0, minLead, −1), max(0, maxLead, 1)]` with 16px top/bottom padding.
  Don't make it symmetric: a one-sided series would waste half the tile. Add a zero line in `var(--border)`, the area above zero tinted
  `var(--win)` at 18% opacity, and below zero `var(--loss)` at 18%. The line itself is `var(--navy)`, 2px.
  End with a 5px dot plus a label `+10` (or `−3`, or `Tied`) placed **left of** the dot (text-anchor end)
  so it never clips at the top edge.
- Stats line under the chart (14px):
  `Lead changes: 1 · Biggest lead: Brian/Ron +10 (2024)` and, when the trailer has ever led,
  `· Jake last led in 2005`. Otherwise use `· Jake has never led`.
  A **lead change** is when the side in front differs from the last side that was in front
  (a tie then the same leader again is not a change).
- Tap a point: use invisible 20px-wide hit rects per meeting and the same caption pattern as the
  timeline. Show `After 2012 Wk 12: Brian/Ron +1` in a caption div. Keep a separate `leadTitles` array.
  Wire it in `wireVSInteractions`.
- Axis row: first year / last year (same as `.h2h-axis`). Legend: `▲ {Owner1} ahead · ▼ {Owner2} ahead`.

## G. Collapse the picker once a matchup is loaded

On a phone the 21-pill grid pushes the result below the fold.

- When `sel1 && sel2` (a full matchup), hide `#filterBar`'s section and `#ownerGrid`. `#ownerStatus` then
  shows the two **short** names (`Brian/Ron VS Jake`, 18px display) plus a `Change` button (min 44px, gold-outline pill). Tapping `Change`
  re-shows both and leaves the current selection as is.
- Any other state (0 or 1 owner picked) looks exactly like today.
- Implement it in `renderPills()` / `renderStatus()` with a `pickerCollapsed` flag. It resets to
  collapsed whenever a new full pair is loaded (`tapOwner`, `applyHash`, `loadPair`).

## H. Fill the desktop

- `.vs-explorer` padding: 18px 16px → 20px (≥768px: 24px).
- `.lb-grid` ≥1024px: `repeat(3, 1fr)`.
- `.owner-grid` minmax stays.

## I. Stamp

VERSION major: `v1.1` → `v2.0`; Last Updated = today. Update the header comment
`MAFFL RIVALRY ENGINE  (rivalry.html, v1.0)` (two spaces) → `v2.0`.

## Verify

- `node --check` on the inline `<script>` (copied to a temp file outside the repo) passes.
- Brian/Ron vs Jake matches the worked example at the top (record, split, last 5, lead changes 1, +10).
- Ratings: in the console, `ALL_PAIRS.filter(p=>p.lastYear===2025).length` pairs are no longer
  penalized. Report the top 5 of Top Rivalry Ratings before and after.
- Floor-rule grep (section B) is empty.
- Tabs, `#owner=` deep links, the power-rankings Rivals slug links, Share, the badge chips, the game
  log and the timeline taps all still work. The Discovery rows still load a pair (the picker collapses).
- **Mobile:** DevTools iPhone 12 Pro (390×844) **and** iOS Home-Screen standalone:
  hero numerals don't clip with two long co-owner names (try `Jon Murello / Rick Simmons` vs
  `Brian Murello / Ron Murello`), tiles are 2-up with nothing overflowing, the form chips are ≥44px,
  and `document.documentElement.scrollWidth === 390`.
- Desktop 1280px: tiles 4-up, hero numerals 72px, leaderboards 3-up.
- `git diff --stat` → `rivalry.html`, STATUS, the mockup doc, this prompt's move.

## Close out

Report the diff summary and the before/after top-5 ratings. `git mv` this prompt to
`_ops/prompts/done/`, then update `_ops/STATUS.md` with the block below. Everything goes in one commit.
**Commit but don't push yet.** Upgrade 3 ships in the same v2.0 release.

Suggested commit message: `Rivalry v2.0 (1/2): scoreboard hero, stat tiles, last-5 strip, Series Lead chart, bigger type, collapsible picker; rating recency anchored to last complete season`

---

STATUS:
- Recently shipped (top): `2026-09-30 · Rivalry v2.0 part 1: scoreboard hero, stat tiles, last-5 strip, Series Lead chart, 12px type floor, picker collapses after a pick; rating recency anchored to last complete season (no in-season swings). Not pushed: ships with upgrade 3.`
- Queued prompts: remove this prompt's line.
