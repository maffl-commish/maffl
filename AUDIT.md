# MAFFL HQ — Data Provenance & Consistency Audit

**Date:** 2026-06-01
**Scope:** Read-only diagnostic of the MAFFL HQ static site (HTML + CSV in `./data/`).
**Constraint honored:** No file was modified, created, moved, or deleted except this `AUDIT.md`.

> **How to read the verdicts:** Each item is tagged **[ERROR]** (a genuine defect),
> **[CONFLICT]** (two sources disagree — one is wrong), **[KNOWN/INTENTIONAL]** (a gap the
> builder appears to have made on purpose), or **[QUESTION]** (needs a human decision).

---

## 1. Executive Summary

**Overall health verdict: GOOD with a handful of real defects.** The CSVs are the master
record and the pages mostly track them faithfully. Career stats reconcile almost perfectly
against the raw season data, prize/dues/credit numbers are correct, and `history.html` even
re-parses embedded CSV copies at runtime with proper name-normalization. The problems are
concentrated in (a) **owner-name string chaos** across files, which has already caused one
silent bug, and (b) a **2002 double-championship** that the pages handle three different ways.

The most important findings, worst first:

1. **[ERROR] `draft.html` tier lookup is broken for Brian Murello / Ron Murello** — the 2025
   tier map keys their entry with a **backslash** `"Brian Murello \ Ron Murello"`
   (`draft.html:7958`) while every lookup uses the forward-slash canonical name. Result: none
   of Brian/Ron's 2025 draft picks get their Upper-Tier pill. A pure typo, caused by the
   name-format mess. **Highest-confidence concrete bug.**

2. **[CONFLICT/QUESTION] 2002 has TWO championship flags** — both **Mike Murello** and
   **Josh Lavrinc** carry `Champ=1` for 2002 in `cleaned_maffl_revised.csv`. That makes **25
   championship flags across 24 seasons (2002-2025)**. The three pages disagree:
   `history.html` shows them as **co-champions**, `draft.html`'s `CHAMPS` map silently
   assigns 2002 to **Mike Murello only** (Josh's 2002 title disappears from the draft
   timeline), and `stats.html` credits **Josh with 1 ring** that can't be located on
   draft's champion-by-year. Either 2002 was a genuine co-championship (then `draft.html` is
   wrong) or one flag is a data error (then `stats.html`/`history.html` overcount). **Needs
   the commissioner to confirm who won 2002.**

3. **[ERROR] Tony Brooks career "Division Titles" is overstated.** `MAFFL_Owners_Sheet_revised.csv`
   (and therefore `stats.html`) lists **2** division titles. Recomputing from the year-by-year
   data and cross-checking the division-rank history, he has only **1** (Number 2 Tony,
   Kunis #1 in 2023). Displayed **2**, recomputed **1**. This is the only career-stat
   mismatch in the entire dataset.

4. **[ERROR] Owner-name string has up to 6 different representations** for the same co-owner
   pair (newline / `/` / `/ ` / ` / ` / `\`), and "Mike Murello" vs "Michael Murello". Today
   this only bites in `draft.html` (#1), but it is a latent hazard for every hand-keyed join.

5. **[CONFLICT] Auction Draft Slot 2 time disagrees.** `rules.html:1247` shows
   **8:30–10:30 AM**; `MAFFL_Rules_revised.csv` (row 58) says **9:30–11:30 AM**. HTML
   contradicts the canonical CSV.

6. **[CONFLICT] The credit packet's "2026 League" column is mislabeled.**
   `MAFFL League Packet - Division History.csv` has a column headed **"2026 League"** whose
   values are actually each owner's **2025** league (e.g., Mike Murello = "Lower-Tier", but he
   is Upper-Tier for 2026). The real 2026 tier is encoded by whether the row has a 2026
   Division (A–D = Upper, N/A = Lower). Every page that matters reads the *correct* 2026 tier;
   only this CSV column is misleading.

7. **[ERROR/EXPOSURE] `weekly.html` will display fabricated Week-1 results as if real.**
   `IS_OFFSEASON = false` (`weekly.html:930`) even though today is the off-season, and the
   embedded Week-1 data is invented placeholder (Joe Reilly 142.8, etc.) tagged
   `[PLACEHOLDER]`. A league member visiting today would see made-up standings. The
   Gmail-attachment twin `MAFFL_HQ_Weekly_Week01_2026.html` carries the same placeholder data
   (there it's clearly labeled as a template).

8. **[KNOWN/INTENTIONAL] Every page is "frozen," not live.** No page fetches a CSV at runtime
   except `history.html`, which parses *its own embedded copy* of three CSVs. All other data
   is hand-copied into HTML/JS. This is by design (self-contained for Gmail), but it means any
   later CSV edit must be hand-propagated, and the embedded copies can silently drift.

Nothing here is financially wrong (dues, prizes, credit balances all reconcile). The
reputational risks are the 2002 championship ambiguity (#2), the missing tier pill (#1), the
overstated Tony Brooks division count (#3), and the live placeholder weekly (#7).

---

## 2. File Inventory

| File | Type | Purpose / Notes |
|---|---|---|
| `index.html` | HTML | Landing / springboard. Pure navigation markup; no league data values (only a static "24 Seasons" label). |
| `weekly.html` | HTML | Weekly Pulse (standings/survivor/Elite 5/news). **Embedded JS `WEEKS`; all 2026 data is `[PLACEHOLDER]`.** |
| `rules.html` | HTML | Rulebook + 2026 tier assignments + division alignment. Embedded markup; data NOT read from CSV at runtime. |
| `credits.html` | HTML | Credit Portal (current balances + registry). Balances hardcoded in markup. |
| `draft.html` | HTML | Draft history explorer. Embedded `OWNERS`, `CHAMPS`, `PICKS` (5,855 picks) + 2025 tier map. |
| `history.html` | HTML | Year-by-year history. **Parses embedded copies of 3 CSVs at runtime; normalizes owner names.** |
| `power-rankings.html` | HTML | Madden-style ratings + scout notes. Embedded `OWNERS_DATA` (32 owners). |
| `prize.html` | HTML | Prizes (all-time) + 2026 dues status. Embedded `MAFFL` object. |
| `stats.html` | HTML | Career totals table. Embedded `OWNERS` array (verbatim copy of Owners Sheet). |
| `MAFFL_HQ_Weekly_Week01_2026.html` | HTML | Standalone Gmail-attachment version of Weekly Pulse. Placeholder data (labeled as template). |
| `manifest.json` | JSON | PWA manifest (icons/standalone). Not data. |
| `maffl-logo.png` | image | Logo asset. |
| `data/MAFFL_Owners_Sheet_revised.csv` | CSV | **Authoritative** owner roster, career totals, 2026 assignments, ratings, credit balances. |
| `data/cleaned_maffl_revised.csv` | CSV | Year-by-year W/L/T + season/champ/runner/division/playoff flags (2002-2025). |
| `data/MAFFL_Division_History_2005_2025.csv` | CSV | Division alignments & ranks 2005-2025. Uses "Michael Murello". |
| `data/MAFFL_Draft_History_Clean_v3.csv` | CSV | 5,855 draft picks 2005-2025. |
| `data/MAFFL_Rules_revised.csv` | CSV | Canonical rulebook content (dated 8/17/25). |
| `data/MAFFL League Packet - 2025 Prizes.csv` | CSV | 2025 payouts + 2026 dues + weekly-high-score log. |
| `data/MAFFL League Packet - Credit Overview.csv` | CSV | Credit earning/spending rules. |
| `data/MAFFL League Packet - Division History.csv` | CSV | 2026 alignment + credit snapshots. **"2026 League" column is mislabeled (see §5).** |
| `data/2025 MAFFL League Status - Sheet1.csv` | CSV | Point-in-time snapshot (credit balance + 2025/2026 league). |
| `# MAFFL HQ Project.md` | MD | **Build spec / data-authority rules.** Declares Owners Sheet authoritative; defines co-owner normalization. High value. |
| `check-standalone.ps1` | PS1 | CI-ish check that every HTML has iOS standalone meta tags + nav shim. Build tooling, not data. |
| `_chunk1.txt` | TXT | Stray CSS fragment (springboard styles). Looks like a leftover build artifact; not referenced anywhere. |
| `.claude/launch.json`, `.claude/serve.ps1`, `.claude/settings*.json` | config | Local dev/serve config. |
| `desktop.ini`, `data/desktop.ini` | system | Windows folder metadata. Ignore. |

**Build/merge logic found:** `# MAFFL HQ Project.md` is the spec (it names the authoritative
sources and the co-owner normalization rule). `history.html`'s inline `normalizeOwner()` +
`parseCSV()` is the only place the join logic is expressed as code. There is **no external
build script** that generates the HTML — pages are maintained by hand per the commissioner
workflow comments embedded in each file.

---

## 3. Per-Page Data Map (SOURCE / DERIVED / EMBEDDED)

### `index.html`
- All values hardcoded markup. Only data-ish value: "24 Seasons" label → **DERIVED** (correct:
  2002-2025). No risks.

### `stats.html` — career stats table
- `OWNERS[]` (`stats.html:532-565`): **EMBEDDED** verbatim copy of the Owners Sheet, which is
  itself **DERIVED** from `cleaned_maffl_revised.csv`. W/L/T/Champ/Runner/Playoff/Div per owner.
- Win % → **DERIVED** at runtime, `W/(W+L+T)`.
- OVR/Clutch/Grind/Heat → **EMBEDDED** (copied from `power-rankings.html`, originally
  commissioner emails — no CSV beyond the Owners Sheet).
- Verification: matches the Owners Sheet exactly **except Tony Brooks Div = 2 (should be 1)**
  (see §4).

### `power-rankings.html` — ratings
- `OWNERS_DATA[]`: OVR/Clutch/Grind/Heat + rank → **SOURCE-BACKED** (match Owners Sheet
  ratings columns and `stats.html`). Scout-note prose → **EMBEDDED-ONLY** (e.g.
  "league-best 59% career win rate", "highest playoff trip count (15)" — both happen to
  match the data, but the text itself is not sourced and won't auto-update).

### `rules.html`
- Rulebook prose, prize formulas, promotion/relegation matrix → **SOURCE-BACKED** against
  `MAFFL_Rules_revised.csv` (faithful), **except Slot 2 draft time** (see §6).
- 2026 Tier Assignments table (`:1000-1020`) + Division Alignment A–D (`:1043-1070`) →
  **SOURCE-BACKED** against the Owners Sheet "2026 League" + credit-packet 2026 Division.
  Correctly overrides the alignment-sheet anomaly (an inline comment documents this).
- News feed / version metadata → **EMBEDDED-ONLY** (hand-maintained).

### `credits.html`
- Current Credit Count tables (`:894-928`) → **SOURCE-BACKED** balances (match Owners Sheet /
  status snapshot / credit packet), grouped by **2026** tier (correct).
- Credit Registry transaction log → **EMBEDDED-ONLY** (no credit-log CSV exists; cannot be
  verified against a source). Treat as unverifiable.

### `prize.html`
- 2025 events (`:1114-1136`) → **SOURCE-BACKED** (match `MAFFL League Packet - 2025 Prizes.csv`).
- 2026 dues status (`:1140-1160`) → **SOURCE-BACKED** (match the CSV's draft-day-dues / pay
  status; overpaid owners correctly show `owed:0 / PAID`).
- Pre-2025 placement/division/COTW prizes (2013-2024) → **EMBEDDED-ONLY** (no CSV source
  exists for these years; `meta.note_*` flags acknowledge several derivation gaps).
- `grand_total: 19062` ("Prizes Paid, all time") → **DERIVED** from the embedded events;
  cannot be independently checked because the pre-2025 events have no source.

### `draft.html`
- `PICKS[]` (5,855 rows) → **SOURCE-BACKED**, count matches `MAFFL_Draft_History_Clean_v3.csv`
  exactly (5,855).
- `OWNERS[]` index table + `CHAMPS{}` year→owner map → **DERIVED**. `CHAMPS` matches the
  year-by-year champ flags for all 24 years **except its handling of the 2002 double-flag**
  (assigns Mike Murello only — see §4).
- `OWNER_TIER_BY_YEAR{2025}` → **EMBEDDED**; correct values **but the Brian/Ron key uses a
  backslash** (see §1.1 / §4) so that one lookup fails.

### `history.html`
- Embeds **copies** of `cleaned_maffl_revised.csv`, `MAFFL_Division_History_2005_2025.csv`,
  and the draft CSV inside `<script type="text/csv">` blocks, then **parses them at runtime**
  → effectively **SOURCE-BACKED-but-frozen**. `normalizeOwner()` collapses newline/slash/space
  variants and maps Michael→Mike. Champions, runner-ups, playoff fields, division winners are
  all **DERIVED** live from those embedded CSVs. Treats 2002 as **co-champions**.
- Risk: the embedded copies must be re-pasted whenever `./data/` changes; spot-check confirms
  they currently match the source, but there is no mechanism preventing drift.

### `weekly.html` / `MAFFL_HQ_Weekly_Week01_2026.html`
- `WEEKS[]` → **EMBEDDED-ONLY placeholder** for 2026 (all `[PLACEHOLDER]`). Team↔owner↔credit
  mappings inside are real (credits match), but scores/streaks/news are invented.

---

## 4. Derived-Value Verification (recompute vs. displayed)

Career totals were recomputed from `cleaned_maffl_revised.csv` (summing W/L/T and counting
Champ/Runner/Division/Playoff flags per owner) and compared to the Owners Sheet =
`stats.html`. **All 32 owners reconcile exactly on W, L, T, Championships, Runner-Ups, and
Playoff Appearances.** One mismatch on Division Titles:

| Owner | Field | Displayed (Owners Sheet / stats.html) | Recomputed (year-by-year) | Source rows | Likely cause |
|---|---|---|---|---|---|
| **Tony Brooks** | Division Titles | **2** | **1** | Only `2023` has `Division=1` (Number 2 Tony). Division-rank history confirms Kunis #1 in 2023 only; he was rank 4/2/3 in 2021/2022/2024 and Lower-Tier in 2025. | Manual entry error / mis-credit (possibly counted his 2025 Lower-Tier finish or a playoff berth as a division title). |

**Championship double-count (the big one):**

| Year | `cleaned_maffl` Champ=1 rows | `draft.html` CHAMPS | `history.html` | `stats.html` effect |
|---|---|---|---|---|
| **2002** | **Mike Murello AND Josh Lavrinc** | Mike Murello only (idx 0) | Co-champions (both shown) | Josh credited 1 ring; Mike credited 2 |

Total championship flags = **25 for 24 seasons (2002-2025)**. Every other season has exactly
one champion and reconciles cleanly. This single year is the source of all the cross-page
disagreement in §1.2. **Recompute cannot resolve it — it is a data-definition question for the
commissioner.**

Win % spot-checks (Owners Sheet frozen value vs. `W/(W+L+T)`): all consistent to rounding
(Joe Reilly 54.3%→54%, Brian/Ron 59.0%→59%, Tony Trozzo 53.3%→53%, Jon/Rick 49.4%→49%,
Mike Murello 52.0%→52%).

2025 prize recompute: prize.html's 2025 placement/division/weekly figures all tie to the
2025 Prizes CSV. The CSV's own `meta` notes a **$2 rounding** in the Lower-Tier weekly pool
($695 captured vs $693 stated) — **[KNOWN]**, disclosed.

---

## 5. Cross-Table Consistency Findings

### 5a. Owner name variants (same person, different string)

**"Mike Murello" vs "Michael Murello":**
- `Michael Murello` — only in `MAFFL_Division_History_2005_2025.csv` (all rows).
- `Mike Murello` — everywhere else (Owners Sheet, `cleaned_maffl`, all pages).
- `history.html` reconciles them via `normalizeOwner()`; no other page needs to because no
  other page consumes the division CSV's owner name. **Low functional risk, but a real
  cross-file inconsistency.**

**Co-owner pairs — up to six different slash formats for the SAME pair.** Taking
"Brian Murello / Ron Murello" as the example (the others — "Jon Murello / Rick Simmons",
"Marcus Ruby / Joe Ruby" — follow the same pattern):

| Representation | Where it appears |
|---|---|
| `Brian Murello/⏎Ron Murello` (newline, no spaces) | `MAFFL_Owners_Sheet_revised.csv`, status snapshot, credit packet, 2025 Prizes CSV |
| `Brian Murello/ Ron Murello` (space *after* slash) | `cleaned_maffl_revised.csv` |
| `Brian Murello/Ron Murello` (no spaces) | `MAFFL_Division_History_2005_2025.csv`, `prize.html`, `weekly.html` |
| `Brian Murello / Ron Murello` (spaces both sides) | `MAFFL_Draft_History...csv`, `draft.html` `OWNERS[]`, `stats.html`, `rules.html`, `power-rankings.html`, `credits.html` |
| `Brian Murello \ Ron Murello` (**backslash**) | `draft.html:7958` `OWNER_TIER_BY_YEAR` key — **[ERROR]** |

**Functional consequence:** only the backslash variant actually breaks anything — Brian/Ron's
2025 picks render with no tier pill in `draft.html` (the lookup `OWNER_TIER_BY_YEAR[2025]["Brian Murello / Ron Murello"]`
misses the `"...\..."` key). Note that the *other* co-owner keys in the same map (Jon/Rick)
use the correct forward slash, so the bug is isolated to Brian/Ron.

### 5b. Co-owner pairs split into two owners
- **None found.** Every file treats each co-owner pair as a single unit (a single roster row,
  a single combined record). The pairs are never split and their stats are never divided
  between the two names. This matches the `# MAFFL HQ Project.md` normalization rule. Good.

### 5c. Team-name representation conflicts (same owner-season, different team string)

| Owner / Year | `cleaned_maffl_revised.csv` | `MAFFL_Division_History...csv` | Pages | Note |
|---|---|---|---|---|
| **Tony Brooks 2025** | `Number 2 Tony` | `Tony's Talented Team` | `weekly.html` uses `Tony's Talented Team` | Two different team names for the same 2025 season. "Tony's Talented Team" appears to be the current/canonical brand; "Number 2 Tony" is the older/alias. |
| **David Murello 2025** | `Kardiac Kids` | `Kids BadBlood HighSchool` | `weekly.html` uses `Kids BadBlood HighSchool` | Serial rebrander (also "Kids Mixon with Lamar" 2024). Current canonical unclear. |
| **Mike Murello early** | `$Mike's Bad Attitude Gang` (2005-06) → `Bad Attitude Gang` | `$Mike's Bad Attitude Gang` / `Bad Attitude Gang` | n/a | Cosmetic drift; same team. |
| Team-name drift within `cleaned_maffl` | `Reilly's Reindeer` vs `Reilly's Reindeers`; `Silver Bullets` vs `The Silver Bullets` vs `Silver Bullets!!!`; `. Pardon the Intoxication` (leading "`. `") vs `Pardon the Intoxication` | — | history page keys on owner, not team, so unaffected | Many alias spellings; low risk but messy. |

### 5d. Missing-in-one-table
- **No owner is missing from any roster table.** All 32 owners in `cleaned_maffl` are present
  in the Owners Sheet and vice-versa (no orphans). Inactive owners are correctly flagged.
- 2002-2004 W/L/T are **blank** in `cleaned_maffl` (founding era) — **[KNOWN]**, season/champ
  flags are present, records were not tracked then.

### 5e. Tier / division label conflicts
- **The credit-packet anomaly (see §1.6 / §6):** `MAFFL League Packet - Division History.csv`
  column **"2026 League"** actually holds **2025** leagues (Mike Murello, Tony Trozzo,
  Jacob Nickman shown "Lower-Tier"; Todd Trozzo, Bob Keslar, Chris Johnson shown
  "Upper-Tier") — the inverse of their real 2026 status.
- **Every page resolves this correctly.** `rules.html` carries an explicit comment
  ("2026: Mike Murello, Tony Trozzo, Jacob Nickman were promoted… the alignment sheet's
  'Lower-Tier' label for them is a known anomaly — Upper-Tier is correct.") and lists the
  right tiers. `credits.html` groups by the correct 2026 tier. So the conflict is **confined
  to one CSV column header**; no page is wrong.

---

## 6. HTML-vs-CSV Direct Conflicts

| Fact | HTML value | CSV value | Verdict |
|---|---|---|---|
| Auction Draft **Slot 2** window | `rules.html:1247` → **8:30–10:30 AM EST** | `MAFFL_Rules_revised.csv` row 58 → **9:30–11:30 AM** | **[CONFLICT]** — HTML contradicts the canonical rules CSV. (Slot 1 = 8:00–10:00 AM matches.) Likely the HTML was edited to stagger the two slots but the CSV wasn't, or vice-versa. |
| 2026 League tier for Mike Murello / Tony Trozzo / Jacob Nickman | pages → **Upper-Tier** | credit-packet "2026 League" column → **Lower-Tier** | **[CONFLICT, pages correct]** — the CSV column is mislabeled (holds 2025 data); the Owners Sheet "2026 League" column agrees with the pages. |
| 2002 champion | `draft.html` → Mike Murello; `history.html` → Mike **and** Josh | `cleaned_maffl` → Mike **and** Josh (both Champ=1) | **[CONFLICT across artifacts]** — see §4. |
| Tony Brooks division titles | `stats.html` → 2 | year-by-year flags → 1 | **[ERROR]** — Owners Sheet value is high by 1 (the Owners Sheet, not the year-by-year file, is the one out of step). |

No other HTML literal was found to contradict a CSV value. Prize amounts, dues, credit
balances, ratings, and W/L records all match their sources.

---

## 7. CSV Health

- **Blank fields:** 2002-2004 W/L/T blank across `cleaned_maffl` (founding era) — **[KNOWN]**.
  No `Season=1` row from 2005+ is missing W/L. Email/credit columns blank for inactive owners
  in the Owners Sheet — expected.
- **Duplicate rows:** **none** (no exact-duplicate rows in `cleaned_maffl`).
- **Multi-team "ghost" rows:** 15 owner-seasons have a second row with `Season=0` used to
  attach a Champ/Division/Playoff flag to an *alternate team name* (e.g., Brian/Ron's
  "Hadley's Comets" rows in 2007/2014/2017/2019; David Murello's lowercase **`kardiac Kids`**
  in 2018/2019; Braiden Snyder's "Mike Vicks Dog Sitting Co." 2024; Joe Reilly's
  "Reilly's Reindeer" vs "Reindeers"). This is a deliberate modeling trick, **but it is
  fragile**: it relies on summing flags across both rows. One consequence —
  **`history.html` counts playoff berths only on `Season=1` rows** (`history.html:7577`), so a
  playoff flag living on a `Season=0` ghost row (e.g., Brian/Ron 2019) is **dropped from the
  history page's playoff field** even though the Owners Sheet career total counts it. Minor,
  but it means `history.html` and `stats.html` can disagree on whether someone "made the
  playoffs" in such a year.
- **Orphaned rows:** none — every stats owner has an Owners Sheet record.
- **Type inconsistencies:** W/L/T stored as floats (`7.0`) in `cleaned_maffl` but ints in the
  division CSV; credit balances stored as `23.0` (float) in the Owners Sheet but `23` (int)
  elsewhere. Cosmetic; parsers handle both. Prize CSV stores dollars as quoted strings with
  spaces/commas (`" $ 1,469 "`, `"$2,100"`) — already normalized in `prize.html`.
- **Lowercase typo:** `kardiac Kids` (rows 125, 127) vs `Kardiac Kids` — alias-only; harmless
  because flags key on owner.

---

## 8. Build-Path & Linkage Map

**How "live" is each page?**

| Page | Data delivery | Live against `./data/`? |
|---|---|---|
| `index.html` | Hardcoded markup | No data |
| `stats.html` | Embedded JS array (copy of Owners Sheet) | **Frozen** |
| `power-rankings.html` | Embedded JS array | **Frozen** |
| `rules.html` | Embedded markup | **Frozen** |
| `credits.html` | Embedded markup | **Frozen** |
| `prize.html` | Embedded JS object | **Frozen** |
| `draft.html` | Embedded JS arrays | **Frozen** |
| `weekly.html` / standalone | Embedded JS (placeholder) | **Frozen / fabricated** |
| `history.html` | Embedded `<script type="text/csv">` copies, parsed at runtime | **Frozen copy, but parsed** (closest to "live") |

**No page performs a runtime `fetch()` of a `./data/*.csv` file.** The only network reference
is `manifest.json` (PWA) and Google Fonts. This matches the stated "self-contained for Gmail"
design. **Implication:** `./data/` is the *master* but is **not wired to the site**; updating a
CSV changes nothing on the pages until a human re-copies the values (and, for `history.html`,
re-pastes the embedded CSV block).

**Internal links:** all `*.html` hrefs resolve to files that exist (index, weekly, rules,
credits, draft, history, power-rankings, prize, stats). **No broken internal links.** The
standalone `MAFFL_HQ_Weekly_Week01_2026.html` is intentionally not linked (it's an
attachment). `credits.html` is reachable only via the homepage "Credits" card / Current Credit
Count button — by design there is no nav item for it (documented in an inline comment), and no
page is marked `.current` for it.

**Build/generation step:** none that emits HTML. `check-standalone.ps1` only *validates* that
each page has the iOS standalone meta tags + nav shim (exit 2 on failure, wired to a PostToolUse
hook). `_chunk1.txt` is an orphan CSS fragment with no consumer.

---

## 9. Open Questions for the Commissioner

1. **Who won the 2002 championship?** Both Mike Murello and Josh Lavrinc are flagged
   `Champ=1` for 2002. Was it a genuine co-championship (then `draft.html` should show both,
   not just Mike), or is one flag an error (then `stats.html`/`history.html` overstate one
   man's ring count and the league has 24 champions, not 25)? **This is the single most
   important thing to resolve** — it changes career championship totals and the champion
   timeline on three pages.

2. **Tony Brooks — 1 or 2 division titles?** The year-by-year data and division-rank history
   support **1** (2023). The Owners Sheet says **2**. Which is right, and where did the
   second one come from?

3. **Auction Draft Slot 2 time — 8:30–10:30 or 9:30–11:30 AM?** `rules.html` and
   `MAFFL_Rules_revised.csv` disagree. Which is the published time?

4. **Should `weekly.html` be showing placeholder Week-1 data right now?** It's the off-season
   and `IS_OFFSEASON=false`, so visitors see invented standings. Flip the toggle, or is the
   placeholder intentional pre-season filler?

5. **Canonical owner-name string.** Pick ONE representation for co-owner pairs and for
   Mike/Michael, and standardize all CSVs and pages to it. (Recommend forward slash with no
   surrounding spaces, matching the Owners Sheet once the newline is removed.) Until then,
   please at minimum fix the **backslash** in `draft.html:7958` so Brian/Ron's 2025 tier pill
   renders.

6. **Pre-2025 prize history has no CSV.** The 2013-2024 prize amounts (and the "$19,062
   all-time" total) live only inside `prize.html`. Is there a source spreadsheet these came
   from that should live in `./data/`, or are these the only record? They currently cannot be
   audited.

7. **Canonical team name for serial rebranders** (Tony Brooks 2025: "Number 2 Tony" vs
   "Tony's Talented Team"; David Murello 2025: "Kardiac Kids" vs "Kids BadBlood HighSchool").
   Which string is official for the record?

8. **Credit Registry transaction log** in `credits.html` has no CSV backing. Should a
   `Credit_Log` CSV become the source of truth (the rules CSV references a "Credit Log" tab)?

---

### Methodology note
Career aggregates were recomputed from `cleaned_maffl_revised.csv` and cross-checked against
`MAFFL_Division_History_2005_2025.csv`; prize/dues/credit figures were checked line-by-line
against their packets; the 5,855 embedded draft picks were confirmed by count. Where a single
source could not settle a fact (the 2002 championship), it is raised as a question rather than
guessed. The `./data/` CSVs were treated as the master per `# MAFFL HQ Project.md`.
