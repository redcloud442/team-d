#!/bin/bash

# Export all secrets in /run/secrets as environment variables
if [ -d "/run/secrets" ]; then
  export $(grep -v '^#' /run/secrets/* | xargs)
fi

# Call the original entrypoint or application
exec "$@"