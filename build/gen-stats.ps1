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
$Cols = [ordered]@{
    name=4; active=46; years=61; champ=72; runner=82; playoff=93; div=106;
    wins=114; losses=125; ties=138; ovr=147; clutch=156; grind=168; heat=179
}
$BraceCol = 188
$Keys = @($Cols.Keys)

function Format-OwnerRow {
    param($Owner, [bool]$IsLast)
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('  { ')
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
        $target = if ($i -lt ($Keys.Count - 1)) { $Cols[$Keys[$i+1]] } else { $BraceCol }
        $pad = $target - $sb.Length
        if ($pad -lt 1) { $pad = 1 }
        [void]$sb.Append(' ' * $pad)
    }
    [void]$sb.Append('}')
    if (-not $IsLast) { [void]$sb.Append(',') }
    $sb.ToString()
}

$owners = Get-CanonicalOwners
$rows = for ($i = 0; $i -lt $owners.Count; $i++) {
    Format-OwnerRow -Owner $owners[$i] -IsLast ($i -eq ($owners.Count - 1))
}
# EndMarker is "`n];", so it already supplies the final newline.
$newBody = "`n" + ($rows -join "`n")

# Inject into a copy and compare to current (round-trip proof).
$current = Read-TextRaw $PagePath
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
    [System.IO.File]::WriteAllText($PagePath, $updated)
    Write-Host "[stats.html] WROTE regenerated OWNERS[]." -ForegroundColor Cyan
} else {
    Write-Host "[stats.html] check-only (no -Write); nothing written." -ForegroundColor DarkGray
}
exit 1
