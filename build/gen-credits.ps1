# ======================================================================
# gen-credits.ps1  --  Regenerate credits.html balances + REGISTRY_DATA
# ----------------------------------------------------------------------
# Source: Credit_Log.csv (sentinel + empty template rows ignored). Only
# rows with a real Season carry data -- currently the 56 season-2025
# "Earn" rows that sum to 197 across the league.
#
# Balances tables (hand-coded <tbody> rows): one per 2026 tier. Each
# active owner's balance = sum of their approved logged credits. Sorted
# by balance DESC, then power-rank ASC (verified tie order). Tier comes
# from the Owners Sheet "2026 League" column -- the generated mirror.
#
# REGISTRY_DATA: one JSON object per real Credit_Log row, in file order.
#
#   build\gen-credits.ps1          # check-only: prove round-trip
#   build\gen-credits.ps1 -Write   # inject if changed
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$PagePath = Join-Path $RepoRoot 'credits.html'

# Real (data-bearing) credit rows = non-sentinel with a Season set.
$rows = @(Read-CreditLog | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Season) })

# ---- Balances per owner (approved only) ----
$bal = @{}
foreach ($r in $rows) {
    if (($r.'Approved?').Trim() -ne 'Y') { continue }
    $n = Normalize-Owner $r.Owner
    if (-not $n) { continue }
    $amt = 0; [void][int]::TryParse(($r.'Credit +/-'), [ref]$amt)
    if (-not $bal.ContainsKey($n)) { $bal[$n] = 0 }
    $bal[$n] += $amt
}

# ---- Active owners split by 2026 tier, sorted (balance desc, rank asc) ----
$owners = Get-CanonicalOwners
function Build-TierRows {
    param([string]$Tier)
    $members = $owners | Where-Object { $_.league26 -eq $Tier }
    $sorted = $members | Sort-Object @{ Expression = { if ($bal.ContainsKey($_.name)) { $bal[$_.name] } else { 0 } }; Descending = $true }, @{ Expression = 'rank'; Descending = $false }
    ($sorted | ForEach-Object {
        $c = if ($bal.ContainsKey($_.name)) { $bal[$_.name] } else { 0 }
        '            <tr><td><a href="power-rankings.html">' + $_.name + '</a></td><td>' + $c + '</td></tr>'
    }) -join "`n"
}
$upperRows = Build-TierRows 'Upper-Tier'
$lowerRows = Build-TierRows 'Lower-Tier'

# ---- REGISTRY_DATA (file order) ----
function ConvertTo-JsonStr {
    param([string]$s)
    if ($null -eq $s) { return '' }
    $s = $s -replace '\\', '\\'
    $s = $s -replace '"', '\"'
    $s = $s -replace "`r", '\r' -replace "`n", '\n' -replace "`t", '\t'
    $s
}
$regObjs = New-Object System.Collections.Generic.List[string]
foreach ($r in $rows) {
    $season = [int]$r.Season
    $owner  = Normalize-Owner $r.Owner
    $team   = ConvertTo-JsonStr $r.Team
    $cat    = ConvertTo-JsonStr ($r.'Credit Category')
    $type   = ConvertTo-JsonStr ($r.'Credit Type')
    $amt    = 0; [void][int]::TryParse(($r.'Credit +/-'), [ref]$amt)
    $appr   = if (($r.'Approved?').Trim() -eq 'Y') { 'true' } else { 'false' }
    $notes  = ConvertTo-JsonStr $r.Notes
    $regObjs.Add('    {"season":' + $season + ',"owner":"' + (ConvertTo-JsonStr $owner) + '","team":"' + $team + '","creditCategory":"' + $cat + '","creditType":"' + $type + '","amount":' + $amt + ',"approved":' + $appr + ',"notes":"' + $notes + '"}')
}
$registryBody = "`n" + ($regObjs -join ",`n")

# ---- Inject ----
# Balances live in two structurally identical <tbody> blocks; anchor on
# the unique tier <h3> to target the right one.
function Set-TbodyAfterAnchor {
    param([string]$Content, [string]$Anchor, [string]$NewRows)
    $a = $Content.IndexOf($Anchor)
    if ($a -lt 0) { throw "anchor not found: $Anchor" }
    $t = $Content.IndexOf('<tbody>', $a)
    if ($t -lt 0) { throw "<tbody> not found after $Anchor" }
    $bodyStart = $t + '<tbody>'.Length
    $e = $Content.IndexOf('</tbody>', $bodyStart)
    if ($e -lt 0) { throw "</tbody> not found after $Anchor" }
    $Content.Substring(0, $bodyStart) + "`n" + $NewRows + "`n          " + $Content.Substring($e)
}

$content = Read-TextRaw $PagePath
$u = Set-TbodyAfterAnchor -Content $content -Anchor '<h3>Upper-Tier</h3>' -NewRows $upperRows
$u = Set-TbodyAfterAnchor -Content $u       -Anchor '<h3>Lower-Tier</h3>' -NewRows $lowerRows
$updated = Set-BlockBetweenMarkers -Content $u -StartMarker 'const REGISTRY_DATA = [' -EndMarker "`n  ];" -NewBody $registryBody

if ($updated -eq $content) {
    Write-Host "[credits.html] ROUND-TRIP EXACT -- balances + REGISTRY_DATA byte-identical." -ForegroundColor Green
    Write-Host ("[credits.html] balances: total={0}, registry rows={1}" -f (($bal.Values | Measure-Object -Sum).Sum, $regObjs.Count)) -ForegroundColor DarkGray
    exit 0
}

Write-Host "[credits.html] DIFFERS from current. First mismatching lines:" -ForegroundColor Yellow
$o = $content -split "`n"; $n = $updated -split "`n"; $shown = 0
for ($i = 0; $i -lt [math]::Max($o.Count,$n.Count) -and $shown -lt 12; $i++) {
    $ol = if ($i -lt $o.Count) { $o[$i] } else { '<none>' }
    $nl = if ($i -lt $n.Count) { $n[$i] } else { '<none>' }
    if ($ol -ne $nl) {
        Write-Host ("  line {0}" -f ($i+1)) -ForegroundColor Yellow
        Write-Host ("    - {0}" -f $ol) -ForegroundColor Red
        Write-Host ("    + {0}" -f $nl) -ForegroundColor Green
        $shown++
    }
}
if ($Write) {
    [System.IO.File]::WriteAllText($PagePath, $updated)
    Write-Host "[credits.html] WROTE regenerated balances + REGISTRY_DATA." -ForegroundColor Cyan
} else {
    Write-Host "[credits.html] check-only (no -Write); nothing written." -ForegroundColor DarkGray
}
exit 1
