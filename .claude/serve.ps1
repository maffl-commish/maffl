param([int]$Port = 8777)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$Port/"
$mime = @{ ".html"="text/html"; ".css"="text/css"; ".js"="application/javascript"; ".png"="image/png"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml"; ".json"="application/json" }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart("/"))
  if ([string]::IsNullOrEmpty($path)) { $path = "prize.html" }
  $file = Join-Path $root $path
  try {
    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $ct
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $ctx.Response.ContentLength64 = 0
    }
  } catch {}
  $ctx.Response.Close()
}
