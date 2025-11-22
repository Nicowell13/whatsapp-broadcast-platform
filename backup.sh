#!/bin/bash

# Backup script for WhatsApp Broadcast Platform
# Add to crontab: 0 2 * * * /opt/whatsapp-broadcast-platform/backup.sh

BACKUP_DIR="/opt/backups/whatsapp-broadcast"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

# Backup PostgreSQL Database
echo "Backing up database..."
docker exec wa_postgres pg_dump -U wa_admin whatsapp_broadcast | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup WAHA Sessions
echo "Backing up WAHA sessions..."
docker cp wa_waha:/app/.sessions $BACKUP_DIR/waha_sessions_$DATE

# Backup .env file
echo "Backing up configuration..."
cp .env $BACKUP_DIR/env_$DATE

# Compress WAHA sessions
tar -czf $BACKUP_DIR/waha_sessions_$DATE.tar.gz -C $BACKUP_DIR waha_sessions_$DATE
rm -rf $BACKUP_DIR/waha_sessions_$DATE

# Remove old backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "waha_sessions_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "env_*" -mtime +$RETENTION_DAYS -delete

echo "Backup completed at $(date)"
echo "Backup location: $BACKUP_DIR"
ls -lh $BACKUP_DIR | tail -5
