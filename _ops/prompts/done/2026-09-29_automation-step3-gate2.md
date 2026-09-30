# Weekly automation Step 3 — fix validate Gate 2 (read W/L/T from gold matchups, not the quarantined CSV)

VERSION: none

Date: 2026-09-29 · Author: Claude (chat) · Scope: one block in `build/validate.ps1`. No data files,
no pages. Plan: `_ops/docs/WEEKLY_AUTOMATION_PLAN.md` (Step 3).

Read first: `_ops/STATUS.md`, `MAFFL_HQ_DATA_GOVERNANCE.md` §7.2 (GOLD vs DERIVED) and the
"Owner W/L/T per season" row of the derivation table. If an anchor below doesn't match the file
exactly, **stop and ask**. Don't guess. No `*.bak` files.

## Diagnosis (chat, 2026-09-29)

Gate 2 fails because it recomputes each owner's career W/L/T from `data/cleaned_maffl_revised.csv`.
Governance §7.2 lists that file as **CORRUPTED — DO NOT USE**, and says W/L/T per season is
**derived from `MAFFL_Matchups_Clean.csv`**. Chat recomputed the Owners Sheet career columns from
`MAFFL_Matchups_Clean.csv` (`Game_Type` = `Regular`, both tiers, `Year` ≤ 2025, equal scores = tie)
and got **0 mismatches across all 34 owner rows**. The Owners Sheet is right; the gate's source is wrong.

The 10 current Gate 2 mismatches all come from the quarantined file:
- **Wrong season rows (3 games):** 2015 Mike vs Brian/Ron, 2022 Joe vs Jacob, 2024 Dan vs Tony.
  In each case `cleaned_maffl` has the winner and loser swapped against the matchup gold.
- **Wrong owner on 5 seasons:** Warren Brownies 2011–13 is filed under Jimmy Crisan, but gold says
  Vincent Cavalier / Dominic Nicastro. Daddy Fat Sacks 2006–07 is filed under Marcus Ruby / Joe Ruby,
  but gold says Marcus Ruby alone. That's the "co-owner split attribution" note in STATUS.

Fix: point Gate 2 at the gold matchups. Leave `cleaned_maffl_revised.csv` untouched; it stays
quarantined. Gates 1 and 7 and two generators still read it. That's out of scope here, so list it
under Open decisions (see STATUS block).

---

## Step 1 — Baseline

Run `powershell -ExecutionPolicy Bypass -File build\validate.ps1` and paste the gate summary into your
report. Expect **Gate 2 FAIL** with 10 owner mismatches (Joe Reilly, Brian/Ron, Tony Trozzo,
Mike Murello, Jimmy Crisan, Marcus Ruby / Joe Ruby, Jacob Nickman, Dan Reilly, Marcus Ruby,
Vincent Cavalier / Dominic Nicastro). If **other** gates fail too, list them in your report and carry
on with Step 2. Don't fix them.

## Step 2 — Replace the Gate 2 aggregation in `build/validate.ps1`

Find this block (exactly once in the file):

```powershell
# ===== Gate 2: recomputed W/L/T per owner == published =====
$agg = @{}
foreach ($r in $season) {
    $n = Normalize-Owner $r.Owner
    if (-not $n) { continue }
    if (-not $agg.ContainsKey($n)) { $agg[$n] = @{ w=0; l=0; t=0 } }
    $agg[$n].w += (ConvertTo-IntZero $r.W)
    $agg[$n].l += (ConvertTo-IntZero $r.L)
    $agg[$n].t += (ConvertTo-IntZero $r.T)
}
```

Replace it with this (keep the file ASCII-only):

```powershell
# ===== Gate 2: Owners Sheet career W/L/T == recomputed from gold matchups =====
# Source: MAFFL_Matchups_Clean.csv (GOLD, governance 7.2). Regular-season games only
# (Game_Type 'Regular'; excludes playoffs, consolation and 'Ghost'), both tiers, equal
# scores = tie. cleaned_maffl_revised.csv is quarantined and is NOT read here.
# The sheet's career columns run "From 2005" through the last completed season:
# bump $SheetThroughYear when the Owners Sheet is rolled forward after a season.
$SheetThroughYear = 2025
$agg = @{}
foreach ($g in (Read-MafflCsv 'MAFFL_Matchups_Clean.csv')) {
    if ($g.Game_Type -ne 'Regular') { continue }
    if ([int]$g.Year -gt $SheetThroughYear) { continue }
    $wn = Normalize-Owner $g.Winner_Owner
    $ln = Normalize-Owner $g.Loser_Owner
    if (-not $wn -or -not $ln) { continue }
    foreach ($n in @($wn, $ln)) {
        if (-not $agg.ContainsKey($n)) { $agg[$n] = @{ w=0; l=0; t=0 } }
    }
    if ([double]$g.Winner_Score -eq [double]$g.Loser_Score) {
        $agg[$wn].t += 1
        $agg[$ln].t += 1
    } else {
        $agg[$wn].w += 1
        $agg[$ln].l += 1
    }
}
```

Then, two lines further down, find:

```powershell
if ($wltMismatch.Count -eq 0) { $d2 = "all $($owners.Count) owners match" } else { $d2 = ($wltMismatch -join ' | ') }
```

Replace with:

```powershell
if ($wltMismatch.Count -eq 0) { $d2 = "all $($owners.Count) owners match (Matchups_Clean, Regular, 2005-$SheetThroughYear)" } else { $d2 = ($wltMismatch -join ' | ') }
```

Leave the comparison loop between them, `$season` (Gate 1 still uses it) and every other gate unchanged.

## Step 3 — Verify

1. `powershell -ExecutionPolicy Bypass -File build\validate.ps1`. Gate 2 must read
   **[PASS] … all 34 owners match (Matchups_Clean, Regular, 2005-2025)**. Paste the full gate summary.
   If Gate 2 still fails, paste the mismatch detail and **stop**. Don't edit data to make it pass.
2. `powershell -ExecutionPolicy Bypass -File build\build.ps1` **check-only**. **Do NOT pass `-Write`.**
   `gen-prize.ps1` would wipe the dues pay stamps (known issue in STATUS). Paste the final summary and
   any generator that reports differences. Report them only; don't act on them.
3. `git diff --stat` → only `build/validate.ps1`, plus STATUS and this prompt's move.
4. No page changed, so no mobile check is needed.

## Step 4 — Close out

Report the diff summary. `git mv` this prompt to `_ops/prompts/done/`, update `_ops/STATUS.md` with the
block below, and fill in the build result. One commit.

Suggested commit message: `validate Gate 2: recompute career W/L/T from gold Matchups_Clean (not quarantined cleaned_maffl)`

---

STATUS:
- Recently shipped (top): `2026-09-29 · validate Gate 2 now reads gold Matchups_Clean (Regular, 2005–2025); 34/34 owners match. validate: <N>/8 pass. build check-only: <result>`
- Open decisions → **remove** the "`build.ps1` aborts on validate Gate 2" bullet. **Add:** `**Quarantined cleaned_maffl_revised.csv is still read** by validate Gates 1 (champ flags) + 7 (names), gen-history (csv-seasons embed) and gen-draft (CHAMPS). It has 3 swapped 2015/2022/2024 results and 5 mis-owned seasons (Warren Brownies 2011–13, Daddy Fat Sacks 2006–07). Repoint to gold per governance §7.3 before the robot runs generators unattended.`
- Now → in the "Weekly automation" bullet, replace `Next: Step 3, fix \`build.ps1\` Gate 2.` with `Step 3: Gate 2 ✅; remaining before Step 4: gen-prize dues safety + cleaned_maffl consumers.`
- Queued prompts: remove this prompt's line.
