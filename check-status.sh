#!/bin/bash

# Script untuk check status semua services

echo "🔍 Checking WhatsApp Broadcast Platform Status"
echo "=============================================="
echo ""

echo "📦 Container Status:"
docker-compose ps
echo ""

echo "🗄️ PostgreSQL Status:"
if docker exec wa_postgres_c1 pg_isready -U wa_admin 2>/dev/null; then
    echo "✅ PostgreSQL is ready"
    echo ""
    echo "📊 Database Tables:"
    docker exec -it wa_postgres_c1 psql -U wa_admin -d whatsapp_broadcast -c "\dt" 2>/dev/null || echo "❌ Cannot connect to database"
else
    echo "❌ PostgreSQL is not ready"
fi
echo ""

echo "🔴 Redis Status:"
if docker exec wa_redis_c1 redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi
echo ""

echo "📱 WAHA Status:"
WAHA_STATUS=$(curl -s http://localhost:3000/api/sessions 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ WAHA is responding"
else
    echo "❌ WAHA is not responding"
fi
echo ""

echo "🔧 Backend Status:"
BACKEND_STATUS=$(docker exec wa_backend_c1 curl -s http://localhost:3000/api 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding"
fi
echo ""

echo "🌐 Frontend Status:"
FRONTEND_STATUS=$(curl -s http://localhost:3001 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi
echo ""

echo "💾 Disk Usage:"
docker system df
echo ""

echo "📝 Recent Backend Logs (last 20 lines):"
echo "----------------------------------------"
docker logs wa_backend_c1 --tail 20
echo ""

echo "🔧 Environment Check:"
echo "Backend DATABASE_HOST: $(docker exec wa_backend_c1 env | grep DATABASE_HOST)"
echo "Backend DATABASE_NAME: $(docker exec wa_backend_c1 env | grep DATABASE_NAME)"
echo "Backend REDIS_HOST: $(docker exec wa_backend_c1 env | grep REDIS_HOST)"
