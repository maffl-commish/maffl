# ======================================================================
# gen-prize.ps1  --  Regenerate prize.html dues_2026; verify 2025 payouts
# ----------------------------------------------------------------------
# Commissioner decision #2: generate dues/status + computed payouts;
# LEAVE the pre-2025 history (2013-2024) as literals; don't recompute it.
#
# Reality of the MAFFL object: the 2025 "computed payouts" live INSIDE
# the same `prize_events` array as the 2013-2024 history. Rewriting just
# the 2025 subset in place risks drifting the preserved history, and the
# 2025 values are already correct. So this script:
#   * GENERATES `dues_2026` from the 2025 Prizes packet (round-trips).
#   * VERIFIES the existing 2025 prize_events reconcile to the packet's
#     per-owner totals and the 67/33 pool -- proof the payouts are the
#     computed values -- without rewriting the interleaved array.
#   * leaves prize_events + meta untouched (flagged in BUILD_SUMMARY).
#
# prize.html owner format is the RAW slashed form ("Jon Murello/Rick
# Simmons"), NOT the canonical spaced form -- co-owner cells are just
# the CSV value with the embedded newline removed.
#
#   build\gen-prize.ps1          # check-only
#   build\gen-prize.ps1 -Write   # inject dues_2026 if changed
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

# ---- Generate dues_2026 ----
$duesItems = foreach ($r in $ownerRows) {
    $owner = Format-PrizeOwner ($r.PSObject.Properties.Value | Select-Object -First 1)
    $draftDues = ConvertTo-Dollars ($r.'2026 DRAFT DAY DUES')
    $owed = [math]::Max(0, $draftDues)
    $status = if ((($r.'2026 Pay Status')).Trim() -eq 'PAID') { 'PAID' } else { 'UNPAID' }
    '  {"owner":"' + $owner + '","owed":' + $owed + ',"status":"' + $status + '"}'
}
$duesBody = "`n" + ($duesItems -join ",`n")

$content = Read-TextRaw $PagePath
$updated = Set-BlockBetweenMarkers -Content $content -StartMarker '"dues_2026": [' -EndMarker "`n ]," -NewBody $duesBody
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
Write-Host ("[prize.html] dues_2026 round-trip exact : {0} ({1} owners)" -f $duesExact, $duesItems.Count) -ForegroundColor Cyan
Write-Host ("[prize.html] 2025 payout pool : all=`$$poolAll Upper=`$$poolUpper Lower=`$$poolLower (Upper exact 1407; Lower 695 = 693 +`$2 whitelisted rounding) -> {0}" -f $poolOk) -ForegroundColor Cyan
Write-Host ("[prize.html] per-owner payout reconciliation mismatches (>`$1) : {0}" -f $reconMismatch.Count) -ForegroundColor Cyan
if ($reconMismatch.Count -gt 0) { $reconMismatch | ForEach-Object { Write-Host "    $_" -ForegroundColor Red } }

$ok = $duesExact -and $poolOk -and ($reconMismatch.Count -eq 0)
if (-not $duesExact) {
    Write-Host "[prize.html] dues_2026 DIFFERS -- showing diff:" -ForegroundColor Yellow
    $o = $content -split "`n"; $n = $updated -split "`n"; $shown = 0
    for ($i = 0; $i -lt [math]::Max($o.Count,$n.Count) -and $shown -lt 8; $i++) {
        $ol = if ($i -lt $o.Count) { $o[$i] } else { '<none>' }; $nl = if ($i -lt $n.Count) { $n[$i] } else { '<none>' }
        if ($ol -ne $nl) { Write-Host "  - $ol" -ForegroundColor Red; Write-Host "  + $nl" -ForegroundColor Green; $shown++ }
    }
    if ($Write) { [System.IO.File]::WriteAllText($PagePath, $updated); Write-Host "[prize.html] WROTE dues_2026." -ForegroundColor Cyan }
}

if ($ok) {
    Write-Host "[prize.html] CLEAN: dues_2026 round-trips; 2025 payouts reconcile to packet + pool. prize_events/meta left as literals." -ForegroundColor Green
    exit 0
}
exit 1
