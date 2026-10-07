# ======================================================================
# gen-draft.ps1  --  Regenerate draft.html OWNERS / CHAMPS / PICKS
# ----------------------------------------------------------------------
# OWNERS  = owners in CSV first-appearance order (the index space).
# CHAMPS  = {year: ownerIdx} from MAFFL_Owner_Seasons.csv Champ flags;
#           2002 co-champ stays an ascending [idx,idx] array.
# PICKS   = [year,ownerIdx,"player","pos","team",price,champFlag] per row.
#
# Blank prices serialize as `null` (renders as a dash, not "$0"; the
# one-time 2007 migration is done). Check mode lists every differing
# line; -Write injects the regenerated blocks.
#
#   build\gen-draft.ps1          # check-only: list every diff
#   build\gen-draft.ps1 -Write   # inject the regenerated blocks
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$PagePath = Join-Path $RepoRoot 'draft.html'
$draft = Read-MafflCsv 'MAFFL_Draft_History_Clean_v3.csv'
$season = Read-MafflCsv 'MAFFL_Owner_Seasons.csv'

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
# Compare in LF; a Windows checkout gives CRLF. -Write restores the page's own line endings.
$pageNl = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }
$content = $content -replace "`r`n", "`n"
$step1 = Set-BlockBetweenMarkers -Content $content -StartMarker 'const OWNERS=['  -EndMarker '];' -NewBody $ownersBody
$step2 = Set-BlockBetweenMarkers -Content $step1   -StartMarker 'const CHAMPS={' -EndMarker '};' -NewBody $champsBody
$updated = Set-BlockBetweenMarkers -Content $step2 -StartMarker 'const PICKS=['  -EndMarker "`n];" -NewBody $picksBody

# Line-level diffs across the whole file (round-trip proof).
$oldArr = $content -split "`n"
$newArr = $updated -split "`n"
$diffs = New-Object System.Collections.ArrayList
if ($oldArr.Count -ne $newArr.Count) { [void]$diffs.Add("LINE COUNT changed: $($oldArr.Count) -> $($newArr.Count)") }
for ($i = 0; $i -lt [math]::Min($oldArr.Count,$newArr.Count); $i++) {
    if ($oldArr[$i] -ne $newArr[$i]) { [void]$diffs.Add(("line {0}:`n    - {1}`n    + {2}" -f ($i+1), $oldArr[$i], $newArr[$i])) }
}

Write-Host "[draft.html] OWNERS round-trip exact : $((Set-BlockBetweenMarkers $content 'const OWNERS=[' '];' $ownersBody) -eq $content)" -ForegroundColor Cyan
Write-Host "[draft.html] CHAMPS round-trip exact : $((Set-BlockBetweenMarkers $content 'const CHAMPS={' '};' $champsBody) -eq $content)" -ForegroundColor Cyan
Write-Host "[draft.html] PICKS rows : $($pickLines.Count); differing lines : $($diffs.Count)" -ForegroundColor Cyan

if ($diffs.Count -eq 0) {
    Write-Host "[draft.html] CLEAN: OWNERS/CHAMPS/PICKS round-trip from gold." -ForegroundColor Green
    exit 0
}
Write-Host "---- differences (showing up to 10) ----" -ForegroundColor Yellow
$diffs | Select-Object -First 10 | ForEach-Object { Write-Host $_ }
if ($Write) {
    [System.IO.File]::WriteAllText($PagePath, ($updated -replace "`n", $pageNl))
    Write-Host "[draft.html] WROTE regenerated OWNERS/CHAMPS/PICKS." -ForegroundColor Cyan
} else {
    Write-Host "[draft.html] check-only (no -Write); nothing written." -ForegroundColor DarkGray
}
exit 1
