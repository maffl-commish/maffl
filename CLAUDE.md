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

The two pills do different jobs:
- **Last Updated** = "something on this page is fresh." Update it on EVERY edit.
- **Version** = "the page itself changed in a way a returning owner would notice."
  It is a product signal, not a change counter. Most edits do NOT touch it.

### Version format: `vMAJOR.MINOR` only. There is no third digit on the pill.

| Level | Pill change | Use it for | How often |
|---|---|---|---|
| **None** (default) | date only | New weekly content, data refreshes (balances, standings, dues), rule text edits, copy and wording, bug fixes, style tweaks, follow-up fixes to a feature already shipped | Most commits |
| **Minor** | vX.Y → vX.(Y+1) | A new card, section, tab, or feature an owner would notice and use | A few per page per season |
| **Major** | vX.Y → v(X+1).0 | An overhaul: new layout, or a new way of using the page | About once per page per season, at most |

### Who decides
1. Every commissioner prompt carries a `VERSION:` line, which is `none`, `minor`, or `major`. Follow it exactly.
2. If a prompt has no `VERSION:` line, the default is **none**. Update the date only, and say in your report
   that you did not bump the version.
3. Never choose **major** yourself. Only the commissioner can call a major.
4. **One bump per release.** If the pill was already bumped for this feature in an earlier commit or prompt
   that hasn't gone out to the league, don't bump it again. Follow-ups and fixes to it are `none`.

### Other rules (unchanged)
- Pages are versioned INDEPENDENTLY. Don't sync numbers across pages.
- If a page is missing a meta pill, add it following the existing pattern before stamping.
- `rules.html`: `RULEBOOK_VERSION` tracks rule content and `PAGE_BUILD` is internal. This policy
  doesn't change either one. CAUTION: the header pills are rendered at runtime from
  `RULEBOOK_VERSION` / `RULEBOOK_LAST_UPDATED` (`renderVersionChips()` overwrites
  `#versionChipVersion` / `#versionChipUpdated`), so on this page the header pill always SHOWS
  `RULEBOOK_VERSION`. Stamp the date via `RULEBOOK_LAST_UPDATED` and keep the static pill
  markup in sync with the constants; editing only the static markup has no visible effect.
- A stamp update is part of the SAME commit as the change, not a separate pass.

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
   Division_History (Tier=Upper, Rank=1, **Year>=2005** — all years, NOT 2013+); Runner_Ups / Playoff_Apps from
   MAFFL_Matchups_NoConsolation.csv. Regenerate from gold, never hand-edit.
   NOTE: `cleaned_maffl_revised.csv` is CORRUPTED and must never be used to derive finish
   flags — it carried wrong division/lower-tier values into the HTML embeds. Use
   Division_History (divisions) + prize.csv (champ/RU/lower-tier) instead.
