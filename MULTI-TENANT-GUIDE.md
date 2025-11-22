# 🚀 Multi-Tenant Deployment Guide
## WhatsApp Broadcast API - SaaS Model

Deploy multiple isolated instances for different clients on 1 VPS.

---

## 📋 Domain Structure

```
Client 1: api.siripku.id       → Backend + Frontend
Client 2: api2.siripku.id      → Backend + Frontend  
Client 3: api3.siripku.id      → Backend + Frontend
...
Client 10: api10.siripku.id    → Backend + Frontend
```

---

## 🎯 Architecture Overview

```
1 VPS (8GB RAM recommended)
│
├── Nginx Proxy Manager (ports 80, 443, 81)
│   ├── api.siripku.id → wa_backend_1 + wa_frontend_1
│   ├── api2.siripku.id → wa_backend_2 + wa_frontend_2
│   ├── api3.siripku.id → wa_backend_3 + wa_frontend_3
│   └── ...
│
├── Shared Resources
│   ├── PostgreSQL (separate database per client)
│   └── Redis (shared with key prefixes)
│
└── Per-Client Containers
    ├── Backend API (NestJS)
    ├── Frontend (NextJS)
    ├── Worker (2x for faster delivery)
    └── WAHA (WhatsApp session - isolated per client)
```

---

## 🔧 Step-by-Step Deployment

### 1️⃣ Prepare VPS & DNS

```bash
# Point all subdomains to your VPS IP
# In your DNS provider (Cloudflare/cPanel/etc):

A Record: api.siripku.id    → YOUR_VPS_IP
A Record: api2.siripku.id   → YOUR_VPS_IP
A Record: api3.siripku.id   → YOUR_VPS_IP
A Record: api4.siripku.id   → YOUR_VPS_IP
... (up to api10)

# Or use wildcard:
A Record: *.siripku.id      → YOUR_VPS_IP
```

### 2️⃣ Initial VPS Setup (One Time)

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create main directory
mkdir -p /opt/whatsapp-saas
cd /opt/whatsapp-saas

# Create network for Nginx Proxy Manager
docker network create nginx_proxy_manager_default
```

### 3️⃣ Deploy Nginx Proxy Manager (One Time)

```bash
# Create directory
mkdir -p /opt/whatsapp-saas/nginx-proxy-manager
cd /opt/whatsapp-saas/nginx-proxy-manager

# Create docker-compose.yml
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx_proxy_manager
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "81:81"
    environment:
      DB_SQLITE_FILE: "/data/database.sqlite"
    volumes:
      - npm_data:/data
      - npm_letsencrypt:/etc/letsencrypt
    networks:
      - default

networks:
  default:
    name: nginx_proxy_manager_default
    external: true

volumes:
  npm_data:
  npm_letsencrypt:
EOF

# Deploy
docker-compose up -d

# Access NPM at http://YOUR_VPS_IP:81
# Default: admin@example.com / changeme
# CHANGE PASSWORD IMMEDIATELY!
```

### 4️⃣ Deploy Client 1 (api.siripku.id)

```bash
cd /opt/whatsapp-saas

# Clone/copy project
git clone <your-repo> client1
cd client1

# Create .env file
cat > .env <<'EOF'
# Database Configuration
POSTGRES_USER=client1_user
POSTGRES_PASSWORD=STRONG_PASSWORD_CLIENT1_CHANGE_THIS
POSTGRES_DB=client1_wa_db

# JWT Secret
JWT_SECRET=client1_jwt_secret_min_32_characters_random_CHANGE_THIS

# Frontend URL
FRONTEND_URL=https://api.siripku.id
NEXT_PUBLIC_API_URL=https://api.siripku.id/api

# Message Pacing (milliseconds)
MESSAGE_PACING_MIN=2000
MESSAGE_PACING_MAX=4000

# Worker Configuration
WORKER_CONCURRENCY=1
EOF

# Edit docker-compose.yml - Update container names
nano docker-compose.yml
# Change all container names:
# wa_postgres → wa_postgres_c1
# wa_redis → wa_redis_c1
# wa_waha → wa_waha_c1
# wa_backend → wa_backend_c1
# wa_worker → wa_worker_c1
# wa_frontend → wa_frontend_c1

# Deploy
docker-compose up -d --build
```

**Edit docker-compose.yml for Client 1:**
```yaml
# Replace container names to avoid conflicts
services:
  postgres:
    container_name: wa_postgres_c1
    
  redis:
    container_name: wa_redis_c1
    
  waha:
    container_name: wa_waha_c1
    
  backend:
    container_name: wa_backend_c1
    
  worker:
    container_name: wa_worker_c1
    
  frontend:
    container_name: wa_frontend_c1
```

### 5️⃣ Setup SSL in Nginx Proxy Manager

1. Open `http://YOUR_VPS_IP:81`
2. Login and change password
3. Go to **Hosts → Proxy Hosts → Add Proxy Host**

**For Client 1 (api.siripku.id):**

**Setup #1: Backend API**
```
Domain Names: api.siripku.id
Scheme: http
Forward Hostname/IP: wa_backend_c1
Forward Port: 3000
☑ Cache Assets
☑ Block Common Exploits
☑ Websockets Support

SSL Tab:
☑ Request a new SSL Certificate
☑ Force SSL
☑ HTTP/2 Support
Email: your@email.com
☑ I Agree to the Let's Encrypt Terms
```

**Setup #2: Frontend (Optional - if you want separate frontend domain)**
```
Domain Names: app.siripku.id (or use same domain with /app path)
Scheme: http
Forward Hostname/IP: wa_frontend_c1
Forward Port: 3001
☑ SSL settings same as above
```

### 6️⃣ Deploy Client 2 (api2.siripku.id)

```bash
cd /opt/whatsapp-saas

# Copy from client1
cp -r client1 client2
cd client2

# Update .env
cat > .env <<'EOF'
# Database Configuration
POSTGRES_USER=client2_user
POSTGRES_PASSWORD=STRONG_PASSWORD_CLIENT2_CHANGE_THIS
POSTGRES_DB=client2_wa_db

# JWT Secret
JWT_SECRET=client2_jwt_secret_min_32_characters_random_CHANGE_THIS

# Frontend URL
FRONTEND_URL=https://api2.siripku.id
NEXT_PUBLIC_API_URL=https://api2.siripku.id/api

# Message Pacing
MESSAGE_PACING_MIN=2000
MESSAGE_PACING_MAX=4000

# Worker Configuration
WORKER_CONCURRENCY=1
EOF

# Edit docker-compose.yml - Change container names to _c2
nano docker-compose.yml
# wa_postgres_c1 → wa_postgres_c2
# wa_redis_c1 → wa_redis_c2
# wa_waha_c1 → wa_waha_c2
# wa_backend_c1 → wa_backend_c2
# wa_worker_c1 → wa_worker_c2
# wa_frontend_c1 → wa_frontend_c2

# Deploy
docker-compose up -d --build
```

**Add in Nginx Proxy Manager:**
- Domain: `api2.siripku.id`
- Forward to: `wa_backend_c2:3000`
- Enable SSL

### 7️⃣ Repeat for Clients 3-10

```bash
# For each new client:
cd /opt/whatsapp-saas
cp -r client1 client3
cd client3

# Update .env with client3 credentials
# Update docker-compose.yml container names to _c3
# Deploy: docker-compose up -d --build
# Add domain in Nginx Proxy Manager
```

---

## 🔄 Quick Deployment Script

Create `deploy-new-client.sh`:

```bash
#!/bin/bash

# Usage: ./deploy-new-client.sh 3 api3.siripku.id

CLIENT_NUM=$1
DOMAIN=$2

if [ -z "$CLIENT_NUM" ] || [ -z "$DOMAIN" ]; then
    echo "Usage: ./deploy-new-client.sh <client_number> <domain>"
    echo "Example: ./deploy-new-client.sh 3 api3.siripku.id"
    exit 1
fi

echo "🚀 Deploying Client $CLIENT_NUM on $DOMAIN"

cd /opt/whatsapp-saas
cp -r client1 client$CLIENT_NUM
cd client$CLIENT_NUM

# Generate random password
POSTGRES_PASS=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 48)

# Create .env
cat > .env <<EOF
POSTGRES_USER=client${CLIENT_NUM}_user
POSTGRES_PASSWORD=$POSTGRES_PASS
POSTGRES_DB=client${CLIENT_NUM}_wa_db
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
MESSAGE_PACING_MIN=2000
MESSAGE_PACING_MAX=4000
WORKER_CONCURRENCY=1
EOF

# Update container names
sed -i "s/_c1/_c${CLIENT_NUM}/g" docker-compose.yml

# Deploy
docker-compose up -d --build

echo "✅ Client $CLIENT_NUM deployed!"
echo "📝 Credentials saved in .env"
echo "🌐 Add domain $DOMAIN in Nginx Proxy Manager:"
echo "   Forward to: wa_backend_c${CLIENT_NUM}:3000"
echo ""
echo "🔐 Database Password: $POSTGRES_PASS"
echo "🔑 JWT Secret: $JWT_SECRET"
```

Make it executable:
```bash
chmod +x deploy-new-client.sh
```

Use it:
```bash
./deploy-new-client.sh 3 api3.siripku.id
./deploy-new-client.sh 4 api4.siripku.id
./deploy-new-client.sh 5 api5.siripku.id
```

---

## 📊 Resource Planning

### VPS Requirements per Number of Clients:

| Clients | RAM  | CPU | Storage | VPS Cost/mo |
|---------|------|-----|---------|-------------|
| 1-3     | 4GB  | 2   | 40GB    | $10-15      |
| 4-7     | 8GB  | 4   | 80GB    | $20-30      |
| 8-12    | 16GB | 6   | 120GB   | $40-60      |
| 13-20   | 32GB | 8   | 200GB   | $80-120     |

### Per-Client Resource Usage:

```yaml
Each client uses approximately:
- RAM: 600-800MB
- CPU: 0.3-0.5 cores
- Storage: 2-5GB (depending on messages)
```

---

## 💰 Pricing Strategy

```
Package         Price/mo    Resources
───────────────────────────────────────────
Starter         $49         1 worker, 5k msgs
Professional    $99         2 workers, 25k msgs
Business        $199        5 workers, 100k msgs
Enterprise      $499        10 workers, unlimited
```

---

## 🔐 Security Best Practices

### 1. Firewall Setup
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow from YOUR_IP to any port 81  # NPM admin
ufw enable
```

### 2. Regular Backups
```bash
# Backup all clients
for client in client1 client2 client3; do
    docker exec wa_postgres_${client/client/c} pg_dump -U ${client}_user ${client}_wa_db | gzip > /backup/${client}_$(date +%Y%m%d).sql.gz
done
```

### 3. Monitor Resources
```bash
# Check all containers
docker stats

# Check specific client
docker stats wa_backend_c1 wa_worker_c1 wa_waha_c1
```

---

## 🛠️ Management Commands

### Check Status
```bash
# All clients
docker ps | grep "wa_"

# Specific client
docker-compose -f /opt/whatsapp-saas/client1/docker-compose.yml ps
```

### View Logs
```bash
# Client 1 backend
docker logs -f wa_backend_c1

# Client 2 worker
docker logs -f wa_worker_c2
```

### Restart Client
```bash
cd /opt/whatsapp-saas/client1
docker-compose restart
```

### Stop Client
```bash
cd /opt/whatsapp-saas/client1
docker-compose down
```

### Remove Client
```bash
cd /opt/whatsapp-saas
docker-compose -f client3/docker-compose.yml down -v
rm -rf client3
```

---

## 📈 Scaling Tips

1. **Monitor RAM usage** - Add more RAM before deploying more clients
2. **Use SSD** - Better I/O performance
3. **Separate DB server** - For 10+ clients, use dedicated PostgreSQL server
4. **Load balancer** - For 20+ clients, use multiple VPS with load balancer
5. **CDN** - Use Cloudflare for frontend assets

---

## 🎯 Next Steps

After deployment:
1. ✅ Test each client's API: `https://api.siripku.id/api`
2. ✅ Access frontend: `https://api.siripku.id`
3. ✅ Create admin account for each client
4. ✅ Connect WhatsApp number via QR code
5. ✅ Test sending campaign
6. ✅ Monitor resource usage
7. ✅ Setup automated backups

---

## 📞 Support

For issues:
- Check logs: `docker logs wa_backend_c1`
- Check health: `docker stats`
- Restart if needed: `docker-compose restart`

**Your SaaS is ready to scale! 🚀**
