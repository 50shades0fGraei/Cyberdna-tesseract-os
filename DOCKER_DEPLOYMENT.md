# CodemapOS - Docker Container Deployment Guide

## Overview

CodemapOS can be built and packaged entirely within Docker containers, eliminating local dependency management and enabling consistent, reproducible builds across all machines.

## Quick Start (3 Commands)

### On Windows (PowerShell)
```powershell
# Build the Docker image
docker build -t codemap-os:latest .

# Run the builder
docker run --rm -v "${PWD}/dist:/dist" codemap-os:latest

# Check results
ls dist/
```

### On Linux/Mac (Bash)
```bash
# Build and run
docker build -t codemap-os:latest .
docker run --rm -v "$(pwd)/dist:/dist" codemap-os:latest

# Check results
ls -lh dist/
```

### Using Helper Scripts
```powershell
# Windows
.\docker-build.ps1

# With code signing
.\docker-build.ps1 -CertFile "cert.pfx" -CertPassword "password"
```

```bash
# Linux/Mac
./docker-build.sh

# With code signing
./docker-build.sh --sign cert.pfx:password
```

## What Gets Built

Inside the container:
1. React dashboard compiled to static files
2. Electron application packaged
3. Windows installers created:
   - `CodemapOS-Setup-1.0.0.exe` (NSIS installer)
   - `CodemapOS-1.0.0.msi` (Enterprise MSI)
   - `latest-win.yml` (Update manifest)

All artifacts copied to `dist/` on the host machine.

## Docker Compose (Recommended)

For most users, docker-compose provides the simplest experience:

### Production Build
```bash
docker-compose up builder
```

### Development Server
```bash
docker-compose up dev
```

Services defined in `docker-compose.yml`:
- **builder** - Builds Windows installers
- **dev** - Development server (React hot-reload + Electron)

## Environment Variables

### Code Signing
```bash
# Set certificate file path and password
export WIN_CERT_FILE=/path/to/cert.pfx
export WIN_CERT_PASSWORD=your_password

docker-compose up builder
```

Or with direct docker run:
```bash
docker run \
  -e WIN_CERT_FILE=/app/cert.pfx \
  -e WIN_CERT_PASSWORD=your_password \
  -v /path/to/cert.pfx:/app/cert.pfx:ro \
  -v $(pwd)/dist:/dist \
  codemap-os:latest
```

### Build Options
```bash
# GitHub token for auto-update releases
export GH_TOKEN=your_github_token

# Additional electron-builder arguments
export ELECTRON_BUILDER_ARGS="--win --msi --publish never"
```

## Volume Mounts

| Path | Purpose | Access |
|------|---------|--------|
| `/dist` | Build output (EXE, MSI, manifests) | Read-write |
| `/app/cert.pfx` | Code signing certificate | Read-only |
| `/app` | Source code (if needed) | Read-write |

## File Structure Inside Container

```
/app/
├── src/                    # React source
├── electron/              # Electron main & preload
├── python/                # Python backend
├── package.json           # npm config
├── electron-builder.json  # Build config
└── dist/                  # OUTPUT: Built installers
```

## Building Variants

### Minimal Build (No Signing)
```bash
docker run --rm \
  -v "$(pwd)/dist:/dist" \
  codemap-os:latest
```
**Time:** ~5-10 minutes  
**Size:** 150-200 MB installer

### Signed Build (With EV Certificate)
```bash
docker run --rm \
  -v "$(pwd)/dist:/dist" \
  -e WIN_CERT_FILE=/app/cert.pfx \
  -e WIN_CERT_PASSWORD=password \
  -v /path/to/cert.pfx:/app/cert.pfx:ro \
  codemap-os:latest
```
**Time:** ~7-12 minutes (signing adds 1-2 min)  
**Size:** 150-200 MB installer (signed)

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Build CodemapOS

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker
        uses: docker/setup-buildx-action@v2
      
      - name: Build image
        run: docker build -t codemap-os:latest .
      
      - name: Build installers
        run: docker run --rm -v "$(pwd)/dist:/dist" codemap-os:latest
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: installers
          path: dist/
      
      - name: Create release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/CodemapOS*.exe
          files: dist/CodemapOS*.msi
```

### GitLab CI Example
```yaml
build:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t codemap-os:latest .
    - docker run --rm -v "$(pwd)/dist:/dist" codemap-os:latest
  artifacts:
    paths:
      - dist/
```

## Troubleshooting

### "Docker not found"
Install Docker Desktop:
- **Windows:** https://www.docker.com/products/docker-desktop
- **Mac:** https://www.docker.com/products/docker-desktop
- **Linux:** `sudo apt install docker.io docker-compose`

### "Cannot connect to Docker daemon"
- Start Docker Desktop (Windows/Mac)
- On Linux: `sudo usermod -aG docker $USER` then restart terminal

### "Permission denied" on volume mount
- Windows: Ensure Docker Desktop has file sharing enabled
- Mac: Check security & privacy settings
- Linux: Ensure user is in docker group

### Build fails with certificate error
1. Check cert file path is correct
2. Verify certificate password
3. Try building without signing first
4. Check cert format (must be .pfx)

### "dist/ directory empty"
- Check docker logs: `docker logs <container_id>`
- Verify React built: `npm run react-build` locally first
- Check npm dependencies: rebuild image if package.json changed

## Performance Optimization

### First Build (Slower)
- Installs all dependencies
- Creates Docker image
- Time: 10-15 minutes

### Subsequent Builds (Faster)
- Reuses Docker layers (cached)
- Time: 5-10 minutes

### Further Optimization
1. **Use BuildKit:** `DOCKER_BUILDKIT=1 docker build .`
2. **Multi-stage caching:** Already implemented in Dockerfile
3. **Smaller base image:** Alpine 3.17 used in final stage

## Container Specs

### Builder Image
- **Base:** `node:18-alpine`
- **Size:** ~150-200 MB
- **Build time:** First run ~5 min, cached ~30 sec

### Final Installer
- **Output size:** 150-200 MB (EXE/MSI combined)
- **Includes:** Chromium + Python + app code
- **Platform:** Windows 10/11 compatible

## Security Considerations

### Secrets Management
**Never commit certificates to Git!**

1. Store certificate outside repo
2. Pass via environment variable
3. Use CI/CD secret management (GitHub Secrets, etc.)

### Container Security
- Running as non-root user (implicit in Alpine)
- No exposed ports in builder container
- Read-only cert mount
- Signed artifacts when possible

### Supply Chain Security
- Pin Node version (`node:18-alpine`)
- Verify npm packages: `npm audit`
- Use lockfile: `npm ci` instead of `npm install`

## Extending the Build

### Custom Scripts
Modify `docker-compose.yml` command section:
```yaml
command: >
  sh -c "
    npm ci &&
    npm run react-build &&
    # Add custom steps here
    npm run electron-build &&
    echo 'Custom post-build step'
  "
```

### Additional Tools
Add to Dockerfile `RUN apk add --no-cache`:
```dockerfile
RUN apk add --no-cache \
    python3 py3-pip \
    build-base git bash \
    wine wine32 wine64 \
    custom-tool
```

### Multi-Platform Builds
Use electron-builder's `publish` field for multi-platform:
```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "50shades0fgraei",
    "repo": "codemap-os-releases"
  }
}
```

## Cleanup

### Remove Docker Image
```bash
docker rmi codemap-os:latest
```

### Remove Dangling Images
```bash
docker image prune
```

### Clean Volume
```bash
rm -rf dist/
```

### Full Docker System Cleanup
```bash
docker system prune -a
```

## Distribution via Container Registry

### Push to Docker Hub
```bash
docker login
docker tag codemap-os:latest yourusername/codemap-os:latest
docker push yourusername/codemap-os:latest
```

### Use Prebuilt Image
```bash
docker run --rm \
  -v "$(pwd)/dist:/dist" \
  yourusername/codemap-os:latest
```

## Next Steps

1. **Test locally:** `docker-compose up builder`
2. **Verify installers:** Check `dist/` directory
3. **Set up CI/CD:** Copy GitHub Actions example
4. **Add signing:** Get EV certificate, use `--sign` flag
5. **Automate releases:** Hook CI/CD to GitHub releases

---

## Cheat Sheet

```bash
# Build image
docker build -t codemap-os:latest .

# Build without cache (fresh)
docker build --no-cache -t codemap-os:latest .

# Run container
docker run --rm -v "$(pwd)/dist:/dist" codemap-os:latest

# List images
docker images | grep codemap

# Clean up
docker system prune -a

# View build logs
docker run --rm -v "$(pwd)/dist:/dist" codemap-os:latest 2>&1 | tee build.log
```

## Quick Links

- **Docker Docs:** https://docs.docker.com
- **Docker Compose:** https://docs.docker.com/compose
- **electron-builder:** https://www.electron.build
- **Node Docker Images:** https://hub.docker.com/_/node

---

Your CodemapOS installer can now be built anywhere Docker is available! 🐳
