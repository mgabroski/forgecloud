#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR/.."
cd "$REPO_ROOT"

echo "🛑 Stopping ForgeCloud infra (Postgres + Redis)..."
docker compose -f infra/docker-compose.yml down
