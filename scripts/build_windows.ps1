Param(
    [string]$VenvPath = ".venv",
    [string]$ExeName = "CodemapOS",
    [string]$SrcDir = "src"
)

Write-Host "Building Windows EXE for Codemap..."

# Create venv if missing
if (-not (Test-Path $VenvPath)) {
    py -3 -m venv $VenvPath
}

# Activate venv for this script
& $VenvPath\Scripts\Activate.ps1

python -m pip install --upgrade pip
python -m pip install pyinstaller

Push-Location $SrcDir

# Build single-file exe from entrypoint.py
pyinstaller --onefile --name $ExeName entrypoint.py

Pop-Location

if (Test-Path "$SrcDir\dist\$ExeName.exe") {
    $target = "build"
    if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target | Out-Null }
    Copy-Item -Path "$SrcDir\dist\$ExeName.exe" -Destination $target -Force
    Write-Host "Built: $target\$ExeName.exe"
} else {
    Write-Error "Build failed: EXE not found"
}
