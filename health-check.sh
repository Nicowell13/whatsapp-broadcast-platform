#!/bin/bash

# Health Check Script for WhatsApp Broadcast Platform

echo "🏥 Health Check - WhatsApp Broadcast Platform"
echo "=============================================="
echo ""

# Check Docker services
echo "📦 Docker Services Status:"
docker-compose ps

echo ""
echo "🔍 Service Health Checks:"

# Check PostgreSQL
if docker exec wa_postgres pg_isready -U wa_admin > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Healthy"
else
    echo "❌ PostgreSQL: Not responding"
fi

# Check Redis
if docker exec wa_redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Not responding"
fi

# Check Backend
if curl -s http://localhost:3000/api > /dev/null; then
    echo "✅ Backend API: Healthy"
else
    echo "❌ Backend API: Not responding"
fi

# Check Frontend
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Not responding"
fi

# Check WAHA
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ WAHA: Healthy"
else
    echo "❌ WAHA: Not responding"
fi

echo ""
echo "📊 Queue Statistics:"
docker exec wa_redis redis-cli <<EOF
ECHO "Pending messages:"
LLEN bull:messages:wait
ECHO "Active jobs:"
LLEN bull:messages:active
ECHO "Failed jobs:"
LLEN bull:messages:failed
EOF

echo ""
echo "💾 Database Statistics:"
docker exec wa_postgres psql -U wa_admin -d whatsapp_broadcast -c "
SELECT 
    (SELECT COUNT(*) FROM campaigns) as total_campaigns,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM messages WHERE status='sent') as sent_messages,
    (SELECT COUNT(*) FROM messages WHERE status='delivered') as delivered_messages,
    (SELECT COUNT(*) FROM messages WHERE status='failed') as failed_messages,
    (SELECT COUNT(*) FROM contacts WHERE \"isActive\"=true) as active_contacts;
" 2>/dev/null || echo "Database query failed"

echo ""
echo "🖥️  Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "=============================================="
echo "Health check completed at $(date)"
