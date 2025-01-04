#!/bin/bash

# Read secrets and export them as environment variables
if [ -d /run/secrets ]; then
  echo "Reading secrets..."
  export DATABASE_URL=$(cat /run/secrets/databaseUrl 2>/dev/null || echo "")
  export DIRECT_URL=$(cat /run/secrets/directUrl 2>/dev/null || echo "")
  export NEXT_PUBLIC_SUPABASE_URL=$(cat /run/secrets/supabaseUrl 2>/dev/null || echo "")
  export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(cat /run/secrets/anonKey 2>/dev/null || echo "")
  export NEXT_PUBLIC_CRYPTO_SECRET_KEY=$(cat /run/secrets/cryptokey 2>/dev/null || echo "")
  export SUPABASE_SERVICE_ROLE_KEY=$(cat /run/secrets/serviceRoleKey 2>/dev/null || echo "")
  export NEXT_PUBLIC_BASE_URL=$(cat /run/secrets/baseUrl 2>/dev/null || echo "")
else
  echo "No secrets directory found at /run/secrets."
fi


# Execute the default command
exec "$@"
