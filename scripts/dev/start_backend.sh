#!/usr/bin/env bash
# =============================================================================
# start_backend.sh — Backend-only development mode
# =============================================================================
# What this starts:  FastAPI (uvicorn) + ML inference engine
# What this skips:   Next.js, Docker, local DB/Redis (uses Supabase + Upstash)
#
# Use when: You're working on API routes, ingestion, or ML endpoints.
# RAM usage: ~250MB (vs 2GB+ for full stack)
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
API_DIR="$REPO_ROOT/apps/api"
VENV_DIR="$REPO_ROOT/.venv"

echo "⚡ APEX-F1 — Backend-only mode"
echo "   → FastAPI on http://localhost:8001"
echo "   → Database: Supabase (cloud)"
echo "   → Cache: Upstash (cloud)"
echo ""

# Check for .env
if [ ! -f "$API_DIR/.env" ]; then
  echo "❌ ERROR: $API_DIR/.env not found."
  echo "   Please copy .env.example to .env and fill in your Supabase/Upstash URLs."
  exit 1
fi

# Load API env
export $(grep -v '^#' "$API_DIR/.env" | grep -v '^\s*$' | xargs)

# Validate DATABASE_URL is not the placeholder
if echo "$DATABASE_URL" | grep -q "localhost:5433"; then
  echo "⚠️  WARNING: DATABASE_URL still points to localhost. Did you update .env with Supabase?"
fi

# Activate venv
if [ -f "$VENV_DIR/bin/activate" ]; then
  source "$VENV_DIR/bin/activate"
else
  echo "⚠️  No .venv found at $VENV_DIR. Using system Python."
fi

export PYTHONPATH="$REPO_ROOT:$REPO_ROOT/apps/api:${PYTHONPATH:-}"

cd "$REPO_ROOT"
exec uvicorn apps.api.main:app \
  --reload \
  --port 8001 \
  --host 0.0.0.0 \
  --reload-exclude "*.pyc" \
  --reload-exclude "__pycache__" \
  --reload-exclude "*.pkl" \
  --reload-exclude "apps/web/**" \
  --reload-exclude "scripts/**" \
  --reload-exclude "scratch/**" \
  --reload-exclude "tests/**"
