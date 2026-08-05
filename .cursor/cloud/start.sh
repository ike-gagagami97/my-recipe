#!/usr/bin/env bash
#
# Cloud Agent service startup (idempotent).
# Runs as environment.json "start" on every VM boot, after install.sh.
# Brings up the Docker daemon and the Supabase local stack so the Next.js app
# has a working database, then writes .env.local for the app.
set -euo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"

# --- 1. Docker daemon -----------------------------------------------------------
# `service`/systemd is not available in this VM, so launch dockerd directly.
if ! sudo docker info >/dev/null 2>&1; then
  echo "[start] Starting Docker daemon..."
  sudo dockerd > /tmp/dockerd.log 2>&1 &
  for _ in $(seq 1 60); do
    sudo docker info >/dev/null 2>&1 && break
    sleep 1
  done
fi
# Make the socket usable by the docker group (so `sg docker -c ...` works).
sudo chown root:docker /var/run/docker.sock 2>/dev/null || true
sudo chmod 660 /var/run/docker.sock 2>/dev/null || true

if ! sudo docker info >/dev/null 2>&1; then
  echo "[start] ERROR: Docker daemon failed to start. See /tmp/dockerd.log" >&2
  exit 1
fi

# --- 2. Supabase local stack (applies supabase/migrations automatically) --------
if ! sg docker -c "supabase status" >/dev/null 2>&1; then
  echo "[start] Starting Supabase local stack..."
  sg docker -c "supabase start"
fi

# --- 3. App env (local Supabase URL + anon key + service_role key) --------------
if [ ! -f .env.local ]; then
  echo "[start] Writing .env.local from supabase status..."
  status_env="$(sg docker -c "supabase status -o env")"
  api_url="$(printf '%s\n' "$status_env" | sed -n 's/^API_URL="\?\([^"]*\)"\?$/\1/p')"
  anon_key="$(printf '%s\n' "$status_env" | sed -n 's/^ANON_KEY="\?\([^"]*\)"\?$/\1/p')"
  service_role_key="$(printf '%s\n' "$status_env" | sed -n 's/^SERVICE_ROLE_KEY="\?\([^"]*\)"\?$/\1/p')"
  {
    echo "NEXT_PUBLIC_SUPABASE_URL=${api_url}"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon_key}"
    echo "SUPABASE_SERVICE_ROLE_KEY=${service_role_key}"
  } > .env.local
fi

echo "[start] Ready. Supabase: $(sg docker -c 'supabase status -o env' | sed -n 's/^API_URL=//p')"
