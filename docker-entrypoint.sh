#!/bin/sh
set -e

# Si DATABASE_URL no está definida, intentar construirla desde las variables de Azure
if [ -z "$DATABASE_URL" ]; then
  if [ -n "$AZURE_SQL_USERNAME" ] && [ -n "$AZURE_SQL_PASSWORD" ] && [ -n "$AZURE_SQL_HOST" ] && [ -n "$AZURE_SQL_PORT" ] && [ -n "$AZURE_SQL_DATABASE" ] && [ -n "$AZURE_SQL_AUTHENTICATION" ]; then
    export DATABASE_URL="sqlserver://$AZURE_SQL_USERNAME:$AZURE_SQL_PASSWORD@$AZURE_SQL_HOST:$AZURE_SQL_PORT;database=$AZURE_SQL_DATABASE;authentication=$AZURE_SQL_AUTHENTICATION"
    echo "DATABASE_URL construida dinámicamente."
  else
    echo "Error: Faltan variables para construir DATABASE_URL (AZURE_SQL_USERNAME, AZURE_SQL_PASSWORD, AZURE_SQL_HOST, AZURE_SQL_PORT, AZURE_SQL_DATABASE, AZURE_SQL_AUTHENTICATION)"
    exit 1
  fi
fi

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