# ======================================================================
# gen-prize.ps1  --  Regenerate prize.html dues_seasons rows from
#                    data/Dues_Log.csv; verify 2025 payouts
# ----------------------------------------------------------------------
# Commissioner decision #2: generate dues/status + computed payouts;
# LEAVE the pre-2025 history (2013-2024) as literals; don't recompute it.
#
# Dues (CE-7): data/Dues_Log.csv is the ledger and the source of truth.
# For every season that has Approved?=Y rows in the log, this script
# regenerates that season's "rows":[...] inside prize.html dues_seasons:
#   amount    = sum of Obligation rows
#   owed      = max(0, amount - sum of Payment rows)
#   status    = PAID when owed <= 0, else UNPAID
#   paid_date / method = latest Payment row (PAID rows only)
# Row order = order of the owner's first Obligation row in the log.
# Season-level fields (status OPEN/SETTLED, closed_date, note) are page
# literals and are left untouched; a season with no log rows (e.g. the
# next OPEN season before amounts are set) is left untouched too.
#
# 2025 payouts: the "computed payouts" live INSIDE the same
# `prize_events` array as the 2013-2024 history, so this script only
# VERIFIES that the 2025 prize_events reconcile to the 2025 Prizes
# packet's per-owner totals and the 67/33 pool; it never rewrites them.
#
# prize.html owner format is the RAW slashed form ("Jon Murello/Rick
# Simmons"), NOT the canonical spaced form; Dues_Log uses the same form.
#
#   build\gen-prize.ps1          # check-only
#   build\gen-prize.ps1 -Write   # rewrite dues_seasons rows if changed
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$PagePath = Join-Path $RepoRoot 'prize.html'
$prize = Read-MafflCsv 'MAFFL League Packet - 2025 Prizes.csv'

# prize.html owner = CSV owner with embedded CR/LF removed (no spacing).
function Format-PrizeOwner { param([string]$s) ($s -replace "[`r`n]", '') }

# Owner rows are everything before the TOTALS row.
$ownerRows = New-Object System.Collections.ArrayList
foreach ($r in $prize) {
    $first = $r.PSObject.Properties.Value | Select-Object -First 1
    if ($first -eq 'TOTALS') { break }
    if ([string]::IsNullOrWhiteSpace($first)) { continue }
    [void]$ownerRows.Add($r)
}

# ---- Generate dues_seasons rows from Dues_Log.csv ----
$log = @(Read-MafflCsv 'Dues_Log.csv' | Where-Object { ($_.'Approved?').Trim() -eq 'Y' })
$content = Read-TextRaw $PagePath
$updated = $content
# Match the page's line endings (a Windows checkout may have CRLF).
$nl = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }
$duesCount = 0
$seasonsDone = New-Object System.Collections.ArrayList
foreach ($yr in ($log | ForEach-Object { $_.Season.Trim() } | Select-Object -Unique)) {
    $rowsY = @($log | Where-Object { $_.Season.Trim() -eq $yr })
    $order = New-Object System.Collections.ArrayList
    foreach ($r in $rowsY) { if ($r.'Entry Type'.Trim() -eq 'Obligation' -and -not $order.Contains($r.Owner.Trim())) { [void]$order.Add($r.Owner.Trim()) } }
    $items = foreach ($ow in $order) {
        $mine = @($rowsY | Where-Object { $_.Owner.Trim() -eq $ow })
        $amount = 0; $paid = 0; $last = $null
        foreach ($r in $mine) {
            $amt = [int]([double]$r.Amount)
            switch ($r.'Entry Type'.Trim()) {
                'Obligation' { $amount += $amt }
                'Payment'    { $paid += $amt; if ($null -eq $last -or $r.Date.Trim() -ge $last.Date.Trim()) { $last = $r } }
                default      { throw "Dues_Log.csv: unknown Entry Type '$($r.'Entry Type')' ($yr $ow)" }
            }
        }
        $owed = [math]::Max(0, $amount - $paid)
        if ($owed -le 0) {
            '    {"owner":"' + $ow + '","amount":' + $amount + ',"owed":0,"status":"PAID","paid_date":"' + $last.Date.Trim() + '","method":"' + $last.Method.Trim() + '"}'
        } else {
            '    {"owner":"' + $ow + '","amount":' + $amount + ',"owed":' + $owed + ',"status":"UNPAID"}'
        }
    }
    $items = @($items)
    $m = [regex]::Matches($updated, '\{"year":' + $yr + ',[^\[\]]*"rows":\[')
    if ($m.Count -ne 1) { throw "prize.html: expected one dues_seasons object for $yr, found $($m.Count). Add the season object by hand first." }
    $bodyStart = $m[0].Index + $m[0].Length
    $bodyEnd = $updated.IndexOf(']}', $bodyStart)
    if ($bodyEnd -lt 0) { throw "prize.html: end of $yr rows not found" }
    $newBody = $nl + ($items -join ("," + $nl)) + $nl + "  "
    $updated = $updated.Substring(0, $bodyStart) + $newBody + $updated.Substring($bodyEnd)
    $duesCount += $items.Count
    [void]$seasonsDone.Add("$yr ($($items.Count) owners)")
}
$duesExact = ($updated -eq $content)

# ---- Verify the 2025 computed payouts (read-only) ----
# (a) per-owner: packet "TOTAL 2025 Prize" == sum of that owner's 2025
#     prize_events amounts in the page.
# (b) pool: all 2025 events sum to $2,100; Upper=$1,407; Lower=$693.
$evMatches = [regex]::Matches($content, '\{"year":2025,"owner":"([^"]+)","era":"([^"]+)","prize_type":"[^"]+","amount":(\d+)')
$pageByOwner = @{}; $poolUpper = 0; $poolLower = 0; $poolAll = 0
foreach ($m in $evMatches) {
    $ow = $m.Groups[1].Value; $era = $m.Groups[2].Value; $amt = [int]$m.Groups[3].Value
    if (-not $pageByOwner.ContainsKey($ow)) { $pageByOwner[$ow] = 0 }
    $pageByOwner[$ow] += $amt; $poolAll += $amt
    if ($era -eq 'Upper-Tier') { $poolUpper += $amt } elseif ($era -eq 'Lower-Tier') { $poolLower += $amt }
}
$csvTotal = @{}
foreach ($r in $ownerRows) {
    $ow = Format-PrizeOwner ($r.PSObject.Properties.Value | Select-Object -First 1)
    $csvTotal[$ow] = ConvertTo-Dollars ($r.'TOTAL 2025 Prize')
}
# Whitelisted: the $2 Lower-Tier weekly rounding (meta.note_2025_lower --
# Lower captured $695 vs $693 stated, $1 rounding in 2 spots). So Upper
# must be formula-exact; Lower/total tolerate +$2; per-owner tolerates
# +/-$1 for the two rounded Lower weekly spots.
$reconMismatch = New-Object System.Collections.ArrayList
foreach ($ow in $pageByOwner.Keys) {
    $exp = if ($csvTotal.ContainsKey($ow)) { $csvTotal[$ow] } else { -1 }
    if ([math]::Abs($pageByOwner[$ow] - $exp) -gt 1) { [void]$reconMismatch.Add("${ow}: page=$($pageByOwner[$ow]) vs packet=$exp") }
}
$poolOk = ($poolUpper -eq 1407) -and ([math]::Abs($poolLower - 693) -le 2) -and ([math]::Abs($poolAll - 2100) -le 2)

# ---- Report ----
Write-Host ("[prize.html] dues_seasons from Dues_Log round-trip exact : {0} ({1})" -f $duesExact, ($seasonsDone -join ', ')) -ForegroundColor Cyan
Write-Host ("[prize.html] 2025 payout pool : all=`$$poolAll Upper=`$$poolUpper Lower=`$$poolLower (Upper exact 1407; Lower 695 = 693 +`$2 whitelisted rounding) -> {0}" -f $poolOk) -ForegroundColor Cyan
Write-Host ("[prize.html] per-owner payout reconciliation mismatches (>`$1) : {0}" -f $reconMismatch.Count) -ForegroundColor Cyan
if ($reconMismatch.Count -gt 0) { $reconMismatch | ForEach-Object { Write-Host "    $_" -ForegroundColor Red } }

$ok = $duesExact -and $poolOk -and ($reconMismatch.Count -eq 0)
if (-not $duesExact) {
    Write-Host "[prize.html] dues_seasons DIFFERS -- showing diff:" -ForegroundColor Yellow
    $o = $content -split "`n"; $n = $updated -split "`n"; $shown = 0
    for ($i = 0; $i -lt [math]::Max($o.Count,$n.Count) -and $shown -lt 8; $i++) {
        $ol = if ($i -lt $o.Count) { $o[$i] } else { '<none>' }; $nl = if ($i -lt $n.Count) { $n[$i] } else { '<none>' }
        if ($ol -ne $nl) { Write-Host "  - $ol" -ForegroundColor Red; Write-Host "  + $nl" -ForegroundColor Green; $shown++ }
    }
    if ($Write) { [System.IO.File]::WriteAllText($PagePath, $updated); Write-Host "[prize.html] WROTE dues_seasons rows." -ForegroundColor Cyan }
}

if ($ok) {
    Write-Host "[prize.html] CLEAN: dues_seasons round-trips from Dues_Log; 2025 payouts reconcile to packet + pool. prize_events/meta left as literals." -ForegroundColor Green
    exit 0
}
exit 1
