#!/bin/bash

# Auto Deploy New Client Script
# Usage: ./deploy-new-client.sh <client_number> <domain>
# Example: ./deploy-new-client.sh 2 api2.siripku.id

set -e

CLIENT_NUM=$1
DOMAIN=$2
BASE_DIR="/opt/whatsapp-saas"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$CLIENT_NUM" ] || [ -z "$DOMAIN" ]; then
    echo -e "${RED}Usage: ./deploy-new-client.sh <client_number> <domain>${NC}"
    echo -e "${YELLOW}Example: ./deploy-new-client.sh 2 api2.siripku.id${NC}"
    exit 1
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 WhatsApp Broadcast SaaS Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Client Number: ${CLIENT_NUM}${NC}"
echo -e "${GREEN}Domain: ${DOMAIN}${NC}"
echo ""

# Check if client already exists
if [ -d "$BASE_DIR/client$CLIENT_NUM" ]; then
    echo -e "${RED}Error: Client $CLIENT_NUM already exists!${NC}"
    exit 1
fi

# Check if template exists
if [ ! -d "$BASE_DIR/client1" ]; then
    echo -e "${RED}Error: Template client1 not found!${NC}"
    echo -e "${YELLOW}Please deploy client1 first as template.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Copying template...${NC}"
cd $BASE_DIR
cp -r client1 client$CLIENT_NUM
cd client$CLIENT_NUM

echo -e "${BLUE}Step 2: Generating credentials...${NC}"
POSTGRES_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

echo -e "${BLUE}Step 3: Creating .env file...${NC}"
cat > .env <<EOF
# Database Configuration
POSTGRES_USER=client${CLIENT_NUM}_user
POSTGRES_PASSWORD=$POSTGRES_PASS
POSTGRES_DB=client${CLIENT_NUM}_wa_db

# JWT Secret
JWT_SECRET=$JWT_SECRET

# Frontend URL
FRONTEND_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api

# Message Pacing (milliseconds)
MESSAGE_PACING_MIN=2000
MESSAGE_PACING_MAX=4000

# Worker Configuration
WORKER_CONCURRENCY=1
EOF

echo -e "${BLUE}Step 4: Updating container names...${NC}"
# Update all container names from _c1 to _c${CLIENT_NUM}
sed -i "s/wa_postgres_c1/wa_postgres_c${CLIENT_NUM}/g" docker-compose.yml
sed -i "s/wa_redis_c1/wa_redis_c${CLIENT_NUM}/g" docker-compose.yml
sed -i "s/wa_waha_c1/wa_waha_c${CLIENT_NUM}/g" docker-compose.yml
sed -i "s/wa_backend_c1/wa_backend_c${CLIENT_NUM}/g" docker-compose.yml
sed -i "s/wa_worker_c1/wa_worker_c${CLIENT_NUM}/g" docker-compose.yml
sed -i "s/wa_frontend_c1/wa_frontend_c${CLIENT_NUM}/g" docker-compose.yml

echo -e "${BLUE}Step 5: Deploying containers...${NC}"
docker-compose up -d --build

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Client $CLIENT_NUM Deployed Successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo -e "   Client Number: ${CLIENT_NUM}"
echo -e "   Domain: ${DOMAIN}"
echo -e "   Container Prefix: wa_*_c${CLIENT_NUM}"
echo ""
echo -e "${YELLOW}🔐 Credentials (SAVE THESE!):${NC}"
echo -e "   Database User: client${CLIENT_NUM}_user"
echo -e "   Database Password: ${POSTGRES_PASS}"
echo -e "   Database Name: client${CLIENT_NUM}_wa_db"
echo -e "   JWT Secret: ${JWT_SECRET}"
echo ""
echo -e "${YELLOW}🌐 Next Steps:${NC}"
echo -e "   1. Open Nginx Proxy Manager: http://YOUR_VPS_IP:81"
echo -e "   2. Add Proxy Host:"
echo -e "      - Domain: ${DOMAIN}"
echo -e "      - Forward to: wa_backend_c${CLIENT_NUM}:3000"
echo -e "      - Enable SSL"
echo -e "   3. Test API: https://${DOMAIN}/api"
echo -e "   4. Access Frontend: https://${DOMAIN}"
echo ""
echo -e "${YELLOW}🔍 Verify Deployment:${NC}"
echo -e "   docker ps | grep c${CLIENT_NUM}"
echo -e "   docker logs -f wa_backend_c${CLIENT_NUM}"
echo ""
echo -e "${YELLOW}📄 Credentials saved to: ${BASE_DIR}/client${CLIENT_NUM}/.env${NC}"
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
