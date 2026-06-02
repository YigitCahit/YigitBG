# YigitBG - Manuel Enjeksiyon Kaldirici (Windows / Discord Stable)
#
# discord_desktop_core\index.js icindeki inject.js require(...) satirini siler.
# BetterDiscord veya diger satirlara DOKUNMAZ.
#
# Calistirma:
#   powershell -ExecutionPolicy Bypass -File .\uninstall.ps1

$ErrorActionPreference = "Stop"

$injectPath = Join-Path $PSScriptRoot "inject.js"
$injectPathForward = ($injectPath -replace '\\', '/')

$discordRoot = Join-Path $env:LOCALAPPDATA "Discord"
if (-not (Test-Path $discordRoot)) {
	Write-Error "Discord bulunamadi: $discordRoot"
}

$appDir = Get-ChildItem -Path $discordRoot -Directory -Filter "app-*" |
	Sort-Object Name -Descending | Select-Object -First 1
if (-not $appDir) {
	Write-Error "app-* klasoru bulunamadi: $discordRoot"
}

$modulesDir = Join-Path $appDir.FullName "modules"
$indexFiles = Get-ChildItem -Path $modulesDir -Recurse -Filter "index.js" |
	Where-Object { $_.FullName -match "discord_desktop_core" }

$changed = 0
foreach ($f in $indexFiles) {
	$lines = Get-Content -Path $f.FullName
	$filtered = $lines | Where-Object { $_ -notlike "*$injectPathForward*" }
	if ($filtered.Count -ne $lines.Count) {
		Set-Content -Path $f.FullName -Value $filtered -Encoding UTF8
		Write-Host "Kaldirildi: $($f.FullName)"
		$changed++
	} else {
		Write-Host "Satir yok:  $($f.FullName)"
	}
}

Write-Host ""
Write-Host "Bitti ($changed dosya guncellendi). Discord'u yeniden baslatin."
