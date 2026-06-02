# MAFFL HQ — Change Inventory

**Purpose.** This is the master map of everything on the site that can change. For each
category of datapoint it records: the single authoritative source, every place the value is
mirrored, what event triggers a change, and the downstream blast radius (what must be rebuilt
or re-synced). This document is (1) the spec the build pipeline is built against, and (2) the
backbone of the operations runbook.

**The one rule that governs all of it:** a datapoint has exactly **one** authoritative source.
Every other appearance is a *mirror* and must be regenerated from the source, never edited
directly. When the authoritative source is itself wrong (it happens — see the Slot 2 time), you
correct the source, then regenerate the mirrors. The principle is *single source of truth*, not
*the CSV is always factually right*.

**Status of "mirrors" today vs. after the pipeline.** Right now, every "mirror" below is a
hand-copied frozen value in HTML, which is why drift was possible. After the build pipeline
(`build.py` → generated data per page), mirrors become *generated artifacts* — regenerated from
source on every build, so they cannot drift. The "Propagation today" and "Propagation after
pipeline" columns reflect this.

---

## 1. Datapoint categories

### A. Owner career totals
*Championships, Runner-Ups, Playoff Appearances, Division Titles, Reg-Season W/L/T, Career Win %*

- **Authoritative source:** `data/MAFFL_Owners_Sheet_revised.csv`
- **Derived-from (upstream):** most totals roll up from `cleaned_maffl_revised.csv` year-by-year
  flags. The Owners Sheet is authoritative for the *published* total; the year-by-year file is
  the *recompute check*. When they disagree, the commissioner rules (as with Tony Brooks).
  **After the pipeline, these totals should be RECOMPUTED from year-by-year, not hand-typed** —
  that closes the drift class entirely.
- **Mirrored in:** `stats.html` (embedded `OWNERS[]`), `draft.html` (owner index table + `CHAMPS{}`).
- **Trigger:** season-end push (see Change-Event Catalog, event 1); a correction surfaced by an owner.
- **Propagation after pipeline:** edit year-by-year → `build.py` recomputes totals → regenerates mirrors.
- **Validation the pipeline should enforce:** total championship flags == 25 (24 seasons, 2002
  is co-champ — see §3); every owner's recomputed W/L/T from year-by-year matches; win % == W/(W+L+T).

### A2. Power rankings — AUTHORED source (not derived)
*OVR / Clutch / Grind / Heat ratings + scout-note prose + overall rank*

- **Authoritative source:** **none today — this is a gap.** Ratings live embedded in
  `power-rankings.html` (`OWNERS_DATA[]`) and are copied into the Owners Sheet ratings columns.
  These are **authored fresh each offseason by the commissioner** — creative input informed by
  the prior season, NOT a calculation. They need their own source file
  (recommend `data/Power_Rankings_2026.csv` or a year-keyed rankings file).
- **Mirrored in:** `power-rankings.html` (`OWNERS_DATA[]`), `stats.html` (ratings columns copied
  from here originally).
- **Trigger:** **standalone event, later in the off-season / near season start** — deliberately
  separate from the season-end push. (Commissioner authors them once the dust settles.)
- **Scout-note prose caveat:** notes sometimes cite figures ("59% career win rate") that match
  the data by coincidence but won't auto-update. When a career stat changes, re-check these by hand.
- **Validation:** ratings are authored, so there's no recompute check — but the build CAN assert
  every rated owner exists and ranks are unique 1..N.

### B. Year-by-year season records & flags
*Per owner-season: team name, W/L/T, Champ/Runner/Division/Playoff/Lower-Tier flags*

- **Authoritative source:** `data/cleaned_maffl_revised.csv`
- **Cross-check for team names & division ranks:** `MAFFL_Division_History_2005_2025.csv`
  (canonical team name per owner-season; uses "Michael Murello").
- **Mirrored in:** `history.html` (parses its own embedded copies of cleaned_maffl + division
  history + draft CSVs at runtime).
- **Trigger:** new season finalized; a corrected historical record.
- **Propagation today:** edit cleaned_maffl → **re-paste** the embedded `<script type="text/csv">`
  block in history.html. (history.html is the closest thing to "live" but its copy still drifts.)
- **Propagation after pipeline:** edit cleaned_maffl → build regenerates history.html's embedded
  block from source. No hand re-paste.
- **Known structural quirk:** 15 owner-seasons use a second `Season=0` "ghost row" to attach a
  flag to an alternate team name. history.html counts playoff berths only on `Season=1` rows, so
  a playoff flag on a ghost row can be dropped from the history page even though the Owners Sheet
  counts it. **The pipeline should normalize ghost-row flags so history.html and stats.html
  agree.** (Audit §7.)

### C. Draft history
*5,855 picks: Year, Owner, Player, Position, Draft Slot, NFL Team, Price*

- **Authoritative source:** `data/MAFFL_Draft_History_Clean_v3.csv`
- **Mirrored in:** `draft.html` (`PICKS[]`, all 5,855 rows embedded).
- **Trigger:** a new draft each season; a correction ("I didn't draft that guy" / wrong
  position / wrong price).
- **Propagation today:** edit draft CSV → hand-re-sync the embedded `PICKS[]`.
- **Propagation after pipeline:** edit draft CSV → build regenerates `PICKS[]`.
- **Known permanent gap:** 2007 prices are blank (hard-drive loss). Do not fabricate. Pick
  records intact. (Audit + system prompt §4.)
- **Position taxonomy note:** coarse vs. fine taxonomy varies by era; 2007's fine taxonomy is a
  re-entry artifact, NOT a rule change. Don't "correct" it. (System prompt §5.)

### D. Rules
*Rulebook prose, prize formulas, draft slot times, promotion/relegation, credit menu*

- **Authoritative source:** `data/MAFFL_Rules_revised.csv`
- **Mirrored in:** `rules.html` (embedded markup).
- **Trigger:** a rule change (e.g., the in-progress MAFFL Ghost rule); a correction (e.g., the
  Slot 2 time, where the CSV was the stale one).
- **Propagation today:** edit rules CSV → hand-re-sync rules.html markup.
- **Propagation after pipeline:** edit rules CSV → build regenerates the rules sections.
- **Watch item:** rules prose is the hardest to fully auto-generate (it's formatted markup, not
  just values). The pipeline may keep *structured* rule values (times, fees, percentages)
  generated, while longer prose stays semi-manual. Flag for the build-design step.

### E. Prizes & dues / pay status
*2025 payouts, 2026 league dues, draft-day dues, pay status, all-time prize history*

- **Authoritative source:** `data/MAFFL League Packet - 2025 Prizes.csv` (payouts + dues/status)
- **Payouts are FORMULA-DRIVEN:** pool = $100 × total teams, split 67% Upper / 33% Lower, then
  the placement percentages (Champion 50%, Runner-Up 15%, etc. per rules.html §4). **This means
  `build.py` can COMPUTE payouts** from the season's results + team counts rather than you typing
  dollar figures — and can validate that the parts sum to the pool. Pay STATUS (who's paid) stays
  a manual input; the payout AMOUNTS can be derived.
- **Mirrored in:** `prize.html` (embedded `MAFFL` object).
- **Trigger:** a payment comes in (update pay status, anytime); season-end push (compute payouts).
- **Propagation after pipeline:** results + dues → build computes payouts → regenerates prize.html.
- **KNOWN GAP — needs a decision:** pre-2025 prize history (2013–2024) and the "$19,062 all-time"
  total exist **only inside prize.html** — no CSV source. Since the payout formula is known, it
  may be possible to *recompute* historical years from their results rather than leave them as
  un-sourced literals — but older seasons may have used different rules, so verify before trusting
  a recompute. Until resolved, these specific values stay manual and flagged as un-sourced. (Audit §9.)

### F. Credit balances & transactions  [RESOLVED — Google Sheet retired]
*Transaction log; balances derived from it*

- **Authoritative source:** `data/Credit_Log.csv` — a transaction log living in the repo. **The
  Google Sheet is retired entirely.** Each row is one credit event (owner, date, +/- amount,
  reason/type). This file is the new source of truth for everything credit-related.
- **Balances are DERIVED, not stored:** an owner's current balance = sum of their Credit_Log
  rows. The balance column that currently sits in the Owners Sheet becomes a **mirror**
  (generated from the log), not a hand-maintained source. **Design note for the build:** stop
  hand-editing the Owners Sheet balance; generate it.
- **Intake channel:** a Google Form for credit requests. Form output is NOT the source — it's a
  request queue. The commissioner reviews each request and, if approved, appends a row to
  `Credit_Log.csv`. (Form → review → one new transaction row → rebuild.)
- **Mirrored in:** `credits.html` (the balance tables AND the transaction registry — both now
  generated from Credit_Log.csv, so the registry is finally source-backed and verifiable).
- **Trigger:** an approved credit request (spend/trade); offseason credit awards (these can be
  batch-appended as the season-end outcomes resolve).
- **Propagation after pipeline:** append row(s) to Credit_Log.csv → build recomputes every
  balance and regenerates credits.html + the Owners Sheet balance mirror.
- **Validation the pipeline should enforce:** every displayed balance == sum of that owner's
  Credit_Log rows; no negative balance unless a rule permits it; every owner in the log resolves
  to a canonical name.
- **Migration step (one-time, this June):** build the initial Credit_Log.csv from the current
  known balances — either as one "opening balance" row per owner, or by back-entering known
  historical transactions if you have them. Decide which when we design the build.

### G. Weekly in-season content
*Standings, Survivor, Elite 5, News Reel — the Weekly Pulse*

- **Authoritative source:** *to be defined* — currently hand-built `WEEKS[]` / `pulseData`
  objects with placeholder data. Real source will be weekly ESPN results you paste in.
- **Mirrored in:** `weekly.html` and the standalone `MAFFL_HQ_Weekly_Week01_2026.html` (Gmail).
- **Trigger:** every regular-season week.
- **Target workflow (your stated preference): paste results → AI/build produces the week's data
  object → it flows into both weekly.html and the standalone attachment.** This is the page that
  most justifies the pipeline.
- **Current state:** `IS_OFFSEASON = true` (set in the fix pass) so no placeholder leaks. Good
  until kickoff.

### H. Site chrome / non-data
*Navigation, "24 Seasons" label, scout-note prose, news/version metadata, UI behavior*

- **Authoritative source:** none — these are content/code, not league data.
- **Trigger:** a UI bug; a copy edit; a new page.
- **Propagation:** pure code change. No CSV involved. Goes through the same branch-and-review
  discipline but isn't a "data" change.
- **Note:** scout-note prose in power-rankings.html sometimes states figures ("59% career win
  rate") that happen to match the data but are NOT sourced and won't auto-update. If a career
  stat changes, these sentences must be hand-checked. Low frequency, worth a checklist line.

---

## 2. Authoritative-source quick table

| Datapoint | Authoritative source | Mirrors (regenerated by build) |
|---|---|---|
| Career totals | `MAFFL_Owners_Sheet_revised.csv` (recomputed from history) | stats.html, draft.html owner table |
| Power rankings (authored) | `Power_Rankings_*.csv` (**to create**) | power-rankings.html, stats.html ratings |
| Year-by-year records/flags | `cleaned_maffl_revised.csv` | history.html embedded block |
| Canonical team names / div ranks | `MAFFL_Division_History_2005_2025.csv` | history.html |
| Draft picks | `MAFFL_Draft_History_Clean_v3.csv` | draft.html PICKS[] |
| Rules | `MAFFL_Rules_revised.csv` | rules.html |
| Prizes (formula-derived) / dues / pay status | `MAFFL League Packet - 2025 Prizes.csv` | prize.html |
| Credit log → balances (derived) | `Credit_Log.csv` (**to create**) | credits.html, Owners Sheet balance |
| Weekly Pulse | Pasted weekly results | weekly.html + standalone |
| Site chrome | n/a (code) | — |

---

## 3. Standing exceptions the pipeline must NOT flag as errors

These are confirmed-correct anomalies. A future validation pass should whitelist them so it
doesn't keep re-raising settled questions.

1. **2002 co-championship.** Mike Murello AND Josh Lavrinc both hold 2002. This means **25
   championship flags across 24 seasons is correct.** Any "one champion per year" assertion is
   wrong by design here. (Commissioner ruling.)
2. **2002–2004 blank W/L/T.** Founding-era records were never tracked. Blank is correct, not
   missing. (System prompt §4.)
3. **2007 blank draft prices.** Permanent hard-drive loss. Blank is correct. (System prompt §4.)
4. **"Michael Murello" in the division-history file** = Mike Murello. Normalization handles it.
5. **Co-owner pairs are single units** (Brian/Ron, Jon/Rick, Marcus/Joe). Never split.
6. **The credit-packet "2026 League" column holds 2025 data** — known mislabel; pages already
   resolve the real 2026 tier correctly. Don't "fix" by trusting that column.
7. **$2 Lower-Tier weekly-pool rounding** in the 2025 prizes — disclosed in the CSV meta.

---

## 4. Open decisions that block parts of the pipeline

| # | Decision | Status | Blocks |
|---|---|---|---|
| 1 | Credit Log | **RESOLVED** — Google Sheet retired; `Credit_Log.csv` is source; balances derived; Google Form is intake only | — |
| 2 | Credit migration: opening-balance rows vs. back-entered history | Open (decide at build) | Initial Credit_Log.csv shape |
| 3 | Pre-2025 prize history: recompute via formula vs. accept as un-sourced literals | Open | Whether all-time prize totals validate |
| 4 | Canonical owner-name string: pick ONE format, standardize all CSVs | Open | Where normalization lives (one place vs. defensive everywhere) |
| 5 | Canonical team name for serial rebranders (Tony Brooks, David Murello 2025) | Open | Which name weekly/history display |
| 6 | Power rankings source file: format & whether year-keyed | Open | How A2 enters the build |
| 7 | Rules: which values structured/generated vs. prose/manual | Open | How much of rules.html the build owns |

---

## 5. Change-Event Catalog (the actual calendar)

Datapoints rarely change one at a time. They change in **events** — and within an event, order
matters because some updates feed others. These are the real workflows.

### Event 1 — Season-End Push  *(at season end, "in short order")*
The big one. **Priority outputs go first** — prizes and promotion/relegation are the
time-sensitive money-and-status results the league is waiting on. The items can be done together
(no strict workflow chain); the only build-internal dependency is the recompute one noted below.

1. **Prizes** — compute the season's payouts from final results + team counts via the formula;
   extend the all-time history. Pay status updated as money comes in. *(Priority output.)*
2. **Promotion / Relegation** — 3 up from Lower, 3 down from Upper. Updates next season's tier
   assignments → ripples into rules.html (tier tables), credits.html (balance grouping), and
   weekly.html (which league each team is in). *(Priority output. Easy to forget; touches
   multiple pages.)*
3. **Credit awards** — batch-append season-outcome credits (champion, survivor, etc.) to
   `Credit_Log.csv`.
4. **History** — append the new season's rows to `cleaned_maffl_revised.csv` (team names, W/L/T,
   Champ/Runner/Division/Playoff/Lower-Tier flags) and division alignment/ranks to
   `MAFFL_Division_History_2005_2025.csv`.
5. **Stats** — career totals **recompute** from the updated history (NOT hand-typed). *Build
   dependency: this must run after step 4, since stats derive from history. Running stats before
   history exists = the Tony Brooks drift.*
6. **Season count** — "24 Seasons" → "25" (index.html and anywhere the count appears).

**Source files touched:** prizes, Credit_Log, cleaned_maffl, division history, Owners Sheet
(regenerated). **Validation gate before publish:** champ flags count, W/L/T recompute, payout
sum, balance sums all pass.

### Event 2 — Power Rankings  *(later off-season / near season start, standalone)*
Deliberately separate from Event 1. Commissioner **authors** fresh OVR/Clutch/Grind/Heat +
scout notes once the season's dust has settled. Touches only the power-rankings source file
(to be created) → regenerates power-rankings.html and the ratings mirror in stats.html.
**No recompute check** (authored data); build asserts ranks unique, all owners present.

### Event 3 — Division Alignment  *(by August 1, Upper-Tier)*
New A/B/C/D assignments set. Feeds rules.html alignment table + anywhere divisions display.
May overlap with the credit-spend window (division swaps cost credits → Credit_Log rows).

### Event 4 — Draft Results  *(shortly after Labor Day draft)*
Highest-volume single input: a few hundred new pick rows appended to
`MAFFL_Draft_History_Clean_v3.csv` (Year, Owner, Player, Position, Slot, NFL Team, Price).
Mechanically simple (append) but bulk — the paste-to-build path matters most here.
Regenerates draft.html `PICKS[]`. **Validation:** pick count per team matches roster size for
the era (22 in 2025+); no Kicker drafted (eliminated 2025+); every owner resolves to canonical.

### Event 5 — Weekly In-Season  *(every regular-season week)*
Paste ESPN results → build produces the week's data object → flows into weekly.html AND the
standalone Gmail attachment. `IS_OFFSEASON` flips false at kickoff. (See category G.)

### Event 6 — Ad-Hoc Correction  *(anytime an owner reports an error)*
"I didn't draft that guy" / wrong position / mislabeled stat. Process: log the report → verify
against the **authoritative source** for that datapoint (use §2 table) → if real, fix the SOURCE
file → rebuild → tell the owner. Never fix only the HTML. Git history is the audit trail.

### Event 7 — Rule Change  *(anytime, e.g. the MAFFL Ghost rule)*
Edit `MAFFL_Rules_revised.csv` → regenerate rules.html. Announce to league.

### Event 8 — UI Bug / Content  *(anytime)*
Pure code, no data. Same branch-and-review discipline, but no source CSV involved.

---

## 6. Authoritative-source quick table

---

## 7. The change types you listed, mapped to category + event

- *Rule change* → category D / Event 7 (rules CSV) — e.g., the MAFFL Ghost rule.
- *Weekly results* → category G / Event 5 (paste → build → weekly).
- *"I didn't draft this player" / wrong position* → category C / Event 6 (draft CSV).
- *Payment received / update pay status* → category E / Event 1 step 3 (prizes CSV).
- *Credit spent or traded* → category F / Event 6 (approved request → Credit_Log row).
- *UI bug* → category H / Event 8 (pure code).
- *Corrected career stat* → category A / Event 6 (fix year-by-year source → recompute).
- *New power rankings* → category A2 / Event 2 (authored, late off-season).
- *Update history + stats + prizes* → Event 1 (season-end push, in dependency order).
- *Draft results after Labor Day* → category C / Event 4 (bulk append).
- *Promotion/relegation, division re-alignment, season count* → Event 1 steps 4&6 + Event 3.
