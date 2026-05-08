#!/usr/bin/env bash
# =============================================================================
# start_frontend.sh — Frontend-only development mode
# =============================================================================
# What this starts:  Next.js dev server only
# What this skips:   FastAPI, PostgreSQL, Redis, Docker, ML workers
#
# Use when: You're working on UI components, styling, or routing only.
# RAM usage: ~400MB (vs 2GB+ for full stack)
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB_DIR="$REPO_ROOT/apps/web"

echo "🎨 APEX-F1 — Frontend-only mode"
echo "   → Next.js dev server (http://localhost:3000)"
echo "   → API calls will fail gracefully (expected in this mode)"
echo ""

# Load web env
if [ -f "$WEB_DIR/.env.local" ]; then
  export $(grep -v '^#' "$WEB_DIR/.env.local" | xargs)
fi

cd "$WEB_DIR"
exec pnpm dev
