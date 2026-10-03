# Rivalry upgrade 2 of 3: head-to-head redesign (scoreboard + accordions)

VERSION: major

Date: 2026-10-03 (replaces the 2026-09-30 tile version) · Author: Claude (chat) · Scope: `rivalry.html` only.

Commissioner call (2026-09-30, approved 2026-10-03 from Mockup B): the page read small and cluttered.
These structural layout changes are approved:
- a navy scoreboard hero;
- the head-to-head stats regrouped into **Pulse-style accordion cards** (only the first one open);
- a Last-5 strip and a Series Lead chart;
- a 12px type floor;
- the owner picker collapses once a matchup is loaded.

Don't make any other layout changes.

Read first: `_ops/STATUS.md`, `CLAUDE.md` (stamp rule + data-freshness pill rule), and the approved mockup
`_ops/docs/RIVALRY_V2_MOCKUP.html` (panel ②). **Match the mockup's look.** If the mockup and this spec
disagree, the spec wins. Anchors are from `rivalry.html` as of 2026-09-30 (v1.1, with the `dataThroughPill`).
If one doesn't match, **stop and ask**. No `*.bak` files.

**Worked example** for checking: Brian/Ron vs Jake (`#vs=brian murello / ron murello,jacob nickman`).
- 21–11 all time (Regular Season 18–10, Postseason 3–1). Brian/Ron has won the last 3.
- Last 5 from Brian/Ron's view, oldest → newest: W (2021 Wk 6), L (2021 Q), W (2022), W (2023), W (2024).
- Series lead: Jake led 2–0 after 2005 Wk 13. Brian/Ron first led after 2006 Wk 8, was level again
  after 2012 Wk 2, and has led ever since. Biggest lead +10 (2024). **1 lead change.** Jake last led in 2005.
- Biggest blowout Jake by 62.5 (146–83.5, 2011 Wk 12). Heartbreaker Brian/Ron by 1.5 (112–110.5, 2009 Wk 11).
  Nail-biters 1 (Brian/Ron 1, Jake 0). Longest streaks Brian/Ron 6, Jake 4. Average margin 27.43.
- Shared history: 25 seasons together (2002–present), same tier 1 (2026, Upper), same division 8 (2005–2012:
  Simpson, Kardashian).

---

## A. Rating fix: anchor recency to the last complete season (logic)

Because 2026 is in progress, `ratingRaw()` recency now cuts every pair that met in 2025 from 15 to 10, while
pairs that happened to meet in Weeks 1–4 keep 15. Ratings will swing every week.

- After the `DATA_MAX_YEAR` IIFE, add:
  ```js
  /* Last season with a Championship game. Ratings anchor here so they don't swing week to week in-season. */
  var LAST_COMPLETE_YEAR = (function () {
    var mx = 0;
    (window.MATCHUPS_DATA || []).forEach(function (r) { if (r[7] === "C" && r[0] > mx) mx = r[0]; });
    return mx || DATA_MAX_YEAR;
  })();
  ```
- `ratingRaw()`: replace `DATA_MAX_YEAR` with `LAST_COMPLETE_YEAR` in all three recency tests.
- `renderLeaderboards()` budding filter: `firstY >= DATA_MAX_YEAR - 2` → `firstY >= LAST_COMPLETE_YEAR - 2`.
- `explainerHtml()` Recency bullet → `"met this season or last (up to 15 pts)"`.
- `DATA_MAX_YEAR` stays everywhere else ("present").

## B. Type floor: nothing on the page under 12px

| Selector | New size |
|---|---|
| `.vs-blurb` | 16px, weight 500, `color: var(--navy)`, not italic, left-aligned |
| `.badge-chip` / `.badge-desc` | 14px (chip `min-height: 36px`) / 14px |
| `.tl-caption` | 14px |
| `.h2h-axis`, `.h2h-legend` | 12.5px |
| `.po-line .po-years` | 14px |
| `.field-row` / `.field-rec` / `.field-last` / `.field-emoji` / `.field-head` | 15 / 14 / 12.5 / 14 / 20px |
| `.owner-pill` / `.op-rec` / `.op-badge` | 14.5 / 12 / 12px |
| `.owner-status .os-tag` / `.os-name` / `.os-empty` | 12 / 18 / 14px |
| `.filter-count` | 12px |
| `.lb-row__names` / `.lb-vs` / `.lb-note` / `.lb-emoji` | 15 / 12 / 13 / 14px |
| `.vs-msg` | 15px |

Check: `grep -nE "font-size:\s*(9|10|11)(\.[0-9]+)?px" rivalry.html` → nothing.

## C. Scoreboard hero (replace the `var head = ...` block in `renderVS()` and the `.vs-head*` CSS)

- Card: `background: linear-gradient(160deg, #243a62 0%, #1a2e50 55%, #0f1d34 100%); color: #fff;`
  radius 14px, padding 12px 14px 14px, centered text, margin-bottom 10px.
- First child: an empty `<div class="vs-strip-slot"></div>` (upgrade 3 puts the "This week" strip here; it's
  empty in this prompt and takes no space).
- Scoreboard is a 3-col grid `1fr auto 1fr`, `align-items: end`:
  - Each side has the **full name** (Barlow Condensed 700, 17px, line-height 1.1, wraps) over the win count
    (Barlow Condensed 700, **52px**, line-height 1).
  - Middle: `VS` (12px, letter-spacing .12em, `rgba(255,255,255,.55)`).
  - The series leader's number is `var(--gold)`, the trailer's `rgba(255,255,255,.7)`; tied → both gold.
    Owner 1's name is `#f7c46a`, Owner 2's white.
- Meta row (flex, centered, wraps, gap 6px 12px, 14px, `rgba(255,255,255,.8)`):
  `Reg 18–10 · Post 3–1` (values bold white); the tier split (keep the current logic, same format) if both
  tiers have meetings; the Rating pill (`Rating 86` + badge emojis, 1px gold border, white text, radius 999px);
  and the **Share** button, restyled as an underlined text button (white, 14px display font, min-height 44px).
  It must keep class `vs-share` so the existing wiring works.
- Remove the `vs-head-rec` winRateColor pill. Keep the `winRateColor()` function (pills and field rows use it).
- ≥768px: numbers 72px, names 22px.

## D. Accordion sections (replaces the `.vs-stats` list, the blurb/badge/callout stack and the old game-log toggle)

Below the hero, render six Pulse-style cards. Copy the look of `weekly.html`'s `.pulse-card` / `.card-head` /
`.card-title` / `.card-chev` / `.card-preview` / `.card-body` (same sizes, border, radius 10px, open state =
navy border + shadow), but under new class names so nothing collides:

```html
<section class="acc[ open]" data-acc="{id}">
  <button type="button" class="acc-head" aria-expanded="true|false" aria-controls="acc-{id}">
    <span class="acc-l"><span class="acc-icon">{icon}</span><span class="acc-title">{TITLE}</span></span>
    <span class="acc-chev" aria-hidden="true">▼</span>
  </button>
  <div class="acc-prev">{one-line preview, 14px muted; hidden when open}</div>
  <div class="acc-body" id="acc-{id}">{body; hidden when closed}</div>
</section>
```

Build it with a helper `accHtml(id, icon, title, preview, body, open)`. `.acc-head` must be min-height 52px.
Tapping the head toggles `open` + `aria-expanded`. **Only `form` starts open.** The open state resets on every
new pair. Inside bodies use a new `.kv` row (label left, 14px muted; value right, 16px bold; optional `<small>`
detail line, 13.5px muted) as in the mockup.

| # | id | Icon + title | Collapsed preview | Body |
|---|---|---|---|---|
| 1 | `form` | 📈 Recent Form | `Brian/Ron has won the last 3` (1 → `Jake won the last meeting`) | The Last-5 strip (E) |
| 2 | `story` | 📖 The Story | lead summary + ` · ` + badge names, e.g. `Jake hasn't led since 2005 · 🩸 Blood Feud` (variants: `{X} has never trailed`, `Series is level`, `{X} leads after trailing as late as {year}`) | `rivalryBlurb()` text (`.vs-blurb`), then `renderBadgeRow()` (chips + description, same wiring), then the Series Lead chart (F) |
| 3 | `big` | 🏆 Big Games | `Postseason 3–1 Brian/Ron · Biggest blowout 62.5` (no playoff games → `No playoff meetings · Biggest blowout …`) | `champCalloutHtml()` (if any), sub-head `Postseason by Round` + `postseasonHtml()`, sub-head `Extremes`, kv rows: Biggest blowout, Heartbreaker, Nail-biters (≤ 3 pts) with each side's count |
| 4 | `streaks` | 🔥 Streaks & Scoring | `Brian/Ron has won 3 straight · avg margin 27.43` | kv rows: Current streak, Longest streak (both sides), Total points (`3632.56 – 3346.12`, small `Brian/Ron – Jake`), Average margin |
| 5 | `shared` | 🤝 Shared History | `25 seasons together · 8 in the same division` (0 → `never in the same division`) | kv rows: Seasons together / Same tier / Same division: big count + small span/names. Reuse the existing `sharedYearsTxt`, tier and division logic; only the presentation changes. Keep the "n/a — tiers began in 2025" case. |
| 6 | `log` | 📜 All {N} Meetings | `Since 2005 · margin timeline + full log` | Margin timeline (`renderTimeline()` output without its outer `vs-stat` wrapper; caption taps unchanged), then sub-head `Game Log` + `newest first`, one row per game: left muted `2024 Wk 6 · Quarter`, right winner short name (win/loss colour from Owner 1's view, as today) + `99.96–82.22` |

The sub-heads use `.sub-h` (12.5px display uppercase muted). Grep-before-delete: once nothing references
`statBlock`, `gameLogHtml`, `.vs-stats`, `.vs-stat*`, `.gamelog-*`, `.vs-head-*`, remove them, and report what
you removed.

## E. Last-5 strip (`formStripHtml(p, k1)`)

- The last 5 meetings (fewer if the series is shorter), **oldest → newest, left to right**, from Owner 1's view.
- Label row: `LAST 5` (sub-h style) + right-aligned `{Owner1 short}'s view`.
- Chips are buttons, 44×44px, radius 10px, white `W`/`L` (18px display) on `var(--win)` / `var(--loss)`.
  Non-regular-season games get a tiny navy corner tag (`Q` / `S` / `C` / `3rd`). Under each chip: `'24` (12.5px muted).
- Tapping a chip shows a caption under the strip in the timeline format, e.g. `2024 Wk6 · 99.96–82.22 (+17.74)`.
  Tap again to hide. One caption at a time. Wire it in `wireVSInteractions`.

## F. Series Lead chart (`seriesLeadHtml(p, k1, k2)`, inside The Story)

- Lead after meeting i = Owner 1 wins − Owner 2 wins so far.
- SVG `viewBox="0 0 340 140"`, width 100%:
  - A step line (`var(--navy)`, 2px) through each meeting, x evenly spaced.
  - y scaled to the **actual** range `[min(0, minLead, −1), max(0, maxLead, 1)]` with 16px padding top and bottom
    (not symmetric).
  - A zero line in `var(--border)`. The area above zero is tinted `var(--win)` at 18%, below `var(--loss)` at 18%
    (clipPaths, as in the mockup).
  - A 5px end dot, labelled `+10` / `−3` / `Tied` to the **left** of the dot (text-anchor end).
- Axis row: first / last year (`.h2h-axis`). Legend: `{Owner1} ahead` / `{Owner2} ahead`.
- Stats line (14px): `Lead changes 1 · Biggest lead Brian/Ron +10 (2024) · Jake last led in 2005`
  (or `· Jake has never led`). A lead change happens only when the side in front differs from the last side
  that was in front (level-then-same-leader is not a change).
- Tap targets: invisible 20px-wide rects per meeting. They show a caption like `After 2012 Wk 2: level` /
  `After 2024 Wk 6: Brian/Ron +10`. Keep a separate `leadTitles` array and wire it in `wireVSInteractions`.

## G. Collapse the picker once a matchup is loaded

When `sel1 && sel2`, hide the "Owner filter" section, the "Pick Two Owners" label and `#ownerGrid`. `#ownerStatus`
becomes a compact bar: the **short** names (`Brian/Ron VS Jake`, 18px display, Owner 1 gold-dark) and a `Change`
button (min 44px, gold-outline pill). `Change` re-shows the picker and keeps the selection. Any other state looks
exactly like today. Use a `pickerCollapsed` flag that resets to collapsed when a new full pair loads (`tapOwner`,
`applyHash`, `loadPair`).

## H. Desktop

At ≥900px, cap the head-to-head result column (hero + accordions) at `max-width: 760px; margin: 0 auto`, so cards
don't stretch to 1100px. `.lb-grid` at ≥1024px: `repeat(3, 1fr)`.

## I. Stamp

VERSION major: `v1.1` → `v2.0`; Last Updated = today. Leave the `dataThroughPill` alone. Header comment:
`MAFFL RIVALRY ENGINE  (rivalry.html, v1.0)` (two spaces) → `v2.0`.

## Verify

- `node --check` on the inline `<script>` blocks (copied to a temp file outside the repo) passes.
- Brian/Ron vs Jake matches every number in the worked example.
- Only Recent Form is open on load. Every head toggles, and the previews read as specified.
- Ratings: report the top 5 of Top Rivalry Ratings before and after section A.
- The type-floor grep is empty.
- Tabs, `#owner=` links, the power-rankings Rivals slug links, Share, badge chips, timeline taps, Discovery rows
  (load a pair, the picker collapses) and the Data-through pill all still work. No console errors.
- **Mobile:** DevTools iPhone 12 Pro (390×844) **and** iOS Home-Screen standalone. Hero numbers don't clip with two
  long co-owner names (`Jon Murello / Rick Simmons` vs `Brian Murello / Ron Murello`). Accordion heads are ≥52px.
  Form chips ≥44px. `document.documentElement.scrollWidth === 390`.
- Desktop 1280px: the result column is centered at ≤760px, and leaderboards are 3-up.
- `git diff --stat` → `rivalry.html`, STATUS, this prompt's move.

## Close out

Report the diff summary, the removed-code list and the before/after top-5 ratings. `git mv` this prompt to
`_ops/prompts/done/`. Update `_ops/STATUS.md` with the block below. One commit.
**Commit, don't push.** Upgrade 3 ships in the same v2.0 release.

Suggested commit message: `Rivalry v2.0 (1/2): scoreboard hero, accordion sections, Last 5, Series Lead chart, 12px type floor, collapsible picker; rating recency anchored to last complete season`

---

STATUS:
- Recently shipped (top): `2026-10-03 · Rivalry v2.0 part 1 (committed, not pushed): scoreboard hero, Pulse-style accordion sections (Recent Form open), Last 5, Series Lead chart, 12px type floor, picker collapses after a pick; rating recency anchored to last complete season.`
- Queued prompts: remove this prompt's line.
