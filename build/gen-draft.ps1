# ======================================================================
# gen-draft.ps1  --  Regenerate draft.html OWNERS / CHAMPS / PICKS
# ----------------------------------------------------------------------
# OWNERS  = owners in CSV first-appearance order (the index space).
# CHAMPS  = {year: ownerIdx} from cleaned_maffl_revised.csv Champ flags;
#           2002 co-champ stays an ascending [idx,idx] array.
# PICKS   = [year,ownerIdx,"player","pos","team",price,champFlag] per row.
#
# DELIBERATE FIX (commissioner): 2007 blank prices serialize as `null`
# (was `0`), to render as a dash instead of "$0". So OWNERS + CHAMPS must
# round-trip BYTE-IDENTICAL, and PICKS must be identical EXCEPT the 256
# 2007 rows whose price goes 0 -> null. The check below proves exactly
# that and rejects any other drift.
#
#   build\gen-draft.ps1          # check-only: classify every diff
#   build\gen-draft.ps1 -Write   # inject the regenerated blocks
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$PagePath = Join-Path $RepoRoot 'draft.html'
$draft = Read-MafflCsv 'MAFFL_Draft_History_Clean_v3.csv'
$season = Read-MafflCsv 'cleaned_maffl_revised.csv'

# ---- OWNERS: first-appearance order, normalized ----
$order = New-Object System.Collections.Specialized.OrderedDictionary
foreach ($r in $draft) {
    $n = Normalize-Owner $r.Owner
    if (-not $order.Contains($n)) { $order.Add($n, $order.Count) }
}
$ownerIdx = $order            # name -> index
$ownerNames = @($order.Keys)
# Inner content only -- the markers already carry the [ ] delimiters.
$ownersBody = '"' + ($ownerNames -join '","') + '"'

# ---- CHAMPS: {year: idx | [idx,idx]} from Champ flags ----
$champByYear = @{}
foreach ($r in $season) {
    if ((ConvertTo-IntZero $r.Champ) -ne 1) { continue }
    $n = Normalize-Owner $r.Owner
    if (-not $ownerIdx.Contains($n)) { continue }
    $y = [int]$r.YEAR
    if (-not $champByYear.ContainsKey($y)) { $champByYear[$y] = New-Object System.Collections.ArrayList }
    [void]$champByYear[$y].Add([int]$ownerIdx[$n])
}
$champPairs = foreach ($y in ($champByYear.Keys | Sort-Object)) {
    $idxs = @($champByYear[$y] | Sort-Object)
    if ($idxs.Count -eq 1) { "$y`:$($idxs[0])" } else { "$y`:[" + ($idxs -join ',') + "]" }
}
$champsBody = ($champPairs -join ',')   # inner only; markers carry the { }
# Flat lookup for F_C (single champ per year for the draft era 2005+).
$champLookup = @{}
foreach ($y in $champByYear.Keys) { if ($champByYear[$y].Count -eq 1) { $champLookup[$y] = [int]$champByYear[$y][0] } }

# ---- PICKS rows ----
$pickLines = New-Object System.Collections.Generic.List[string]
foreach ($r in $draft) {
    $y    = [int]$r.Year
    $oi   = [int]$ownerIdx[(Normalize-Owner $r.Owner)]
    $pl   = $r.Player
    $pos  = $r.Position_Actual
    $team = $r.NFL_Team
    if ([string]::IsNullOrWhiteSpace($r.Price)) { $price = 'null' } else { $price = [string][int][double]$r.Price }
    $champ = if ($champLookup.ContainsKey($y) -and $champLookup[$y] -eq $oi) { '1' } else { '0' }
    $pickLines.Add("[$y,$oi,`"$pl`",`"$pos`",`"$team`",$price,$champ]")
}
$picksBody = "`n" + ($pickLines -join ",`n")   # EndMarker "`n];" supplies final newline

# ---- Inject into a copy and classify diffs ----
$content = Read-TextRaw $PagePath
$step1 = Set-BlockBetweenMarkers -Content $content -StartMarker 'const OWNERS=['  -EndMarker '];' -NewBody $ownersBody
$step2 = Set-BlockBetweenMarkers -Content $step1   -StartMarker 'const CHAMPS={' -EndMarker '};' -NewBody $champsBody
$updated = Set-BlockBetweenMarkers -Content $step2 -StartMarker 'const PICKS=['  -EndMarker "`n];" -NewBody $picksBody

# Classify line-level diffs across the whole file.
$oldArr = $content -split "`n"
$newArr = $updated -split "`n"
$expected = 0   # 2007 price 0 -> null
$unexpected = New-Object System.Collections.ArrayList
$max = [math]::Max($oldArr.Count, $newArr.Count)
if ($oldArr.Count -ne $newArr.Count) {
    [void]$unexpected.Add("LINE COUNT changed: $($oldArr.Count) -> $($newArr.Count)")
}
for ($i = 0; $i -lt [math]::Min($oldArr.Count,$newArr.Count); $i++) {
    if ($oldArr[$i] -eq $newArr[$i]) { continue }
    # Is this a PICKS row whose ONLY change is price 0 -> null on a 2007 row?
    $mo = [regex]::Match($oldArr[$i], '^\[2007,(\d+),(".*"),(".*"),(".*"),0,(\d)\]')
    $mn = [regex]::Match($newArr[$i], '^\[2007,(\d+),(".*"),(".*"),(".*"),null,(\d)\]')
    if ($mo.Success -and $mn.Success -and $mo.Groups[1].Value -eq $mn.Groups[1].Value `
        -and $mo.Groups[2].Value -eq $mn.Groups[2].Value -and $mo.Groups[5].Value -eq $mn.Groups[5].Value) {
        $expected++
    } else {
        [void]$unexpected.Add(("line {0}:`n    - {1}`n    + {2}" -f ($i+1), $oldArr[$i], $newArr[$i]))
    }
}

Write-Host "[draft.html] OWNERS round-trip exact : $((Set-BlockBetweenMarkers $content 'const OWNERS=[' '];' $ownersBody) -eq $content)" -ForegroundColor Cyan
Write-Host "[draft.html] CHAMPS round-trip exact : $((Set-BlockBetweenMarkers $content 'const CHAMPS={' '};' $champsBody) -eq $content)" -ForegroundColor Cyan
# 256 = first run applying the fix; 0 = already fixed (idempotent regen).
Write-Host "[draft.html] 2007 price 0->null migrations : $expected (256 on first run, 0 once applied)" -ForegroundColor Cyan
Write-Host "[draft.html] UNEXPECTED diffs : $($unexpected.Count)" -ForegroundColor Cyan

if ($unexpected.Count -gt 0) {
    Write-Host "---- unexpected (showing up to 10) ----" -ForegroundColor Red
    $unexpected | Select-Object -First 10 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    Write-Host "[draft.html] REFUSING to write: drift beyond the intended 2007 fix." -ForegroundColor Red
    exit 1
}
if ($expected -notin @(0, 256)) {
    Write-Host "[draft.html] migration count is neither 0 nor 256; refusing to write." -ForegroundColor Red
    exit 1
}

Write-Host "[draft.html] CLEAN: only intended 2007 price->null change (no other drift)." -ForegroundColor Green
if ($Write) {
    [System.IO.File]::WriteAllText($PagePath, $updated)
    Write-Host "[draft.html] WROTE regenerated OWNERS/CHAMPS/PICKS." -ForegroundColor Cyan
} else {
    Write-Host "[draft.html] check-only (no -Write); nothing written." -ForegroundColor DarkGray
}
exit 0
