# Build and create deploy.zip for Hostinger upload
Write-Host "Building..." -ForegroundColor Cyan
npx vite build
if (-not $?) { exit 1 }

Write-Host "Creating deploy.zip..." -ForegroundColor Cyan
if (Test-Path deploy.zip) { Remove-Item deploy.zip }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory('dist', 'deploy.zip', [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "Done! Upload deploy.zip to Hostinger and extract into public_html/" -ForegroundColor Green
