#!/bin/bash
set -e

echo "Starting entrypoint script..."

# Export only the secret values as environment variables
for secret_file in /run/secrets/*; do
  if [ -f "$secret_file" ]; then
    secret_name=$(basename "$secret_file")
    secret_value=$(cat "$secret_file")
    export "$secret_name=$secret_value"
    echo "Exported secret: $secret_name"
  fi
done

# Execute the default command
exec "$@"
