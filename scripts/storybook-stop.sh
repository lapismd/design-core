#!/usr/bin/env bash
# Kill Storybook listeners for this package (dev port + known extras).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${STORYBOOK_PORT:-9009}"
# Visual static defaults to Storybook port + 1 (same as resolveVisualServerPort).
VISUAL_PORT="${VISUAL_SERVER_PORT:-${VISUAL_DELTA_SERVER_PORT:-$((PORT + 1))}}"
# Extra ports: warm static server + a spare debug Storybook instance.
EXTRA_PORTS="${STORYBOOK_EXTRA_PORTS:-$VISUAL_PORT 9999}"

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

for port in $PORT $EXTRA_PORTS; do
  kill_port "$port"
done

echo "Storybook stopped (ports: $PORT $EXTRA_PORTS)"
