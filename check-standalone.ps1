# Verifies every .html page has the iOS standalone meta tags + the navigation shim.
# Exit 0 = all good, Exit 1 = at least one page is missing something.
$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

$required = @(
  'name="apple-mobile-web-app-capable"',
  'name="mobile-web-app-capable"',
  'name="apple-mobile-web-app-status-bar-style"',
  'name="apple-mobile-web-app-title"',
  'navigator.standalone'
)

$fail = $false
Get-ChildItem -Path $dir -Filter *.html | Sort-Object Name | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $missing = @($required | Where-Object { -not $content.Contains($_) })
  if ($missing.Count -gt 0) {
    $fail = $true
    Write-Host ("FAIL  {0}  -> missing: {1}" -f $_.Name, ($missing -join ', '))
  } else {
    Write-Host ("ok    {0}" -f $_.Name)
  }
}

if ($fail) {
  Write-Host ""
  Write-Host "STANDALONE CHECK FAILED - one or more pages will drop out of the iOS app experience."
  exit 1
} else {
  Write-Host ""
  Write-Host "All pages have the standalone tags + navigation shim."
  exit 0
}
