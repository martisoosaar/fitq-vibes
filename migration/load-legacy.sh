#!/usr/bin/env bash
set -euo pipefail

SQL_FILE=${1:-migration/fitq_legacy.sql}

if [ ! -f "$SQL_FILE" ]; then
  echo "Usage: $0 path/to/legacy_dump.sql"
  exit 1
fi

echo "Starting MySQL (docker compose) if not running..."
docker compose up -d db

DB_CONTAINER=$(docker compose ps -q db)
if [ -z "$DB_CONTAINER" ]; then
  echo "Failed to resolve db container" >&2
  exit 1
fi

echo "Copying dump to container..."
docker cp "$SQL_FILE" "$DB_CONTAINER":/tmp/legacy.sql

echo "Creating legacy database and importing dump..."
docker compose exec -T db sh -lc "mysql -uroot -proot -e 'CREATE DATABASE IF NOT EXISTS fitq_legacy;' && mysql -uroot -proot fitq_legacy < /tmp/legacy.sql"

echo "Done. You can now set LEGACY_DATABASE_URL or LEGACY_DB_* to point at mysql://root:root@localhost:3306/fitq_legacy"

