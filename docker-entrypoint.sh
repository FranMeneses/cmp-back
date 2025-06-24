#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL no está definida"
  exit 1
fi

# Ejecutar el comando original
exec "$@" 