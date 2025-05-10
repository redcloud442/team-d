#!/bin/bash
set -e

# Inject Doppler secrets at runtime
if [ -n "$DOPPLER_TOKEN" ]; then
  echo "⬇️  Fetching secrets from Doppler..."
  doppler secrets download --no-file --format env > /usr/src/app/.env
  export $(cat /usr/src/app/.env | xargs)
else
  echo "⚠️  Skipping Doppler secret injection (no token)"
fi
# Start app
exec "$@"
