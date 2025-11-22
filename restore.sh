#!/bin/bash

# Restore script for WhatsApp Broadcast Platform
# Usage: ./restore.sh <backup_date>
# Example: ./restore.sh 20231122_140000

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_date>"
    echo "Example: ./restore.sh 20231122_140000"
    echo ""
    echo "Available backups:"
    ls -1 /opt/backups/whatsapp-broadcast/db_*.sql.gz | sed 's/.*db_//' | sed 's/.sql.gz//'
    exit 1
fi

BACKUP_DIR="/opt/backups/whatsapp-broadcast"
BACKUP_DATE=$1

# Check if backup exists
if [ ! -f "$BACKUP_DIR/db_$BACKUP_DATE.sql.gz" ]; then
    echo "Error: Backup not found: $BACKUP_DIR/db_$BACKUP_DATE.sql.gz"
    exit 1
fi

echo "⚠️  WARNING: This will restore data from backup $BACKUP_DATE"
echo "Current data will be replaced!"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Starting restore..."

# Stop services
echo "Stopping services..."
docker-compose stop backend worker

# Restore database
echo "Restoring database..."
gunzip < $BACKUP_DIR/db_$BACKUP_DATE.sql.gz | docker exec -i wa_postgres psql -U wa_admin whatsapp_broadcast

# Restore WAHA sessions if exists
if [ -f "$BACKUP_DIR/waha_sessions_$BACKUP_DATE.tar.gz" ]; then
    echo "Restoring WAHA sessions..."
    docker-compose stop waha
    tar -xzf $BACKUP_DIR/waha_sessions_$BACKUP_DATE.tar.gz -C /tmp
    docker cp /tmp/waha_sessions_$BACKUP_DATE/. wa_waha:/app/.sessions
    rm -rf /tmp/waha_sessions_$BACKUP_DATE
    docker-compose start waha
fi

# Start services
echo "Starting services..."
docker-compose start backend worker

echo "✅ Restore completed!"
echo "Please verify your data."
