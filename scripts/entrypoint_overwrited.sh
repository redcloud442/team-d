#!/bin/bash

# Map specific secret file names to environment variable names
declare -A env_map
env_map["databaseUrl"]="DATABASE_URL"
env_map["directUrl"]="DIRECT_URL"
env_map["supabaseUrl"]="NEXT_PUBLIC_SUPABASE_URL"
env_map["anonKey"]="NEXT_PUBLIC_SUPABASE_ANON_KEY"
env_map["cryptokey"]="NEXT_PUBLIC_CRYPTO_SECRET_KEY"
env_map["serviceRoleKey"]="SUPABASE_SERVICE_ROLE_KEY"
env_map["baseUrl"]="NEXT_PUBLIC_BASE_URL"
# Loop through secret files and export them as mapped environment variables
for secret_file in /run/secrets/*; do
  if [ -f "$secret_file" ]; then
    secret_name=$(basename "$secret_file")
    if [[ -n "${env_map[$secret_name]}" ]]; then
      secret_value=$(cat "$secret_file")
      export "${env_map[$secret_name]}=$secret_value"
    fi
  fi
done

# Execute the default command
exec "$@"
