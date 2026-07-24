#!/usr/bin/env bash
#
# Cloud Agent dependency install (idempotent).
# Runs as environment.json "install" on every VM boot after the repo is pulled.
# Only installs/refreshes dependencies here — service startup lives in start.sh.
set -euo pipefail

DOCKER_CE_VERSION="5:28.5.2-1~ubuntu.24.04~noble"
SUPABASE_CLI_VERSION="2.109.1"

# --- 1. Docker CE (Docker-in-Docker compatible) --------------------------------
# Pinned to 28.x: Docker 29 defaults to the containerd snapshotter, which breaks
# the fuse-overlayfs storage driver required in this nested-container VM.
if ! command -v docker >/dev/null 2>&1; then
  echo "[install] Installing Docker CE ${DOCKER_CE_VERSION}..."
  sudo install -m 0755 -d /etc/apt/keyrings
  curl --retry 3 --retry-delay 5 -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y \
    "docker-ce=${DOCKER_CE_VERSION}" \
    "docker-ce-cli=${DOCKER_CE_VERSION}" \
    containerd.io docker-buildx-plugin docker-compose-plugin \
    fuse-overlayfs iptables

  # Kernel lacks full overlay2/nftables support in this VM.
  sudo mkdir -p /etc/docker
  printf '%s\n' '{' '  "storage-driver": "fuse-overlayfs"' '}' \
    | sudo tee /etc/docker/daemon.json > /dev/null
  sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
  sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
fi

# Let the agent user drive Docker without sudo (applies to new shells / tmux).
sudo groupadd -f docker
sudo usermod -aG docker "$USER" || true

# --- 2. Supabase CLI ------------------------------------------------------------
if ! command -v supabase >/dev/null 2>&1; then
  echo "[install] Installing Supabase CLI v${SUPABASE_CLI_VERSION}..."
  tmp="$(mktemp -d)"
  curl --retry 3 --retry-delay 5 -fsSL -o "${tmp}/supabase.deb" \
    "https://github.com/supabase/cli/releases/download/v${SUPABASE_CLI_VERSION}/supabase_${SUPABASE_CLI_VERSION}_linux_amd64.deb"
  sudo dpkg -i "${tmp}/supabase.deb"
  rm -rf "${tmp}"
fi

# --- 3. Node dependencies -------------------------------------------------------
npm install

# --- 4. Playwright browsers + OS deps (skips already-installed browsers) --------
npx playwright install --with-deps

echo "[install] Done."
