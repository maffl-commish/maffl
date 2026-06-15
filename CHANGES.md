# MAFFL HQ — 2026 Credit-Swap Rule Revision — CHANGES

**Branch:** `rules/2026-credit-swap-revision` (create off current; do NOT push or merge without commissioner sign-off)
**Date:** 2026-06-14
**Scope:** Commissioner-approved rule CHANGES (not clarifications) to the credit-swap perks, plus a presentation change converting the Spending Credits table to stacked perk cards. Source-of-truth ordering honored: `rules.html` (authoritative) edited first, `data/MAFFL_Rules_revised.csv` re-synced to match afterward. One new CSS rule added (`.perk-stack`); `.callout`, `.rule-tag`, and table styles untouched.

**Files touched:**
- `rules.html`
- `data/MAFFL_Rules_revised.csv`
- `CHANGES.md`

---

## Change 1 — Matchup Swap: hard deadline + one-and-done lock
New deadline: declare to commish AND all affected owners by **Thursday 6:00 PM ET** (or one hour before that week's first kickoff if earlier than Thursday), replacing the old "before 1st game of the week kickoff." Added a one-swap-per-owner-per-week cap and a **no-reversal lock**: once a swap is approved, the teams involved are locked for that week — no reversing or re-swapping. New `No Reversal` restrict pill added beside `Reg. Season Only`. Swaps remain unilateral with commish approval as the only gate; affected-owner approval is NOT required. Existing "declare to all parties = notified, approval not required" and "does not change weekly high-score prizes / Survivor pool / other awards" clauses preserved. CSV synced.

## Change 2 — Double Player Bonus: hard deadline
Deadline changed to declare to commish and opponent by **Thursday 6:00 PM ET** (or one hour before that week's first kickoff if earlier than Thursday), replacing "before 1st game of the week kickoff." All other eligibility/stacking terms unchanged. CSV synced.

## Change 3 — Division Swap: Model B (provisional until Labor Day Eve freeze)
Alignment no longer "locks on August 1." The commissioner posts **provisional** alignment in the offseason (often early); from posting until the **Labor Day Eve freeze**, an owner may make a 1-for-1 division swap. Swaps are provisional and changeable/withdrawable at no cost until the freeze; each owner may have **one** swap committed at the freeze, and only the swap in effect at the freeze is charged (−10), at which point alignment becomes final. Affected owners notified; approval NOT required; commish approval required. Division Alignment paragraph rewritten; off-season milestone row relabeled "Division Swap Window Freezes (alignment final)"; Division Swap perk row fully rewritten with `Off-Season · Limit 1` pill. CSV synced (milestone rows + perk parenthetical).

## Change 4 — Owner-facing flag
NEWS_FEED "Amended" entry added to the Info tab (above the existing "Clarified" item), linking to the Credit System section (`#credit-system`), summarizing the swap deadline/lock and the division-swap freeze.

## Change 5 — Spending Credits: table → stacked perk cards
Replaced the 5-column Spending Credits `<table>` (inside its `.table-scroll` wrapper) with a `.perk-stack` of five `.callout` cards (one per perk: Purchase Additional FAAB, Double Player Bonus, Matchup Swap, Division Swap, Relegation Insurance), reusing the existing `.callout` / `.callout-label` pattern. Each card carries its restrict/`Clarified · 2026` pills in the label and breaks the perk into labeled `Cost` / `Mechanic` / `Deadline` / `Eligibility` / `Limits` / etc. bullets — same rule content as the swap revision above, just restructured for mobile readability (no horizontal scroll). One new CSS rule added: `.perk-stack { display: flex; flex-direction: column; gap: 14px; }`. The Earning-credits table above and the `<h3>Spending Credits</h3>` heading were left untouched.

## Change 6 — Spending Credits: reverted cards back to the data-table
Reverted Change 5's presentation. The `.perk-stack` card block was replaced with the original 5-column `<table class="data-table">` inside its `.table-scroll` wrapper (League / Option / Perk Description / Credit Cost / Notes / Restrictions). The cleaned bullet content from the cards is retained — each row's **Notes / Restrictions** cell now holds a `<ul>` of labeled bullets (Deadline / Eligibility / Approvals / Restrictions / Limits / etc.) rather than a prose paragraph. The now-unused `.perk-stack` CSS rule was removed; three compact in-cell list rules were added (`.data-table td ul`, `.data-table td li`, `.data-table td li:last-child`). Rule content unchanged; the swap-rule revisions (Changes 1–3), Division Alignment paragraph, milestones row, NEWS_FEED entry, RULEBOOK constants, and the synced CSV all remain in place.

## Change 7 — Spending Credits: widen the Notes / Restrictions column
With the bulleted Notes cells, the column was too narrow on mobile (~213px) and the table sprawled vertically. Added a scoped `perks-table` class to this table only and two CSS rules: `.table-scroll .data-table.perks-table { min-width: 880px; }` and a 360px width on its last column (`th/td:last-child`). The shared `.table-scroll .data-table { min-width: 640px; }` default is unchanged, so other wide tables are unaffected. Measured effect at 375px viewport: Notes column 213px → 360px, table height 1995px → 1203px (~40% shorter); the wider table still scrolls horizontally inside `.table-scroll`.

**Verification:** `git diff` confirmed `rules.html` and `data/MAFFL_Rules_revised.csv` agree on every revised rule; comma-bearing CSV fields quoted per file convention (no spurious columns); table structure/CSS untouched. Version held at **v1.0** (pre-go-live); "Last Updated" pill already read June 14, 2026 (today) — no date change needed.

---

# MAFFL HQ — 2026 Rule Clarification Pass — CHANGES

**Branch:** `rules/2026-clarifications` (create off current; do NOT push or merge without commissioner sign-off)
**Date:** 2026-06-13
**Scope:** Commissioner-approved rule clarifications surfaced in the rules audit. No new rules — wording/logic clarifications only, plus presentation and a CSV re-sync. Source-of-truth ordering honored: `rules.html` (authoritative) edited first, `data/MAFFL_Rules_revised.csv` re-synced to match afterward.

**Files touched:**
- `rules.html`
- `data/MAFFL_Rules_revised.csv`
- `CHANGES.md`

---

## Change 1 — Tiebreakers section reorganized
Collapsed the scattered tiebreaker columns into three clean columns: General/Wildcard (standings + season-long credit-earning awards use Record → Credit Balance → Total Points For), Division (Record → Credit Balance → Division Record → Total Points For), and a single merged "Playoff Game & Weekly High Score Prize" column that resolves both the same way — highest single-game score by any one starter across the tied teams, then second-highest, then third, and so on. Removed the redundant standalone "Credit-Earning Awards" column (its content folded into General/Wildcard) and unified two previously inconsistent wordings of the single-game-score method. CSV synced.

## Change 2 — Weekly High Score: cash + credit clarified
Clarified that the weekly high score earns BOTH a cash payout (share of 20% pool) AND a +1 credit; 14 fixed payouts; ties never create extra dollars; weekly tie broken by highest individual starter score on either tied team (now stated once, in the merged Tiebreakers column). New callout in Prize Schedule; CSV synced.

## Change 3 — Relegation Insurance: 3-per-season cap + displacement
Limited to 3 purchases per season, first come first served. Elevating an insured team to Seed #7 shifts teams ordinarily ahead down accordingly. Added to Spending Credits Notes; cross-link added between the Promotion/Relegation "How the 3rd spots are decided" callout and the Credit System section. CSV synced.

## Change 4 — Double Player Bonus eligibility
Eligible in Consolation series but NOT in Promotion/Relegation Showdowns; stackable with Matchup Swap; both owners in a matchup may declare the same week; an owner may declare twice in a week but not on the same player (no 4× on one player). Spending Credits Notes updated; CSV synced.

## Change 5 — Matchup Swap notification + neutrality
"Declare to all parties" = affected owners are notified directly (not left to find out via ESPN results); commish approval required; affected-owner approval NOT required. A swap does not change weekly high-score, Survivor, or other awards for the games involved. Spending Credits Notes updated; CSV synced.

## Change 6 — 3-game series format
All Showdowns and Consolations (3-game series) are first-to-2 wins, not aggregate points. Added to Promotion & Relegation intro; CSV synced.

## Change 7 — Survivor Pool expanded definition + large-tier overflow
Regular season only (Wks 1–14), run per tier; lowest weekly score eliminated each week; a team facing MAFFL Ghost is scored on its own real score (Ghost does not affect Survivor); last team standing earns +5; simultaneous-low ties eliminate both. Added overflow handling: with more than 15 teams in a tier, extra eliminations are front-loaded in the earliest weeks (then one per week) so a winner still emerges by Week 14 (e.g., 16 teams → 2 out in Wk 1; 17 teams → 2 out in Wks 1–2). New callout in Credit System (Bonus area); CSV synced.

## Change 8 — MAFFL Cup defined
The MAFFL Cup is the league championship trophy, awarded to the Upper-Tier Champion; the reigning champion keeps it and ships it to the next champion. Added to General Rules; CSV synced.

## Change 9 — MAFFL Ghost scoring re-synced (CSV → HTML)
CSV brought in line with HTML: Ghost score = DROP the single highest real-team score, then average the remaining real teams (CSV previously averaged all teams). Ghost draft behavior and draft-window times also re-synced. HTML unchanged (already correct).

## Change 10 — Presentation
Rulebook search bar made sticky beneath the site header. Critical spending-perk restrictions surfaced as inline badges (No Playoffs / By Wk 4 · Limit 3 / Reg. Season Only) in the Option cells. Example prize calculation labeled illustrative.

## Change 11 — Deep-link / navigation fixes
Fixed the News & Announcements "Clarified" item so it now jumps to the Rulebook tab and opens Tiebreakers (href `#tiebreakers`); hardened the news-link click handler so a click whose hash already equals the current location still re-triggers the section jump. Fixed a broken Division Alignment reference on the Info tab so it links to the "2026 Tier & Division Alignment" section (`#alignment`).

## Change 12 — Owner-facing flags
"Clarified · 2026" pills (`.rule-tag.amended`) added to each clarified line item (Tiebreakers merged column, Survivor pool, Double Player Bonus, Matchup Swap, Relegation Insurance, MAFFL Cup, Weekly High Score). NEWS_FEED entry added to the Info tab — positioned below the MAFFL Ghost "New Rule" item — linking owners to the Rulebook.

**Note — reverted during review:** A "prizes stack" clarification was drafted and then removed at commissioner direction; prize stacking has never been in question and the added line read as confusing. No prize-stacking language ships in `rules.html` or the Info tab.

**Verification:** Confirmed `rules.html` and `data/MAFFL_Rules_revised.csv` agree on every clarified rule; AMENDED pills render distinct from gold New pills; sticky search and perk badges hold at 390px; Tiebreakers grid renders 3 columns at 390px; the Clarified news item switches to the Rulebook tab and opens Tiebreakers; the Division Alignment link resolves. "Last Updated" date pill bumped; version held at v1.0 (pre-go-live).

---

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
