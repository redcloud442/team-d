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

# Export secrets as environment variables based on the mapping
for secret_file in /run/secrets/*; do
  if [ -f "$secret_file" ]; then
    secret_name=$(basename "$secret_file")          # Extract the secret name
    secret_value=$(cat "$secret_file")             # Read the secret value
    env_var_name="${secret_env_map[$secret_name]}" # Get the mapped environment variable name

    if [ -n "$env_var_name" ]; then                # Check if mapping exists
      export "$env_var_name=$secret_value"         # Export the environment variable
      echo "Exported $env_var_name from $secret_name"  # Debug log
    else
      echo "Warning: No mapping found for secret $secret_name"  # Debug log for unmapped secrets
    fi
  fi
done

# Debugging: Print all exported environment variables (remove in production)
env | grep -E 'DATABASE_URL|DIRECT_URL|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_CRYPTO_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_BASE_URL'

# Execute the default command
exec "$@"
