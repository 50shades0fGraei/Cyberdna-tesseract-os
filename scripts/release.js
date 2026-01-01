#!/usr/bin/env node
/**
 * Release script for creating signed releases.
 * Creates GitHub release with signed artifacts.
 * 
 * Usage:
 *   npm run release -- --version 1.0.1 --notes "Bug fixes and improvements"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const args = process.argv.slice(2);
const versionIndex = args.indexOf('--version');
const notesIndex = args.indexOf('--notes');

const version = versionIndex >= 0 ? args[versionIndex + 1] : null;
const releaseNotes = notesIndex >= 0 ? args[notesIndex + 1] : 'Release ' + version;

if (!version) {
  console.error('Usage: npm run release -- --version <version> [--notes <notes>]');
  process.exit(1);
}

const distDir = path.join(__dirname, '../dist');

console.log(`\n📦 Building release v${version}...\n`);

try {
  // Build the app
  console.log('Building Electron app...');
  execSync('npm run electron-build', { stdio: 'inherit' });

  console.log('\n✓ Build complete!');
  console.log('\n📄 Release artifacts:');

  // List artifacts
  const files = fs.readdirSync(distDir).filter(f => {
    return f.endsWith('.exe') || f.endsWith('.msi') || f.endsWith('.zip') || f.endsWith('.yml');
  });

  files.forEach(f => {
    const filePath = path.join(distDir, f);
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  - ${f} (${sizeInMB} MB)`);
  });

  console.log('\n🔐 Sign with code certificate (if not done):');
  console.log('  signtool sign /f cert.pfx /p PASSWORD /fd sha256 /tr http://timestamp.comodoca.com/rfc3161 dist/*.exe');

  console.log('\n🚀 Next steps:');
  console.log(`  1. Verify artifacts in ${distDir}`);
  console.log('  2. Create GitHub release with version ' + version);
  console.log('  3. Upload signed artifacts to release');
  console.log('\n💡 To create release on GitHub:');
  console.log(`  gh release create v${version} --title "CodemapOS v${version}" --notes "${releaseNotes}" dist/*`);
} catch (err) {
  console.error('\n✗ Build failed:', err.message);
  process.exit(1);
}
