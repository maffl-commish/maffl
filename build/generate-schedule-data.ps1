# ======================================================================
# generate-schedule-data.ps1  --  season fixtures -> schedule-data.js
# ----------------------------------------------------------------------
# GOLD (never written here):
#   data/MAFFL_Schedule_2026_Upper.csv   hand-authored by the commissioner
#   data/MAFFL_Schedule_2026_Lower.csv   one-time ESPN extract
#                                        (_ops/scripts/extract_espn_schedule.py)
# DERIVED (regenerated here, never hand-edited):
#   schedule-data.js                     both tiers, read by rivalry.html
#
#   build\generate-schedule-data.ps1          # check-only: report, write nothing
#   build\generate-schedule-data.ps1 -Write   # write schedule-data.js if it changed
#
# Exit 0 = schedule-data.js already matches the gold; 1 = differs (written
# only with -Write); 2 = REFUSED, nothing written.
#
# Refuses (exit 2) when:
#   - a CSV header differs from the Upper file's column list, or a row has
#     a bad Year / Week / Tier / Game_Class;
#   - an owner string does not resolve EXACTLY against an alias in
#     data/MAFFL_Owner_Registry.csv, or an alias maps to two owner_ids
#     (governance 7.1: add new spellings to the registry, never fuzzy-match);
#   - Upper is not 84 rows (6 x 14 weeks) or Lower is not 70 (5 x 14);
#   - an owner appears twice in one week+tier, or a game pairs an owner
#     with themselves.
#
# Fixtures are not results: this file says who is SCHEDULED to meet. Records,
# streaks and ratings still come only from played results (matchups-data.js).
# Fixtures change once a season, so this is run by hand; it is NOT part of
# build.ps1.
# ======================================================================
param([switch]$Write)

. (Join-Path $PSScriptRoot 'maffl-lib.ps1')

$Utf8Bom      = New-Object System.Text.UTF8Encoding($true)

$Year         = 2026
$UpperPath    = Join-Path $DataDir  "MAFFL_Schedule_${Year}_Upper.csv"
$LowerPath    = Join-Path $DataDir  "MAFFL_Schedule_${Year}_Lower.csv"
$JsPath       = Join-Path $RepoRoot 'schedule-data.js'
$RegistryPath = Join-Path $DataDir  'MAFFL_Owner_Registry.csv'

$ScheduleHeader = 'Year,Week,Tier,Week_Type,Game_Class,Division,Away_Team,Away_Owner,Home_Team,Home_Owner'
$GhostName      = 'MAFFL Ghost'
$AllowedClasses = @('Divisional', 'Open', 'Mirror Match')
$Expected       = @{ Upper = 84; Lower = 70 }

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

# ----------------------------------------------------------------------
# 1. Gold: read + validate both schedule CSVs (CRLF or LF; a Windows
#    checkout carries CRLF, the repo stores LF)
# ----------------------------------------------------------------------
$games = New-Object System.Collections.ArrayList
foreach ($src in @(@{ Tier = 'Upper'; Path = $UpperPath }, @{ Tier = 'Lower'; Path = $LowerPath })) {
    $label = Split-Path -Leaf $src.Path
    if (-not (Test-Path $src.Path)) { Add-Problem "$label not found"; continue }
    $first = ([IO.File]::ReadAllLines($src.Path) | Select-Object -First 1).TrimStart([char]0xFEFF)
    if ($first -cne $ScheduleHeader) { Add-Problem "$label header changed: $first"; continue }
    $ln = 1
    foreach ($r in (Import-Csv -Path $src.Path -Encoding UTF8)) {
        $ln++
        if ($r.Year -cne "$Year")                { Add-Problem "$label line ${ln}: Year '$($r.Year)' (expected $Year)"; continue }
        if ($r.Week -notmatch '^\d{1,2}$')       { Add-Problem "$label line ${ln}: bad Week '$($r.Week)'"; continue }
        if ($r.Tier -cne $src.Tier)              { Add-Problem "$label line ${ln}: Tier '$($r.Tier)' in the $($src.Tier) file"; continue }
        if ($AllowedClasses -cnotcontains $r.Game_Class) { Add-Problem "$label line ${ln}: unknown Game_Class '$($r.Game_Class)'"; continue }
        if ($r.Division -and $r.Game_Class -cne 'Divisional') { Add-Problem "$label line ${ln}: Division '$($r.Division)' on a $($r.Game_Class) game" }
        if (-not $r.Division -and $r.Game_Class -ceq 'Divisional') { Add-Problem "$label line ${ln}: Divisional game with no Division" }
        [void]$games.Add([pscustomobject]@{
            Label = $label; Line = $ln; Week = [int]$r.Week; Tier = $src.Tier
            Class = $r.Game_Class; Division = $r.Division
            Away = $r.Away_Owner; Home = $r.Home_Owner; AwayName = $null; HomeName = $null
        })
    }
}
Stop-IfProblems 'gold'

# ----------------------------------------------------------------------
# 2. Owner identity: exact alias lookup against the registry
# ----------------------------------------------------------------------
$aliasToId  = New-Object 'System.Collections.Generic.Dictionary[string,string]' ([StringComparer]::Ordinal)
$canonById  = @{}
foreach ($r in (Import-Csv -Path $RegistryPath -Encoding UTF8)) {
    foreach ($n in (@($r.canonical_name) + @($r.aliases -split '\|'))) {
        if ([string]::IsNullOrWhiteSpace($n)) { continue }
        if (-not $aliasToId.ContainsKey($n)) { $aliasToId[$n] = $r.owner_id }
        elseif ($aliasToId[$n] -cne $r.owner_id) {
            Add-Problem "registry alias '$n' maps to both $($aliasToId[$n]) and $($r.owner_id)"
        }
    }
    $canonById[$r.owner_id] = $r.canonical_name
}
if ($aliasToId.ContainsKey($GhostName)) { Add-Problem "MAFFL Ghost is in the owner registry; it is not an owner" }

$unresolved = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([StringComparer]::Ordinal)
$respelled  = New-Object 'System.Collections.Generic.Dictionary[string,int]' ([StringComparer]::Ordinal)
foreach ($g in $games) {
    foreach ($side in 'Away', 'Home') {
        $raw = $g.$side
        if ($raw -ceq $GhostName) { $g.($side + 'Name') = $GhostName; continue }
        if (-not $aliasToId.ContainsKey($raw)) {
            if ($unresolved.ContainsKey($raw)) { $unresolved[$raw]++ } else { $unresolved[$raw] = 1 }
            continue
        }
        $name = $canonById[$aliasToId[$raw]]
        $g.($side + 'Name') = $name
        if ($raw -cne $name) {
            $k = "'$raw' -> '$name'"
            if ($respelled.ContainsKey($k)) { $respelled[$k]++ } else { $respelled[$k] = 1 }
        }
    }
}
foreach ($k in $unresolved.Keys) { Add-Problem "owner string '$k' ($($unresolved[$k]) row(s)) is not in the registry -- add it to an aliases list" }
Stop-IfProblems 'registry'

# ----------------------------------------------------------------------
# 3. Shape gates
# ----------------------------------------------------------------------
foreach ($t in 'Upper', 'Lower') {
    $n = @($games | Where-Object { $_.Tier -ceq $t }).Count
    if ($n -ne $Expected[$t]) { Add-Problem "$t has $n fixtures, expected $($Expected[$t])" }
}
$seen = @{}
foreach ($g in $games) {
    if ($g.AwayName -ceq $g.HomeName) { Add-Problem "$($g.Label) line $($g.Line): $($g.AwayName) is scheduled against themselves" }
    foreach ($o in $g.AwayName, $g.HomeName) {
        $k = "$($g.Tier)`t$($g.Week)`t$o"
        if ($seen.ContainsKey($k)) { Add-Problem "$($g.Tier) week $($g.Week): $o is scheduled twice" } else { $seen[$k] = 1 }
    }
}
Stop-IfProblems 'shape'

# ----------------------------------------------------------------------
# 4. schedule-data.js  (week, then tier U first, then source row order)
# ----------------------------------------------------------------------
$sorted = New-Object 'System.Collections.Generic.List[object]'
for ($i = 0; $i -lt $games.Count; $i++) { $games[$i] | Add-Member -NotePropertyName Seq -NotePropertyValue $i; $sorted.Add($games[$i]) }
$sorted.Sort([Comparison[object]]{
    param($x, $y)
    $c = $x.Week.CompareTo($y.Week)
    if ($c -eq 0) { $c = [string]::CompareOrdinal($y.Tier, $x.Tier) }   # 'Upper' before 'Lower'
    if ($c -eq 0) { $c = $x.Seq.CompareTo($y.Seq) }
    $c
})

$nUpper = $Expected.Upper; $nLower = $Expected.Lower
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('/* =====================================================================')
$lines.Add(" * MAFFL SCHEDULE DATA  ($Year regular-season fixtures, both tiers)")
$lines.Add(' * ---------------------------------------------------------------------')
$lines.Add(" * Sources: data/MAFFL_Schedule_${Year}_Upper.csv ($nUpper rows, commissioner-authored)")
$lines.Add(" *          data/MAFFL_Schedule_${Year}_Lower.csv ($nLower rows, one-time ESPN extract)")
$lines.Add(' * FIXTURES ARE NOT RESULTS. This says who is scheduled to meet; it carries')
$lines.Add(' * no scores and no W/L. Records, streaks and ratings come only from played')
$lines.Add(' * results (matchups-data.js). MAFFL Ghost (Lower-Tier bye filler) is kept')
$lines.Add(' * here so the weekly slate is complete; it is not an owner.')
$lines.Add(' * Each game (6 fields):')
$lines.Add(' *   [week, tier, awayOwner, homeOwner, gameClass, division]')
$lines.Add(' *   week      : integer week number (1-14)')
$lines.Add(' *   tier      : "U" = Upper, "L" = Lower')
$lines.Add(' *   awayOwner : registry canonical_name (or "MAFFL Ghost")')
$lines.Add(' *   homeOwner : registry canonical_name (or "MAFFL Ghost")')
$lines.Add(' *   gameClass : "Divisional", "Open" or "Mirror Match" (verbatim Game_Class)')
$lines.Add(' *   division  : Upper division letter on Divisional games, else ""')
$lines.Add(' * Sorted by week, then tier (U first), then source row order.')
$lines.Add(' * Regenerate with build/generate-schedule-data.ps1 -Write; do not hand-edit.')
$lines.Add(' * ===================================================================== */')
$lines.Add('window.SCHEDULE_DATA = {')
$lines.Add("  year: $Year,")
$lines.Add('  games: [')
for ($i = 0; $i -lt $sorted.Count; $i++) {
    $g = $sorted[$i]
    foreach ($s in $g.AwayName, $g.HomeName, $g.Division) {
        if ($s.IndexOfAny([char[]]'"\') -ge 0) { Add-Problem "value needs JS escaping: $s" }
    }
    $row = '    [{0},"{1}","{2}","{3}","{4}","{5}"]' -f $g.Week, $g.Tier.Substring(0, 1), $g.AwayName, $g.HomeName, $g.Class, $g.Division
    if ($i -lt $sorted.Count - 1) { $row += ',' }
    $lines.Add($row)
}
$lines.Add('  ]')
$lines.Add('};')
Stop-IfProblems 'emit'
$jsText = ($lines -join "`n") + "`n"
$jsBytes = Get-EncodedBytes $jsText $Utf8Bom

# ----------------------------------------------------------------------
# 5. Report + write
# ----------------------------------------------------------------------
Write-Host "[gold] Upper $nUpper + Lower $nLower fixtures ($Year), all owner strings resolved; no repeats, no self-pairings." -ForegroundColor Green
foreach ($k in $respelled.Keys) { Write-Host "  Registry-resolved spelling: $k x$($respelled[$k])" -ForegroundColor DarkGray }

$note = "$($sorted.Count) games"
if ((Test-Path $JsPath) -and (Get-Sha ([IO.File]::ReadAllBytes($JsPath))) -eq (Get-Sha $jsBytes)) {
    Write-Host "[schedule-data.js] ROUND-TRIP EXACT -- unchanged ($note)." -ForegroundColor Green
    exit 0
}
$state = if (Test-Path $JsPath) { 'DIFFERS' } else { 'NEW FILE' }
Write-Host "[schedule-data.js] $state -- $note." -ForegroundColor Yellow
if (-not $Write) { Write-Host "check-only (no -Write); nothing written." -ForegroundColor DarkGray; exit 1 }
[IO.File]::WriteAllBytes($JsPath, $jsBytes)
if ((Get-Sha ([IO.File]::ReadAllBytes($JsPath))) -ne (Get-Sha $jsBytes)) { Write-Host "[schedule-data.js] WRITE VERIFY FAILED" -ForegroundColor Red; exit 2 }
Write-Host "[schedule-data.js] WROTE." -ForegroundColor Cyan
exit 1
