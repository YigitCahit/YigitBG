# YigitBG - Manuel Enjeksiyon Kurucu (Windows / Discord Stable)
#
# En guncel Discord surumunun discord_desktop_core\index.js dosyasini bulur ve
# bu klasordeki inject.js'i yukleyen require(...) satirini ekler.
# Zaten ekliyse tekrar eklemez (idempotent).
#
# Discord her guncellendiginde yeni bir app-* klasoru olusturdugu icin
# bu betigi guncellemeden sonra tekrar calistirmaniz gerekir.
#
# Calistirma:
#   powershell -ExecutionPolicy Bypass -File .\install.ps1

$ErrorActionPreference = "Stop"

# inject.js'in tam yolu (bu betikle ayni klasorde)
$injectPath = Join-Path $PSScriptRoot "inject.js"
if (-not (Test-Path $injectPath)) {
	Write-Error "inject.js bulunamadi: $injectPath"
}
$injectPathForward = ($injectPath -replace '\\', '/')
$requireLine = 'require("' + $injectPathForward + '");'

# Discord Stable kurulum koku
$discordRoot = Join-Path $env:LOCALAPPDATA "Discord"
if (-not (Test-Path $discordRoot)) {
	Write-Error "Discord bulunamadi: $discordRoot"
}

# En guncel app-* klasoru
$appDir = Get-ChildItem -Path $discordRoot -Directory -Filter "app-*" |
	Sort-Object Name -Descending | Select-Object -First 1
if (-not $appDir) {
	Write-Error "app-* klasoru bulunamadi: $discordRoot"
}

# discord_desktop_core icindeki index.js dosyalari
$modulesDir = Join-Path $appDir.FullName "modules"
$indexFiles = Get-ChildItem -Path $modulesDir -Recurse -Filter "index.js" |
	Where-Object { $_.FullName -match "discord_desktop_core" }

if (-not $indexFiles) {
	Write-Error "discord_desktop_core\index.js bulunamadi: $modulesDir"
}

$changed = 0
foreach ($f in $indexFiles) {
	$content = Get-Content -Path $f.FullName -Raw
	if ($content -like "*$injectPathForward*") {
		Write-Host "Zaten kurulu: $($f.FullName)"
		continue
	}
	# require satirini dosyanin basina ekle (core.asar'dan once calismasi icin)
	$new = $requireLine + "`r`n" + $content
	Set-Content -Path $f.FullName -Value $new -NoNewline -Encoding UTF8
	Write-Host "Kuruldu:    $($f.FullName)"
	$changed++
}

Write-Host ""
Write-Host "Bitti ($changed dosya guncellendi)."
Write-Host "Discord'u tamamen kapatip (sistem tepsisinden de cikis yapip) yeniden acin."
