# ESPN stat corrections — Weeks 1–2 (2026)

VERSION: none

Date: 2026-09-29 · Author: Claude (chat)

This prompt changes five things:

- the generator gets a new `-CorrectSeason` switch,
- 17 gold rows get new scores,
- the four CE-1 derived files are regenerated,
- weekly.html is corrected with a patch, and
- governance gets a new chain-event line.

Read first: `_ops/STATUS.md`, `CLAUDE.md`, and the header of `build/generate-matchups-data.ps1`.
If an anchor doesn't match exactly, **stop and ask**. No `*.bak` files.

## Why

After Week 2 was captured, ESPN applied stat corrections. The commish pasted ESPN's League Schedule
page for both tiers on 2026-09-29, and it shows 17 of the 22 Week 1–2 games with changed scores.
Week 3 matches gold exactly.

**No win/loss result changes. No Survivor elimination changes.**

**These do change:**

- Season points
- Both Ghost pars:
  - Wk 1 goes from 151.16 to **151.28**
  - Wk 2 goes from 131.65 to **138.02**
  - Recomputed with the standard rule: 9 real Lower scores, drop the top one, average 8, round half-up.
- The Upper Largest Blowout leader: Bad Attitude Gang 59.14 (Wk 2) now tops Turkey Hat's 58.40 and 58.54.
- The Upper Most Points order: Bad Attitude Gang 502.70 now leads Turkey Hat 500.66.
- A few sentences in the Pulse prose that quoted the old numbers.

## Step 1 — Let the generator accept in-season corrections

In `build/generate-matchups-data.ps1` the NoConsolation and matchups-data.js checks are prefix-only.
Any change to an already-published row is refused, including one in the current season.
Add a narrow, explicit override.

1. Change `param([switch]$Write)` to `param([switch]$Write, [int]$CorrectSeason = 0)`.
2. After `$maxYear` is computed (line ~163), add:
   - If `$CorrectSeason -ne 0 -and $CorrectSeason -ne $maxYear`, call
     `Add-Problem "-CorrectSeason $CorrectSeason is not the in-progress season ($maxYear)"`.
   - Add `$corrected = 0`.
3. In the NoConsolation prefix loop (the line with `"NoConsolation line $($i + 1) would change"`), handle a
   mismatch like this:
   - If `$CorrectSeason -gt 0` and **both** the old and the new line start with `"$CorrectSeason,"`,
     write `  corrected NoConsolation: <old> -> <new>` with `Write-Host` in Yellow, do `$corrected++`,
     and `continue`.
   - Otherwise keep the existing `Add-Problem` and `break`.
4. Apply the same rule to the matchups-data.js prefix loop (`"matchups-data.js row $($i + 1) would change"`).
   The row prefix there is `"[$CorrectSeason,"`. Don't increment `$corrected` for JS rows.
5. Near the end, before the final summary, add:
   `if ($CorrectSeason -gt 0) { Write-Host "[correct] $corrected NoConsolation row(s) corrected in season $CorrectSeason" -ForegroundColor Yellow }`
6. Update the header comment. In the "Refuses (exit 2) when" list, the prefix rule now ends:
   "…unless `-CorrectSeason <in-progress year>` is passed, which allows edits to that season's
   existing rows only (ESPN stat corrections, CE-1a). Earlier seasons stay byte-locked."
   Add the usage line
   `#   build\generate-matchups-data.ps1 -CorrectSeason 2026 [-Write]   # re-derive after a stat correction`.

Nothing else in the generator changes. Row counts still can't shrink, and pre-2026 rows stay locked.

## Step 2 — Correct 17 rows in gold `data/MAFFL_Matchups_Clean.csv`

For each pair below, find the `OLD:` line (it must match exactly once) and replace it with the `NEW:`
line. Keep the CRLF line endings. Only fields 9 (Winner_Score) and 13 (Loser_Score) differ.

```
OLD: 2026,1,Upper,False,Regular,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,159.22,Mike Murello,Michael Murello,Bad Attitude Gang,137.98
NEW: 2026,1,Upper,False,Regular,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,159.22,Mike Murello,Michael Murello,Bad Attitude Gang,138.48

OLD: 2026,1,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,160.64,Joe Reilly,Joseph Reilly,Reilly's Reindeer,145.32
NEW: 2026,1,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,160.64,Joe Reilly,Joseph Reilly,Reilly's Reindeer,146.82

OLD: 2026,1,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,158.56,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,146.9
NEW: 2026,1,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,158.56,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,148.4

OLD: 2026,1,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,160.04,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,144.58
NEW: 2026,1,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,160.04,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,145.08

OLD: 2026,1,Lower,False,Regular,Chris Johnson,Chris Johnson,The V-Unit,141.06,Nick Yankovich,Nick Yankovich,Sarge's Squad,126.4
NEW: 2026,1,Lower,False,Regular,Chris Johnson,Chris Johnson,The V-Unit,141.06,Nick Yankovich,Nick Yankovich,Sarge's Squad,126.9

OLD: 2026,1,Lower,False,Ghost,Charles Lavrinc,Charlie Lavrinc,Portly Primates,168.72,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,151.16
NEW: 2026,1,Lower,False,Ghost,Charles Lavrinc,Charlie Lavrinc,Portly Primates,168.72,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,151.28

OLD: 2026,2,Upper,False,Regular,Mike Murello,Michael Murello,Bad Attitude Gang,202.0,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,146.86
NEW: 2026,2,Upper,False,Regular,Mike Murello,Michael Murello,Bad Attitude Gang,210.0,Jon Murello/ Rick Simmons,Jon Murello / Rick Simmons,The Prodigal Sons,150.86

OLD: 2026,2,Upper,False,Regular,Tony Trozzo,Tony Trozzo,Happy Valley Hammer Time,170.8,Joe Reilly,Joseph Reilly,Reilly's Reindeer,139.38
NEW: 2026,2,Upper,False,Regular,Tony Trozzo,Tony Trozzo,Happy Valley Hammer Time,173.8,Joe Reilly,Joseph Reilly,Reilly's Reindeer,142.88

OLD: 2026,2,Upper,False,Regular,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,168.46,Jon Fetrow/ Casey Trozzo,John Fetrow / Casey Trozzo,Southside Shooters,103.06
NEW: 2026,2,Upper,False,Regular,Ed Peters,Edwin Peters,Turkey Hat Conglomerate,170.46,Jon Fetrow/ Casey Trozzo,John Fetrow / Casey Trozzo,Southside Shooters,112.06

OLD: 2026,2,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,164.24,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,118.08
NEW: 2026,2,Upper,False,Regular,Jacob Nickman,Jacob Nickman,Jake's Jagoffs,180.24,Braiden Snyder,Braiden Snyder,Mike Vicks Dog Sitting Co.,127.08

OLD: 2026,2,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,158.74,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,109.62
NEW: 2026,2,Upper,False,Regular,Brian Murello/ Ron Murello,Ron Murello,Hadley's Comets,163.74,David Murello,David Murello / Michael Murello,Marco Clair Kardiac Attack,116.62

OLD: 2026,2,Upper,False,Regular,BJ Funari,Bryan Funari,South Hills FunShiners,108.0,Dan Reilly,Daniel Reilly,The Big Bang Theory,87.72
NEW: 2026,2,Upper,False,Regular,BJ Funari,Bryan Funari,South Hills FunShiners,111.0,Dan Reilly,Daniel Reilly,The Big Bang Theory,88.72

OLD: 2026,2,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,147.88,Todd Trozzo,Todd Trozzo,Fightin Ferrets,137.52
NEW: 2026,2,Lower,False,Regular,Ben Funari,Benjamin Funari,The Best in The 'Burgh,152.88,Todd Trozzo,Todd Trozzo,Fightin Ferrets,141.52

OLD: 2026,2,Lower,False,Regular,Dominic Nicastro,Dominic Nicastro,Steel City Champyinz,137.56,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,126.86
NEW: 2026,2,Lower,False,Regular,Dominic Nicastro,Dominic Nicastro,Steel City Champyinz,143.56,Bob Keslar,Bob Keslar / Bo Kes,Camp Kes,138.86

OLD: 2026,2,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,132.78,Charles Lavrinc,Charlie Lavrinc,Portly Primates,126.2
NEW: 2026,2,Lower,False,Regular,Nick Yankovich,Nick Yankovich,Sarge's Squad,140.78,Charles Lavrinc,Charlie Lavrinc,Portly Primates,135.2

OLD: 2026,2,Lower,False,Regular,Tony Brooks,Tony Brooks,Tony's Talented Team,125.64,Chris Johnson,Chris Johnson,The V-Unit,118.74
NEW: 2026,2,Lower,False,Regular,Tony Brooks,Tony Brooks,Tony's Talented Team,126.64,Chris Johnson,Chris Johnson,The V-Unit,124.74

OLD: 2026,2,Lower,False,Ghost,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,194.92,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,131.65
NEW: 2026,2,Lower,False,Ghost,Sam Lavrinc,Sam Lavrinc,Tommy Phamclub,198.92,MAFFL Ghost,MAFFL Ghost,MAFFL Ghost,138.02
```

Verify:

- `git diff --stat data/MAFFL_Matchups_Clean.csv` shows **17 insertions, 17 deletions**.
- No `^2026,3,` row changed.

## Step 3 — Regenerate CE-1

```
powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 -CorrectSeason 2026          # check
powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 -CorrectSeason 2026 -Write   # write
```

The check run should behave like this:

- **Exit code:** 1.
- **The `[correct]` summary line:** reports **17** corrected NoConsolation rows.
- **JS rows reported:** 15. The two Ghost rows are not in matchups-data.js.
- **Problems:** none.

Also run the check **without** `-CorrectSeason` once and confirm it still exits 2 (REFUSED).
That proves the lock holds by default.

After `-Write`, confirm the following:

- **Changed files:** `git diff --stat` touches only Clean, NoConsolation, matchups-data.js,
  Points_By_Season, Points_AllTime, and the generator.
- **Points files:** only 2026 rows change.
- **Four spot checks in `MAFFL_Points_By_Season.csv`:**

  | Owner | 2026 Reg_PF |
  |---|---|
  | Mike Murello | 502.7 |
  | Jacob Nickman | 491.08 |
  | Sam Lavrinc | 497.16 |
  | Nick Yankovich | 406.1 |

## Step 4 — Correct weekly.html

A patch is saved next to this prompt: `_ops/prompts/2026-09-29_stat-corrections_weekly.patch`.
It was built against weekly.html as committed in "week 3 pulse".

```
git apply --check _ops/prompts/2026-09-29_stat-corrections_weekly.patch
git apply _ops/prompts/2026-09-29_stat-corrections_weekly.patch
```

If `--check` fails, stop and report. Don't hand-merge.

**Week 3 changes:**

- **Data:** standings points (Ghost included), Most Points Upper → Bad Attitude Gang 502.70 (since 2),
  Blowout Upper → Bad Attitude Gang 59.14 (since 2), Lower 497.16 / 60.90, and Highest Weekly
  Wk 2 → 210.0 / 198.92.
- **Rewritten because the new numbers made the old text false:**
  - `latestChange`
  - `postseasonNote`
  - one Hot & Not item
  - one Results note (Ferrets–Camp Kes)
  - two preview notes (Dave–Ed, Sam–Brooks)
  - Elite 5: re-ranked on the rubric to Jake's Jagoffs, Hadley's Comets, The Best in The 'Burgh,
    Turkey Hat, Portly. Jake's all-play is now 25-8, the best in Upper.

**Week 2 changes:**

- **Data:** every score and PF, the credit tracker, and highest weekly.
- **Prose:** every sentence that quoted a changed number. The dropped claims are "65.40 widest margin"
  and "158.56 then 158.74, 0.18 apart". The Elite 5 order is left as published.

**Week 1 changes:**

- **Data:** 6 scores, the matching PFs, and the Ghost par (151.28).
- **Prose:** the par margin (17.44), the tier averages (Lower 156.12, Upper 152.86), and one preview
  note whose "both beaten by under twelve" claim was wrong.

The date pill already reads September 29, 2026. If you run this on a later day, update it.
VERSION is none, so leave v6.2.

**Verify:**

- `Select-String weekly.html -Pattern '65\.40|63\.27|0\.18 points|202\.0|194\.92|131\.65|151\.16'` → **0 hits**
- `Select-String weekly.html -Pattern '210\.0|198\.92|138\.02|151\.28'` → hits in Weeks 1–3 only
- In Chrome DevTools at iPhone 12 Pro (390×844), check these weeks:
  - `?week=3`:
    - Credit Tracker shows Most Points Upper as **Bad Attitude Gang (Mike), Leader since Wk 2**. It
      should not say NEW LEADER.
    - Elite 5 #1 is Jake's Jagoffs with `25-8`.
    - No console errors, and `scrollWidth` is 390.
  - `?week=2`: the Results card shows 210.0–150.86 and 198.92–138.02.
  - `?week=1`: the Results card shows the Ghost game as 168.72–151.28.
  - In standalone mode, confirm that the rewritten latestChange (the longest line) wraps cleanly in the
    collapsed Credit Tracker tile.

## Step 5 — Governance

In `MAFFL_HQ_DATA_GOVERNANCE.md` §4, add a new block directly after the CE-1 block:

```
### CE-1a — ESPN stat correction to an already-posted week (in-progress season only)
Edit the affected rows' scores in `MAFFL_Matchups_Clean.csv` (never add or remove rows)
→ recompute that week's 👻 par from the corrected real Lower scores and edit the Ghost row too
→ `build\generate-matchups-data.ps1 -CorrectSeason <year> [-Write]` (the lock stays on for every earlier season)
→ correct every weekly.html week object from the corrected week onward: results, standings points, creditTracker, highestWeekly, and any prose that quotes a changed number
→ LM re-enters the corrected 👻 par in ESPN
Top-performer rows are not re-captured for corrections (player-level corrections aren't visible on the schedule page).
```

## Step 6 — Close out

1. Report the diff summary.
2. `git mv` this prompt and its `.patch` to `_ops/prompts/done/`.
3. Update `_ops/STATUS.md` from the block below.

Everything goes in one commit. Suggested message:
`Apply ESPN stat corrections to 2026 Wks 1–2 (CE-1a) + generator -CorrectSeason`

---

STATUS:
- Recently shipped (top): `2026-09-29 · ESPN stat corrections applied to 2026 Wks 1–2 (17 rows); generator -CorrectSeason; CE-1a added; Pulse Wks 1–3 corrected`
- Open decisions: remove the "ESPN stat corrections, Wks 1–2 (decided: correct gold)" item.
- Now: replace the "Stat corrections, Wks 1–2" bullet with `**LM to-do:** set ESPN 👻 scores to Wk 1 151.28, Wk 2 138.02, Wk 3 151.47 (delete this line once done).`
- Queued prompts: remove this prompt's line.
