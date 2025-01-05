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

# Export secrets as environment variables and overwrite any existing variables
for secret_file in /run/secrets/*; do
  if [ -f "$secret_file" ]; then
    secret_name=$(basename "$secret_file")
    secret_value=$(cat "$secret_file")
    env_var_name="${secret_env_map[$secret_name]}"

    if [ -n "$env_var_name" ]; then
      echo "Overwriting $env_var_name with value from $secret_name"
      export "$env_var_name=$secret_value"
    else
      echo "Warning: No mapping found for secret $secret_name"
    fi
  fi
done

# Debugging: Print all overwritten environment variables (remove in production)
env | grep -E 'DATABASE_URL|DIRECT_URL|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_CRYPTO_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_BASE_URL'

printenv | while IFS='=' read -r key value; do
  echo "Replacing $key in .next files with runtime value..."
  find /usr/src/app/.next/ -type f -exec sed -i "s|$key|$value|g" {} +
done
# Execute the default command passed to the container
exec "$@"
