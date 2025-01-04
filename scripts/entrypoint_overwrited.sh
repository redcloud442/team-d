#!/bin/bash

# Function to read secrets and export them as environment variables
read_and_export_secret() {
  local secret_name=$1
  local env_var_name=$2
  if [ -f "/run/secrets/$secret_name" ]; then
    export "$env_var_name=$(cat /run/secrets/$secret_name 2>/dev/null || echo "")"
    echo "Exported $env_var_name"
  else
    echo "Warning: Secret $secret_name not found in /run/secrets."
  fi
}

# Check if the /run/secrets directory exists
if [ -d /run/secrets ]; then
  echo "Reading secrets and setting environment variables..."

  # Map secrets to environment variables
  read_and_export_secret "databaseUrl" "DATABASE_URL"
  read_and_export_secret "directUrl" "DIRECT_URL"
  read_and_export_secret "supabaseUrl" "NEXT_PUBLIC_SUPABASE_URL"
  read_and_export_secret "anonKey" "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  read_and_export_secret "cryptokey" "NEXT_PUBLIC_CRYPTO_SECRET_KEY"
  read_and_export_secret "serviceRoleKey" "SUPABASE_SERVICE_ROLE_KEY"
  read_and_export_secret "baseUrl" "NEXT_PUBLIC_BASE_URL"
else
  echo "No /run/secrets directory found. Skipping secret export."
fi

# Debugging: Print all exported environment variables (Optional: Remove in production)
echo "Environment variables successfully set:"
env | grep -E 'DATABASE_URL|DIRECT_URL|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_CRYPTO_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_BASE_URL'

# Execute the default command passed to the container
exec "$@"
