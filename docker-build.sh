#!/usr/bin/env bash
# CodemapOS Docker Build Orchestrator
# Builds the Electron installer in a container
# Usage: ./docker-build.sh [--sign cert.pfx:password]

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        CodemapOS - Docker Container Build System          ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Parse arguments
CERT_FILE=""
CERT_PASSWORD=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --sign)
      IFS=':' read -r CERT_FILE CERT_PASSWORD <<< "$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Docker
echo -e "\n${BLUE}[1/4] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker Desktop."
  exit 1
fi
echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"

# Step 2: Build Docker image
echo -e "\n${BLUE}[2/4] Building Docker image...${NC}"
docker build -t codemap-os:latest .
echo -e "${GREEN}✓ Docker image built${NC}"

# Step 3: Run builder container
echo -e "\n${BLUE}[3/4] Building CodemapOS installer...${NC}"
if [ -n "$CERT_FILE" ] && [ -n "$CERT_PASSWORD" ]; then
  echo "🔐 Code signing enabled"
  docker run \
    --rm \
    -v "$(pwd)/dist:/dist" \
    -e "WIN_CERT_FILE=/app/cert.pfx" \
    -e "WIN_CERT_PASSWORD=$CERT_PASSWORD" \
    -v "$CERT_FILE:/app/cert.pfx:ro" \
    codemap-os:latest
else
  echo "⏭️  Skipping code signing"
  docker run \
    --rm \
    -v "$(pwd)/dist:/dist" \
    codemap-os:latest
fi
echo -e "${GREEN}✓ Build complete${NC}"

# Step 4: Show results
echo -e "\n${BLUE}[4/4] Build Results${NC}"
if [ -d "dist" ]; then
  echo -e "${GREEN}📦 Installers created:${NC}"
  ls -lh dist/ | grep -E '\.(exe|msi|yml)$' || echo "No installers found"
  echo ""
  echo -e "${YELLOW}💡 Next steps:${NC}"
  echo "  1. Test installer: ./dist/CodemapOS-Setup-*.exe"
  echo "  2. Create GitHub release and upload artifacts"
  echo "  3. Share installer link with users"
else
  echo -e "${YELLOW}⚠️  No dist/ directory found${NC}"
fi

echo -e "\n${GREEN}🎉 Docker build complete!${NC}"
