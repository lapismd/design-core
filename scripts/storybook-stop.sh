#!/usr/bin/env bash
# Kill Storybook listeners for this package (dev port + known extras).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${STORYBOOK_PORT:-9009}"
# Visual static defaults to Storybook port + 1 (same as resolveVisualServerPort).
VISUAL_PORT="${VISUAL_SERVER_PORT:-${VISUAL_DELTA_SERVER_PORT:-$((PORT + 1))}}"
# Extra ports: warm static server + a spare debug Storybook instance.
EXTRA_PORTS="${STORYBOOK_EXTRA_PORTS:-$VISUAL_PORT $((PORT + 90))}"
PANEL_STATIC_PORT="${VISUAL_DELTA_PANEL_STATIC_PORT:-$((PORT + 3))}"
PANEL_STORYBOOK_PORT="${VISUAL_DELTA_PANEL_STORYBOOK_PORT:-$((PORT + 4))}"
PANEL_VISUAL_PORT="${VISUAL_DELTA_PANEL_VISUAL_PORT:-$((PORT + 5))}"
PANEL_DEBUG_PORT="$((PANEL_STORYBOOK_PORT + 90))"
WORKSPACE_PORT="${WORKSPACE_STORYBOOK_PORT:-$((PORT + 200))}"
WORKSPACE_VISUAL_PORT="${WORKSPACE_VISUAL_SERVER_PORT:-$((WORKSPACE_PORT + 1))}"
WORKSPACE_DEBUG_PORT="$((WORKSPACE_PORT + 90))"

kill_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    echo "port $port: idle"
    return 0
  fi
  echo "port $port: killing $pids"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  sleep 0.4
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
}

cd "$ROOT"

ALL_PORTS="$PORT $EXTRA_PORTS $PANEL_STATIC_PORT $PANEL_STORYBOOK_PORT $PANEL_VISUAL_PORT $PANEL_DEBUG_PORT $WORKSPACE_PORT $WORKSPACE_VISUAL_PORT $WORKSPACE_DEBUG_PORT"

for port in $ALL_PORTS; do
  kill_port "$port"
done

echo "Storybook stopped (ports: $ALL_PORTS)"
