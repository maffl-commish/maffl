# Home page: What's New slide for Rivalry v2.0 (replaces the Draft slide)

VERSION: none

Date: 2026-10-03 · Author: Claude (chat) · Scope: `index.html` only (one slide swap + stamp).
**Run after upgrade 3** (`2026-09-30_rivalry-3-gameday.md`). The slide points at the new Rivalry page, so it
should go live with or after v2.0. If upgrade 3 hasn't been committed yet, stop and ask.

Read first: `_ops/STATUS.md`, `CLAUDE.md` (stamp rule: `index.html` pills are at the bottom in
`.footer-meta`), and the "ZONE 1 — WHAT'S NEW" comment above the carousel. If an anchor doesn't match
exactly, **stop and ask**. No `*.bak` files.

Commissioner call (2026-10-03): the draft is well behind us, so retire the Draft slide. The new slide
celebrates the Pulse + Rivalry upgrades and goes in **position 2**. Slide 1 (Weekly Pulse, evergreen) and
the "Tell Me What You Think" slide (now position 3) stay as they are.

## Step 1: Swap the slide

In `#newsTrack`, replace this whole block (exactly once):

```html
        <a class="slide" href="draft.html">
          <p class="slide-eyebrow">Both tiers · Sept 7</p>
          <p class="slide-headline">🎯 2026 Draft Results Are In</p>
          <p class="slide-body">All 462 picks are live on the Auction Draft page — search, filter, and see what everyone paid.</p>
        </a>
```

with:

```html
        <a class="slide" href="rivalry.html">
          <p class="slide-eyebrow">New · Rivalry v2.0</p>
          <p class="slide-headline">⚔️ Your League, Live Every Week</p>
          <p class="slide-body">The new Rivalry page and the Pulse's upcoming-week preview team up: this week's matchups, what's on the line, and every head-to-head since 2005.</p>
        </a>
```

Don't change slide 1, the speakup slide, the CSS or `wireCarousel()`.

## Step 2: Stamp

Footer `.footer-meta`: Last Updated = today's date. Version pill unchanged (VERSION none).

## Verify

- `#newsTrack` has exactly 3 `.slide` anchors in this order: `weekly.html`, `rivalry.html`, `speakup.html`.
  `grep -c 'href="draft.html"' index.html` counts only the nav/section links, with no slide left pointing there.
- The dots show 3, auto-advance still cycles, and tapping slide 2 opens `rivalry.html` (it lands on the Week N
  Rivalries card).
- **Mobile:** DevTools iPhone 12 Pro (390×844) **and** iOS Home-Screen standalone. Slide 2's headline and body
  wrap without clipping, the slide height matches its neighbours (no jump while swiping), tapping it stays inside
  standalone, and `document.documentElement.scrollWidth === 390`.
- `git diff --stat` → `index.html`, STATUS, this prompt's move.

## Close out

Report the diff summary. `git mv` this prompt to `_ops/prompts/done/`. Update `_ops/STATUS.md` with the block
below. One commit, then push.

Suggested commit message: `Home: What's New slide for Rivalry v2.0 (replaces Draft slide)`

---

STATUS:
- Recently shipped (top): `2026-10-03 · Home What's New: Draft slide retired; new slide 2 "⚔️ Your League, Live Every Week" → rivalry.html.`
- Queued prompts: remove this prompt's line.
