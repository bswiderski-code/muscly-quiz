#!/usr/bin/env bash
# Refresh exchange rates via the app HTTP API (same logic as POST /api/exchange-rates).
# Intended for cron inside the app container (hits localhost).
set -euo pipefail

if [[ -z "${EXCHANGE_RATE_APIKEY:-}" ]]; then
  echo "refresh-exchange-rates: EXCHANGE_RATE_APIKEY is not set" >&2
  exit 1
fi

PORT="${PORT:-3000}"
URL="${EXCHANGE_RATES_REFRESH_URL:-http://127.0.0.1:${PORT}/api/exchange-rates}"

curl -sfS -X POST \
  -H "X-Admin-Secret: ${EXCHANGE_RATE_APIKEY}" \
  "$URL"

echo
echo "refresh-exchange-rates: OK"
