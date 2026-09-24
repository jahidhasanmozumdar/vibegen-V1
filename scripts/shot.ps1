# Screenshot a local page with headless Edge for visual review.
# Usage: powershell -File scripts/shot.ps1 -Path /pricing -Name pricing [-Width 1440] [-Height 4000]
# Output: .data/shots/<Name>-<Width>.png (gitignored)
param(
  [Parameter(Mandatory = $true)][string]$Path,
  [Parameter(Mandatory = $true)][string]$Name,
  [int]$Width = 1440,
  [int]$Height = 4000,
  [string]$Base = "http://localhost:3100"
)

$out = Join-Path $PSScriptRoot "..\.data\shots"
New-Item -ItemType Directory -Force $out | Out-Null
$file = Join-Path (Resolve-Path $out) "$Name-$Width.png"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$profile = Join-Path $env:TEMP "vg-edge-$Width-$Name"

$args = @(
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  "--user-data-dir=$profile", "--window-size=$Width,$Height",
  "--virtual-time-budget=6000", "--screenshot=$file", "$Base$Path"
)
Start-Process -FilePath $edge -ArgumentList $args -Wait -WindowStyle Hidden
Write-Output $file
