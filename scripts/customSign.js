/**
 * Custom code signing script for electron-builder.
 * Signs Windows executables and installers with EV certificate.
 * 
 * Usage:
 *   Place your certificate in cert.pfx
 *   Set environment variables:
 *     WIN_CERT_FILE=cert.pfx
 *     WIN_CERT_PASSWORD=your_password
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function sign(options) {
  const { path: filePath, certificateFile, certificatePassword } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (!certificateFile) {
    console.log(`Skipping signing for ${path.basename(filePath)} (no certificate)`);
    return;
  }

  if (!fs.existsSync(certificateFile)) {
    throw new Error(`Certificate not found: ${certificateFile}`);
  }

  console.log(`Signing ${path.basename(filePath)}...`);

  try {
    // Use signtool from Windows SDK
    const signtoolPath = process.env.SIGNTOOL_PATH || 'signtool.exe';
    
    const signCommand = [
      signtoolPath,
      'sign',
      '/f', certificateFile,
      '/p', certificatePassword,
      '/fd', 'sha256',
      '/tr', 'http://timestamp.comodoca.com/rfc3161',
      '/td', 'sha256',
      filePath,
    ].join(' ');

    execSync(signCommand, { stdio: 'inherit' });
    console.log(`✓ Successfully signed ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`✗ Failed to sign ${path.basename(filePath)}`);
    throw err;
  }
}

module.exports = { sign };
