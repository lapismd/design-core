#!/usr/bin/env bash
# Kill Storybook listeners for this package (dev port + known extras).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${STORYBOOK_PORT:-9009}"
# Extra ports this repo has used for temporary/debug Storybook instances.
EXTRA_PORTS="${STORYBOOK_EXTRA_PORTS:-9010 9999}"

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
