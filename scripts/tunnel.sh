#!/usr/bin/env bash
set -euo pipefail

# Reads SSH config from environment and opens a local tunnel to the remote MySQL.
# Env vars (example values):
#   SSH_USER=ubuntu
#   SSH_HOST=34.88.69.135
#   SSH_PORT=22
#   SSH_KEY=~/.ssh/id_rsa
#   LOCAL_PORT=3307
#   REMOTE_HOST=127.0.0.1
#   REMOTE_PORT=3306

SSH_USER=${SSH_USER:-}
SSH_HOST=${SSH_HOST:-}
SSH_PORT=${SSH_PORT:-22}
SSH_KEY=${SSH_KEY:-}
LOCAL_PORT=${LOCAL_PORT:-3307}
REMOTE_HOST=${REMOTE_HOST:-127.0.0.1}
REMOTE_PORT=${REMOTE_PORT:-3306}

if [[ -z "$SSH_USER" || -z "$SSH_HOST" || -z "$SSH_KEY" ]]; then
  echo "Missing SSH_USER/SSH_HOST/SSH_KEY env. Example:"
  echo "  SSH_USER=ubuntu SSH_HOST=34.88.69.135 SSH_KEY=~/.ssh/id_rsa npm run tunnel"
  exit 1
fi

echo "Opening SSH tunnel: localhost:${LOCAL_PORT} -> ${REMOTE_HOST}:${REMOTE_PORT} via ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "Press Ctrl+C to close."

ssh -N -L "${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_PORT}" -i "${SSH_KEY}" -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}"

