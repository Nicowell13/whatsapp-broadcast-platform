#!/bin/bash

# Script untuk restart services dengan urutan yang benar
# Pastikan database ready sebelum backend start

echo "🔄 Stopping all services..."
docker-compose down

echo ""
echo "🗄️ Starting PostgreSQL database..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is ready
until docker exec wa_postgres_c1 pg_isready -U wa_admin 2>/dev/null; do
  echo "   Database is unavailable - waiting..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"
echo ""

echo "🚀 Starting Redis and WAHA..."
docker-compose up -d redis waha

echo "⏳ Waiting for Redis and WAHA to be ready..."
sleep 3

echo ""
echo "🔧 Rebuilding and starting Backend..."
docker-compose build backend
docker-compose up -d backend

echo "⏳ Waiting for Backend to initialize..."
sleep 5

echo ""
echo "👷 Starting Workers..."
docker-compose up -d worker

echo ""
echo "🌐 Starting Frontend..."
docker-compose up -d frontend

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "📋 To view logs:"
echo "   Backend:  docker logs wa_backend_c1 -f"
echo "   Worker:   docker-compose logs worker -f"
echo "   Frontend: docker logs wa_frontend_c1 -f"
echo "   Database: docker logs wa_postgres_c1 -f"
echo ""
echo "🔍 Check backend health:"
echo "   curl http://localhost:3000/api"
