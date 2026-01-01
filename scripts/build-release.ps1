# PowerShell setup and build script for commercial CodemapOS distribution
# This script handles certificate setup, code signing, and building the installer

param(
    [Parameter(Mandatory=$false)]
    [string]$Version = "1.0.0",
    
    [Parameter(Mandatory=$false)]
    [string]$CertPath = "",
    
    [Parameter(Mandatory=$false)]
    [string]$CertPassword = ""
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptRoot

Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CodemapOS - Commercial Build and Release Pipeline      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Check prerequisites
Write-Host "`n[1/5] Checking prerequisites..." -ForegroundColor Yellow

$checks = @(
    @{ Name = "Node.js"; Command = "node --version" },
    @{ Name = "npm"; Command = "npm --version" },
    @{ Name = "Python"; Command = "python --version" },
    @{ Name = "Git"; Command = "git --version" }
)

foreach ($check in $checks) {
    try {
        $result = Invoke-Expression $check.Command 2>&1
        Write-Host "  ✓ $($check.Name): $($result.ToString().Trim())" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $($check.Name) not found. Please install it." -ForegroundColor Red
        exit 1
    }
}

# Step 2: Install dependencies
Write-Host "`n[2/5] Installing npm dependencies..." -ForegroundColor Yellow
Push-Location $ProjectRoot
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

# Step 3: Prepare certificate (optional)
if ($CertPath -and (Test-Path $CertPath)) {
    Write-Host "`n[3/5] Setting up code signing certificate..." -ForegroundColor Yellow
    
    # Copy cert to scripts directory
    Copy-Item $CertPath "$ScriptRoot\cert.pfx" -Force
    
    # Set environment variables
    $env:WIN_CERT_FILE = "$ScriptRoot\cert.pfx"
    $env:WIN_CERT_PASSWORD = $CertPassword
    
    Write-Host "  ✓ Certificate configured" -ForegroundColor Green
} else {
    Write-Host "`n[3/5] Skipping code signing (no certificate provided)" -ForegroundColor Yellow
    Write-Host "  To sign your app, provide: -CertPath 'path\to\cert.pfx' -CertPassword 'password'"
}

# Step 4: Build the application
Write-Host "`n[4/5] Building Electron application..." -ForegroundColor Yellow
npm run electron-build-win
if ($LASTEXITCODE -ne 0) { 
    Write-Host "  ✗ Build failed" -ForegroundColor Red
    exit 1 
}

# Step 5: Output results
Write-Host "`n[5/5] Build complete!" -ForegroundColor Yellow

$distPath = "$ProjectRoot\dist"
if (Test-Path $distPath) {
    Write-Host "`n📦 Build artifacts:" -ForegroundColor Cyan
    Get-ChildItem $distPath -Include *.exe, *.msi, *.zip | ForEach-Object {
        $sizeInMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  • $($_.Name) ($($sizeInMB) MB)" -ForegroundColor Green
    }
}

Write-Host "`n✨ Your CodemapOS installer is ready for distribution!" -ForegroundColor Green
Write-Host "`n📋 Distribution checklist:" -ForegroundColor Cyan
Write-Host "  ☐ Test installer on clean Windows machine"
Write-Host "  ☐ Verify all features work (license, file ACL, functions, etc.)"
Write-Host "  ☐ Get antivirus clearance for .exe and .msi"
Write-Host "  ☐ Create GitHub releases for auto-update distribution"
Write-Host "  ☐ Set up license server for key validation"
Write-Host "  ☐ Publish to Windows Store (optional)"
Write-Host ""

Pop-Location
