#!/bin/sh
set -e

# Si DATABASE_URL no está definida, intentar construirla desde las variables de Azure
if [ -z "$DATABASE_URL" ]; then
  if [ -n "$AZURE_SQL_USERNAME" ] && [ -n "$AZURE_SQL_PASSWORD" ] && [ -n "$AZURE_SQL_HOST" ] && [ -n "$AZURE_SQL_PORT" ] && [ -n "$AZURE_SQL_DATABASE" ] && [ -n "$AZURE_SQL_AUTHENTICATION" ]; then
    # Escapar caracteres especiales
    ESCAPED_USERNAME=$(echo "$AZURE_SQL_USERNAME" | sed 's/-/%2D/g')
    
    echo "Debug - Valores para DATABASE_URL (sin contraseña):"
    echo "AZURE_SQL_USERNAME original: $AZURE_SQL_USERNAME"
    echo "AZURE_SQL_USERNAME escaped: $ESCAPED_USERNAME"
    echo "AZURE_SQL_HOST: $AZURE_SQL_HOST"
    echo "AZURE_SQL_PORT: $AZURE_SQL_PORT"
    echo "AZURE_SQL_DATABASE: $AZURE_SQL_DATABASE"
    echo "AZURE_SQL_AUTHENTICATION: $AZURE_SQL_AUTHENTICATION"
    
    export DATABASE_URL="sqlserver://$ESCAPED_USERNAME:$AZURE_SQL_PASSWORD@$AZURE_SQL_HOST:$AZURE_SQL_PORT;database=$AZURE_SQL_DATABASE;authentication=$AZURE_SQL_AUTHENTICATION"
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