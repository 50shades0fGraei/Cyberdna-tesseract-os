# 🐳 CodemapOS Docker Quick Reference

## One-Line Build

```bash
# Windows (PowerShell)
docker run --rm -v "${PWD}/dist:/dist" -t codemap-os:latest

# Linux/Mac (Bash)
docker run --rm -v "$(pwd)/dist:/dist" codemap-os:latest

# Using helper script
.\docker-build.ps1                    # Windows
./docker-build.sh                     # Linux/Mac
```

## Setup (First Time)

```bash
# Build Docker image
docker build -t codemap-os:latest .

# That's it! Image is ready to use
```

## Common Tasks

### Build Installer (No Signing)
```bash
docker-compose up builder
# Output: dist/CodemapOS-Setup-1.0.0.exe
```

### Build with Code Signing
```powershell
# Windows
.\docker-build.ps1 -CertFile "cert.pfx" -CertPassword "password"
```

```bash
# Linux/Mac
./docker-build.sh --sign cert.pfx:password
```

### Development Server
```bash
docker-compose up dev
# React: http://localhost:3000
# Electron: Launches automatically
```

### Just React (Web UI)
```bash
docker run -it -p 3000:3000 -v "$(pwd):/app" codemap-os:latest npm run react-dev
```

### Just Python Backend
```bash
docker run -it -v "$(pwd):/app" codemap-os:latest python python/host.py
```

## View Results

```bash
# Show built installers
ls -lh dist/

# Show file sizes
du -sh dist/CodemapOS-*

# Windows: Open dist folder
explorer dist
```

## Clean Up

```bash
# Remove image
docker rmi codemap-os:latest

# Remove all stopped containers
docker container prune

# Free up space (careful!)
docker system prune -a
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker not found | Install [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| Build fails | Check `docker logs` or run `npm install` locally first |
| Permission denied | Run with `sudo` on Linux, restart Docker on Mac |
| Large installer | Normal (150-200 MB includes Chromium + Python) |

## What Gets Built

Inside the container:
- ✅ React UI compiled
- ✅ Electron packaged
- ✅ Windows EXE installer
- ✅ Windows MSI installer (enterprise)
- ✅ Update manifest (latest-win.yml)

All output to `dist/` directory on host.

## Environment Variables

```bash
# For code signing
export WIN_CERT_FILE=/path/to/cert.pfx
export WIN_CERT_PASSWORD=your_password

# For GitHub releases (optional)
export GH_TOKEN=your_token
```

## Full Docs

See **DOCKER_DEPLOYMENT.md** for:
- Detailed setup
- CI/CD integration (GitHub Actions, GitLab)
- Security best practices
- Performance optimization
- Container registry usage

## Files Involved

```
Dockerfile                 # Build recipe
Dockerfile.dev            # Development image
docker-compose.yml        # Orchestration
docker-build.sh          # Helper script (Linux/Mac)
docker-build.ps1         # Helper script (Windows)
.dockerignore            # Files to exclude from build
```

## Next Steps

1. **First build:** `docker build -t codemap-os:latest .`
2. **Run:** `docker run --rm -v "$(pwd)/dist:/dist" codemap-os:latest`
3. **Test:** Run `dist/CodemapOS-Setup-*.exe`
4. **Automate:** Set up GitHub Actions (see DOCKER_DEPLOYMENT.md)

---

**That's it!** Your CodemapOS installer is ready to distribute. 🚀
