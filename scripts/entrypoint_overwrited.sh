#!/bin/bash

# Read secrets and export as environment variables
export DATABASE_URL=$(cat /run/secrets/databaseUrl)
export DIRECT_URL=$(cat /run/secrets/directUrl)
export NEXT_PUBLIC_SUPABASE_URL=$(cat /run/secrets/supabaseUrl)
export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(cat /run/secrets/anonKey)
export NEXT_PUBLIC_CRYPTO_SECRET_KEY=$(cat /run/secrets/cryptokey)
export SUPABASE_SERVICE_ROLE_KEY=$(cat /run/secrets/serviceRoleKey)
export NEXT_PUBLIC_BASE_URL=$(cat /run/secrets/baseUrl)

# Execute the default command
exec "$@"
