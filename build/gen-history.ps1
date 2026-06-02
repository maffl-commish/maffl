# ======================================================================
# gen-history.ps1  --  Regenerate history.html embedded CSV blocks
# ----------------------------------------------------------------------
# The page embeds three source CSVs verbatim inside
# <script type="text/csv" id="..."> tags. Names like "Michael Murello"
# stay raw here (the page normalizes at render time), so each block is a
# byte-for-byte copy of its source file (LF, trailing newline included).
#
#   build\gen-history.ps1          # check-only: prove round-trip
#   build\gen-history.ps1 -Write   # inject any block that differs
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$PagePath = Join-Path $RepoRoot 'history.html'
$Blocks = @(
    @{ id='csv-seasons';   csv='cleaned_maffl_revised.csv' },
    @{ id='csv-divisions'; csv='MAFFL_Division_History_2005_2025.csv' },
    @{ id='csv-drafts';    csv='MAFFL_Draft_History_Clean_v3.csv' }
)

$content = Read-TextRaw $PagePath
$updated = $content
$allExact = $true

foreach ($b in $Blocks) {
    $start = "<script type=`"text/csv`" id=`"$($b.id)`">"
    $end   = '</script>'
    $body  = Read-TextRaw (Join-Path $DataDir $b.csv)   # exact source, ends in LF
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
    Write-Host "[history.html] ALL 3 BLOCKS ROUND-TRIP EXACT." -ForegroundColor Green
    exit 0
}

if ($Write) {
    [System.IO.File]::WriteAllText($PagePath, $updated)
    Write-Host "[history.html] WROTE regenerated block(s)." -ForegroundColor Cyan
} else {
    Write-Host "[history.html] check-only (no -Write); nothing written." -ForegroundColor DarkGray
}
exit 1
