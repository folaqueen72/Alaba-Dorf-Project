# Rebuilds the Alaba Dorf debug APK on Windows. Run from the repo root:
#   powershell -ExecutionPolicy Bypass -File build-apk.ps1
# Prerequisites (one-time, portable, no admin):
#   - Node 22+ on PATH, Java 17+ (JAVA_HOME), Android SDK (ANDROID_HOME)
# Produces: APK\AlabaDorf-debug.apk (debug-signed, for testing only)
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Web = Join-Path $Root "Alaba Dorf Project\web"
if (-not (Test-Path $Web)) { $Web = Join-Path $Root "web" }

if (-not $env:JAVA_HOME) { throw "JAVA_HOME is not set. Install a JDK 17+ and set JAVA_HOME." }
if (-not $env:ANDROID_HOME) {
  $fallback = "$env:LOCALAPPDATA\Android\Sdk"
  if (Test-Path $fallback) { $env:ANDROID_HOME = $fallback } else { throw "ANDROID_HOME is not set." }
}
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

Set-Location $Web
Write-Output "Syncing web assets..."
npx cap sync android

Write-Output "Building debug APK (first run downloads Gradle)..."
Set-Location (Join-Path $Web "android")
.\gradlew.bat assembleDebug --console=plain
if ($LASTEXITCODE -ne 0) { throw "Gradle build failed." }

$src = Join-Path $Web "android\app\build\outputs\apk\debug\app-debug.apk"
$OutDir = Join-Path $Root "APK"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$dest = Join-Path $OutDir "AlabaDorf-debug.apk"
Copy-Item $src $dest -Force
$hash = (Get-FileHash $dest -Algorithm SHA256).Hash
$mb = [math]::Round((Get-Item $dest).Length / 1MB, 2)
Write-Output "APK: $dest"
Write-Output "Size: ${mb} MB"
Write-Output "SHA-256: $hash"
