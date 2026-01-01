# CodemapOS - Commercial Deployment & Monetization Guide

## Overview

This guide covers everything needed to package, sign, distribute, and monetize CodemapOS as a commercial product.

## Table of Contents

1. [Code Signing & Certificates](#code-signing--certificates)
2. [Building Commercial Installers](#building-commercial-installers)
3. [License Key System](#license-key-system)
4. [Auto-Update Infrastructure](#auto-update-infrastructure)
5. [Distribution Channels](#distribution-channels)
6. [Security Hardening](#security-hardening)

---

## Code Signing & Certificates

### Obtaining an EV Certificate

For maximum trust and distribution reach, use an **Extended Validation (EV) Code Signing Certificate**:

- **Providers**: Sectigo, DigiCert, Thawte, GlobalSign
- **Cost**: $150-$400/year
- **Benefits**: 
  - SmartScreen reputation (fewer warnings)
  - Windows Defender whitelist
  - Professional appearance
  - Cross-platform support

### Installing the Certificate

1. Obtain your `.pfx` file and password
2. Place in `scripts/cert.pfx`
3. Test signing:

```powershell
# From PowerShell as Administrator
signtool sign /f scripts/cert.pfx /p YOUR_PASSWORD /fd sha256 /tr http://timestamp.comodoca.com/rfc3161 /td sha256 dist/CodemapOS.exe
```

### Automated Signing

The build pipeline signs automatically if environment variables are set:

```powershell
$env:WIN_CERT_FILE = "C:\path\to\cert.pfx"
$env:WIN_CERT_PASSWORD = "your_password"

npm run electron-build-win
```

---

## Building Commercial Installers

### NSIS Installer (Default)

```powershell
npm run electron-build-win
```

Creates:
- `CodemapOS-1.0.0.exe` - Full installer
- Updates `.yml` for auto-update checks

### MSI Installer (Enterprise)

Already configured in `package.json` - electron-builder creates both NSIS and MSI.

For enterprise deployments:

```powershell
# MSI signed and ready for Group Policy distribution
dist/CodemapOS-1.0.0.msi
```

### Customize Installer

Edit `package.json` `build.nsis` section:

```json
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "createDesktopShortcut": true,
  "installerIcon": "assets/icon.ico",
  "uninstallerIcon": "assets/icon.ico",
  "artifactName": "${productName}-${version}.${ext}"
}
```

---

## License Key System

### Overview

CodemapOS includes built-in license validation at startup. License keys are stored locally and device-specific.

### How It Works

1. **First Launch**: User enters license key + licensee name
2. **Validation**: Key validated against license server
3. **Storage**: Key stored in `%APPDATA%\CodemapOS\license.json` (encrypted recommended)
4. **Enforcement**: App blocks all features if unregistered

### Implementing License Server

Create a simple license validation backend (Node.js/Python):

```javascript
// Example: Node.js license server
const express = require('express');
const app = express();

app.post('/api/validate-license', (req, res) => {
  const { licenseKey, licensee, deviceId } = req.body;
  
  // Validate against your database
  const isValid = checkLicenseInDatabase(licenseKey, licensee);
  
  res.json({
    valid: isValid,
    expiresAt: '2025-12-31',
    features: ['all'],
    message: isValid ? 'Valid' : 'Invalid key'
  });
});

app.listen(3000);
```

Update `electron/main.js` to call your server:

```javascript
ipcMain.handle('activate-license', async (event, licenseKey, licensee) => {
  try {
    const response = await axios.post('https://license.yourdomain.com/api/validate-license', {
      licenseKey,
      licensee,
      deviceId: uuid.v4()
    });
    
    if (response.data.valid) {
      store.set('licenseKey', licenseKey);
      store.set('licensee', licensee);
      return { success: true };
    }
  } catch (err) {
    return { success: false, error: 'License validation failed' };
  }
});
```

### License Tiers (Recommended)

- **Free Trial**: 30-day full access
- **Professional**: $99/year - Single user
- **Enterprise**: $999/year - Site license (5+ users)
- **Custom**: Per-negotiation pricing

---

## Auto-Update Infrastructure

### Setup GitHub Releases

1. Create repository: `50shades0fgraei/codemap-os-releases`
2. Generate GitHub token with `repo` scope
3. Set in environment:

```powershell
$env:GH_TOKEN = "your_github_token"
```

### Release Process

```bash
# Bump version in package.json
npm version minor

# Build and publish
npm run release

# Or use the release script
node scripts/release.js --version 1.1.0 --notes "New features"
```

### Electron-Updater Config

Already in `package.json`:

```json
"publish": {
  "provider": "github",
  "owner": "50shades0fgraei",
  "repo": "codemap-os-releases"
}
```

Users get automatic notifications when updates are available.

---

## Distribution Channels

### 1. Direct Download (Recommended for Initial Launch)

```html
<!-- Your website -->
<a href="https://github.com/50shades0fgraei/codemap-os-releases/releases/download/v1.0.0/CodemapOS-Setup-1.0.0.exe">
  Download CodemapOS
</a>
```

### 2. Windows Store

Requires:
- Microsoft Partner Center account ($20 one-time)
- MSIX package format
- Privacy policy & EULA

```powershell
# Package as MSIX
electron-builder --win --config.win.certificateFile=cert.pfx
```

### 3. Chocolatey

Create `codemaptos.nuspec`:

```xml
<?xml version="1.0"?>
<package>
  <metadata>
    <id>codemaptos</id>
    <version>1.0.0</version>
    <title>CodemapOS</title>
    <authors>Codemap</authors>
    <description>Function-driven operating system layer</description>
    <projectUrl>https://github.com/50shades0fgraei/codemap-os</projectUrl>
  </metadata>
</package>
```

### 4. Self-Hosted Update Server

For enterprise control:

```javascript
// Custom update server
app.get('/updates/latest', (req, res) => {
  res.json({
    version: '1.1.0',
    releaseDate: new Date(),
    url: 'https://releases.yourdomain.com/CodemapOS-1.1.0.exe',
    releaseNotes: 'Bug fixes and improvements',
    mandatory: true
  });
});
```

---

## Security Hardening

### Before Commercial Release

1. **Code Review**: External security audit recommended
2. **Dependencies Scan**: Check for vulnerabilities
   ```bash
   npm audit
   pip audit
   ```
3. **Sandbox Isolation**: Python subprocess runs with limited privileges
4. **Data Encryption**: Add encryption for sensitive files
   ```javascript
   const Store = require('electron-store');
   const store = new Store({
     encryptionKey: 'your-32-char-key'
   });
   ```

### Privacy & Compliance

- **Privacy Policy**: Required for telemetry
- **EULA**: Already prompted on first launch
- **GDPR**: Implement data export/deletion
- **Data Collection**: Make telemetry opt-in

### Telemetry Implementation

Optional analytics (must be opt-in):

```javascript
// In main.js
ipcMain.handle('send-telemetry', async (event, data) => {
  if (!store.get('telemetryOptIn', false)) {
    return { success: false, reason: 'telemetry disabled' };
  }
  
  // Send to analytics service
  await axios.post('https://analytics.yourdomain.com/events', {
    event: data.event,
    timestamp: new Date(),
    version: app.getVersion(),
    platform: process.platform
  });
  
  return { success: true };
});
```

---

## Monetization Strategy

### Recommended Model

1. **Freemium**: Free tier with limits
   - Limited functions in library
   - 3 data bindings max
   - Single process mapping

2. **Paid Tiers**
   - **Professional** ($99/year): Unlimited access
   - **Enterprise** ($999/year): Multiple users + API
   - **Custom**: On-site deployment

### License Key Generation

Implement a key generator (e.g., using UUID + HMAC):

```python
import uuid
import hmac
import hashlib

def generate_license_key(licensee, tier='professional'):
    device_id = str(uuid.uuid4())
    key_data = f"{licensee}:{tier}:{device_id}"
    signature = hmac.new(
        b'your_secret_key',
        key_data.encode(),
        hashlib.sha256
    ).hexdigest()
    
    license_key = f"{device_id}-{signature[:16].upper()}"
    return license_key
```

---

## Deployment Checklist

```
Pre-Release
☐ Code review and security audit
☐ Full QA testing (Windows 10, 11)
☐ User documentation complete
☐ Privacy policy and EULA finalized
☐ EV certificate obtained and installed
☐ License server deployed
☐ GitHub releases repository created

Release Day
☐ Sign all binaries with EV cert
☐ Create GitHub release with notes
☐ Publish to intended distribution channels
☐ Update website with download links
☐ Announce on social media
☐ Monitor for crash reports

Post-Release
☐ Monitor auto-update adoption
☐ Fix critical bugs in patch releases
☐ Plan next feature release
☐ Gather user feedback
☐ Review sales and activation numbers
```

---

## Support & Updates

### Release Schedule

- **Major** (1.x.0): Every 6 months - New features
- **Minor** (1.1.x): Every month - Improvements
- **Patch** (1.1.1): As needed - Bug fixes

### Communication

- Email newsletter for major releases
- In-app update notifications
- GitHub releases for detailed notes
- Support email: `support@yourdomain.com`

---

## Troubleshooting

### SmartScreen Warnings

After release, reputation builds over 2-4 weeks. Initial users may see warnings.
- Solution: Get EV certificate, submit app to Microsoft
- Include trusted publisher name in installer

### License Server Errors

If users can't validate:
- Provide offline activation (code-based)
- Implement grace period for network failures
- Add manual activation support

### Update Failures

- Keep old release available for fallback
- Test updates before publishing
- Implement rollback capability

---

## Next Steps

1. **Customize License System**: Adapt for your business model
2. **Deploy License Server**: Use provided example
3. **Test Full Flow**: License validation → Update → Uninstall
4. **Create Marketing Site**: Highlight key features
5. **Plan Launch**: Set release date, marketing timeline

Good luck with CodemapOS commercialization! 🚀
