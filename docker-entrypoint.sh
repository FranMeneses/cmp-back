#!/bin/sh
set -e

# Si DATABASE_URL no está definida, intentar construirla desde las variables de Azure
if [ -z "$DATABASE_URL" ]; then
  if [ -n "$AZURE_SQL_HOST" ] && [ -n "$AZURE_SQL_PORT" ] && [ -n "$AZURE_SQL_DATABASE" ]; then
    echo "Debug - Valores para DATABASE_URL:"
    echo "AZURE_SQL_HOST: $AZURE_SQL_HOST"
    echo "AZURE_SQL_PORT: $AZURE_SQL_PORT"
    echo "AZURE_SQL_DATABASE: $AZURE_SQL_DATABASE"
    
    # Usar formato alternativo de conexión para Azure SQL
    export DATABASE_URL="Server=$AZURE_SQL_HOST;Database=$AZURE_SQL_DATABASE;Port=$AZURE_SQL_PORT;Authentication=Active Directory Default;TrustServerCertificate=true"
    echo "DATABASE_URL construida dinámicamente usando autenticación MSI."
  else
    echo "Error: Faltan variables para construir DATABASE_URL (AZURE_SQL_HOST, AZURE_SQL_PORT, AZURE_SQL_DATABASE)"
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