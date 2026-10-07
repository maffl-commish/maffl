# ======================================================================
# gen-stats.ps1  --  Generate stats.html OWNERS[] from the CSVs
# ----------------------------------------------------------------------
# Reproduces the hand-column-aligned OWNERS array byte-for-byte. Field
# start columns are fixed (author-chosen, not max-width+1), so they are
# encoded as constants below -- this is what makes the round-trip exact.
#
#   build\gen-stats.ps1            # check-only: prove round-trip, write nothing
#   build\gen-stats.ps1 -Write     # inject into stats.html (only if changed)
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$PagePath    = Join-Path $RepoRoot 'stats.html'
$StartMarker = 'const OWNERS = ['
$EndMarker   = "`n];"

# Fixed start column for each field (measured from the live block) and
# the closing-brace column. Pad-to-column with a 1-space minimum so an
# unexpectedly long future value degrades gracefully instead of merging.
# third / pWins / pLosses added 2026-10-06 to match the live page:
#   third   = count of rows in MAFFL_ThirdPlace_ByYear.csv
#   pWins / pLosses = Upper-Tier playoff games (full bracket incl. the 3rd-place
#             game) in MAFFL_Matchups_NoConsolation.csv through $SheetThroughYear
# A value that overruns its column pushes every later field right by the same
# amount (the live page does this for the one long co-owner name).
$Cols = [ordered]@{
    name=4; active=46; years=61; champ=72; runner=82; third=93; playoff=103; div=116;
    wins=124; losses=135; ties=148; pWins=157; pLosses=168; ovr=181; clutch=190; grind=202; heat=213
}
$BraceCol = 222
$SheetThroughYear = 2025   # same as validate Gate 2; bump when the Owners Sheet rolls forward
$Keys = @($Cols.Keys)

function Format-OwnerRow {
    param($Owner, [bool]$IsLast)
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('  { ')
    $shift = 0
    for ($i = 0; $i -lt $Keys.Count; $i++) {
        $k = $Keys[$i]
        switch ($k) {
            'name'   { $val = '"' + $Owner.name + '"' }
            'active' { $val = if ($Owner.active) { 'true' } else { 'false' } }
            default  { $val = [string]$Owner.$k }
        }
        [void]$sb.Append("$k`: $val")
        if ($i -lt ($Keys.Count - 1)) { [void]$sb.Append(',') }
        # Pad to the next field's column (>=1 space).
        $target = $shift + $(if ($i -lt ($Keys.Count - 1)) { $Cols[$Keys[$i+1]] } else { $BraceCol })
        $pad = $target - $sb.Length
        if ($pad -lt 1) { $shift += (1 - $pad); $pad = 1 }
        [void]$sb.Append(' ' * $pad)
    }
    [void]$sb.Append('}')
    if (-not $IsLast) { [void]$sb.Append(',') }
    $sb.ToString()
}

$owners = Get-CanonicalOwners
$third = @{}; $pw = @{}; $pl = @{}
foreach ($r in (Read-MafflCsv 'MAFFL_ThirdPlace_ByYear.csv')) {
    $n = Normalize-Owner $r.Third_Place_Owner
    if ($n) { $third[$n] = 1 + $(if ($third.ContainsKey($n)) { $third[$n] } else { 0 }) }
}
foreach ($g in (Read-MafflCsv 'MAFFL_Matchups_NoConsolation.csv')) {
    if ($g.Tier -ne 'Upper' -or $g.Is_Playoffs -ne 'True' -or [int]$g.Year -gt $SheetThroughYear) { continue }
    $w = Normalize-Owner $g.Winner_Owner; $l = Normalize-Owner $g.Loser_Owner
    $pw[$w] = 1 + $(if ($pw.ContainsKey($w)) { $pw[$w] } else { 0 })
    $pl[$l] = 1 + $(if ($pl.ContainsKey($l)) { $pl[$l] } else { 0 })
}
foreach ($o in $owners) {
    $o | Add-Member -NotePropertyName third   -NotePropertyValue $(if ($third.ContainsKey($o.name)) { $third[$o.name] } else { 0 })
    $o | Add-Member -NotePropertyName pWins   -NotePropertyValue $(if ($pw.ContainsKey($o.name)) { $pw[$o.name] } else { 0 })
    $o | Add-Member -NotePropertyName pLosses -NotePropertyValue $(if ($pl.ContainsKey($o.name)) { $pl[$o.name] } else { 0 })
}
$rows = for ($i = 0; $i -lt $owners.Count; $i++) {
    Format-OwnerRow -Owner $owners[$i] -IsLast ($i -eq ($owners.Count - 1))
}
# EndMarker is "`n];", so it already supplies the final newline.
$newBody = "`n" + ($rows -join "`n")

# Inject into a copy and compare to current (round-trip proof).
$current = Read-TextRaw $PagePath
# Compare in LF; a Windows checkout gives CRLF. -Write restores the page's own line endings.
$pageNl = if ($current.Contains("`r`n")) { "`r`n" } else { "`n" }
$current = $current -replace "`r`n", "`n"
$updated = Set-BlockBetweenMarkers -Content $current -StartMarker $StartMarker -EndMarker $EndMarker -NewBody $newBody

if ($updated -eq $current) {
    Write-Host "[stats.html] ROUND-TRIP EXACT -- generated OWNERS[] is byte-identical." -ForegroundColor Green
    if ($Write) { Write-Host "[stats.html] No change to write." -ForegroundColor DarkGray }
    exit 0
}

# Not identical: show a focused diff of the OWNERS region so mismatches
# are obvious, and only write when -Write is given.
Write-Host "[stats.html] DIFFERS from current. First mismatching rows:" -ForegroundColor Yellow
$curRows = (Set-BlockBetweenMarkers -Content $current -StartMarker $StartMarker -EndMarker $EndMarker -NewBody $newBody) # placeholder
$oldArr = ($current  -split "`n")
$newArr = ($updated  -split "`n")
$max = [math]::Max($oldArr.Count, $newArr.Count)
$shown = 0
for ($i = 0; $i -lt $max -and $shown -lt 8; $i++) {
    $o = if ($i -lt $oldArr.Count) { $oldArr[$i] } else { '<none>' }
    $n = if ($i -lt $newArr.Count) { $newArr[$i] } else { '<none>' }
    if ($o -ne $n) {
        Write-Host ("  line {0}" -f ($i+1)) -ForegroundColor Yellow
        Write-Host ("    - |{0}|" -f $o) -ForegroundColor Red
        Write-Host ("    + |{0}|" -f $n) -ForegroundColor Green
        $shown++
    }
}

if ($Write) {
    [System.IO.File]::WriteAllText($PagePath, ($updated -replace "`n", $pageNl))
    Write-Host "[stats.html] WROTE regenerated OWNERS[]." -ForegroundColor Cyan
} else {
    Write-Host "[stats.html] check-only (no -Write); nothing written." -ForegroundColor DarkGray
}
exit 1
