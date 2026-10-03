# Rivalry v2.0 follow-ups: landing, scroll target, way back, pill removal, compact filter

VERSION: none

Date: 2026-10-03 · Author: Claude (chat) · Scope: `rivalry.html`, `CLAUDE.md` (remove one rule), `_ops/STATUS.md`.
These are fixes to v2.0 from the commissioner's walkthrough. Don't bump the version; update Last Updated only.

Read first: `_ops/STATUS.md`, `CLAUDE.md`. Anchors are from `rivalry.html` v2.0 (Last Updated October 3, 2026).
If one doesn't match, **stop and ask**. No `*.bak` files.

---

## 1. Landing: both tier groups start collapsed

`var slateTierOpen = { U: true, L: false };` → `{ U: false, L: false }`. The Week N Rivalries card itself stays open
(`slateOpen = true`), so landing shows the card with two collapsed rows: `UPPER · 6 GAMES` and `LOWER · 5 GAMES`.

## 2. Tapping a matchup: blue hero at the top, every accordion closed

**Bug:** `loadPair()` sets `location.hash`, then calls `scrollToVs()` straight away. The render happens later in
the `hashchange` → `applyHash()` handler, after the Week N card has been removed. So the scroll target moves after
the scroll is calculated, and the page lands in the wrong spot. `tapOwner()` has the same race with smooth scroll.

Fix:
- Replace `scrollToVs()` with `scrollToHero()`. It scrolls to `#vsResult .vs-hero` (fall back to `#vsResult`) and
  runs inside `requestAnimationFrame(() => requestAnimationFrame(...))` so it fires **after** the new markup is
  laid out. Use `scrollIntoView({ block: "start" })` with **no smooth behavior** (iOS standalone mis-lands smooth
  scrolls when the content above is collapsing).
- Give `.vs-hero` `scroll-margin-top: calc(76px + env(safe-area-inset-top));` (it clears the sticky header,
  including the standalone notch inset). Remove the old `#vsResult { scroll-margin-top: 84px; }` rule if nothing
  else needs it.
- Add a module flag `pendingHeroScroll`. `loadPair()` and `tapOwner()` (when a full pair results) set it to true
  instead of scrolling directly. At the end of `applyHash()` and `tapOwner()`, after `renderVS()` / `renderSlate()`,
  call `scrollToHero()` when the flag is set, then clear it. A fresh page load with a `#vs=` hash (e.g. from the Pulse
  rivalry link) should also land on the hero, so set the flag in `boot()` when the incoming hash has `vs=`.
- **All accordions closed on a new pair:** in `renderVS()`, change
  `accState = { pid: p.id, open: { form: true } }` → `accState = { pid: p.id, open: {} }`. That includes This Week /
  Recent Form. Toggles within the same pair keep working as now.

## 3. A way back to the landing view

Today the compact bar's only button, `Change`, re-opens the owner picker. Rebuild the collapsed bar in
`renderStatus()` (the `if (collapse)` branch):

- **Left:** a back button `‹ Week 4 Rivalries` (uses `CUR_WEEK`; `‹ Start over` when there's no slate), class
  `picker-back`, min-height 44px, display font 15px, `color: var(--gold-dark)`, no border.
- **Right:** keep `Change` (class `picker-change`) exactly as it works now.
- Drop the `Brian/Ron VS Jake` names from the bar. The hero directly below already shows them, so remove the
  `.pb-*` markup and grep-before-delete its CSS.
- `‹ Week 4 Rivalries` does a **full reset to the landing view**: `sel1 = sel2 = null; pickerCollapsed = true;`
  clear the hash with `history.replaceState(null, "", location.pathname + location.search)`, then `renderPills()`,
  `renderVS()`, `renderSlate()`, and `window.scrollTo(0, 0)`. The Week N card shows again, tiers collapsed per #1.
- **Phone back gesture:** because `loadPair()` pushes a hash, a back swipe fires `hashchange` with no `vs=`/`owner=`.
  Today `applyHash()` keeps the old selection in that case. Make it clear the selection (`sel1 = sel2 = null`) when the
  hash has neither, so back also returns to the landing view. Boot with no hash is unaffected (already null).

## 4. Remove the "Data through" pill (commissioner: it widens the header; Last Updated covers it)

- Delete `<span class="meta-pill" id="dataThroughPill">Data through …</span>`.
- Delete the whole `<script>` block that begins `/* Data-freshness pill: the newest game in matchups-data.js`
  (the small block directly after `<script src="matchups-data.js"></script>`; leave the `schedule-data.js` tag).
- `CLAUDE.md`: delete the `- **Data-freshness pill.** …` bullet (3 lines, starting at the line containing
  `Data-freshness pill`). Then confirm `grep -n "Data through\|dataThroughPill\|Data-freshness" CLAUDE.md rivalry.html`
  is empty.
- `_ops/STATUS.md`: if an Open decisions line about adding the Data-through pill to weekly/power-rankings still
  exists, delete it.

## 5. Compact, low-profile Active / All filter

- Markup: put the label and the pills on one row. Give `#filterSection` a class `filter-row`
  (`display: flex; align-items: center; gap: 10px; margin-bottom: 14px;`). Inside it, `.section-label` gets
  `margin: 0` and `#filterBar` `margin-bottom: 0`. Keep the ids, the `role="group"` and the handlers.
- Pills: scope new styles to `#filterBar .filter-pill` only (`.filter-pill` is also used by the vs-the-field
  sort buttons, which must not change):
  - visual height 30px (`min-height: 30px; padding: 4px 12px;`), 12px display font, letter-spacing 0.04em;
    `#filterBar .filter-count` stays 12px;
  - touch target is still ≥44px: `position: relative`, plus a `::after { content: ""; position: absolute;
    inset: -7px -2px; }` hit area;
  - gap between the two pills 6px. Selected = navy fill (unchanged).
- The result should read as one slim line: `SHOW  [ACTIVE (21)] [ALL (34)]`. It should be clearly smaller than the
  owner pills.

## Stamp

Last Updated = today. Version stays `v2.0`.

## Verify

- `node --check` on the inline scripts (copied to a temp file outside the repo) passes. No console errors.
- Fresh load: the Week 4 Rivalries card is open with **both** tiers collapsed.
- Open Upper, tap Brian/Ron v Jake: the page lands with the **navy hero's top edge just under the sticky header**,
  and **all six** accordions are closed (This Week included). Repeat from Lower (Troz v Johnson), from a Discovery
  row, and with a cold load of `rivalry.html#vs=mike murello,bj funari`: same landing every time.
- Tap `‹ Week 4 Rivalries`: back at the top, the Week 4 card is showing, the picker is in its normal state, and the
  URL has no hash. Load a pair again, then use the browser Back button: same landing view.
- `Change` still opens the owner picker with the current pair kept.
- The header shows only two pills (`v2.0`, `Last Updated …`).
- The filter is a single slim row. The vs-the-field sort buttons (pick one owner) look exactly as before.
- **Mobile:** DevTools iPhone 12 Pro (390×844) **and** iOS Home-Screen standalone, especially the hero landing under
  the header and the notch, and the back button + `Change` fitting on one row without wrapping.
  `document.documentElement.scrollWidth === 390`.
- `git diff --stat` → `rivalry.html`, `CLAUDE.md`, STATUS, this prompt's move.

## Close out

Report the diff summary. `git mv` this prompt to `_ops/prompts/done/`. Update `_ops/STATUS.md` with the block below.
One commit, then push.

Suggested commit message: `Rivalry v2.0 fixes: tiers start collapsed, tap lands on hero with all cards closed, back-to-landing button + back gesture, Data-through pill removed, compact Show filter`

---

STATUS:
- Recently shipped (top): `2026-10-03 · Rivalry v2.0 fixes: tiers start collapsed; tapping a game lands on the hero with every card closed; ‹ Week N Rivalries back button (and phone Back) returns to landing; Data-through pill + CLAUDE.md rule removed; compact one-line Show filter.`
- Queued prompts: remove this prompt's line.
