# CodemapOS - Command Reference

Quick reference for all npm scripts and commands.

## Development

```bash
# Install everything
npm install

# Run dev mode (React + Electron hot-reload)
npm run dev

# Run just React UI (http://localhost:3000)
npm run react-dev

# Run just Electron (connect to existing React dev server)
npm run electron-dev
```

## Building

```bash
# Build Windows installer (EXE + MSI)
npm run electron-build-win

# Build all platforms (Windows, Mac, Linux)
npm run electron-build-all

# Just build react (no installer)
npm run react-build

# Show build without creating installer
npm run pack
```

## Releasing

```bash
# Build and publish to GitHub releases
npm run release

# Custom release with version and notes
node scripts/release.js --version 1.0.0 --notes "New features"
```

## Testing

```bash
# Run React tests
npm run test
```

## Code Signing (Advanced)

```powershell
# Set certificate environment variables
$env:WIN_CERT_FILE = "C:\path\to\cert.pfx"
$env:WIN_CERT_PASSWORD = "your_password"

# Build with signing
npm run electron-build-win

# Manual signing (if needed)
signtool sign /f cert.pfx /p PASSWORD /fd sha256 /tr http://timestamp.comodoca.com/rfc3161 dist/CodemapOS.exe
```

## PowerShell Build Script

```powershell
# Basic build
.\scripts\build-release.ps1

# Build with code signing
.\scripts\build-release.ps1 -Version "1.0.0" -CertPath "cert.pfx" -CertPassword "password"
```

## Python Commands

```bash
# Test Python host directly
python python/host.py

# Run auto-indexer on your code
python -m codemap_dna_tesseract.runtime.auto_indexer

# Run installer
python src/installer.py
```

## File Locations

```
Build output:     dist/
Installed files:  C:\Program Files\CodemapOS\
AppData files:    %APPDATA%\CodemapOS\
  ├── library/
  ├── processes/
  ├── files/
  └── data/
```

## Environment Variables

```powershell
# For code signing
$env:WIN_CERT_FILE = "path/to/cert.pfx"
$env:WIN_CERT_PASSWORD = "password"

# For GitHub releases
$env:GH_TOKEN = "github_personal_access_token"

# For auto-update (GitHub)
$env:UPDATE_PROVIDER = "github"
```

## Troubleshooting Commands

```bash
# Check npm version
npm --version

# Check node version
node --version

# Audit security
npm audit

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install

# View electron-builder config
npm run dist -- -c
```

## GitHub Release Commands

```bash
# Install GitHub CLI
brew install gh  # macOS
choco install gh # Windows
scoop install gh # Windows

# Login
gh auth login

# Create release
gh release create v1.0.0 -t "Version 1.0.0" -n "Release notes" dist/CodemapOS*.exe dist/CodemapOS*.msi

# List releases
gh release list

# Delete release
gh release delete v1.0.0
```

## CI/CD (GitHub Actions)

Create `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run electron-build-win
      - uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist/
```

## Package Info

```bash
# Check installed version
npm list

# Check for updates
npm outdated

# Update all packages
npm update

# Specific package version
npm install package@version
```

## Performance Profiling

```bash
# Profile Electron main process
npm run electron-dev -- --inspect

# Profile React bundle
npm run react-build -- --analyze

# Measure build time
time npm run electron-build-win
```

---

For detailed guides, see:
- **ELECTRON_QUICK_START.md** - Development and testing
- **COMMERCIAL_DEPLOYMENT.md** - Production deployment
- **COMMERCIAL_README.md** - Overview and customization
