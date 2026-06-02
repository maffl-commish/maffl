# ======================================================================
# maffl-lib.ps1  —  Core library for the MAFFL HQ build pipeline
# ----------------------------------------------------------------------
# Pipeline language: Windows PowerShell 5.1 (only runtime available on
# this machine; no real Python/Node). Provides CSV loading, canonical
# owner-name normalization, shared helpers, and marker-anchored block
# injection used by the per-page generators.
#
# Pure library: dot-source it (`. .\build\maffl-lib.ps1`). It performs
# NO file writes and edits NO pages on its own.
# ======================================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Repo root = parent of this script's folder.
$script:RepoRoot = Split-Path -Parent $PSScriptRoot
$script:DataDir  = Join-Path $RepoRoot 'data'

# ----------------------------------------------------------------------
# CSV loading
# ----------------------------------------------------------------------
# Import-Csv with explicit UTF8 so emoji headers (OVR/Clutch/...) and
# special punctuation round-trip. Handles RFC-4180 quoted multi-line
# fields (co-owner names span two physical lines).
function Read-MafflCsv {
    param([Parameter(Mandatory)][string]$Name)
    $path = Join-Path $DataDir $Name
    if (-not (Test-Path $path)) { throw "CSV not found: $path" }
    # Some packet sheets carry a deliberate blank spacer column; the
    # resulting "missing header" warning is expected and silenced.
    Import-Csv -Path $path -Encoding UTF8 -WarningAction SilentlyContinue
}

# ----------------------------------------------------------------------
# Owner-name normalization
# ----------------------------------------------------------------------
# Canonical form (per live stats.html): single names verbatim; co-owner
# pairs as "Name A / Name B" (slash padded with one space each side).
# Standing alias: "Michael Murello" -> "Mike Murello".
$script:OwnerAliases = @{
    'Michael Murello' = 'Mike Murello'
}

function Normalize-Owner {
    param([string]$Raw)
    if ([string]::IsNullOrWhiteSpace($Raw)) { return $null }
    # Collapse all whitespace (incl. embedded newlines in quoted fields).
    $s = ($Raw -replace '\s+', ' ').Trim()
    if ($s.Contains('/')) {
        $parts = $s.Split('/') | ForEach-Object {
            $p = $_.Trim()
            if ($OwnerAliases.ContainsKey($p)) { $OwnerAliases[$p] } else { $p }
        }
        $s = ($parts -join ' / ')
    } elseif ($OwnerAliases.ContainsKey($s)) {
        $s = $OwnerAliases[$s]
    }
    $s
}

# ----------------------------------------------------------------------
# Canonical owner roster (the 32 units) loaded from the Owners Sheet.
# Returns ordered objects with the published values used as gate truth.
# ----------------------------------------------------------------------
function Get-CanonicalOwners {
    $rows = Read-MafflCsv 'MAFFL_Owners_Sheet_revised.csv'
    $out = New-Object System.Collections.ArrayList
    foreach ($r in $rows) {
        $name = Normalize-Owner $r.Owners
        if (-not $name) { continue }
        $bal = $null
        if (-not [string]::IsNullOrWhiteSpace($r.'Current Credit Balance')) {
            $bal = [double]$r.'Current Credit Balance'
        }
        # OVR/Clutch/Grind/Heat have emoji headers; read positionally
        # (col indices 13-16) to keep this script ASCII-only.
        $vals = @($r.PSObject.Properties.Value)
        [void]$out.Add([pscustomobject]@{
            name     = $name
            active   = ($r.'Active?' -eq 'Y')
            years    = [int]$r.'Total Years (From 2002)'
            champ    = [int]$r.'Total Championships (From 2002)'
            runner   = [int]$r.'Total Runner-Ups (From 2005)'
            playoff  = [int]$r.'Total Playoff Appearances (From 2005)'
            div      = [int]$r.'Division Titles (From 2013)'
            wins     = [int]$r.'Total Regular Season Wins (From 2005)'
            losses   = [int]$r.'Total Regular Season Loss (From 2005)'
            ties     = [int]$r.'Total Regular Season Tie (From 2005)'
            winPct   = ($r.'Career Win % (From 2005)').Trim()
            rank     = [int]$r.'2026 Power Ranking'
            ovr      = [int]$vals[13]
            clutch   = [int]$vals[14]
            grind    = [int]$vals[15]
            heat     = [int]$vals[16]
            balance  = $bal
            league26 = ($r.'2026 League').Trim()
        })
    }
    $out
}

# Build a fast lookup set of canonical names.
function Get-CanonicalNameSet {
    $set = New-Object System.Collections.Generic.HashSet[string]
    foreach ($o in (Get-CanonicalOwners)) { [void]$set.Add($o.name) }
    $set
}

# ----------------------------------------------------------------------
# Credit_Log sentinel rows
# ----------------------------------------------------------------------
# The source sheet carries placeholder rows (Team "#N/A", blank Credit
# Type, amount 0, Note "Keep this line to avoid null values...") whose
# only purpose is to stop null errors in its Credit Detail view. They
# are not real owners/transactions and net to zero. Skip them.
function Test-CreditSentinelRow {
    param([Parameter(Mandatory)]$Row)
    return ($Row.Notes -like 'Keep this line to avoid null values*')
}

# Credit_Log with sentinel rows removed (use everywhere credits matter).
function Read-CreditLog {
    @(Read-MafflCsv 'Credit_Log.csv' | Where-Object { -not (Test-CreditSentinelRow $_) })
}

# ----------------------------------------------------------------------
# Numeric helpers
# ----------------------------------------------------------------------
# Parse a "7.0"-style float field to int; blank -> $null (sentinel for
# unknown, e.g. 2007 draft prices, 2002-04 blank W/L/T).
function ConvertTo-IntOrNull {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return $null }
    [int][double]$Value
}
# Same but blank -> 0 (for additive stat columns where blank means none).
function ConvertTo-IntZero {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return 0 }
    [int][double]$Value
}

# Parse a packet dollar string like " $ 386 ", " $ (286)", " $ -   ",
# "$2,100" into a signed integer dollar amount. Parens = negative.
function ConvertTo-Dollars {
    param([string]$Value)
    if ($null -eq $Value) { return 0 }
    $s = $Value.Trim()
    if ($s -eq '' ) { return 0 }
    # Accounting-style negative: parentheses anywhere, e.g. " $ (286)".
    $neg = $false
    if ($s -match '\(') { $neg = $true }
    $digits = ($s -replace '[^0-9]', '')
    if ($digits -eq '') { return 0 }   # " $ -   " => 0
    $n = [int]$digits
    if ($neg) { -$n } else { $n }
}

# ----------------------------------------------------------------------
# Marker-anchored block injection (used by page generators, Steps 2+).
# Replaces the text strictly BETWEEN $StartMarker and $EndMarker with
# $NewBody, leaving the markers themselves intact. Fails loudly if the
# markers are missing or ambiguous — never guesses.
# ----------------------------------------------------------------------
function Set-BlockBetweenMarkers {
    param(
        [Parameter(Mandatory)][string]$Content,
        [Parameter(Mandatory)][string]$StartMarker,
        [Parameter(Mandatory)][string]$EndMarker,
        [Parameter(Mandatory)][string]$NewBody
    )
    $sIdx = $Content.IndexOf($StartMarker)
    if ($sIdx -lt 0) { throw "Start marker not found: $StartMarker" }
    if ($Content.IndexOf($StartMarker, $sIdx + $StartMarker.Length) -ge 0) {
        throw "Start marker is ambiguous (appears more than once): $StartMarker"
    }
    $bodyStart = $sIdx + $StartMarker.Length
    $eIdx = $Content.IndexOf($EndMarker, $bodyStart)
    if ($eIdx -lt 0) { throw "End marker not found after start: $EndMarker" }
    $Content.Substring(0, $bodyStart) + $NewBody + $Content.Substring($eIdx)
}

# Read a whole file as one string preserving its exact bytes/newlines.
function Read-TextRaw {
    param([Parameter(Mandatory)][string]$Path)
    [System.IO.File]::ReadAllText($Path)
}
