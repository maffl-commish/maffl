# Robot fix: CRLF bug in the CE-1 generator + apply ESPN stat corrections automatically

VERSION: none

**Why:** The first unattended Pulse draft (Week 4, Tue Oct 6) failed in the data job. Run log:

```
Appended week 4: 11 matchup rows (CRLF) · 63 top-performer rows (CRLF) · score_sum 3254.31
Stat corrections reported for earlier weeks: 6 → NOT applied automatically (CE-1a needs the commissioner)
[matchups drift] REFUSED -- 1 problem(s):
- matchups-data.js: 'window.MATCHUPS_DATA = [' line not found
CE-1 generator, check (expect 1 = additions) failed (exit 2).
```

1. **The blocker is a line-ending bug, not the stat corrections.** Git stores `matchups-data.js` with LF.
   The Windows runner checks it out with CRLF (autocrlf), so after `-split "`n"` the anchor line is
   `window.MATCHUPS_DATA = [` + `\r` and the exact `IndexOf` match misses. Every earlier robot run skipped
   the generator (connection test and rehearsal), so this is the first time it ran on the runner.
   I checked gold vs `NoConsolation` vs `matchups-data.js` on main: all 2,419 rows, scores and owner labels
   agree. Nothing is actually drifting.
2. **Stat corrections:** ESPN changed 6 Week 3 scores (no winner changed, 👻 par unchanged at 151.47).
   Going forward the commissioner wants small in-season corrections applied by the robot, not held for a
   hand CE-1a. The PR still lists every change, so nothing goes in unseen.

**Scope:** `build/generate-matchups-data.ps1` (one line), new `_ops/scripts/apply_corrections.py`,
`.github/workflows/pulse-draft.yml`, `_ops/docs/ROBOT_PULSE_RECIPE.md`, governance CE-1a,
`_ops/docs/WEEKLY_AUTOMATION_PLAN.md`, `_ops/STATUS.md`. **No site pages, no CSV edits by hand.**
**Mobile:** no page markup or CSS changes, so no rendering impact on iOS standalone / ~390px. The robot will
change numbers inside earlier Week objects in `weekly.html` on its own branch, which doesn't affect layout.

Read each file before editing it. If a quoted "find" string isn't in the file exactly, stop and report it.
Don't create `*.bak` files. **Before starting: GitHub Desktop Fetch/Pull** (the ESPN robot pushed the Week 4
report to main this morning). There is no open Weekly Pulse PR, so the CLAUDE.md "don't touch weekly.html
while a PR is open" rule doesn't block this, and this prompt doesn't touch `weekly.html` anyway.

---

## 1. `build/generate-matchups-data.ps1`: tolerate CRLF when finding the data anchor

Find:

```powershell
$start = [Array]::IndexOf($oldJsAll, 'window.MATCHUPS_DATA = [')
```

Replace with:

```powershell
# Windows runners check matchups-data.js out with CRLF (git stores LF): match the anchor without its CR.
$start = [Array]::IndexOf(@($oldJsAll | ForEach-Object { $_.TrimEnd("`r") }), 'window.MATCHUPS_DATA = [')
```

The row loop below it already does `TrimEnd("`r")`, so nothing else in that block changes.

Then grep the rest of this script and `build/validate.ps1` for any other exact-line comparison against a
file read with `-split "`n"` (or `ReadAllLines`) that would break the same way on a CRLF checkout. Report
what you find. Fix only `validate.ps1` and this generator (the robot runs both); the other `gen-*.ps1`
scripts aren't run by the robot, so just list them in your report.

**Verify (PowerShell, repo root), simulating the runner on a scratch copy:**

```powershell
git stash list   # expect clean tree first
$tmp = Join-Path $env:TEMP "maffl-crlf-test"; Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
git worktree add $tmp HEAD
Push-Location $tmp
git -c core.autocrlf=true checkout -- .                         # force CRLF on every text file
(Get-Content matchups-data.js -Raw) -match "MATCHUPS_DATA = \[`r`n"   # expect True
powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1; "exit $LASTEXITCODE"   # expect 0 or 1, never 2
powershell -ExecutionPolicy Bypass -File build\validate.ps1; "exit $LASTEXITCODE"                  # expect 0
Pop-Location; git worktree remove $tmp --force
```

Also run the generator check in your normal checkout: expect exit 0 (in sync), as before.

---

## 2. New `_ops/scripts/apply_corrections.py`: apply in-season ESPN stat corrections to gold

Header in the same style as `ingest_week.py` (VERSION 0.1.0 (2026-10-06), usage, exit codes, UTF-8 console
reconfigure for Windows). Usage: `python _ops/scripts/apply_corrections.py W`.

Behaviour:

- Read `_ops/inbox/MAFFL_2026_WeekWW_espn.md`. Refuse (exit 2, nothing written) unless the last line is
  `STATUS: READY TO INGEST`.
- Parse `## OUTPUT 4 — PRIOR-WEEK SCORE AUDIT`. If the line `Stat corrections vs gold:` says `none`,
  print `No stat corrections.` and exit 0 without writing anything (and without creating a corrections file).
- Otherwise read the fenced row blocks under `Week 1`, `Week 2`, … in OUTPUT 4 (same 13-field format as
  OUTPUT 1, one block per earlier week, ghost row included with ESPN-based par already recomputed by the
  pull script). Check the `AUDIT · weeks … · score_sum …` line against the sum of those rows (Decimal);
  refuse on mismatch.
- For each audit row, find the gold row in `data/MAFFL_Matchups_Clean.csv` with the same Year (2026), Week,
  Tier and the same **pair of team names** (fields 7 and 11, either order). Rules:
  - **Only 2026 rows, only weeks < W.** Never add or remove rows. Any audit row with no gold match, or a
    gold 2026 week < W with a different row count than its audit block → refuse (exit 2).
  - Same winner, different score(s) → rewrite **only** the two score fields (8 and 12) of the gold row,
    keeping the gold row's owner strings, ESPN strings and team names byte-for-byte.
  - **Winner flipped** → swap the winner/loser sides of the gold row (fields 5–8 ↔ 9–12, keeping each
    side's gold owner/ESPN/team strings) and put in the corrected scores. Count it as a flip.
  - Identical → leave alone.
- Format scores exactly as the gold file already does (same as OUTPUT 1: e.g. `125.1`, `153.72`, `124.0`;
  match whatever `ingest_week.py` writes — reuse its number text from the report, don't reformat).
- Keep the file's line endings and trailing newline (same approach as `append_rows` in `ingest_week.py`;
  rewrite the whole file, CRLF if the file has CRLF).
- After writing, re-read gold and confirm every 2026 week < W now matches the audit block (scores, and
  winner team per row). If not, restore the original bytes and refuse (exit 2).
- Write `_ops/inbox/MAFFL_2026_WeekWW_corrections.md`:

  ```
  # Week W — stat corrections applied to gold (robot)
  Applied: N score change(s) in M row(s) · winner flips: F
  - Week 3 · Upper · Bad Attitude Gang 154.22 → 153.72 (vs Happy Valley Hammer Time, result unchanged)
  - …
  - ⚠️ Week K · <tier> · WINNER FLIPPED: <old winner> → <new winner>   (only if any)
  👻 par changes: <"none", or "Week K 151.47 → 151.12 — LM: re-enter in ESPN">
  ```

  One bullet per changed team score, naming the opponent and whether the result changed. The 👻 line
  compares old vs new score on the Ghost side of each Ghost row.
- Print the same text to stdout (it lands in the data log). Exit 0 = applied (or none);
  3 = applied **and** at least one winner flipped (the workflow treats 3 as success but the PR is flagged);
  2 = refused.

**Verify (local, on a scratch branch, then throw it away):**

```powershell
git switch -c scratch/corrections-test
python _ops/scripts/ingest_week.py 4; "exit $LASTEXITCODE"            # expect 0
python _ops/scripts/apply_corrections.py 4; "exit $LASTEXITCODE"      # expect 0, "Applied: 6 score change(s) in 6 row(s) · winner flips: 0", 👻 none
git diff --stat data/MAFFL_Matchups_Clean.csv                         # expect only Week 3 lines changed + 11 Week 4 lines added
powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 -CorrectSeason 2026; "exit $LASTEXITCODE"   # expect 1, lists 6 corrected rows
python _ops/scripts/apply_corrections.py 4; "exit $LASTEXITCODE"      # run twice: expect 0 and "Applied: 0" (idempotent)
git checkout -- . ; git clean -fd _ops/inbox ; git switch main ; git branch -D scratch/corrections-test
```

Expected Week 3 changes (from the report): Bad Attitude Gang 154.22 → 153.72, The Prodigal Sons 143.78 →
142.78, The Big Bang Theory 125.60 → 125.10, Fightin Ferrets 137.60 → 138.60, The Best in The 'Burgh
179.34 → 178.84, Tony's Talented Team 167.52 → 167.02. Do **not** commit the gold changes from this test; the
robot applies them on its own branch.

---

## 3. `ingest_week.py`: update the message only

Find the print that ends `→ NOT applied automatically (CE-1a needs the commissioner)` and change that
suffix to `→ applied next by apply_corrections.py`. Bump its VERSION line to 0.1.2 (2026-10-06) with that
note. No logic change.

---

## 4. `.github/workflows/pulse-draft.yml`: run corrections, then the generator in correct mode

In the `Gold data, generator, validate, facts` step, replace the draft block:

```powershell
          if ($mode -eq 'draft') {
            Step "Append week to gold (ingest_week.py)" { python _ops/scripts/ingest_week.py $w } @(0)
            Step "CE-1 generator, check (expect 1 = additions)" { powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 } @(1)
            Step "CE-1 generator, write" { powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 -Write } @(0,1)
            Step "CE-1 generator, re-check (expect 0 = in sync)" { powershell -ExecutionPolicy Bypass -File build\generate-matchups-data.ps1 } @(0)
          }
```

with:

```powershell
          if ($mode -eq 'draft') {
            Step "Append week to gold (ingest_week.py)" { python _ops/scripts/ingest_week.py $w } @(0)
            Step "Apply ESPN stat corrections to earlier weeks (apply_corrections.py)" { python _ops/scripts/apply_corrections.py $w } @(0,3)
            $cf = "_ops/inbox/MAFFL_2026_Week{0:D2}_corrections.md" -f $w
            $gen = @('-ExecutionPolicy','Bypass','-File','build\generate-matchups-data.ps1')
            if (Test-Path $cf) { $gen += @('-CorrectSeason','2026') }   # unlocks 2026 rows only; earlier seasons stay byte-locked
            Step "CE-1 generator, check (expect 1 = additions)" { powershell @gen } @(1)
            Step "CE-1 generator, write" { powershell @gen -Write } @(0,1)
            Step "CE-1 generator, re-check (expect 0 = in sync)" { powershell @gen } @(0)
          }
```

(If PowerShell splatting with `-Write` appended doesn't parse, use `powershell ($gen + '-Write')`. Test the
exact syntax locally in `pwsh` before committing.) Update the header comment line
`#   1. data  (Windows, no AI): append the week to gold, run the CE-1 generator + validate,` to read
`#   1. data  (Windows, no AI): append the week to gold, apply ESPN stat corrections, run CE-1 + validate,`.
Change nothing else in the file.

**Verify:** `git diff .github/workflows/pulse-draft.yml` shows only these lines; indentation matches the
neighbours (10 spaces inside `run: |`).

---

## 5. `_ops/docs/ROBOT_PULSE_RECIPE.md` → VERSION 0.5

VERSION line: prepend `0.5 (2026-10-06): stat corrections are applied to gold by the data job; Claude
updates earlier Week objects to match and lists every change.`

§0 "Read first": add item 5a: `_ops/inbox/MAFFL_2026_WeekWW_corrections.md` **if it exists**: stat
corrections the data job already applied to gold.

§2: replace the sentence starting `If the data log says stat corrections were reported for earlier weeks,
they were **not** applied` (through `(CE-1a is the commissioner's call).`) with:

> If `_ops/inbox/MAFFL_2026_WeekWW_corrections.md` exists, the data job has **already applied** those ESPN
> stat corrections to gold, and the facts file is built from the corrected gold. Your part (CE-1a, robot
> path):
> - In each **earlier** Week object in `weekly.html`, change each corrected score (`scoreA` / `scoreB`) to
>   the new value, and fix any prose in that object that quotes a changed number (a score, a margin like
>   "by 3.46", a running total). Recompute a margin only by subtracting the two corrected scores as written
>   in the corrections file; show your arithmetic in the summary.
> - **Don't** rewrite earlier weeks' standings, creditTracker or highestWeekly snapshots. They stay as
>   published; this week's object (from the facts file) carries the corrected season totals.
>   Exception: if a correction changes who holds `highestWeekly` or flips a winner, say so under
>   "Needs your OK" and leave it for the commissioner.
> - Don't mention corrections in this week's prose unless a winner flipped.
> - `git status` may show `weekly.html` edits in earlier objects; that's expected.

§6 summary: add a section right after the opening line:
`**Stat corrections applied (ESPN):** <copy the bullets from the corrections file, then list every
weekly.html edit you made for them, or "none">`. If the corrections file has a ⚠️ WINNER FLIPPED line,
put `⚠️ A stat correction flipped a result. Check before merging.` as the **first** line of the summary.
If the 👻 par changed, add the LM re-entry to "Needs your OK".

§5 self-check: the "only `weekly.html` and the summary file changed by you" rule stays.

---

## 6. Docs

- `MAFFL_HQ_DATA_GOVERNANCE.md` CE-1a: add a line under the heading:
  `**Robot path (from 2026-10-06):** in season, pulse-draft applies these automatically:
  apply_corrections.py edits gold scores (never rows) from the ESPN report's OUTPUT 4, the generator runs with
  -CorrectSeason, and the robot fixes earlier Week objects' scores and quoted numbers (not their standings
  snapshots). Every change is listed in the PR; a flipped winner is flagged at the top. The hand steps below
  remain the method outside the robot.`
- `_ops/docs/WEEKLY_AUTOMATION_PLAN.md`: in the Tuesday routine / what-the-robot-does section, one line:
  `ESPN stat corrections to earlier weeks are applied automatically and listed in the PR under "Stat corrections applied". A ⚠️ at the top means a result flipped: read that before merging.`

---

## 7. Commit, push, then re-run Week 4

One commit: `Robot: CRLF-safe matchups anchor; auto-apply ESPN stat corrections (apply_corrections.py, recipe 0.5)`.
Push to main.

Then tell the commissioner (don't do it yourself): **Actions → Pulse draft → Run workflow**, leave
"week" blank (or 4). Don't use "Re-run failed jobs" on this morning's run: a re-run uses the old workflow file,
which has no corrections step. Expect a "Weekly Pulse: Week 4 draft" PR in ~10–15 min with a
"Stat corrections applied" section listing the six Week 3 changes.

---

STATUS:
- Last updated: `2026-10-06 by Claude (code), robot CRLF fix + auto stat corrections`
- Now: replace the "Week 4 Pulse (Tue Oct 6)" bullet's first sentence with `**Week 4 Pulse:** first unattended run (Tue Oct 6) failed in the data job on a CRLF bug in the generator (fixed 10/6); re-run by hand via Actions → Pulse draft → Run workflow.` Keep the rest of the bullet.
- Now, Weekly robot bullet: add `**Tuesday's five scheduled ESPN pulls never fired** (only the 6:12 AM manual run exists); watch next Tuesday; Wed backstop still in place.`
- Recently shipped (top): `2026-10-06 · Robot fix: CE-1 generator finds the matchups-data.js anchor on CRLF checkouts (first unattended run failed on it); ESPN stat corrections now auto-applied to gold by apply_corrections.py + generator -CorrectSeason; recipe 0.5 has the robot fix earlier Week objects' scores and list every change in the PR.`
- Queued prompts: remove this prompt's line.
