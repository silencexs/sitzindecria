$root = "C:\Meus Sites\Policia Federal site"
$prefix = "http://127.0.0.1:8765/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"
$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="application/javascript";
  ".png"="image/png"; ".gif"="image/gif"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg";
  ".svg"="image/svg+xml"; ".woff2"="font/woff2"; ".woff"="font/woff"; ".ttf"="font/ttf";
  ".exe"="application/octet-stream"; ".ico"="image/x-icon"
}
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $reqPath = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($reqPath)) { $reqPath = "index.html" }
  $full = [IO.Path]::GetFullPath((Join-Path $root $reqPath))
  $rootFull = [IO.Path]::GetFullPath($root)
  $res = $ctx.Response
  if (-not $full.StartsWith($rootFull)) {
    $res.StatusCode = 403; $res.Close(); continue
  }
  if ((Test-Path $full) -and (Get-Item $full).PSIsContainer) {
    $full = Join-Path $full "index.html"
  }
  if (Test-Path $full -PathType Leaf) {
    $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
    if ($mime.ContainsKey($ext)) { $res.ContentType = $mime[$ext] } else { $res.ContentType = "application/octet-stream" }
    $bytes = [IO.File]::ReadAllBytes($full)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes("404 $reqPath")
    $res.OutputStream.Write($msg, 0, $msg.Length)
  }
  $res.Close()
}
