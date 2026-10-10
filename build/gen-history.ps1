# ======================================================================
# gen-history.ps1  --  Regenerate history.html embedded CSV blocks
# ----------------------------------------------------------------------
# The page embeds four source CSVs verbatim inside
# <script type="text/csv" id="..."> tags. Names like "Michael Murello"
# stay raw here (the page normalizes at render time), so each block is a
# byte-for-byte copy of its source file (LF, trailing newline included).
# csv-matchups (added 2026-10-09) is gold MAFFL_Matchups_Clean.csv through
# $HistoryThroughYear (the last completed season; the in-progress season
# stays out). Bump it after the Championship is ingested, as with validate.
#
#   build\gen-history.ps1          # check-only: prove round-trip
#   build\gen-history.ps1 -Write   # inject any block that differs
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$PagePath = Join-Path $RepoRoot 'history.html'
$HistoryThroughYear = 2025
$Blocks = @(
    @{ id='csv-seasons';   csv='MAFFL_Owner_Seasons.csv' },
    @{ id='csv-divisions'; csv='MAFFL_Division_History_2005_2025.csv' },
    @{ id='csv-drafts';    csv='MAFFL_Draft_History_Clean_v3.csv' },
    @{ id='csv-matchups';  csv='MAFFL_Matchups_Clean.csv'; throughYear=$HistoryThroughYear }
)

# Compare in LF and write back in the page's own line endings (as gen-draft does): a source CSV
# freshly written by another generator can be LF while a Windows checkout of the page is CRLF.
$content = Read-TextRaw $PagePath
$pageNl  = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }
$content = $content -replace "`r`n", "`n"
$updated = $content
$allExact = $true

foreach ($b in $Blocks) {
    $start = "<script type=`"text/csv`" id=`"$($b.id)`">"
    $end   = '</script>'
    $body  = Read-TextRaw (Join-Path $DataDir $b.csv)   # exact source, ends in LF
    if ($b.ContainsKey('throughYear')) {
        # Keep the header + rows whose Year (first field) <= throughYear, same line endings.
        $nl = "`n"; if ($body.Contains("`r`n")) { $nl = "`r`n" }
        $keep = New-Object System.Collections.Generic.List[string]
        $i = 0
        foreach ($ln in ($body -split "`r?`n")) {
            if ($ln -eq '') { continue }
            if ($i -eq 0 -or [int]($ln.Substring(0, $ln.IndexOf(','))) -le $b.throughYear) { $keep.Add($ln) }
            $i++
        }
        $body = ($keep -join $nl) + $nl
    }
    $body  = $body -replace "`r`n", "`n"
    $try   = Set-BlockBetweenMarkers -Content $updated -StartMarker $start -EndMarker $end -NewBody $body
    if ($try -eq $updated) {
        Write-Host ("[history.html] {0,-13} ROUND-TRIP EXACT ({1})" -f $b.id, $b.csv) -ForegroundColor Green
    } else {
        $allExact = $false
        Write-Host ("[history.html] {0,-13} DIFFERS from {1}" -f $b.id, $b.csv) -ForegroundColor Yellow
        $updated = $try
    }
}

if ($allExact) {
    Write-Host "[history.html] ALL $($Blocks.Count) BLOCKS ROUND-TRIP EXACT." -ForegroundColor Green
    exit 0
}

if ($Write) {
    [System.IO.File]::WriteAllText($PagePath, ($updated -replace "`n", $pageNl))
    Write-Host "[history.html] WROTE regenerated block(s)." -ForegroundColor Cyan
} else {
    Write-Host "[history.html] check-only (no -Write); nothing written." -ForegroundColor DarkGray
}
exit 1
