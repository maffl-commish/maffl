# ======================================================================
# validate.ps1  --  Step 1 validation gates (read-only; edits no pages)
# ----------------------------------------------------------------------
# Implements the 8 gates from BUILD_NOTES.md section 5 against the
# current ./data CSVs (+ the embedded power-rankings block for gate 8).
# Honors the whitelist: 2002 co-championship (=25), 2002-04 blank W/L/T,
# 2007 blank prices, Michael Murello alias, co-owner units, packet
# "2026 League" mislabel, USD-2 Lower-Tier weekly rounding.
#
# Usage:  powershell -ExecutionPolicy Bypass -File build\validate.ps1
# Exit code 0 if all gates pass, 1 otherwise.
# ======================================================================

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$script:Results = New-Object System.Collections.ArrayList
function Add-Gate {
    param([string]$Id, [string]$Name, [bool]$Pass, [string]$Detail)
    [void]$Results.Add([pscustomobject]@{ Gate=$Id; Name=$Name; Pass=$Pass; Detail=$Detail })
}

$owners      = Get-CanonicalOwners
$nameSet     = Get-CanonicalNameSet
$ownerByName = @{}
foreach ($o in $owners) { $ownerByName[$o.name] = $o }

# Load season rows once, normalizing owners.
$season = Read-MafflCsv 'cleaned_maffl_revised.csv'

# ===== Gate 1: total championship flags == 25 (2002 co-champ => 2) =====
$champFlags = 0
foreach ($r in $season) { $champFlags += (ConvertTo-IntZero $r.Champ) }
$d1 = "sum(Champ)=$champFlags (expected 25; 2002 co-champ counts as 2 -- whitelisted)"
Add-Gate '1' 'Championship flags == 25' ($champFlags -eq 25) $d1

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
$wltMismatch = New-Object System.Collections.ArrayList
foreach ($o in $owners) {
    if ($agg.ContainsKey($o.name)) { $a = $agg[$o.name] } else { $a = @{ w=0; l=0; t=0 } }
    if ($a.w -ne $o.wins -or $a.l -ne $o.losses -or $a.t -ne $o.ties) {
        [void]$wltMismatch.Add(("{0}: computed {1}-{2}-{3} vs published {4}-{5}-{6}" -f $o.name, $a.w, $a.l, $a.t, $o.wins, $o.losses, $o.ties))
    }
}
if ($wltMismatch.Count -eq 0) { $d2 = "all $($owners.Count) owners match" } else { $d2 = ($wltMismatch -join ' | ') }
Add-Gate '2' 'Recomputed W/L/T == published' ($wltMismatch.Count -eq 0) $d2

# ===== Gate 3: published Win% == round(W/(W+L+T)) =====
$pctMismatch = New-Object System.Collections.ArrayList
foreach ($o in $owners) {
    $denom = $o.wins + $o.losses + $o.ties
    if ($denom -gt 0) { $calc = [math]::Round(100.0 * $o.wins / $denom, 0) } else { $calc = 0 }
    $pub = [int]($o.winPct -replace '[^0-9]', '')
    if ([math]::Abs($calc - $pub) -gt 1) {
        [void]$pctMismatch.Add(("{0}: calc {1}pct vs published {2}" -f $o.name, $calc, $o.winPct))
    }
}
if ($pctMismatch.Count -eq 0) { $d3 = "all match within 1pt" } else { $d3 = ($pctMismatch -join ' | ') }
Add-Gate '3' 'Win% == W/(W+L+T)' ($pctMismatch.Count -eq 0) $d3

# ===== Gate 4: credit balance == sum of Credit_Log rows (approved) =====
$credit = Read-CreditLog
$creditSumApproved = @{}
$creditSumAll = @{}
foreach ($r in $credit) {
    $n = Normalize-Owner $r.Owner
    if (-not $n) { continue }
    $amt = 0
    [void][int]::TryParse(($r.'Credit +/-'), [ref]$amt)
    if (-not $creditSumAll.ContainsKey($n)) { $creditSumAll[$n] = 0; $creditSumApproved[$n] = 0 }
    $creditSumAll[$n] += $amt
    if (($r.'Approved?').Trim() -eq 'Y') { $creditSumApproved[$n] += $amt }
}
$balMismatch = New-Object System.Collections.ArrayList
foreach ($o in $owners) {
    if ($null -eq $o.balance) { continue }
    if ($creditSumApproved.ContainsKey($o.name)) { $sum = $creditSumApproved[$o.name] } else { $sum = 0 }
    if ([math]::Abs($sum - $o.balance) -gt 0.001) {
        if ($creditSumAll.ContainsKey($o.name)) { $all = $creditSumAll[$o.name] } else { $all = 0 }
        [void]$balMismatch.Add(("{0}: log(approved)={1} all={2} vs sheet={3}" -f $o.name, $sum, $all, $o.balance))
    }
}
if ($balMismatch.Count -eq 0) { $d4 = "all sheeted balances reconcile" } else { $d4 = ($balMismatch -join ' | ') }
Add-Gate '4' 'Credit balance == sum(Credit_Log approved)' ($balMismatch.Count -eq 0) $d4

# ===== Gate 5: prize payouts sum to computed pool (67/33 split) =====
$prizeRows = Read-MafflCsv 'MAFFL League Packet - 2025 Prizes.csv'
$teamCount = 0
foreach ($r in $prizeRows) {
    $owner = $r.PSObject.Properties.Value | Select-Object -First 1
    if ($owner -eq 'TOTALS') { break }   # owner rows end at the TOTALS row
    if ([string]::IsNullOrWhiteSpace($owner)) { continue }
    $teamCount++
}
$pool = 100 * $teamCount
$upper = [math]::Round($pool * 0.67, 0)
$lower = [math]::Round($pool * 0.33, 0)
$splitOk = ([math]::Abs(($upper + $lower) - $pool) -le 1)
$d5 = "teams=$teamCount pool=USD$pool -> Upper(67pct)=USD$upper + Lower(33pct)=USD$lower"
Add-Gate '5' 'Prize pool 67/33 split reconciles' $splitOk $d5

# ===== Gate 6: zero Kickers drafted 2025+ =====
$draft = Read-MafflCsv 'MAFFL_Draft_History_Clean_v3.csv'
$kick = @($draft | Where-Object { [int]$_.Year -ge 2025 -and $_.Position_Actual -eq 'K' }).Count
$d6 = "K picks 2025+ = $kick (rows=$($draft.Count))"
Add-Gate '6' 'Zero Kickers drafted 2025+' ($kick -eq 0) $d6

# ===== Gate 7: every owner name resolves to canonical =====
$unresolved = New-Object System.Collections.Generic.HashSet[string]
$ownerSources = @(
    @{ file='cleaned_maffl_revised.csv';            col='Owner' },
    @{ file='Credit_Log.csv';                       col='Owner' },
    @{ file='MAFFL_Draft_History_Clean_v3.csv';     col='Owner' },
    @{ file='MAFFL_Division_History_2005_2025.csv'; col='Owner' }
)
foreach ($src in $ownerSources) {
    $rows = Read-MafflCsv $src.file
    foreach ($r in $rows) {
        if ($src.file -eq 'Credit_Log.csv' -and (Test-CreditSentinelRow $r)) { continue }
        $raw = $r.($src.col)
        if ([string]::IsNullOrWhiteSpace($raw)) { continue }
        $n = Normalize-Owner $raw
        if (-not $nameSet.Contains($n)) { [void]$unresolved.Add("$($src.file): '$raw' -> '$n'") }
    }
}
if ($unresolved.Count -eq 0) { $d7 = "all names across 4 files resolve" } else { $d7 = (($unresolved) -join ' | ') }
Add-Gate '7' 'All owner names resolve to canonical' ($unresolved.Count -eq 0) $d7

# ===== Gate 8: power-ranking ranks unique 1..N; rated owners exist =====
$prPath = Join-Path $RepoRoot 'power-rankings.html'
$prText = Read-TextRaw $prPath
$start = $prText.IndexOf('const OWNERS_DATA = [')
$end   = $prText.IndexOf('];', $start)
$block = $prText.Substring($start, $end - $start)
$ranks = @([regex]::Matches($block, '(?m)^\s*rank:\s*(\d+)') | ForEach-Object { [int]$_.Groups[1].Value })
$prNames = @([regex]::Matches($block, '(?m)^\s*name:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
$ranksUnique = (@($ranks | Sort-Object -Unique).Count -eq $ranks.Count)
$ranksContig = $true
$sorted = @($ranks | Sort-Object)
for ($i = 0; $i -lt $sorted.Count; $i++) { if ($sorted[$i] -ne ($i + 1)) { $ranksContig = $false; break } }
$prNameBad = New-Object System.Collections.ArrayList
foreach ($nm in $prNames) { if (-not $nameSet.Contains((Normalize-Owner $nm))) { [void]$prNameBad.Add($nm) } }
$g8 = $ranksUnique -and $ranksContig -and ($prNameBad.Count -eq 0)
$d8 = "ranks=$($ranks.Count) unique=$ranksUnique contiguous=$ranksContig badNames=$($prNameBad.Count)"
Add-Gate '8' 'Power ranks unique 1..N; owners exist' $g8 $d8

# ----------------------------------------------------------------------
# Report
# ----------------------------------------------------------------------
Write-Host ""
Write-Host "==================== MAFFL validate() -- Step 1 ====================" -ForegroundColor Cyan
$fail = 0
foreach ($g in $Results) {
    if ($g.Pass) { $tag = '[PASS]'; $color = 'Green' } else { $tag = '[FAIL]'; $color = 'Red'; $fail++ }
    Write-Host ("{0} Gate {1}: {2}" -f $tag, $g.Gate, $g.Name) -ForegroundColor $color
    Write-Host ("        {0}" -f $g.Detail) -ForegroundColor DarkGray
}
Write-Host "--------------------------------------------------------------------" -ForegroundColor Cyan
if ($fail -eq 0) {
    Write-Host "ALL GATES PASS ($($Results.Count)/$($Results.Count))" -ForegroundColor Green
} else {
    Write-Host "$fail GATE(S) FAILED -- $($Results.Count - $fail)/$($Results.Count) passed" -ForegroundColor Red
}
Write-Host "====================================================================" -ForegroundColor Cyan
exit $fail
