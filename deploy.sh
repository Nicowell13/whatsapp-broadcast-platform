#!/bin/bash

# WhatsApp Broadcast Platform - Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo -e "${BLUE}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${BLUE}Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create network for Nginx Proxy Manager
echo -e "${BLUE}Creating Docker network...${NC}"
docker network create nginx_proxy_manager_default 2>/dev/null || true

# Deploy Nginx Proxy Manager (if not already running)
if [ ! "$(docker ps -q -f name=nginx_proxy_manager)" ]; then
    echo -e "${BLUE}Deploying Nginx Proxy Manager...${NC}"
    cd nginx-proxy-manager
    docker-compose up -d
    cd ..
    echo -e "${GREEN}✓ Nginx Proxy Manager deployed${NC}"
    echo -e "${BLUE}Access at: http://$(hostname -I | awk '{print $1}'):81${NC}"
    echo -e "${BLUE}Default login: admin@example.com / changeme${NC}"
fi

# Build and deploy main application
echo -e "${BLUE}Building and deploying application...${NC}"
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 10

# Check service status
echo -e "${GREEN}Checking service status...${NC}"
docker-compose ps

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Access Nginx Proxy Manager at: http://$(hostname -I | awk '{print $1}'):81"
echo "2. Setup your domains and SSL certificates"
echo "3. Access your application"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose ps               # Check status"
echo "  docker-compose restart          # Restart services"
echo "  docker-compose down             # Stop all services"
