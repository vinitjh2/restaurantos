#!/usr/bin/env bash
# ==============================================================================
# RESTAURANTOS AUTOMATED DATABASE BACKUP SCRIPT (BASH)
# Supports both PostgreSQL (pg_dump) and local SQLite (.backup)
# ==============================================================================

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

echo "================================================================="
echo "  RESTAURANTOS DATABASE BACKUP INITIATED: $TIMESTAMP"
echo "================================================================="

if [ -n "${DATABASE_URL:-}" ] && [[ "$DATABASE_URL" == postgresql* ]]; then
  BACKUP_FILE="$BACKUP_DIR/restaurantos_pg_$TIMESTAMP.dump"
  echo ">>> Target: PostgreSQL Database"
  echo ">>> Dumping schema and data to: $BACKUP_FILE"
  
  pg_dump "$DATABASE_URL" \
    --format=custom \
    --compress=9 \
    --verbose \
    --file="$BACKUP_FILE"
    
  echo "✅ PostgreSQL backup completed successfully: $(du -h "$BACKUP_FILE" | cut -f1)"
else
  # SQLite Backup
  SQLITE_DB="${1:-./dev.db}"
  BACKUP_FILE="$BACKUP_DIR/restaurantos_sqlite_$TIMESTAMP.db"
  echo ">>> Target: SQLite Database ($SQLITE_DB)"
  
  if [ ! -f "$SQLITE_DB" ]; then
    echo "❌ Error: SQLite database file not found at $SQLITE_DB"
    exit 1
  fi
  
  sqlite3 "$SQLITE_DB" ".backup '$BACKUP_FILE'"
  gzip -k "$BACKUP_FILE"
  echo "✅ SQLite backup completed: $BACKUP_FILE.gz"
fi

# Retention policy: Prune backups older than 30 days
echo ">>> Applying 30-day retention cleanup..."
find "$BACKUP_DIR" -type f -name "restaurantos_*" -mtime +30 -delete || true
echo "✅ Backup process finished cleanly."
