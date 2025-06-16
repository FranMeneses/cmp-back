#!/bin/sh
set -e

# Verificar variables de entorno requeridas
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL no está definida"
  exit 1
fi

if [ -z "$AZURE_STORAGE_CONNECTION_STRING" ]; then
  echo "Error: AZURE_STORAGE_CONNECTION_STRING no está definida"
  exit 1
fi

if [ -z "$AZURE_STORAGE_SAS_TOKEN" ]; then
  echo "Error: AZURE_STORAGE_SAS_TOKEN no está definida"
  exit 1
fi

# Ejecutar el comando original
exec "$@" 