# CLAUDE.md

## STANDING RULE: DATE/VERSION STAMP — applies to every code change to any page

Each subpage (`credits.html`, `draft.html`, `history.html`, `power-rankings.html`,
`prize.html`, `rules.html`, `stats.html`, `weekly.html`) carries header meta-pills:

```html
<div class="page-header__meta" ...>
  <span class="meta-pill">vX.Y</span>
  <span class="meta-pill">Last Updated <Month D, YYYY></span>
</div>
```

`index.html` carries the same pills at the BOTTOM in `<div class="footer-meta">`
(around line 846): `<span class="meta-pill">v1.0</span>` and
`<span class="meta-pill">Last Updated <Month D, YYYY></span>`.

### ON EVERY EDIT to a page:

1. ALWAYS update that page's "Last Updated" pill to today's date.
2. AFTER GO-LIVE (2026-07-01 onward): also bump that page's version pill IF the change
   is user-facing/substantive (markup, data, behavior). Use the page's own pill as the
   source of truth: patch bump (vX.Y → vX.Y+1) for fixes/tweaks; minor bump
   (vX.Y → vX+1.0) for new features/columns/sections. Skip the version bump only for
   trivial no-user-impact changes (comments, whitespace) — but still update the date.
3. Pages are versioned INDEPENDENTLY; do not sync version numbers across pages.
4. If a page is missing a meta pill, add it following the existing pattern before stamping.

**A stamp update is part of the SAME commit as the change, not a separate pass.**
