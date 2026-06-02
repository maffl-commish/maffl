# ======================================================================
# build.ps1  --  MAFFL HQ build orchestrator
# ----------------------------------------------------------------------
# Runs validate() FIRST (validate-before-write), then each page
# generator. Check-only by default; pass -Write to inject.
#
#   build\build.ps1            # validate + prove every page round-trips
#   build\build.ps1 -Write     # validate, then write any changed page
#
# Skipped by commissioner decision / missing source:
#   power-rankings.html  -- no Power_Rankings source CSV yet (#6)
#   rules.html           -- fully manual; handled by corrections (#3)
#   weekly.html + standalone -- separate in-season task
# ======================================================================
param([switch]$Write)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$ps   = 'powershell.exe'   # Windows PowerShell 5.1 host

function Invoke-Step {
    param([string]$Label, [string]$Script, [switch]$PassWrite)
    Write-Host ""
    Write-Host ">>> $Label" -ForegroundColor Magenta
    $cliArgs = @('-ExecutionPolicy','Bypass','-File',(Join-Path $here $Script))
    if ($PassWrite -and $Write) { $cliArgs += '-Write' }
    # Pass child output through to the host; return ONLY the exit code
    # (a bare `& ...` would fold the child's stdout into the return value).
    & $ps @cliArgs 2>&1 | Out-Host
    return $LASTEXITCODE
}

$fail = 0

# 1. Validate gates first -- never write if the data doesn't reconcile.
if ((Invoke-Step -Label 'validate() -- 8 gates' -Script 'validate.ps1') -ne 0) {
    Write-Host "`nABORT: validation failed; no pages generated." -ForegroundColor Red
    exit 1
}

# 2. Page generators (round-trip-proven).
$gens = @(
    @{ label='stats.html  OWNERS[]';                 script='gen-stats.ps1'   },
    @{ label='history.html CSV blocks';              script='gen-history.ps1' },
    @{ label='draft.html  OWNERS/CHAMPS/PICKS (+2007 fix)'; script='gen-draft.ps1' },
    @{ label='credits.html balances + REGISTRY_DATA'; script='gen-credits.ps1' },
    @{ label='prize.html  dues_2026 + payout verify'; script='gen-prize.ps1'  }
)
foreach ($g in $gens) {
    if ((Invoke-Step -Label $g.label -Script $g.script -PassWrite) -ne 0) { $fail++ }
}

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
if ($fail -eq 0) {
    Write-Host "BUILD OK -- validate 8/8; all 5 generated pages round-trip clean." -ForegroundColor Green
    Write-Host "Skipped (by decision/missing source): power-rankings, rules, weekly." -ForegroundColor DarkGray
} else {
    Write-Host "BUILD: $fail generator(s) reported differences -- review output above." -ForegroundColor Red
}
Write-Host "====================================================================" -ForegroundColor Cyan
exit $fail
