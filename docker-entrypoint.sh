#!/bin/sh
set -e

echo "Starting CMP Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Warning: DATABASE_URL is not set"
else
  echo "Database URL configured"
fi

# Check if Azure Storage is configured
if [ -z "$AZURE_STORAGE_ACCOUNT_NAME" ]; then
  echo "Warning: AZURE_STORAGE_ACCOUNT_NAME is not set"
else
  echo "Azure Storage Account configured: $AZURE_STORAGE_ACCOUNT_NAME"
fi

echo "Environment: ${NODE_ENV:-development}"
echo "Port: ${PORT:-4000}"

# Execute the main command
echo "Executing: $@"
exec "$@" 