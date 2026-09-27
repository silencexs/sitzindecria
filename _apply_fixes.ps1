$ErrorActionPreference = "Stop"
$root = "C:\Meus Sites\Policia Federal site"
$site = Join-Path $root "pcesp.duckdns.org"

# --- CSS: Font Awesome webfonts ---
$faCss = Join-Path $root "cdnjs.cloudflare.com\ajax\libs\font-awesome\6.5.1\css\all.min.css"
$fa = Get-Content -Raw -Encoding UTF8 $faCss
$fa = $fa.Replace("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/", "../webfonts/")
Set-Content -Path $faCss -Value $fa -Encoding UTF8
Write-Host "Patched Font Awesome CSS"

# --- CSS: style.css ---
$stylePath = Join-Path $site "css\style.css"
$style = Get-Content -Raw -Encoding UTF8 $stylePath
$style = [regex]::Replace($style, '@import url\(https://fonts\.googleapis\.com/css2\?[^)]+\);', '@import url(google-fonts.css);')
$style = $style.Replace('url("/assets/', 'url("../assets/')
$style = $style.Replace("url('/assets/", "url('../assets/")
$style = $style.Replace('url(/assets/', 'url(../assets/')
Set-Content -Path $stylePath -Value $style -Encoding UTF8
Write-Host "Patched style.css"

# --- CSS: codigo-penal.css ---
$penalPath = Join-Path $site "css\codigo-penal.css"
$penal = Get-Content -Raw -Encoding UTF8 $penalPath
$penal = [regex]::Replace($penal, '@import url\(https://fonts\.googleapis\.com/css2\?[^)]+\);', '@import url(google-fonts.css);')
Set-Content -Path $penalPath -Value $penal -Encoding UTF8
Write-Host "Patched codigo-penal.css"

# --- login.html from snippet ---
$snippet = Get-Content -Raw -Encoding UTF8 (Join-Path $root "_login_snippet.txt")
$snippet = $snippet -replace '\./Autentica[^\s"]+_files/logo\.png', 'assets/logo.png'
$snippet = $snippet.Replace('https://pcesp.duckdns.org/perfil', 'espelho-indisponivel.html')
$snippet = $snippet.Replace('https://pcesp.duckdns.org/privacidade', 'privacidade.html')
$snippet = $snippet.Replace('https://pcesp.duckdns.org/download', 'download.html')
$snippet = $snippet.Replace('https://pcesp.duckdns.org/', 'index.html')

$loginHtml = @"
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Autenticação de Servidores — Polícia Civil SP · Legacy Roleplay</title>
  <link rel="icon" type="image/png" sizes="32x32" href="assets/logo.png">
  <link rel="icon" type="image/png" sizes="16x16" href="assets/logo.png">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/logo.png">
  <link rel="shortcut icon" type="image/png" href="assets/logo.png">
  <meta name="theme-color" content="#002b66">
  <link rel="stylesheet" href="../cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/account-access.css">
  <script src="js/offline-paths.js"></script>
  <script src="js/security-guardeb77.js?v=4.6"></script>
</head>
<body>
  <div id="site-header-placeholder"></div>
  $snippet
  <div id="site-footer-placeholder"></div>
  <script src="js/api.js"></script>
  <script src="js/header.js"></script>
  <script src="js/main.js"></script>
  <script src="js/login.js"></script>
  <script src="js/account-access.js"></script>
  <script>function switchLoginTab(t){document.getElementById("tab-login").classList.toggle("active","login"===t);document.getElementById("tab-cadastro").classList.toggle("active","cadastro"===t);document.getElementById("tab-login-btn").classList.toggle("active","login"===t);document.getElementById("tab-cadastro-btn").classList.toggle("active","cadastro"===t);}</script>
</body>
</html>
"@
[System.IO.File]::WriteAllText((Join-Path $site "login.html"), $loginHtml, [System.Text.UTF8Encoding]::new($false))
Write-Host "Wrote login.html"

# --- Patch all HTML pages ---
Get-ChildItem (Join-Path $site "*.html") | ForEach-Object {
  $html = Get-Content -Raw -Encoding UTF8 $_.FullName
  $orig = $html

  $html = [regex]::Replace($html, '<link rel="preconnect" href="https://fonts\.googleapis\.com/"?\s*/?>', '')
  $html = [regex]::Replace($html, '<link rel="preconnect" href="https://fonts\.gstatic\.com/"[^>]*>', '')
  $html = [regex]::Replace($html, '<link href="https://fonts\.googleapis\.com/css2\?[^"]+" rel="stylesheet"\s*/?>', '')
  $html = [regex]::Replace($html, '<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?[^"]+"\s*/?>', '')

  if ($html -notmatch 'js/offline-paths\.js') {
    if ($html -match '<script src="js/security-guardeb77\.js') {
      $html = $html.Replace('<script src="js/security-guardeb77.js', '<script src="js/offline-paths.js"></script> <script src="js/security-guardeb77.js')
    } elseif ($html -match '</head>') {
      $html = $html.Replace('</head>', '<script src="js/offline-paths.js"></script></head>')
    }
  }

  if ($html -ne $orig) {
    [System.IO.File]::WriteAllText($_.FullName, $html, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Patched HTML $($_.Name)"
  } else {
    Write-Host "No HTML change $($_.Name)"
  }
}

# cleanup helper files
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $root "_scan_paths.py")
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $root "_scan_paths.ps1")
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $root "_login_snippet.txt")
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $site "css\google-fonts-raw.css")
Write-Host "DONE"
