#!/bin/bash
set -e


if [ -f /run/secrets/serviceRoleKey ]; then
  export SUPABASE_SERVICE_ROLE_KEY=$(cat /run/secrets/serviceRoleKey)
fi

if [ -f /run/secrets/databaseUrl ]; then
  export DATABASE_URL=$(cat /run/secrets/databaseUrl)
fi

if [ -f /run/secrets/directUrl ]; then
  export DIRECT_URL=$(cat /run/secrets/directUrl)
fi

# Start the application
exec "$@"
