#!/bin/bash
# Database backup script
# Creates daily pg_dump backups to /backups/db-YYYY-MM-DD.sql
#
# Usage:
# chmod +x scripts/backup-db.sh
# ./scripts/backup-db.sh
#
# For cron (daily at 2 AM):
# 0 2 * * * cd /path/to/project && ./scripts/backup-db.sh

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/db-$DATE.sql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL_UNPOOLED" ]; then
  echo "Error: DATABASE_URL_UNPOOLED environment variable is not set"
  exit 1
fi

echo "Starting database backup..."
echo "Date: $DATE"
echo "Output: $BACKUP_FILE"

# Perform backup using pg_dump
pg_dump "$DATABASE_URL_UNPOOLED" > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "✅ Backup completed successfully!"

  # Compress the backup
  gzip -f "$BACKUP_FILE"
  echo "✅ Backup compressed: ${BACKUP_FILE}.gz"

  # Remove old backups
  echo "Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "db-*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

  # List current backups
  echo ""
  echo "Current backups:"
  ls -lh "$BACKUP_DIR"
else
  echo "❌ Backup failed!"
  exit 1
fi
