# ======================================================================
# generate-matchups-data.ps1  --  CE-1 derived-file chain (new week of results)
# ----------------------------------------------------------------------
# GOLD (hand-appended weekly, never written here):
#   data/MAFFL_Matchups_Clean.csv
# DERIVED (regenerated here, never hand-edited):
#   data/MAFFL_Matchups_NoConsolation.csv  Clean minus Game_Type Consolation
#   matchups-data.js                       NoConsolation minus Game_Type Ghost
#   data/MAFFL_Points_By_Season.csv        per owner x season, from NoConsolation
#   data/MAFFL_Points_AllTime.csv          per owner, sum of By_Season
#
#   build\generate-matchups-data.ps1          # check-only: report, write nothing
#   build\generate-matchups-data.ps1 -Write   # write the files that changed
#
# Exit 0 = all four files already match the gold; 1 = differences found
# (written only with -Write); 2 = REFUSED, nothing written.
#
# Refuses (exit 2) when:
#   - a gold row fails validation (field count, Game_Type, Is_Playoffs,
#     score format, a MAFFL Ghost side outside a Ghost row, ...);
#   - an owner string does not resolve EXACTLY against an alias in
#     data/MAFFL_Owner_Registry.csv, or an alias maps to two owner_ids
#     (governance 7.1: add new spellings to the registry, never fuzzy-match);
#   - regeneration would change anything already published other than the
#     in-progress season: NoConsolation / matchups-data.js rows must be an
#     exact prefix of the regenerated rows, and By_Season rows for earlier
#     seasons must be byte-identical.
#
# Owner names. The CSVs carry each row's gold owner string verbatim. The two
# name-keyed outputs (matchups-data.js, points files) instead emit ONE label
# per owner_id: the spelling of that owner's first row in the gold file. Each
# owner_id has exactly one historical spelling, so this is byte-identical to
# the prior output, and a new co-owner spelling (e.g. "Jon Fetrow/ Casey
# Trozzo") stays on the same identity instead of splitting it.
#
# MAFFL Ghost (Game_Type == "Ghost") is a schedule filler, not a franchise.
# Its row stays in NoConsolation; it is dropped from matchups-data.js; the
# real team's side counts as a regular-season game in the points files and
# the Ghost side gets no row anywhere.
#
# Post_ columns (gotcha G-8). The existing Post_Games/PF/PA values for seasons
# <= $PostFrozenThrough were built on the pre-2026-06-03 (narrow) playoff
# definition and do not match the reclassified bracket in NoConsolation. They
# are CARRIED FORWARD unchanged, not recomputed, and the mismatch is reported.
# Seasons after that use the runbook 8 rule: Upper-tier, non-ThirdPlace
# playoff games.
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$Inv          = [Globalization.CultureInfo]::InvariantCulture
$Utf8NoBom    = New-Object System.Text.UTF8Encoding($false)
$Utf8Bom      = New-Object System.Text.UTF8Encoding($true)

$CleanPath    = Join-Path $DataDir  'MAFFL_Matchups_Clean.csv'
$NoConsPath   = Join-Path $DataDir  'MAFFL_Matchups_NoConsolation.csv'
$JsPath       = Join-Path $RepoRoot 'matchups-data.js'
$BySeasonPath = Join-Path $DataDir  'MAFFL_Points_By_Season.csv'
$AllTimePath  = Join-Path $DataDir  'MAFFL_Points_AllTime.csv'
$RegistryPath = Join-Path $DataDir  'MAFFL_Owner_Registry.csv'

$MatchupHeader  = 'Year,Week,Tier,Is_Playoffs,Game_Type,Winner_Owner,Winner_Owner_ESPN,Winner_Team,Winner_Score,Loser_Owner,Loser_Owner_ESPN,Loser_Team,Loser_Score'
$BySeasonHeader = 'Owner,Year,Reg_Games,Reg_PF,Reg_PA,Reg_Diff,Post_Games,Post_PF,Post_PA,Post_Diff,Total_Games,Total_PF,Total_PA,Total_Diff'
$AllTimeHeader  = 'Owner,Reg_Games,Reg_PF,Reg_PA,Reg_Diff,Reg_PPG,Post_Games,Post_PF,Post_PA,Post_Diff,Total_Games,Total_PF,Total_PA,Total_Diff,Short_Name'

$GhostName         = 'MAFFL Ghost'
$AllowedTypes      = @('Regular','Consolation','Quarterfinal','Semifinal','Championship','ThirdPlace','Ghost')
$PlayoffTypes      = @('Quarterfinal','Semifinal','Championship','ThirdPlace')
$TypeLetter        = @{ Regular='R'; Quarterfinal='Q'; Semifinal='S'; Championship='C'; ThirdPlace='T' }
$PostFrozenThrough = 2025

# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------
$script:Problems = New-Object System.Collections.ArrayList
function Add-Problem([string]$Message) { [void]$script:Problems.Add($Message) }
function Stop-IfProblems([string]$Stage) {
    if ($script:Problems.Count -eq 0) { return }
    Write-Host "[$Stage] REFUSED -- $($script:Problems.Count) problem(s):" -ForegroundColor Red
    $script:Problems | Select-Object -First 25 | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "Nothing written." -ForegroundColor Red
    exit 2
}

# Split a CRLF file into lines (no terminators). Every line must end CRLF.
function Read-CrlfLines([string]$Path, [string]$Label) {
    $raw = [IO.File]::ReadAllText($Path)
    if ($raw.Length -lt 2 -or -not $raw.EndsWith("`r`n")) { Add-Problem "$Label does not end with CRLF"; return ,@() }
    $body = $raw.Substring(0, $raw.Length - 2)
    if ($body.Replace("`r`n", '').IndexOfAny([char[]]@([char]13, [char]10)) -ge 0) {
        Add-Problem "$Label has a bare CR or LF (expected CRLF throughout)"
    }
    ,($body -split "`r`n")
}

function Get-EncodedBytes([string]$Text, $Encoding) {
    $ms = New-Object System.IO.MemoryStream
    $pre = $Encoding.GetPreamble(); $ms.Write($pre, 0, $pre.Length)
    $b = $Encoding.GetBytes($Text); $ms.Write($b, 0, $b.Length)
    ,$ms.ToArray()
}
function Get-Sha([byte[]]$Bytes) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    [BitConverter]::ToString($sha.ComputeHash($Bytes))
}

# Python-float-style number text used by the points files: 1422.0, 1305.5, 110.02
function Format-Num([decimal]$Value) {
    $s = $Value.ToString('0.##', $Inv)
    if ($s.IndexOf('.') -lt 0) { $s += '.0' }
    $s
}
function ConvertTo-Dec([string]$Text) { [decimal]::Parse($Text, [Globalization.NumberStyles]::Float, $Inv) }

# ----------------------------------------------------------------------
# 1. Gold: read + validate MAFFL_Matchups_Clean.csv
# ----------------------------------------------------------------------
$cleanLines = Read-CrlfLines $CleanPath 'MAFFL_Matchups_Clean.csv'
Stop-IfProblems 'gold'
if ($cleanLines[0] -cne $MatchupHeader) { Add-Problem "Clean header changed: $($cleanLines[0])" }

$games = New-Object System.Collections.ArrayList
for ($i = 1; $i -lt $cleanLines.Count; $i++) {
    $line = $cleanLines[$i]; $ln = $i + 1
    if ($line.IndexOf('"') -ge 0) { Add-Problem "Clean line ${ln}: quoted fields are not supported"; continue }
    $f = $line.Split(',')
    if ($f.Count -ne 13) { Add-Problem "Clean line ${ln}: expected 13 fields, got $($f.Count)"; continue }
    $gt = $f[4]
    if ($f[0] -notmatch '^\d{4}$')          { Add-Problem "Clean line ${ln}: bad Year '$($f[0])'"; continue }
    if ($f[1] -notmatch '^\d{1,2}$')        { Add-Problem "Clean line ${ln}: bad Week '$($f[1])'"; continue }
    if ($AllowedTypes -cnotcontains $gt)    { Add-Problem "Clean line ${ln}: unknown Game_Type '$gt'"; continue }
    if ($f[2] -cne 'Upper' -and $f[2] -cne 'Lower') { Add-Problem "Clean line ${ln}: bad Tier '$($f[2])'"; continue }
    if ($f[8] -notmatch '^\d+(\.\d{1,2})?$' -or $f[12] -notmatch '^\d+(\.\d{1,2})?$') {
        Add-Problem "Clean line ${ln}: bad score '$($f[8])' / '$($f[12])'"; continue
    }
    $wantPo = $null
    if ($PlayoffTypes -ccontains $gt) { $wantPo = 'True' } elseif ($gt -cne 'Consolation') { $wantPo = 'False' }
    if ($f[3] -cne 'True' -and $f[3] -cne 'False') { Add-Problem "Clean line ${ln}: bad Is_Playoffs '$($f[3])'" }
    elseif ($wantPo -and $f[3] -cne $wantPo)       { Add-Problem "Clean line ${ln}: Game_Type $gt with Is_Playoffs $($f[3])" }

    $wGhost = ($f[5] -ceq $GhostName); $lGhost = ($f[9] -ceq $GhostName)
    if ($gt -ceq 'Ghost') {
        if ($wGhost -eq $lGhost) { Add-Problem "Clean line ${ln}: a Ghost row needs exactly one MAFFL Ghost side" }
        else {
            $gi = 9; if ($wGhost) { $gi = 5 }
            if ($f[$gi + 1] -cne $GhostName -or $f[$gi + 2] -cne $GhostName) {
                Add-Problem "Clean line ${ln}: the Ghost side must read MAFFL Ghost in owner, ESPN and team"
            }
        }
    } elseif ($wGhost -or $lGhost) {
        Add-Problem "Clean line ${ln}: MAFFL Ghost on a $gt row (only Game_Type Ghost may carry it)"
    }

    [void]$games.Add([pscustomobject]@{
        Line = $line; Year = [int]$f[0]; YearText = $f[0]; WeekText = $f[1]
        Tier = $f[2]; Type = $gt
        W = $f[5]; WSText = $f[8];  WS = (ConvertTo-Dec $f[8]);  WId = $null
        L = $f[9]; LSText = $f[12]; LS = (ConvertTo-Dec $f[12]); LId = $null
    })
}
Stop-IfProblems 'gold'
$maxYear = ($games | Measure-Object -Property Year -Maximum).Maximum

# ----------------------------------------------------------------------
# 2. Owner identity: exact alias lookup against the registry
# ----------------------------------------------------------------------
$aliasToId = New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
$shortById = @{}
foreach ($r in (Import-Csv -Path $RegistryPath -Encoding UTF8)) {
    foreach ($n in (@($r.canonical_name) + @($r.aliases -split '\|'))) {
        if ([string]::IsNullOrWhiteSpace($n)) { continue }
        if (-not $aliasToId.ContainsKey($n)) { $aliasToId[$n] = $r.owner_id }
        elseif ($aliasToId[$n] -cne $r.owner_id) {
            Add-Problem "registry alias '$n' maps to both $($aliasToId[$n]) and $($r.owner_id)"
        }
    }
    $shortById[$r.owner_id] = $r.short_name
}
if ($aliasToId.ContainsKey($GhostName)) { Add-Problem "MAFFL Ghost is in the owner registry; it is not an owner" }

$labelById  = New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
$unresolved = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([StringComparer]::Ordinal)
foreach ($g in $games) {
    foreach ($side in 'W', 'L') {
        $raw = $g.$side
        if ($raw -ceq $GhostName) { continue }
        if (-not $aliasToId.ContainsKey($raw)) {
            if ($unresolved.ContainsKey($raw)) { $unresolved[$raw]++ } else { $unresolved[$raw] = 1 }
            continue
        }
        $id = $aliasToId[$raw]
        $g.($side + 'Id') = $id
        if (-not $labelById.ContainsKey($id)) { $labelById[$id] = $raw }
    }
}
foreach ($k in $unresolved.Keys) { Add-Problem "owner string '$k' ($($unresolved[$k]) row(s)) is not in the registry -- add it to an aliases list" }
Stop-IfProblems 'registry'

# Spellings that differ from their owner's established label (informational).
$respelled = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([StringComparer]::Ordinal)
foreach ($g in $games) {
    foreach ($side in 'W', 'L') {
        $id = $g.($side + 'Id'); if (-not $id) { continue }
        if ($g.$side -cne $labelById[$id]) {
            $k = "'$($g.$side)' -> '$($labelById[$id])' ($id)"
            if ($respelled.ContainsKey($k)) { $respelled[$k]++ } else { $respelled[$k] = 1 }
        }
    }
}

# ----------------------------------------------------------------------
# 3. MAFFL_Matchups_NoConsolation.csv  (filter Consolation, nothing else)
# ----------------------------------------------------------------------
$ncGames = @($games | Where-Object { $_.Type -cne 'Consolation' })
$ncLines = @($MatchupHeader) + @($ncGames | ForEach-Object { $_.Line })
$ncText  = ($ncLines -join "`r`n") + "`r`n"

$oldNc = Read-CrlfLines $NoConsPath 'MAFFL_Matchups_NoConsolation.csv'
if ($oldNc.Count -gt $ncLines.Count) {
    Add-Problem "NoConsolation would SHRINK ($($oldNc.Count - 1) -> $($ncLines.Count - 1) rows)"
} else {
    for ($i = 0; $i -lt $oldNc.Count; $i++) {
        if ($oldNc[$i] -cne $ncLines[$i]) { Add-Problem "NoConsolation line $($i + 1) would change: '$($oldNc[$i])' -> '$($ncLines[$i])'"; break }
    }
}

# ----------------------------------------------------------------------
# 4. matchups-data.js  (NoConsolation minus Ghost rows)
# ----------------------------------------------------------------------
$jsGames    = @($ncGames | Where-Object { $_.Type -cne 'Ghost' })
$ghostGames = @($ncGames | Where-Object { $_.Type -ceq 'Ghost' })
$minYear    = ($ncGames | Measure-Object -Property Year -Minimum).Minimum
$range      = "$minYear-$(($ncGames | Measure-Object -Property Year -Maximum).Maximum)"

$hdr = New-Object System.Collections.Generic.List[string]
$hdr.Add('/* =====================================================================')
$hdr.Add(' * MAFFL MATCHUPS DATA  (consolation games already excluded)')
$hdr.Add(' * ---------------------------------------------------------------------')
$hdr.Add((' * Source: data/MAFFL_Matchups_NoConsolation.csv ({0} rows, {1}).' -f $ncGames.Count.ToString('N0', $Inv), $range))
if ($ghostGames.Count -gt 0) {
    $hdr.Add((' * Ghost rows (Game_Type == "Ghost") are EXCLUDED {0} {1} rows emitted.' -f [char]0x2014, $jsGames.Count.ToString('N0', $Inv)))
    $hdr.Add(' *   MAFFL Ghost is a schedule filler, not a franchise: it earns no credits, wins')
    $hdr.Add(' *   no prizes, and does not affect promotion or relegation. Emitting it would put')
    $hdr.Add(' *   "MAFFL Ghost" in the rivalry.html owner picker (that roster is built from the')
    $hdr.Add(' *   names appearing in these rows) and, because both consumers treat any type')
    $hdr.Add(' *   other than "R" as postseason, would book it as a playoff meeting.')
    $hdr.Add(' *   The real team''s win and points are still recorded in gold and in NoConsolation.')
}
$hdr.Add(' * Each row (8 fields):')
$hdr.Add(' *   [year, week, tier, winnerName, winnerScore, loserName, loserScore, type]')
$hdr.Add((' *   year       : integer season ({0})' -f $range))
$hdr.Add(' *   week       : integer week number')
$hdr.Add(' *   tier       : "U" = Upper, "L" = Lower')
$hdr.Add(' *   winnerName : canonical gold owner name (NOT the ESPN variant)')
$hdr.Add(' *   winnerScore: number (decimals preserved as-is)')
$hdr.Add(' *   loserName  : canonical gold owner name')
$hdr.Add(' *   loserScore : number')
$hdr.Add(' *   type       : "R" = Regular season, "Q" = Quarterfinal, "S" = Semifinal,')
$hdr.Add(' *                "C" = Championship, "T" = 3rd-Place game.')
$hdr.Add(' *   Q, S, C and T together are the playoff games (Big Game Matchups).')
$hdr.Add(' * Owner names are the canonical gold names (match OWNERS_DATA[].name via')
$hdr.Add(' * normalizeName() in power-rankings.html). Used for head-to-head (Rivals)')
$hdr.Add(' * and reusable for a future points-timeline view.')
$hdr.Add(' * Regenerate from CSV; do not hand-edit.')
$hdr.Add(' * ===================================================================== */')
$hdr.Add('window.MATCHUPS_DATA = [')

$jsRows = New-Object System.Collections.Generic.List[string]
foreach ($g in $jsGames) {
    $w = $labelById[$g.WId]; $l = $labelById[$g.LId]
    if ($w.IndexOfAny([char[]]'"\') -ge 0 -or $l.IndexOfAny([char[]]'"\') -ge 0) { Add-Problem "owner label needs JS escaping: $w / $l"; continue }
    $jsRows.Add(('[{0},{1},"{2}","{3}",{4},"{5}",{6},"{7}"]' -f $g.YearText, $g.WeekText, $g.Tier.Substring(0, 1), $w, $g.WSText, $l, $g.LSText, $TypeLetter[$g.Type]))
}
# Byte layout of the published file: UTF-8 BOM; header lines LF; data rows
# CRLF with a trailing comma; last row and the closing "];" LF.
$sb = New-Object System.Text.StringBuilder
foreach ($h in $hdr) { [void]$sb.Append($h).Append("`n") }
for ($i = 0; $i -lt $jsRows.Count; $i++) {
    if ($i -lt $jsRows.Count - 1) { [void]$sb.Append($jsRows[$i]).Append(",`r`n") }
    else                          { [void]$sb.Append($jsRows[$i]).Append("`n") }
}
[void]$sb.Append("];`n")
$jsText = $sb.ToString()

$oldJsText = [IO.File]::ReadAllText($JsPath)
$oldJsAll  = $oldJsText -split "`n"
$start = [Array]::IndexOf($oldJsAll, 'window.MATCHUPS_DATA = [')
$oldJsRows = New-Object System.Collections.Generic.List[string]
if ($start -lt 0) { Add-Problem "matchups-data.js: 'window.MATCHUPS_DATA = [' line not found" }
else {
    for ($i = $start + 1; $i -lt $oldJsAll.Count; $i++) {
        $t = $oldJsAll[$i].TrimEnd("`r")
        if ($t -ceq '];') { break }
        $oldJsRows.Add($t.TrimEnd(','))
    }
}
if ($oldJsRows.Count -gt $jsRows.Count) { Add-Problem "matchups-data.js would SHRINK ($($oldJsRows.Count) -> $($jsRows.Count) rows)" }
else {
    for ($i = 0; $i -lt $oldJsRows.Count; $i++) {
        if ($oldJsRows[$i] -cne $jsRows[$i]) { Add-Problem "matchups-data.js row $($i + 1) would change: $($oldJsRows[$i]) -> $($jsRows[$i])"; break }
    }
}

# ----------------------------------------------------------------------
# 5. Points: MAFFL_Points_By_Season.csv + MAFFL_Points_AllTime.csv
# ----------------------------------------------------------------------
Stop-IfProblems 'matchups drift'

$acc = New-Object 'System.Collections.Generic.Dictionary[string,object]' ([StringComparer]::Ordinal)
function Add-Side([string]$Id, $Game, [decimal]$PF, [decimal]$PA) {
    $label = $labelById[$Id]; $k = "$label`t$($Game.Year)"
    if (-not $acc.ContainsKey($k)) {
        $acc[$k] = [pscustomobject]@{ Owner = $label; Id = $Id; Year = $Game.Year
            RegG = 0; RegPF = [decimal]0; RegPA = [decimal]0; PostG = 0; PostPF = [decimal]0; PostPA = [decimal]0 }
    }
    $a = $acc[$k]
    if ($Game.Type -ceq 'Regular' -or $Game.Type -ceq 'Ghost') {
        $a.RegG += 1; $a.RegPF += $PF; $a.RegPA += $PA
    } elseif ($PlayoffTypes -ccontains $Game.Type) {
        # Runbook 8: <= 2024 the full NoConsolation playoff set; 2025+ Upper, non-ThirdPlace.
        if ($Game.Year -le 2024 -or ($Game.Tier -ceq 'Upper' -and $Game.Type -cne 'ThirdPlace')) {
            $a.PostG += 1; $a.PostPF += $PF; $a.PostPA += $PA
        }
    }
}
foreach ($g in $ncGames) {
    if ($g.WId) { Add-Side $g.WId $g $g.WS $g.LS }
    if ($g.LId) { Add-Side $g.LId $g $g.LS $g.WS }
}

$oldBs = Read-CrlfLines $BySeasonPath 'MAFFL_Points_By_Season.csv'
$oldAt = Read-CrlfLines $AllTimePath  'MAFFL_Points_AllTime.csv'
Stop-IfProblems 'points input'
if ($oldBs[0] -cne $BySeasonHeader) { Add-Problem "By_Season header changed: $($oldBs[0])" }
if ($oldAt[0] -cne $AllTimeHeader)  { Add-Problem "AllTime header changed: $($oldAt[0])" }
$oldBsByKey = New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
for ($i = 1; $i -lt $oldBs.Count; $i++) { $p = $oldBs[$i].Split(','); $oldBsByKey["$($p[0])`t$($p[1])"] = $oldBs[$i] }
$oldAtByOwner = New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
for ($i = 1; $i -lt $oldAt.Count; $i++) { $p = $oldAt[$i].Split(','); $oldAtByOwner[$p[0]] = $oldAt[$i] }

# G-8: carry frozen Post_ values; count where they disagree with the matchups.
$g8 = 0
foreach ($a in $acc.Values) {
    if ($a.Year -gt $PostFrozenThrough) { continue }
    $k = "$($a.Owner)`t$($a.Year)"
    $fg = 0; $fpf = [decimal]0; $fpa = [decimal]0
    if ($oldBsByKey.ContainsKey($k)) {
        $p = $oldBsByKey[$k].Split(',')
        $fg = [int]$p[6]; $fpf = ConvertTo-Dec $p[7]; $fpa = ConvertTo-Dec $p[8]
    }
    if ($fg -ne $a.PostG -or $fpf -ne $a.PostPF -or $fpa -ne $a.PostPA) { $g8++ }
    $a.PostG = $fg; $a.PostPF = $fpf; $a.PostPA = $fpa
}

$bsRows = New-Object 'System.Collections.Generic.List[object]'
foreach ($a in $acc.Values) { $bsRows.Add($a) }
$bsRows.Sort([Comparison[object]]{
    param($x, $y)
    $c = [string]::CompareOrdinal($x.Owner, $y.Owner)
    if ($c -ne 0) { $c } else { $x.Year.CompareTo($y.Year) }
})
function Format-BsLine($a) {
    @($a.Owner, $a.Year, $a.RegG, (Format-Num $a.RegPF), (Format-Num $a.RegPA), (Format-Num ($a.RegPF - $a.RegPA)),
      $a.PostG, (Format-Num $a.PostPF), (Format-Num $a.PostPA), (Format-Num ($a.PostPF - $a.PostPA)),
      ($a.RegG + $a.PostG), (Format-Num ($a.RegPF + $a.PostPF)), (Format-Num ($a.RegPA + $a.PostPA)),
      (Format-Num (($a.RegPF + $a.PostPF) - ($a.RegPA + $a.PostPA)))) -join ','
}
$bsLines = @($BySeasonHeader)
$newBsByKey = New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
foreach ($a in $bsRows) { $t = Format-BsLine $a; $bsLines += $t; $newBsByKey["$($a.Owner)`t$($a.Year)"] = $t }
$bsText = ($bsLines -join "`r`n") + "`r`n"

# Drift guard: every earlier-season row must be unchanged, in both directions.
foreach ($k in $oldBsByKey.Keys) {
    if ([int]($k.Split("`t")[1]) -ge $maxYear) { continue }
    if (-not $newBsByKey.ContainsKey($k))          { Add-Problem "By_Season row would disappear: $($oldBsByKey[$k])" }
    elseif ($newBsByKey[$k] -cne $oldBsByKey[$k])  { Add-Problem "By_Season pre-$maxYear row would change: '$($oldBsByKey[$k])' -> '$($newBsByKey[$k])'" }
}
foreach ($k in $newBsByKey.Keys) {
    if ([int]($k.Split("`t")[1]) -lt $maxYear -and -not $oldBsByKey.ContainsKey($k)) { Add-Problem "By_Season would gain a pre-$maxYear row: $($newBsByKey[$k])" }
}

# AllTime = per-owner sum of By_Season.
$tot = New-Object 'System.Collections.Generic.Dictionary[string,object]' ([StringComparer]::Ordinal)
foreach ($a in $bsRows) {
    if (-not $tot.ContainsKey($a.Owner)) {
        $tot[$a.Owner] = [pscustomobject]@{ Owner = $a.Owner; Id = $a.Id; RegG = 0; RegPF = [decimal]0; RegPA = [decimal]0; PostG = 0; PostPF = [decimal]0; PostPA = [decimal]0 }
    }
    $t = $tot[$a.Owner]
    $t.RegG += $a.RegG; $t.RegPF += $a.RegPF; $t.RegPA += $a.RegPA
    $t.PostG += $a.PostG; $t.PostPF += $a.PostPF; $t.PostPA += $a.PostPA
}
$atRows = New-Object 'System.Collections.Generic.List[object]'
foreach ($t in $tot.Values) { $atRows.Add($t) }
$atRows.Sort([Comparison[object]]{
    param($x, $y)
    $c = ($y.RegPF + $y.PostPF).CompareTo($x.RegPF + $x.PostPF)
    if ($c -ne 0) { $c } else { [string]::CompareOrdinal($x.Owner, $y.Owner) }
})
$ownersThisSeason = @{}
foreach ($a in $bsRows) { if ($a.Year -eq $maxYear) { $ownersThisSeason[$a.Owner] = $true } }
$atLines = @($AllTimeHeader)
$atChanged = 0
foreach ($t in $atRows) {
    $short = ''
    if ($oldAtByOwner.ContainsKey($t.Owner)) { $short = $oldAtByOwner[$t.Owner].Split(',')[14] }
    else { $short = [string]$shortById[$t.Id]; Add-Problem "AllTime would gain a new owner row: $($t.Owner) -- confirm Short_Name '$short' and re-run" }
    $ppg = [math]::Round($t.RegPF / $t.RegG, 2, [MidpointRounding]::ToEven)
    $line = @($t.Owner, $t.RegG, (Format-Num $t.RegPF), (Format-Num $t.RegPA), (Format-Num ($t.RegPF - $t.RegPA)), (Format-Num $ppg),
              $t.PostG, (Format-Num $t.PostPF), (Format-Num $t.PostPA), (Format-Num ($t.PostPF - $t.PostPA)),
              ($t.RegG + $t.PostG), (Format-Num ($t.RegPF + $t.PostPF)), (Format-Num ($t.RegPA + $t.PostPA)),
              (Format-Num (($t.RegPF + $t.PostPF) - ($t.RegPA + $t.PostPA))), $short) -join ','
    $atLines += $line
    if ($oldAtByOwner.ContainsKey($t.Owner) -and $oldAtByOwner[$t.Owner] -cne $line) {
        $atChanged++
        if (-not $ownersThisSeason.ContainsKey($t.Owner)) { Add-Problem "AllTime row would change for an owner with no $maxYear games: $($t.Owner)" }
    }
}
foreach ($o in $oldAtByOwner.Keys) { if (-not $tot.ContainsKey($o)) { Add-Problem "AllTime row would disappear: $o" } }
$atText = ($atLines -join "`r`n") + "`r`n"

Stop-IfProblems 'drift'

# ----------------------------------------------------------------------
# 6. Report + write
# ----------------------------------------------------------------------
Write-Host "[gold] MAFFL_Matchups_Clean.csv: $($games.Count) rows, $minYear-$maxYear, all owner strings resolved." -ForegroundColor Green
foreach ($gg in $ghostGames) {
    $real = if ($gg.WId) { "$($labelById[$gg.WId]) W $($gg.WSText)-$($gg.LSText)" } else { "$($labelById[$gg.LId]) L $($gg.LSText)-$($gg.WSText)" }
    Write-Host "  Ghost row: $($gg.YearText) wk $($gg.WeekText) $($gg.Tier): $real vs MAFFL Ghost (kept in NoConsolation, dropped from matchups-data.js)" -ForegroundColor DarkGray
}
foreach ($k in $respelled.Keys) { Write-Host "  Registry-resolved spelling: $k x$($respelled[$k])" -ForegroundColor DarkGray }
Write-Host "  G-8: $g8 owner-season(s) <= $PostFrozenThrough carry frozen Post_ values that differ from the matchup-derived playoff set (carried, not fixed)." -ForegroundColor DarkGray

$outputs = @(
    @{ Label = 'MAFFL_Matchups_NoConsolation.csv'; Path = $NoConsPath;   Bytes = (Get-EncodedBytes $ncText $Utf8NoBom); Note = "$($oldNc.Count - 1) -> $($ncLines.Count - 1) rows" },
    @{ Label = 'matchups-data.js';                 Path = $JsPath;       Bytes = (Get-EncodedBytes $jsText $Utf8Bom);   Note = "$($oldJsRows.Count) -> $($jsRows.Count) rows ($($ghostGames.Count) Ghost row(s) excluded)" },
    @{ Label = 'MAFFL_Points_By_Season.csv';       Path = $BySeasonPath; Bytes = (Get-EncodedBytes $bsText $Utf8NoBom); Note = "$($oldBs.Count - 1) -> $($bsLines.Count - 1) rows" },
    @{ Label = 'MAFFL_Points_AllTime.csv';         Path = $AllTimePath;  Bytes = (Get-EncodedBytes $atText $Utf8NoBom); Note = "$($oldAt.Count - 1) -> $($atLines.Count - 1) rows, $atChanged updated" }
)
$changed = 0
foreach ($o in $outputs) {
    $cur = [IO.File]::ReadAllBytes($o.Path)
    if ((Get-Sha $cur) -eq (Get-Sha $o.Bytes)) {
        Write-Host "[$($o.Label)] ROUND-TRIP EXACT -- byte-identical ($($o.Note))." -ForegroundColor Green
        continue
    }
    $changed++
    Write-Host "[$($o.Label)] DIFFERS -- $($o.Note); append-only drift check passed." -ForegroundColor Yellow
    if ($Write) {
        [IO.File]::WriteAllBytes($o.Path, $o.Bytes)
        if ((Get-Sha ([IO.File]::ReadAllBytes($o.Path))) -ne (Get-Sha $o.Bytes)) { Write-Host "[$($o.Label)] WRITE VERIFY FAILED" -ForegroundColor Red; exit 2 }
        Write-Host "[$($o.Label)] WROTE." -ForegroundColor Cyan
    }
}
if ($changed -eq 0) { exit 0 }
if (-not $Write) { Write-Host "check-only (no -Write); nothing written." -ForegroundColor DarkGray }
exit 1
