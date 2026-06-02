# MAFFL HQ — Post-Audit Defect Fix Pass — CHANGES

**Branch:** `fix/post-audit-defects` (created off a pre-edit snapshot commit; NOT pushed, NOT merged)
**Date:** 2026-06-01
**Scope:** Only the 5 commissioner-approved fixes from AUDIT.md. No refactors, no reformatting,
no unrelated edits. Source-of-truth ordering honored (CSV that owns a fact fixed first, then the
embedded HTML copy re-synced to match).

**Files touched:** 5
- `draft.html`
- `data/MAFFL_Owners_Sheet_revised.csv`
- `stats.html`
- `data/MAFFL_Rules_revised.csv`
- `weekly.html`

---

## Fix 1 — Brian/Ron backslash tier-lookup bug — NO CHANGE REQUIRED (already correct)

**Finding:** The defect described in AUDIT.md (§1.1 / §5a) is **not present in the current file.**
`draft.html` already keys the 2025 tier map with the forward-slash canonical form, matching the
`OWNERS[]` entry and every lookup. There is **no backslash variant anywhere in `draft.html`**
(verified by byte-level inspection and a whole-file backslash search).

- `draft.html:7958` (`OWNER_TIER_BY_YEAR[2025]`):
  `"Brian Murello / Ron Murello": "UPPER"`  ← already forward slash
- `draft.html:2091` (`OWNERS[]`):
  `... "Brian Murello / Ron Murello" ...`  ← exact match string the lookup uses

**Before:** `"Brian Murello / Ron Murello": "UPPER"` (forward slash)
**After:**  `"Brian Murello / Ron Murello": "UPPER"` (unchanged)
**Line:** `draft.html:7958`

**Action taken:** None. Changing it would have introduced no functional difference. Flagging for
the commissioner: either this was fixed since the audit was written, or the audit's byte-reading of
this line was mistaken. Brian/Ron's 2025 Upper-Tier pill already resolves correctly.

---

## Fix 2 — 2002 co-championship in `draft.html` (commissioner ruling: BOTH won)

`CHAMPS{}` mapped each year to a single owner index; 2002 pointed at Mike Murello (index 0) only,
silently dropping Josh Lavrinc's (index 4) 2002 title from the draft timeline. Changed the value
for 2002 to an array of both indices, and updated the three places that read `CHAMPS` so they
accept either a single index (the other 23 years, unchanged) or an array (2002).

**File:** `draft.html`

1. **Map value** — `draft.html:2092`
   - Before: `const CHAMPS={2002:0,2003:11,...`
   - After:  `const CHAMPS={2002:[0,4],2003:11,...`
   - (Index 0 = Mike Murello, index 4 = Josh Lavrinc per `OWNERS[]` at line 2091. All other years
     left as single integers.)

2. **`trophyHTML()` champion-name tooltip** — `draft.html:8000-8003`
   - Before:
     ```
     const champIdx = CHAMPS[yr];
     const champName = (champIdx !== undefined) ? OWNERS[champIdx] : OWNERS[pick[F_O]];
     ```
   - After:
     ```
     const champIdx = CHAMPS[yr];
     let champName;
     if (Array.isArray(champIdx)) champName = champIdx.map(i => OWNERS[i]).join(" & ");
     else champName = (champIdx !== undefined) ? OWNERS[champIdx] : OWNERS[pick[F_O]];
     ```
   - Co-champion years now render "Mike Murello & Josh Lavrinc"; single-champion years unchanged.

3. **Owner-profile champion years** — `draft.html:9010`
   - Before: `Object.keys(CHAMPS).forEach(y => { if (CHAMPS[y] === ownerIdx) champYears.add(parseInt(y, 10)); });`
   - After:  `Object.keys(CHAMPS).forEach(y => { const c = CHAMPS[y]; if (Array.isArray(c) ? c.includes(ownerIdx) : c === ownerIdx) champYears.add(parseInt(y, 10)); });`
   - Both Mike's and Josh's profiles now list 2002 as a championship year.

4. **Owner-profile championship count** — `draft.html:9358`
   - Before: `Object.keys(CHAMPS).forEach(y => { if (CHAMPS[y] === ownerIdx) champCount++; });`
   - After:  `Object.keys(CHAMPS).forEach(y => { const c = CHAMPS[y]; if (Array.isArray(c) ? c.includes(ownerIdx) : c === ownerIdx) champCount++; });`
   - 2002 now counts toward both owners' ring totals.

**Not changed (per instructions):** `cleaned_maffl_revised.csv` (both Champ=1 flags are correct) and
`history.html` (already renders co-champions).

**Verification:** 2002 now attributes to both Mike Murello and Josh Lavrinc in draft.html's
champion logic; the other 23 single-champion years compare via the unchanged integer path and are
unaffected.

---

## Fix 3 — Tony Brooks division titles 2 → 1 (commissioner ruling: 1 is correct)

CSV-first. Owners Sheet field "Division Titles (From 2013)" (8th column) was the stale source.

**Step A — source CSV:** `data/MAFFL_Owners_Sheet_revised.csv:32`
- Before: `Tony Brooks,...,Y,5,0,0,1,2,31,37,0,46%,...`
- After:  `Tony Brooks,...,Y,5,0,0,1,1,31,37,0,46%,...`
- (Only the Division Titles field changed: `2` → `1`. Playoff Appearances `1`, Wins `31`,
  Losses `37` to either side are untouched.)

**Step B — re-sync embedded copy:** `stats.html:558`
- Before: `{ name: "Tony Brooks", ... playoff: 1,  div: 2, wins: 31, ... }`
- After:  `{ name: "Tony Brooks", ... playoff: 1,  div: 1, wins: 31, ... }`

**Verification:** CSV and stats.html now agree at 1; matches the year-by-year recompute (only
2023 has Division=1).

---

## Fix 4 — Auction Draft Slot 2 time (commissioner ruling: HTML is right)

CSV-first. The rules CSV was stale (9:30–11:30 AM); the published HTML (8:30–10:30 AM) is correct.

**Step A — source CSV:** `data/MAFFL_Rules_revised.csv:58`
- Before: `,       Labor Day 9:30-11:30AM   ,,`
- After:  `,       Labor Day 8:30-10:30AM   ,,`
- (Slot 1 on row 56, `Labor Day 8-10AM`, left unchanged. Surrounding whitespace preserved.)

**Step B — HTML confirm (no change):** `rules.html:1247`
- Already shows `Slot 2 ... Labor Day, 8:30&ndash;10:30 AM EST`. Confirmed matching; no edit made.
- (The summary row `rules.html:1144` independently shows "Labor Day 8:30 AM EST" — also consistent.)

**Verification:** CSV and rules.html now agree at 8:30–10:30 AM.

---

## Fix 5 — `weekly.html` placeholder exposure (GO-LIVE BLOCKER)

The off-season flag was off while the embedded Week-1 data is invented `[PLACEHOLDER]` content, so
visitors would see fabricated standings as real.

**File:** `weekly.html:930`
- Before: `const IS_OFFSEASON = false;`
- After:  `const IS_OFFSEASON = true;`

**Not changed (per instructions):** The placeholder `WEEKS[]` array was left intact as a template.
The standalone `MAFFL_HQ_Weekly_Week01_2026.html` was left untouched (labeled template attachment).

**Verification:** With `IS_OFFSEASON = true`, the boot routine (`weekly.html:1429`) short-circuits to
`renderOffseason()` and returns **before** any week/standings rendering. `renderOffseason()`
(`weekly.html:1405-1415`) writes only static markup ("Weekly Pulse is dark until kickoff." + a link
to Power Rankings) and hides the week bar — it never reads `WEEKS`, so **no `[PLACEHOLDER]` scores
can surface.** Loading weekly.html today shows the off-season message, no invented standings.

---

## Summary table

| Fix | File | Line | Before | After |
|---|---|---|---|---|
| 1 | draft.html | 7958 | `"Brian Murello / Ron Murello"` | (already correct — no change) |
| 2 | draft.html | 2092 | `2002:0` | `2002:[0,4]` |
| 2 | draft.html | 8000-8003 | single-name lookup | array-aware (joins with " & ") |
| 2 | draft.html | 9010 | `=== ownerIdx` | array-aware `includes` |
| 2 | draft.html | 9358 | `=== ownerIdx` | array-aware `includes` |
| 3 | data/MAFFL_Owners_Sheet_revised.csv | 32 | Division Titles `2` | `1` |
| 3 | stats.html | 558 | `div: 2` | `div: 1` |
| 4 | data/MAFFL_Rules_revised.csv | 58 | `9:30-11:30AM` | `8:30-10:30AM` |
| 4 | rules.html | 1247 | `8:30–10:30 AM` | (already correct — confirm only) |
| 5 | weekly.html | 930 | `IS_OFFSEASON = false` | `IS_OFFSEASON = true` |

---

**Status:** All edits complete on branch `fix/post-audit-defects`. Nothing committed, pushed, or
merged. Awaiting commissioner review.
