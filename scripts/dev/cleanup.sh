#!/usr/bin/env bash
# =============================================================================
# cleanup.sh — Kill orphan processes that cause thermal throttling
# =============================================================================
# Run this when:
#   - Terminal is frozen
#   - Fan is spinning hard
#   - Activity Monitor shows runaway node/python/uvicorn
# =============================================================================

set -euo pipefail

echo "🧹 APEX-F1 — Process Cleanup"
echo ""

# Helper: kill processes matching a name pattern
kill_procs() {
  local name="$1"
  local pids
  pids=$(pgrep -f "$name" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "   Killing $name (PIDs: $pids)..."
    echo "$pids" | xargs kill -TERM 2>/dev/null || true
    sleep 1
    # Force kill anything still alive
    pids=$(pgrep -f "$name" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
  else
    echo "   ✓ No $name processes found"
  fi
}

echo "── Killing dev servers ──"
kill_procs "next dev"
kill_procs "next-server"
kill_procs "uvicorn"

echo ""
echo "── Killing orphan Node processes ──"
# Only kill node processes related to apex-f1, not system nodes
kill_procs "apex-f1.*node"
# Kill any turbopack/next watchers
kill_procs "next/dist/compiled"

echo ""
echo "── Killing Python workers ──"
kill_procs "apps.api.main"
kill_procs "ingestion.py"
kill_procs "ingest_laps.py"

echo ""
echo "── Killing test runners ──"
kill_procs "pytest"

echo ""
echo "── Memory pressure check ──"
vm_stat | grep -E "Pages (free|active|speculative|wired|compressed)" | awk '{
  label = $1 " " $2
  pages = $NF + 0
  mb = pages * 4096 / 1024 / 1024
  printf "   %-40s %6.0f MB\n", label, mb
}'

echo ""
echo "── Top 5 CPU consumers ──"
ps aux --sort=-%cpu 2>/dev/null | head -6 || ps aux | sort -k3 -rn | head -6

echo ""
echo "✅ Cleanup complete. Consider restarting your terminal session."
echo "   → Restart dev: scripts/dev/start_full.sh"
echo "   → Frontend only: scripts/dev/start_frontend.sh"
echo "   → Backend only:  scripts/dev/start_backend.sh"
