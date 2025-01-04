#!/bin/bash

# Export all secrets in /run/secrets as environment variables
for secret_file in /run/secrets/*; do
  if [ -f "$secret_file" ]; then
    secret_name=$(basename "$secret_file")
    secret_value=$(cat "$secret_file")
    export "$secret_name=$secret_value"
  fi
done

# Execute the default command
exec "$@"
