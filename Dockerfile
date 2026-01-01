# Multi-stage Dockerfile for CodemapOS
# Builds Electron installer in container (no local dependencies needed)
# Usage: docker build -t codemap-os .
#        docker run -v $(pwd)/dist:/app/dist codemap-os

FROM electronuserland/builder:wine AS builder

WORKDIR /project
ENV HOME=/project

# Ensure apt is up-to-date and install common native build deps used by many npm modules
RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	python3 \
	python3-dev \
	git \
	ca-certificates \
	libgtk-3-0 \
	libnotify-bin \
	libnss3 \
	libxss1 \
	libasound2 \
	libx11-6 \
	libxkbfile1 \
	libsecret-1-0 \
 && rm -rf /var/lib/apt/lists/*

# Copy package manifest and install dependencies first (cache layer)
COPY package*.json ./
# Show node/npm versions (helpful in build logs)
RUN node --version && npm --version

# Use npm install with verbose logging and relax peer-dependency resolution
ENV NPM_CONFIG_LOGLEVEL=verbose
# Allow legacy peer deps resolution to avoid ERESOLVE conflicts inside builder
RUN npm install --unsafe-perm --no-audit --legacy-peer-deps || \
		(echo "npm install failed - printing npm debug log(s) (if present)"; \
		 for f in /project/.npm/_logs/*.log; do \
			 if [ -f "$f" ]; then echo "===== $f ====="; cat "$f"; echo; fi; \
		 done; \
		 exit 1)

# Copy the rest of the project
COPY . .

# Build the React app
RUN npm run react-build

# Build Electron installers (Windows targets). We pass --publish never to avoid publishing.
RUN npm run electron-build -- --win --x64 --publish never

# Output stage: keep only the produced artifacts
FROM alpine:latest AS output
WORKDIR /out
COPY --from=builder /project/dist /out
VOLUME ["/out"]
CMD ["sh", "-c", "echo 'Build complete!' && ls -lh /out/"]
