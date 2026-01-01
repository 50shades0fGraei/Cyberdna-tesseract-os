# CodemapOS - Commercial Edition Quick Start

## What's Included

A production-ready Electron + React + Python application designed for commercial distribution:

✨ **Features**
- Modern React UI with function library management
- Electron auto-updater with GitHub releases
- License activation on first launch
- Code signing support (EV certificates)
- NSIS + MSI Windows installers
- Python backend sandbox with JSON-RPC bridge
- Complete monetization infrastructure

---

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd c:\Users\randall\Documents\Cyberdna-tesseract-os

# Install Node.js dependencies
npm install

# Install Python dependencies (if needed)
pip install -r requirements.txt
```

### 2. Run in Development Mode

```bash
# Terminal 1: Start React dev server
npm run react-dev

# Terminal 2: Start Electron (in new terminal, wait for React to load)
npm run electron-dev
```

The app will:
- Load React dashboard on `http://localhost:3000`
- Show license activation screen on first run
- For testing: use any key like `TEST-KEY-12345` with licensee name `Test User`

### 3. Build Commercial Installer

Without code signing:
```bash
npm run electron-build-win
# Creates: dist/CodemapOS-Setup-1.0.0.exe
```

With code signing (requires EV certificate):
```powershell
$env:WIN_CERT_FILE = "C:\path\to\cert.pfx"
$env:WIN_CERT_PASSWORD = "your_password"

npm run electron-build-win
```

Or use the build script:
```powershell
.\scripts\build-release.ps1 -Version "1.0.0" -CertPath "cert.pfx" -CertPassword "password"
```

---

## Project Structure

```
.
├── electron/
│   ├── main.js                  # Electron main process (IPC, menu, licensing)
│   ├── preload.js              # Security: context isolation
│   ├── pythonBridge.js         # Spawn and communicate with Python host
│   └── customSign.js           # Code signing script
│
├── src/
│   ├── App.js                  # Main React component
│   ├── App.css                 # Styling
│   └── components/
│       ├── FunctionLibrary.js  # Browse & call functions
│       ├── DataBindings.js     # Manage data→function binding
│       ├── FileACL.js          # File access control rules
│       ├── ProcessMapper.js    # Process→function routing
│       ├── LicenseActivation.js # License key entry
│       └── Stats.js            # Performance metrics
│
├── python/
│   └── host.py                 # JSON-RPC host (Electron bridge)
│
├── scripts/
│   ├── customSign.js           # Code signing (EV certificates)
│   ├── release.js              # Release automation
│   └── build-release.ps1       # PowerShell build pipeline
│
├── package.json                # npm + electron-builder config
├── COMMERCIAL_DEPLOYMENT.md    # Full monetization guide
└── ...
```

---

## Key Files

### electron/main.js
- Creates BrowserWindow
- Sets up IPC handlers for functions, data, ACL, processes
- Checks license on startup
- Manages auto-updater

### src/App.js
- Main UI container with tab navigation
- License check on load

### python/host.py
- JSON-RPC bridge to Python runtime
- Handles all backend requests (functions, ACL, bindings)

### package.json
- Electron-builder config for NSIS/MSI/EXE
- Code signing configuration
- GitHub auto-update configuration
- All npm scripts

---

## Customization

### Change Product Name
Edit `package.json`:
```json
"build": {
  "productName": "Your App Name",
  "appId": "com.yourdomain.appname"
}
```

### Add Company Branding
```json
"nsis": {
  "installerIcon": "assets/your-icon.ico",
  "uninstallerIcon": "assets/your-icon.ico"
}
```

### Implement License Server

Replace test validation in `electron/main.js`:

```javascript
ipcMain.handle('activate-license', async (event, licenseKey, licensee) => {
  const response = await fetch('https://your-server.com/validate', {
    method: 'POST',
    body: JSON.stringify({ licenseKey, licensee })
  });
  const data = await response.json();
  
  if (data.valid) {
    store.set('licenseKey', licenseKey);
    store.set('licensee', licensee);
    return { success: true };
  }
  return { success: false, error: data.error };
});
```

---

## Code Signing for Distribution

### Get EV Certificate
Providers: Sectigo, DigiCert, GlobalSign  
Cost: ~$200-400/year  
Time: 1-2 days to validate

### Test Signing
```bash
signtool sign /f cert.pfx /p PASSWORD /fd sha256 /tr http://timestamp.comodoca.com/rfc3161 dist/CodemapOS.exe
```

### Automated in Build
Set environment variables:
```powershell
$env:WIN_CERT_FILE = "cert.pfx"
$env:WIN_CERT_PASSWORD = "yourpassword"
npm run electron-build-win
```

---

## Testing the Build

1. **Test installer**: Run `dist/CodemapOS-Setup-1.0.0.exe`
2. **Enter license**: Use any key + name (accepts anything for now)
3. **Test features**:
   - Click through tabs (functions, bindings, ACL, etc.)
   - Try calling a function
   - View stats
4. **Uninstall**: Control Panel → Programs

---

## Auto-Updates

### Setup GitHub Releases

1. Create repo: `50shades0fgraei/codemap-os-releases`
2. Generate token: GitHub Settings → Developer Settings → Personal Tokens
3. Create release with signed EXE/MSI files

### Test Auto-Update Flow

1. Release v1.0.0 with signed artifacts
2. Users install v1.0.0
3. App checks GitHub for updates automatically
4. Show notification when v1.0.1 available
5. Download and install automatically (requires restart)

---

## Distribution Channels

| Channel | Setup | Best For |
|---------|-------|----------|
| **GitHub Releases** | Free, auto-updates built-in | Developers, early adopters |
| **Direct Download** | Host on your server | Enterprise customers |
| **Windows Store** | ~$20, MSIX package | Consumer reach |
| **Chocolatey** | Free community list | Command-line users |

See `COMMERCIAL_DEPLOYMENT.md` for detailed instructions.

---

## Performance Tips

### Reduce Installer Size
- Current: ~150-200 MB (Chromium + Python included)
- Remove unused Python modules in PyInstaller build
- Use UPX compression (adds 5-10% to startup time)

### Faster Startups
- Preload registry in Python subprocess
- Cache function library in SQLite
- Lazy-load UI components

### Energy Saving (Local Invocation)
The runtime supports calling functions locally instead of subprocess:
- ~100x faster (direct Python call vs JSON serialization)
- Same functionality, no sandbox isolation
- Toggle with `call_address(address, args, forceLocal=True)`

---

## Troubleshooting

### "Python process initialization timeout"
- Check Python path in `electron/pythonBridge.js`
- Ensure `python/host.py` can import required modules

### License always says "unregistered"
- Check license stored in `electron-store` (SQLite)
- Verify `ipcMain.handle('activate-license')` callback

### SmartScreen warnings on first install
- Get EV certificate and sign binaries
- Takes 2-4 weeks for reputation to build
- Provide uninstall method that cleans registry

### Auto-update not working
- Verify GitHub token in environment
- Check `npm run release` workflow
- Confirm signed artifacts uploaded to release

---

## Production Checklist

Before commercial release:

```
Security
☐ Code audit (external recommended)
☐ npm audit for vulnerabilities
☐ Python package audit
☐ Review IPC attack surface
☐ Encrypt sensitive data at rest

Compliance
☐ Privacy policy written
☐ EULA finalized
☐ License server ready
☐ Support email setup
☐ Crash reporting configured (optional)

Quality
☐ User acceptance testing
☐ Installer testing (clean Windows machine)
☐ Update flow testing
☐ Uninstall testing
☐ Performance testing

Marketing
☐ Landing page ready
☐ Product screenshots
☐ Demo video
☐ Press release
☐ Launch announcement
```

---

## Next Steps

1. **Customize UI**: Edit React components in `src/components/`
2. **Implement licensing**: Add your license server integration
3. **Get certificate**: Apply for EV code signing certificate
4. **Create repository**: `50shades0fgraei/codemap-os-releases`
5. **Plan launch**: Set release date, marketing timeline
6. **Read deployment guide**: See `COMMERCIAL_DEPLOYMENT.md`

---

## Support

For issues or questions:
- Check electron-builder docs: https://www.electron.build
- React docs: https://react.dev
- Electron docs: https://www.electronjs.org/docs

Happy shipping! 🚀
