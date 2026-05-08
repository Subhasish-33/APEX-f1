#!/usr/bin/env bash
# =============================================================================
# start_full.sh — Full stack development mode
# =============================================================================
# What this starts:  Next.js + FastAPI (in parallel)
# What this skips:   Docker, local DB/Redis (uses Supabase + Upstash)
#
# Use when: Working on features that require both frontend and backend.
# Press Ctrl+C to stop both processes cleanly.
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS_DIR="$REPO_ROOT/scripts/dev"

echo "🚀 APEX-F1 — Full stack mode"
echo "   → Next.js  → http://localhost:3000"
echo "   → FastAPI  → http://localhost:8001"
echo "   → Database → Supabase (cloud)"
echo "   → Cache    → Upstash (cloud)"
echo "   → Press Ctrl+C to stop all services"
echo ""

# Track child PIDs for clean shutdown
declare -a PIDS

cleanup() {
  echo ""
  echo "🛑 Shutting down all services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait
  echo "✅ All services stopped."
}

trap cleanup SIGINT SIGTERM EXIT

# Start backend
"$SCRIPTS_DIR/start_backend.sh" &
PIDS+=($!)

# Small delay so backend logs appear first
sleep 1

# Start frontend
"$SCRIPTS_DIR/start_frontend.sh" &
PIDS+=($!)

# Wait for both
wait
