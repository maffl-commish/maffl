param([switch]$Quiet)

# Verifies every .html page has the iOS standalone meta tags + the navigation shim.
# Exit 0 = all good. Exit 2 = at least one page is missing something (failures go to stderr
# so the Claude Code PostToolUse hook surfaces them). Pass -Quiet to suppress success output.
$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

$required = @(
  'name="apple-mobile-web-app-capable"',
  'name="mobile-web-app-capable"',
  'name="apple-mobile-web-app-status-bar-style"',
  'name="apple-mobile-web-app-title"',
  'rel="manifest"',
  'navigator.standalone'
)

$failures = @()
Get-ChildItem -Path $dir -Filter *.html | Sort-Object Name | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $missing = @($required | Where-Object { -not $content.Contains($_) })
  if ($missing.Count -gt 0) {
    $failures += ("FAIL  {0}  -> missing: {1}" -f $_.Name, ($missing -join ', '))
  } elseif (-not $Quiet) {
    Write-Host ("ok    " + $_.Name)
  }
}

if ($failures.Count -gt 0) {
  [Console]::Error.WriteLine("iOS STANDALONE CHECK FAILED - these pages will drop out of the app experience:")
  $failures | ForEach-Object { [Console]::Error.WriteLine($_) }
  exit 2
}

if (-not $Quiet) { Write-Host "All pages have the standalone tags + navigation shim." }
exit 0
