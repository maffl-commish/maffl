# Rivalry page: 2026 division alignment + a "Data through" pill (and the governance gap behind it)

VERSION: none

Date: 2026-09-30 · Author: Claude (chat) · Scope: `data/MAFFL_Division_History_2005_2025.csv` (append 21 rows),
`rivalry.html` (division embed + header pill + small script), `CLAUDE.md` (one rule),
`MAFFL_HQ_DATA_GOVERNANCE.md` (new CE-9, CE-3 note, gotcha G-9). Commissioner-approved in chat 2026-09-30.

Read first: `_ops/STATUS.md`, `CLAUDE.md`, `MAFFL_HQ_DATA_GOVERNANCE.md` §2, §4, §6. If any anchor below doesn't
match exactly, **stop and ask**. Don't guess. No `*.bak` files.

## Why

1. **Rivalry's "same division" logic stops at 2025.** `rivalry.html` reads results live from `matchups-data.js`,
   which the weekly robot refreshes, so head-to-head records stay current. But its `DIVISION_DATA` embed (who shared a
   division/tier each year) was hand-copied from `MAFFL_Division_History_2005_2025.csv` and has no 2026 rows. 2026
   meetings therefore aren't recognised as divisional or same-tier.
2. **Why governance didn't catch it.** Every chain event in §4 starts from a result (weekly results, season end,
   credits, drafts…). None covers **the start of a season**, when promotion/relegation and a new division alignment
   take effect. Division_History is defined as a record of *finished* seasons (rank + W/L), so a new season's alignment
   had nowhere to live until it ended. The rivalry embed is hand-copied, with no provenance check, so nothing flagged it
   as stale. The fix adds the missing event (CE-9) and lets the gold file carry in-progress alignment rows.
3. **"Last Updated July 2" looks stale** even though the page's numbers update every week. Add a runtime
   `Data through YYYY Wk N` pill computed from `matchups-data.js`. `Last Updated` keeps meaning "this page file was edited".

---

## Step 1 — Baseline

`powershell -ExecutionPolicy Bypass -File build\validate.ps1` → expect **8/8**. Paste the summary. If it isn't 8/8, stop.

## Step 2 — Gold: append 2026 alignment rows to `data/MAFFL_Division_History_2005_2025.csv`

The file uses **CRLF** and ends with a CRLF, so keep both. Append these 21 lines verbatim at the end. `Division_Rank`, `W`, `L`
and `T` are **blank on purpose**: the season is in progress, and CE-3 fills them when it ends. Owner spellings match each
owner's 2025 row in this same file (e.g. `Michael Murello`, `Brian Murello/Ron Murello`, `Jon Fetrow`). The Upper alignment
matches the `Division` column of `data/MAFFL_Schedule_2026_Upper.csv`.

```
2026,Upper,N/A,Division A,,Bad Attitude Gang,Michael Murello,,,
2026,Upper,N/A,Division A,,Marco Clair Kardiac Attack,David Murello,,,
2026,Upper,N/A,Division A,,South Hills FunShiners,BJ Funari,,,
2026,Upper,N/A,Division B,,Jake's Jagoffs,Jacob Nickman,,,
2026,Upper,N/A,Division B,,The Prodigal Sons,Jon Murello/Rick Simmons,,,
2026,Upper,N/A,Division B,,Mike Vicks Dog Sitting Co.,Braiden Snyder,,,
2026,Upper,N/A,Division C,,Happy Valley Hammer Time,Tony Trozzo,,,
2026,Upper,N/A,Division C,,The Big Bang Theory,Dan Reilly,,,
2026,Upper,N/A,Division C,,Reilly's Reindeer,Joe Reilly,,,
2026,Upper,N/A,Division D,,Hadley's Comets,Brian Murello/Ron Murello,,,
2026,Upper,N/A,Division D,,Turkey Hat Conglomerate,Ed Peters,,,
2026,Upper,N/A,Division D,,Southside Shooters,Jon Fetrow,,,
2026,Lower,N/A,Lower Tier,,Tommy Phamclub,Sam Lavrinc,,,
2026,Lower,N/A,Lower Tier,,The Best in The 'Burgh,Ben Funari,,,
2026,Lower,N/A,Lower Tier,,Fightin Ferrets,Todd Trozzo,,,
2026,Lower,N/A,Lower Tier,,Tony's Talented Team,Tony Brooks,,,
2026,Lower,N/A,Lower Tier,,Portly Primates,Charles Lavrinc,,,
2026,Lower,N/A,Lower Tier,,The V-Unit,Chris Johnson,,,
2026,Lower,N/A,Lower Tier,,Sarge's Squad,Nick Yankovich,,,
2026,Lower,N/A,Lower Tier,,Steel City Champyinz,Dominic Nicastro,,,
2026,Lower,N/A,Lower Tier,,Camp Kes,Bob Keslar,,,
```

Verify: `(Select-String data/MAFFL_Division_History_2005_2025.csv -Pattern '^2026,').Count` → **21**. Every line has 10
fields. Don't rename the file. Its name is historical, and validate, gen-history and the docs reference it.

## Step 3 — `rivalry.html`

**3a. Division embed.** Find (exactly once): `[2025,"L","N/A","Lower Tier","Dominic Nicastro"]` followed on the next
line by `];`. Add a comma to that 2025 line, then insert these 21 lines before `];` (owner spellings = the embed's
own 2025 spellings, e.g. `Mike Murello`):

```
[2026,"U","N/A","Division A","Mike Murello"],
[2026,"U","N/A","Division A","David Murello"],
[2026,"U","N/A","Division A","BJ Funari"],
[2026,"U","N/A","Division B","Jacob Nickman"],
[2026,"U","N/A","Division B","Jon Murello/Rick Simmons"],
[2026,"U","N/A","Division B","Braiden Snyder"],
[2026,"U","N/A","Division C","Tony Trozzo"],
[2026,"U","N/A","Division C","Dan Reilly"],
[2026,"U","N/A","Division C","Joe Reilly"],
[2026,"U","N/A","Division D","Brian Murello/Ron Murello"],
[2026,"U","N/A","Division D","Ed Peters"],
[2026,"U","N/A","Division D","Jon Fetrow"],
[2026,"L","N/A","Lower Tier","Sam Lavrinc"],
[2026,"L","N/A","Lower Tier","Ben Funari"],
[2026,"L","N/A","Lower Tier","Todd Trozzo"],
[2026,"L","N/A","Lower Tier","Tony Brooks"],
[2026,"L","N/A","Lower Tier","Charles Lavrinc"],
[2026,"L","N/A","Lower Tier","Chris Johnson"],
[2026,"L","N/A","Lower Tier","Nick Yankovich"],
[2026,"L","N/A","Lower Tier","Dominic Nicastro"],
[2026,"L","N/A","Lower Tier","Bob Keslar"]
```

Then change the comment line ` * SAME-DIVISION HISTORY — embedded from MAFFL_Division_History_2005_2025.csv.` to:

```
 * SAME-DIVISION HISTORY — embedded from MAFFL_Division_History_2005_2025.csv (2005–2026; the current
 * season's rows are its alignment, added at season start per governance CE-9).
```

**3b. Header pills.** Find (exactly once):

```
      <span class="meta-pill">Last Updated July 2, 2026</span>
```

Replace with:

```
      <span class="meta-pill">Last Updated September 30, 2026</span>
      <span class="meta-pill" id="dataThroughPill">Data through …</span>
```

(Use today's date if it isn't Sep 30. Keep `v1.1`, because VERSION is none.)

**3c. Fill the pill at runtime.** Find (exactly once) `<script src="matchups-data.js"></script>` and insert directly
after it:

```
<script>
/* Data-freshness pill: the newest game in matchups-data.js (refreshed weekly by the robot).
 * "Last Updated" = this page file was edited; "Data through" = how current the results are. */
(function () {
  var rows = window.MATCHUPS_DATA || [], y = 0, w = 0;
  rows.forEach(function (r) { if (r[0] > y || (r[0] === y && r[1] > w)) { y = r[0]; w = r[1]; } });
  var el = document.getElementById("dataThroughPill");
  if (el && y) el.textContent = "Data through " + y + " Wk " + w;
})();
</script>
```

## Step 4 — `CLAUDE.md`: one rule

Directly after the line `- A stamp update is part of the SAME commit as the change, not a separate pass.` add:

```
- **Data-freshness pill.** A page that reads `matchups-data.js` shows a third header pill, `Data through YYYY Wk N`,
  computed at runtime from the newest row (live on `rivalry.html`; add it to `weekly.html` and `power-rankings.html`
  the next time they're touched). It needs no stamping. `Last Updated` still means the page file itself was edited.
```

## Step 5 — `MAFFL_HQ_DATA_GOVERNANCE.md`

**5a. New chain event.** Directly after the CE-8 line `→ Owners_Sheet power cols + "2026 Power Ranking"`, add
a blank line, then:

```
### CE-9 — New season begins (promotion/relegation + division alignment set)
Added 2026-09-30. This gap left `rivalry.html` without 2026 divisions: every other CE starts from a result, none from a season start.
`MAFFL_Division_History_2005_2025.csv`: append the new season's alignment rows (Upper Division A–D + Lower Tier), with `Division_Rank` / `W` / `L` / `T` **blank** until CE-3
→ `rivalry.html` `DIVISION_DATA` (same rows, embed spellings; drives same-division and same-tier detection)
→ `data/MAFFL_Schedule_<year>_Upper.csv` (commissioner-authored fixtures carry the same divisions; check they agree)
→ weekly robot: `TEAM_MAP` tiers in `_ops/scripts/maffl_espn_pull.py`, `DIVISIONS` in `_ops/scripts/pulse_facts.py`
→ `weekly.html` standings groups (`upperTier.divA..divD`, `lowerTier`) + Owners_Sheet "<year> League" column
→ `history.html` csv-divisions embed is **not** updated mid-season; it picks the season up at CE-3
```

**5b. CE-3 note.** Directly after the last line of CE-3 (the one ending in `book entries`), add:

```
→ `MAFFL_Division_History_2005_2025.csv`: fill `Division_Rank` + `W`/`L`/`T` on the season's CE-9 alignment rows (don't add new rows)
```

**5c. Gotcha.** Directly after the `| G-8 |` row of the §6 table, add:

```
| G-9 | Medium | No chain event for season start, so `rivalry.html` DIVISION_DATA stopped at 2025 (fixed 2026-09-30 via CE-9). Hand-copied embeds go stale silently | `rivalry.html`, Division_History |
```

## Step 6 — Verify

- `validate.ps1` → still **8/8**. Gate 7 reads Division_History owners, and all 21 spellings already exist in 2025 rows.
- `Select-String rivalry.html -Pattern '\[2026,"U"'` → **12**; `'\[2026,"L"'` → **9**; `'dataThroughPill'` → **2**.
- Open `rivalry.html` locally in Chrome. No console errors (apart from expected `file://` font, logo or analytics load failures). There should be **no**
  `[rivalry] division-data name did not resolve` warnings. The third pill reads **`Data through 2026 Wk 3`**.
- Pick Mike Murello vs David Murello (both 2026 Division A). The same-division indicator should now include 2026. Then pick
  Sam Lavrinc vs Ben Funari. Same tier should include 2026.
- Mobile: DevTools iPhone 12 Pro (390×844), and once in standalone (Home-Screen) mode. The three header pills stack
  cleanly at the right (the existing ≤ breakpoint rule switches them to a column), don't overflow, and
  `document.documentElement.scrollWidth === 390`.
- `git diff --stat`: the CSV, `rivalry.html`, `CLAUDE.md`, the governance doc, STATUS, and this prompt's move. Nothing else.

## Step 7 — Close out

`git mv` this prompt to `_ops/prompts/done/`, update `_ops/STATUS.md` with the block below, then one commit and push.

Suggested commit message: `Rivalry: 2026 division alignment + Data-through pill; governance CE-9 (season start)`

---

STATUS:
- Recently shipped (top): `2026-09-30 · Rivalry: 2026 divisions/tiers added (gold Division_History alignment rows + DIVISION_DATA); runtime "Data through YYYY Wk N" pill; governance CE-9 "New season begins" + G-9; CLAUDE.md data-freshness pill rule`
- Open decisions → add: `**Data-through pill on weekly.html + power-rankings.html** (both read matchups-data.js), at their next edit (CLAUDE.md rule).`
- Queued prompts: remove this prompt's line.
