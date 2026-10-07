# ======================================================================
# gen-owner-seasons.ps1  --  Build data/MAFFL_Owner_Seasons.csv from gold
# ----------------------------------------------------------------------
# One row per owner per completed season (a season is complete once its
# Upper-Tier Championship game is in the matchups). Replaces the
# quarantined cleaned_maffl_revised.csv (governance 7.3 / 7.5) with the
# same columns, so history.html (csv-seasons), draft.html (CHAMPS) and
# validate (Gates 1, 7) can read it unchanged.
#
#   Owner   canonical_name via data/MAFFL_Owner_Registry.csv aliases
#   TEAM    MAFFL_Team_History.csv (owner + year)
#   W/L/T   MAFFL_Matchups_NoConsolation.csv, Game_Type Regular, both
#           tiers; equal scores = tie
#   Champ / Runner   winner / loser of the Upper Championship game
#   Playoff any Upper Is_Playoffs game that season (governance 7.5)
#   Division  MAFFL_Division_History_2005_2025.csv Upper, rank 1 (2005+)
#   Lower-Tier 1st / Runner Up / Promotion Showdown Winner
#           prize.csv Lower-Tier Placement 1st / 2nd / 3rd Place
#   2002-2004  copied from MAFFL_Seasons_2002_2004.csv (hand-kept gold:
#           no matchups exist for those years)
#
# Output: header + rows sorted by Owner (ordinal), then YEAR; LF line
# endings; a field is quoted only if it holds a comma, quote or newline.
# DERIVED -- never hand-edit the CSV; change gold and re-run.
#
#   build\gen-owner-seasons.ps1          # check-only: prove round-trip
#   build\gen-owner-seasons.ps1 -Write   # write the CSV if it differs
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$OutName = 'MAFFL_Owner_Seasons.csv'
$OutPath = Join-Path $DataDir $OutName
$Header  = @('Owner','YEAR','TEAM','W','L','T','Season','Champ','Runner','Division','Playoff','Lower-Tier 1st','Lower-Tier Runner Up','Promotion Showdown Winner')

# ---- owner aliases -> canonical ----
$alias = @{}
foreach ($r in (Read-MafflCsv 'MAFFL_Owner_Registry.csv')) {
    $names = @($r.canonical_name) + @($r.aliases -split '\|')
    foreach ($a in $names) { $t = $a.Trim(); if ($t) { $alias[$t] = $r.canonical_name.Trim() } }
}
function Get-Canon { param([string]$n)
    $t = $n.Trim()
    if (-not $alias.ContainsKey($t)) { throw "Owner not in MAFFL_Owner_Registry aliases: '$t'" }
    $alias[$t]
}

# ---- completed seasons = years with an Upper Championship game ----
$games = Read-MafflCsv 'MAFFL_Matchups_NoConsolation.csv'
$years = @{}
foreach ($g in $games) { if ($g.Game_Type -eq 'Championship') { $years[[int]$g.Year] = $true } }

# ---- one row per owner-year from Team_History ----
$rows = @{}
foreach ($r in (Read-MafflCsv 'MAFFL_Team_History.csv')) {
    $y = [int]$r.Year
    if (-not $years.ContainsKey($y)) { continue }
    $key = (Get-Canon $r.Owner) + "`t" + $y
    $rows[$key] = @{ team = $r.Team_Name.Trim(); W = 0; L = 0; T = 0; champ = 0; ru = 0; div = 0; po = 0; l1 = 0; l2 = 0; ps = 0 }
}
function Get-Row { param([string]$owner, [int]$y)
    $key = (Get-Canon $owner) + "`t" + $y
    if (-not $rows.ContainsKey($key)) { throw "No MAFFL_Team_History row for $($key -replace "`t", ' ')" }
    $rows[$key]
}

foreach ($g in $games) {
    $y = [int]$g.Year
    if (-not $years.ContainsKey($y) -or $g.Game_Type -eq 'Ghost') { continue }
    $w = Get-Row $g.Winner_Owner $y
    $l = Get-Row $g.Loser_Owner $y
    if ($g.Game_Type -eq 'Regular') {
        if ([double]$g.Winner_Score -eq [double]$g.Loser_Score) { $w.T += 1; $l.T += 1 }
        else { $w.W += 1; $l.L += 1 }
    }
    if ($g.Tier -eq 'Upper' -and $g.Is_Playoffs -eq 'True') {
        $w.po = 1; $l.po = 1
        if ($g.Game_Type -eq 'Championship') { $w.champ = 1; $l.ru = 1 }
    }
}

foreach ($r in (Read-MafflCsv 'MAFFL_Division_History_2005_2025.csv')) {
    $y = [int]$r.Year
    if ($years.ContainsKey($y) -and $r.Tier -eq 'Upper' -and $r.Division_Rank.Trim() -eq '1') { (Get-Row $r.Owner $y).div = 1 }
}

$placeKey = @{ '1st Place' = 'l1'; '2nd Place' = 'l2'; '3rd Place' = 'ps' }
foreach ($r in (Read-MafflCsv 'prize.csv')) {
    $y = [int]$r.Year
    if ($years.ContainsKey($y) -and $r.'League/Tier' -eq 'Lower-Tier' -and $r.'Prize Category' -eq 'Placement') {
        $k = $placeKey[$r.'Placement Detail'.Trim()]
        if (-not $k) { throw "prize.csv: unexpected Lower-Tier placement '$($r.'Placement Detail')' ($y)" }
        (Get-Row $r.Owner $y).$k = 1
    }
}

# ---- assemble lines (sort key = owner<TAB>year, ordinal) ----
function Format-Field { param([string]$s)
    if ($s -match '[,"\n]') { '"' + $s.Replace('"', '""') + '"' } else { $s }
}
$lines = @{}
foreach ($r in (Read-MafflCsv 'MAFFL_Seasons_2002_2004.csv')) {
    $o = Get-Canon $r.Owner
    $vals = @($o) + @($Header[1..($Header.Count - 1)] | ForEach-Object { $r.$_.Trim() })
    $lines[$o + "`t" + $r.YEAR.Trim()] = (($vals | ForEach-Object { Format-Field $_ }) -join ',')
}
foreach ($key in $rows.Keys) {
    $v = $rows[$key]; $parts = $key -split "`t"
    $vals = @($parts[0], $parts[1], $v.team, $v.W, $v.L, $v.T, 1, $v.champ, $v.ru, $v.div, $v.po, $v.l1, $v.l2, $v.ps)
    if ($lines.ContainsKey($key)) { throw "Duplicate owner-year: $($key -replace "`t", ' ')" }
    $lines[$key] = (($vals | ForEach-Object { Format-Field ([string]$_) }) -join ',')
}
$keys = [string[]]@($lines.Keys)
[Array]::Sort($keys, [System.StringComparer]::Ordinal)
$text = ($Header -join ',') + "`n" + ((($keys | ForEach-Object { $lines[$_] }) -join "`n")) + "`n"

# ---- compare / write ----
$current = if (Test-Path $OutPath) { (Read-TextRaw $OutPath) -replace "`r", '' } else { '' }
$champs = 0; foreach ($k in $rows.Keys) { $champs += $rows[$k].champ }
Write-Host ("[{0}] {1} rows ({2} from 2002-2004 table); seasons {3}-{4}; Champ flags 2005+ = {5}" -f $OutName, $keys.Count, ($keys.Count - $rows.Count), (($years.Keys | Measure-Object -Minimum).Minimum), (($years.Keys | Measure-Object -Maximum).Maximum), $champs) -ForegroundColor Cyan
if ($text -eq $current) {
    Write-Host "[$OutName] ROUND-TRIP EXACT." -ForegroundColor Green
    exit 0
}
$o = $current -split "`n"; $n = $text -split "`n"; $shown = 0
for ($i = 0; $i -lt [math]::Max($o.Count, $n.Count) -and $shown -lt 10; $i++) {
    $ol = if ($i -lt $o.Count) { $o[$i] } else { '<none>' }; $nl = if ($i -lt $n.Count) { $n[$i] } else { '<none>' }
    if ($ol -ne $nl) { Write-Host "  line $($i+1)`n    - $ol`n    + $nl"; $shown++ }
}
if ($Write) {
    [System.IO.File]::WriteAllText($OutPath, $text, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "[$OutName] WROTE." -ForegroundColor Cyan
} else {
    Write-Host "[$OutName] DIFFERS (check-only; nothing written)." -ForegroundColor Yellow
}
exit 1
