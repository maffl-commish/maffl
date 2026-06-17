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

## Data Governance

Standing reference: **`MAFFL_HQ_DATA_GOVERNANCE.md`** (repo root) — the full data model,
source-of-truth registry, chain-event matrix, and gotcha register. Read it before any
data-layer change.

Two binding rules:

1. **Owner identity is canonical via `data/MAFFL_Owner_Registry.csv`** (one row per
   `owner_id` + a pipe-delimited `aliases` list of every spelling in the wild, ESPN
   variants included). Resolve any owner name by looking it up against the registry's
   alias list — do NOT fuzzy-match ad hoc. Any new owner-name spelling encountered must
   be ADDED to the registry, not matched on the fly. The 34 `owner_id` slugs are the
   `key:` values in `power-rankings.html` OWNERS_DATA; never invent a new slug for an
   owner that already has one. (Rationale: governance §7.1; the join key had 6+
   spellings — gotcha G-2.)

2. **Derived data is GENERATED from gold CSVs and must never be hand-edited.** This
   covers every `.js` data file (e.g. `matchups-data.js`, `draft-summary-data.js`) and
   every in-page embedded data array (e.g. the `OWNERS_DATA` / `timeline` blocks in
   `power-rankings.html`). Edit the gold source, then regenerate. The authoritative gold
   sources for each fact are listed in `MAFFL_HQ_DATA_GOVERNANCE.md` §2
   (Source-of-Truth Registry). Additionally: `MAFFL_Owners_Sheet_revised.csv`
   cols 9–12 (regular-season W/L/T + Career Win %) and `Power_Rankings.csv` `Win_Pct`
   are DERIVED from `MAFFL_Matchups_NoConsolation.csv` — regenerate from gold, never
   hand-edit. Likewise: Owners_Sheet col 8 (Division Titles) and Power_Rankings.csv
   Runner_Ups / Playoff_Apps / Division_Titles are DERIVED — Division Titles from
   Division_History (Tier=Upper, Rank=1, Year>=2013); Runner_Ups / Playoff_Apps from
   MAFFL_Matchups_NoConsolation.csv. Regenerate from gold, never hand-edit.
