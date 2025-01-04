#!/bin/sh

# Read secrets from files and sanitize
if [ -f "/run/secrets/databaseUrl" ]; then
  export DATABASE_URL=$(cat /run/secrets/databaseUrl | tr -d '\n')
fi

if [ -f "/run/secrets/directUrl" ]; then
  export DIRECT_URL=$(cat /run/secrets/directUrl | tr -d '\n')
fi

if [ -f "/run/secrets/supabaseUrl" ]; then
  export NEXT_PUBLIC_SUPABASE_URL=$(cat /run/secrets/supabaseUrl | tr -d '\n')
fi

if [ -f "/run/secrets/anonKey" ]; then
  export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(cat /run/secrets/anonKey | tr -d '\n')
fi

if [ -f "/run/secrets/cryptokey" ]; then
  export NEXT_PUBLIC_CRYPTO_SECRET_KEY=$(cat /run/secrets/cryptokey | tr -d '\n')
fi

if [ -f "/run/secrets/serviceRoleKey" ]; then
  export SUPABASE_SERVICE_ROLE_KEY=$(cat /run/secrets/serviceRoleKey | tr -d '\n')
fi

# Run the actual application
exec "$@"
