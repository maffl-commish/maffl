# MAFFL HQ — Operations Runbook

The operating manual for MAFFL HQ, the web hub for the **Mid-Atlantic Fantasy Football League**
(MAFFL, founded 2002). If you read nothing else, read §0 and §1.

**Companion documents** (keep together in the project):
- `# MAFFL HQ Project.md` — the build spec (architecture, design system, data-authority rules)
- `CHANGE_INVENTORY.md` — every changeable datapoint, its authoritative source, and the change-event catalog
- `AUDIT.md` — the 2026-06 data provenance audit (historical record)
- `BUILD_SUMMARY.md` — what the build pipeline generates, per page

---

## 0. The one rule everything follows

**Data lives in the CSVs in `./data/`. The HTML is generated from them. You never hand-edit data
in HTML.**

To change a number on the site: edit the CSV that owns it, run the build, review, publish. That's
the whole loop. The build regenerates the page from the CSV, so the page can't drift from the
source. When the *source itself* is wrong (it happens — a stale rule value, a typo), you fix the
source, not the page. The principle is *single source of truth*, not *the CSV is always factually
right*.

Why this matters: the site's value to the league is that the data is trustworthy. The fastest way
to lose that trust is two pages showing different numbers for the same fact. The pipeline exists
so that can't happen.

---

## 1. The publish loop (every change goes through this)

1. **Identify the owning source.** Use the table in §2 (or `CHANGE_INVENTORY.md`) to find which
   CSV owns the datapoint. One datapoint, one source.
2. **Edit the source CSV** in `./data/`.
3. **Run the build (check mode first):**
   ```
   powershell -ExecutionPolicy Bypass -File build\build.ps1
   ```
   This validates and proves the round-trip but writes nothing. If a validation gate fails, it
   tells you what and stops — fix the cause before going further.
4. **Run the build (write mode):**
   ```
   powershell -ExecutionPolicy Bypass -File build\build.ps1 -Write
   ```
   This regenerates the affected page(s) from the CSVs.
5. **Review** the changed page(s) — confirm the change you intended, and nothing else moved.
6. **Commit and push** (GitHub Pages publishes automatically from the repo).

> The pipeline is PowerShell (`build\*.ps1`), not Python — this machine has no working Python.
> Same design, same loop; just the language the environment required.

**Never** skip to hand-editing the HTML because it's "just one number." That's how the original
drift happened. The loop is the discipline.

---

## 2. Who owns what (authoritative source per datapoint)

| Datapoint | Authoritative source | Generated into |
|---|---|---|
| Career totals (champs, playoffs, W/L/T, win%) | `cleaned_maffl_revised.csv` → recomputed | stats.html, draft.html |
| Year-by-year records & flags | `cleaned_maffl_revised.csv` | history.html |
| Canonical team names / division ranks | `MAFFL_Division_History_2005_2025.csv` | history.html |
| Draft picks | `MAFFL_Draft_History_Clean_v3.csv` | draft.html |
| Credit transactions → balances | `Credit_Log.csv` | credits.html (+ Owners Sheet balance mirror) |
| Prize dues / pay status / payouts | `MAFFL League Packet - 2025 Prizes.csv` (payouts formula-derived) | prize.html |
| Power ratings + scout notes | `Power_Rankings_*.csv` *(to be created)* | power-rankings.html |
| Rules | `MAFFL_Rules_revised.csv` | **rules.html is MANUAL — see §4 Event 7** |
| Weekly Pulse | pasted ESPN results *(workflow TBD)* | weekly.html + standalone |
| Site chrome (nav, season count, news strip) | n/a — code | the page itself |

**Owner-name normalization** is automatic in the build: all co-owner variants collapse to the
canonical `Name A / Name B` (forward slash, spaces both sides), and `Michael Murello` →
`Mike Murello`. (Exception: prize.html intentionally uses the no-space `Name A/Name B` form;
the prize generator reproduces that.)

---

## 3. The validation gates (your safety net)

The build runs these before writing. If any fails, it stops and writes nothing. You should
understand them, because a failure is the system catching a real problem:

1. Championship flags total **25** (2002 is a co-championship — 25 across 24 seasons is correct).
2. Each owner's recomputed W/L/T matches the published value.
3. Win % == W/(W+L+T).
4. Each credit balance == sum of that owner's approved `Credit_Log.csv` rows.
5. Prize payouts sum to the pool ($100 × teams, 67/33 split).
6. Zero Kickers drafted 2025+ (position eliminated).
7. Every owner name resolves to a canonical name.
8. Power-rank positions unique 1..N; every rated owner exists.

**Standing exceptions the build will NOT flag** (these are confirmed-correct, don't "fix" them):
2002 co-championship; 2002–2004 blank W/L/T; 2007 blank draft prices (shown as "—", not $0);
`Michael Murello` alias; co-owner pairs as single units; the credit-packet "2026 League"
mislabel; the $2 Lower-Tier weekly-pool rounding.

---

## 4. The change events (your operating calendar)

Most changes happen as one of these recurring events. Each lists what to touch and any ordering.

### Event 1 — Season-End Push
*The big one. Priority outputs first; the rest can follow together.*
1. **Prizes** — update `MAFFL League Packet - 2025 Prizes.csv` (new payouts via formula, pay
   status). *Priority output — league is waiting on it.*
2. **Promotion / Relegation** — 3 up from Lower, 3 down from Upper. Updates next season's tier
   assignments; ripples into rules.html (tier tables), credits.html (balance grouping), and
   weekly.html. *Priority output. Easy to forget — touches multiple pages.*
3. **Credit awards** — append season-outcome credits (champion, survivor, etc.) to `Credit_Log.csv`.
4. **History** — append the new season's rows to `cleaned_maffl_revised.csv` and division
   alignment to `MAFFL_Division_History_2005_2025.csv`.
5. **Stats** — career totals **recompute** from history automatically. *Build dependency: history
   (step 4) must be updated before stats regenerate. Doing stats from memory instead of recompute
   is what caused the original Tony Brooks division-title error.*
6. **Season count** — bump "Seasons" count in index.html (site chrome).
- Then run the publish loop. The validator confirms the whole set reconciles before anything ships.

### Event 2 — Power Rankings
*Later off-season / near season start. Standalone — not part of the season-end push.*
You **author** fresh OVR/Clutch/Grind/Heat + scout notes. Update the power-rankings source CSV
(once created), run the build. No recompute check — these are authored, not derived.

### Event 3 — Division Alignment
*By August 1 (Upper-Tier).* New A/B/C/D assignments. May overlap the credit-spend window (division
swaps cost credits → `Credit_Log.csv` rows).

### Event 4 — Draft Results
*Shortly after the Labor Day draft.* Append the new picks (a few hundred rows) to
`MAFFL_Draft_History_Clean_v3.csv`, run the build → regenerates draft.html. Validator checks pick
counts per team and the no-Kicker rule.

### Event 5 — Weekly In-Season
*Every regular-season week.* Paste ESPN results → produce the week's data object → flows into
weekly.html and the standalone Gmail attachment. *(Ingestion workflow is a separate build — see §6.)*

### Event 6 — Ad-Hoc Correction
*Anytime an owner reports an error ("I didn't draft that guy", wrong position, wrong stat).*
1. **Log it** (a line in a corrections list is enough — it's your audit trail and your record if
   two owners disagree).
2. **Verify** against the authoritative source for that datapoint (§2).
3. If it's a real error, **fix the source CSV** (never just the HTML).
4. **Run the publish loop.**
5. **Tell the owner** it's fixed. Git history shows exactly what changed and when.

### Event 7 — Rule Change
*Anytime (e.g. a new rule, a corrected draft time).* **rules.html is maintained manually** — it's
prose, not a clean data block, so it's not generated by the build. Edit `MAFFL_Rules_revised.csv`
to keep the source current, then hand-edit the corresponding rules.html section to match, commit,
push. Announce to the league. *(This is the one page where source-then-hand-sync is the intended
process rather than build-regeneration.)*

### Event 8 — UI Bug / Content Change
*Anytime.* Pure code, no data. Same branch-and-review discipline, but no CSV involved.

---

## 5. Working with Claude Code safely

The pipeline and all file edits happen in Claude Code (it can see the real files; a chat assistant
cannot). Patterns that have worked and are worth keeping:

- **Audits and sweeps are read-only.** When you want to understand state, ask for a report that
  changes nothing (`AUDIT.md`, `DOC_SWEEP.md` were built this way). Look before touching.
- **Edits happen on a branch, reviewed before merge.** "Work on a branch, produce a CHANGES
  summary, don't push until I review" — this caught real issues (e.g. a fix that got silently
  reverted later).
- **Incremental, proven per step.** The build was made one page at a time, each round-trip-proven
  before the next. Don't let a big change land all at once.
- **Ask-don't-guess on file structure.** If Claude Code can't find an exact marker or column, it
  should stop and ask, not guess — a wrong guess can silently corrupt a page.
- **Fix data at the source, never paper over it in the generator.** If a generator wants to
  "clean" source data (e.g. collapse a typo), fix the CSV instead and drop the cleaning rule.

---

## 6. Known open work (as of 2026-06)

- **Power rankings source CSV** — `power-rankings.html` is skipped by the build until a
  `Power_Rankings_*.csv` source exists. Create it, then the page generates like the others.
- **Pre-2025 prize history CSV** — the 2013–2024 history (and all-time total) currently lives only
  as literals in prize.html. Once a source CSV exists, regenerate the whole `prize_events` array
  (including 2025) in one pass.
- **Weekly preview/labeling** — at launch, weekly.html may show sample data. Ensure sample data is
  clearly labeled as a preview so no one mistakes it for real results; switch to the off-season
  message when the season starts, then to live weekly at kickoff. *(Decision/build still open.)*
- **Weekly Capture project** — a planned separate tool: a system prompt that extracts structured
  weekly data (standings, scores) from uploaded ESPN screenshots into the CSV/object shape
  weekly.html consumes. The clean implementation of "paste results, the rest is automatic."

---

## 7. Two open data conventions to settle

- **Canonical team name for serial rebranders** (e.g. Tony Brooks, David Murello 2025) — decide
  which season-name the weekly/history pages display when an owner has renamed often.
- (Resolved items, for reference: credit model, credit seeding, owner-name format, pre-2025 prize
  handling, rules-manual decision, and the 2007 price display are all settled — see
  `CHANGE_INVENTORY.md` §4.)

---

## Quick reference card

**To change any number:** edit the CSV (§2) → `build.ps1` (check) → `build.ps1 -Write` → review →
commit/push.
**Build fails a gate:** it caught something real — fix the cause, don't override (unless it's a §3
standing exception, which it won't flag anyway).
**Owner reports an error:** log → verify against source → fix the CSV → publish loop → reply.
**A rule changed:** rules.html is manual — edit the CSV for the record, hand-sync the page.
**Season ended:** Event 1 — prizes & promotion/relegation first, then credits, history, stats,
season count.
