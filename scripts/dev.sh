#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR/.."
cd "$REPO_ROOT"

echo "🚀 Starting ForgeCloud infra (Postgres + Redis)..."
docker compose -f infra/docker-compose.yml up -d

# Give Postgres a brief moment to be ready (cheap & simple for dev)
sleep 3

echo "🌱 Running core seed (idempotent)..."
yarn workspace @forgecloud/backend seed:core || {
  echo "⚠️ Seed failed – backend may still start, but dev data might be missing."
}

echo "🚀 Starting ForgeCloud backend (dev)..."
yarn workspace @forgecloud/backend dev &
BACKEND_PID=$!

echo "🚀 Starting ForgeCloud frontend (dev)..."
yarn workspace frontend dev &
FRONTEND_PID=$!

trap 'echo; echo "🛑 Stopping dev processes..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0' INT

echo
echo "✅ ForgeCloud dev environment is running."
echo "   Backend API:   http://localhost:4000"
echo "   Frontend app:  http://localhost:5173"
echo
echo "Press Ctrl+C to stop everything."

wait
