#!/usr/bin/env bash
# ==============================================================================
# RESTAURANTOS DATABASE RESTORATION SCRIPT (BASH)
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path-to-backup-file> [optional-target-db-path]"
  echo "Example PG:     $0 backups/restaurantos_pg_20261106.dump"
  echo "Example SQLite: $0 backups/restaurantos_sqlite_20261106.db ./dev.db"
  exit 1
fi

BACKUP_FILE="$1"
TARGET_DB="${2:-./dev.db}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "================================================================="
echo "  RESTAURANTOS DATABASE RESTORATION"
echo "  Restoring from: $BACKUP_FILE"
echo "================================================================="

read -p "⚠️  WARNING: Restoring will overwrite current database state. Continue? (y/N): " -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Restoration aborted by operator."
  exit 0
fi

if [[ "$BACKUP_FILE" == *.dump ]] || [[ "$BACKUP_FILE" == *pg* ]]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "❌ Error: DATABASE_URL environment variable must be set for PostgreSQL restore."
    exit 1
  fi
  echo ">>> Restoring PostgreSQL database from dump..."
  pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" "$BACKUP_FILE"
  echo "✅ PostgreSQL restoration completed successfully."
else
  echo ">>> Restoring SQLite database..."
  cp "$BACKUP_FILE" "$TARGET_DB"
  echo "✅ SQLite database replaced with backup: $TARGET_DB"
fi
