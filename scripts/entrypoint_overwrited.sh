#!/bin/bash

# Define a mapping of secret names to environment variable names
declare -A secret_env_map=(
  ["databaseUrl"]="DATABASE_URL"
  ["directUrl"]="DIRECT_URL"
  ["supabaseUrl"]="NEXT_PUBLIC_SUPABASE_URL"
  ["anonKey"]="NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ["cryptokey"]="NEXT_PUBLIC_CRYPTO_SECRET_KEY"
  ["serviceRoleKey"]="SUPABASE_SERVICE_ROLE_KEY"
  ["baseUrl"]="NEXT_PUBLIC_BASE_URL"
)

# Export secrets as environment variables and write to .env file
echo "# Auto-generated env file" > /usr/src/app/.env
for secret_file in /run/secrets/*; do
  if [ -f "$secret_file" ]; then
    secret_name=$(basename "$secret_file")
    secret_value=$(cat "$secret_file")
    env_var_name="${secret_env_map[$secret_name]}"

    if [ -n "$env_var_name" ]; then
      echo "Exported $env_var_name from $secret_name"
      export "$env_var_name=$secret_value"
      echo "$env_var_name=$secret_value" >> /usr/src/app/.env
    else
      echo "Warning: No mapping found for secret $secret_name"
    fi
  fi
done

# Load .env file (optional for debugging)
set -a
. /usr/src/app/.env
set +a

exec "$@"
