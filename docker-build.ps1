# CodemapOS Docker Container Build - PowerShell Version
# Builds Electron installer in Docker container
# Usage: .\docker-build.ps1 -CertFile "cert.pfx" -CertPassword "password"

param(
    [Parameter(Mandatory=$false)]
    [string]$CertFile = "",
    
    [Parameter(Mandatory=$false)]
    [string]$CertPassword = ""
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        CodemapOS - Docker Container Build System          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "`n[1/4] Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Step 2: Build Docker image
Write-Host "`n[2/4] Building Docker image..." -ForegroundColor Yellow
Push-Location $ScriptRoot
docker build -t codemap-os:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker image built" -ForegroundColor Green

# Step 3: Run builder container
Write-Host "`n[3/4] Building CodemapOS installer..." -ForegroundColor Yellow

if ($CertFile -and (Test-Path $CertFile)) {
    Write-Host "🔐 Code signing enabled" -ForegroundColor Green
    $CertPath = (Get-Item $CertFile).FullName
    
    docker run `
        --rm `
        -v "${ScriptRoot}/dist:/dist" `
        -e "WIN_CERT_FILE=/app/cert.pfx" `
        -e "WIN_CERT_PASSWORD=$CertPassword" `
        -v "${CertPath}:/app/cert.pfx:ro" `
        codemap-os:latest
} else {
    Write-Host "⏭️  Skipping code signing" -ForegroundColor Yellow
    docker run `
        --rm `
        -v "${ScriptRoot}/dist:/dist" `
        codemap-os:latest
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build complete" -ForegroundColor Green

# Step 4: Show results
Write-Host "`n[4/4] Build Results" -ForegroundColor Yellow

$distPath = "$ScriptRoot/dist"
if (Test-Path $distPath) {
    Write-Host "📦 Installers created:" -ForegroundColor Green
    Get-ChildItem $distPath -Include *.exe, *.msi, *.yml | ForEach-Object {
        $sizeInMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  • $($_.Name) ($sizeInMB MB)" -ForegroundColor Green
    }
    
    Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Test installer: $distPath\CodemapOS-Setup-*.exe"
    Write-Host "  2. Create GitHub release and upload artifacts"
    Write-Host "  3. Share installer link with users"
} else {
    Write-Host "⚠️  No dist/ directory found" -ForegroundColor Yellow
}

Write-Host "`n🎉 Docker build complete!" -ForegroundColor Green
Pop-Location
