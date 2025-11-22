# Multi-Tenant Setup Guide

## Quick Start for Your SaaS Model

### Domain Pattern:
- Client 1: `api.siripku.id`
- Client 2: `api2.siripku.id`
- Client 3: `api3.siripku.id`
- ... and so on

---

## 🚀 Fast Deployment

### 1. Setup DNS (Do this first!)

Point all subdomains to your VPS IP:

```
A Record: api.siripku.id    → YOUR_VPS_IP
A Record: api2.siripku.id   → YOUR_VPS_IP
A Record: api3.siripku.id   → YOUR_VPS_IP
...
A Record: api10.siripku.id  → YOUR_VPS_IP
```

### 2. Deploy Client 1 (Template)

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Create directory
mkdir -p /opt/whatsapp-saas/client1
cd /opt/whatsapp-saas

# Clone your code
git clone <repo> client1
cd client1

# Create .env
cp .env.example .env
nano .env  # Edit credentials

# Deploy
docker network create nginx_proxy_manager_default
docker-compose up -d --build
```

### 3. Deploy Nginx Proxy Manager

```bash
cd /opt/whatsapp-saas
git clone <repo> nginx-proxy-manager
cd nginx-proxy-manager
docker-compose up -d

# Access: http://YOUR_VPS_IP:81
# Login: admin@example.com / changeme
# CHANGE PASSWORD!
```

### 4. Add Domain in NPM

- Domain: `api.siripku.id`
- Forward to: `wa_backend_c1:3000`
- Enable SSL ✅

### 5. Deploy More Clients (2, 3, 4...)

```bash
cd /opt/whatsapp-saas
chmod +x deploy-new-client.sh

# Deploy client 2
./deploy-new-client.sh 2 api2.siripku.id

# Deploy client 3
./deploy-new-client.sh 3 api3.siripku.id

# Deploy client 4
./deploy-new-client.sh 4 api4.siripku.id
```

After each deployment, add domain in Nginx Proxy Manager!

---

## 📊 Pricing Packages

### Basic ($49/month)
- 1 WhatsApp number
- 5,000 messages/month
- 1,000 contacts
- 1 worker (standard delivery)

### Professional ($99/month)
- 1 WhatsApp number
- 25,000 messages/month
- 5,000 contacts
- 2 workers (faster delivery)

### Business ($199/month)
- 1 WhatsApp number
- 100,000 messages/month
- 20,000 contacts
- 5 workers (very fast delivery)

### Enterprise ($499/month)
- Multiple WhatsApp numbers
- Unlimited messages
- Unlimited contacts
- 10 workers (maximum speed)
- Priority support

---

## 💰 Revenue Projection

```
VPS: 8GB RAM = $30/month

10 clients × $99/month = $990/month
Cost: -$30/month
Profit: $960/month 💰

20 clients (2 VPS) = $1,980/month
Cost: -$60/month  
Profit: $1,920/month 💰💰

50 clients (5 VPS) = $4,950/month
Cost: -$150/month
Profit: $4,800/month 💰💰💰
```

---

## 🔧 Daily Operations

### Check All Clients
```bash
docker ps | grep "wa_"
```

### View Client Logs
```bash
docker logs -f wa_backend_c1   # Client 1
docker logs -f wa_backend_c2   # Client 2
```

### Restart Client
```bash
cd /opt/whatsapp-saas/client2
docker-compose restart
```

### Backup Client Data
```bash
docker exec wa_postgres_c1 pg_dump -U client1_user client1_wa_db | gzip > client1_backup.sql.gz
```

---

## 📈 Monitoring

### Resource Usage
```bash
docker stats

# Shows:
# - RAM usage per container
# - CPU usage
# - Network I/O
```

### Queue Status
```bash
docker exec wa_redis_c1 redis-cli LLEN bull:messages:wait
```

### Database Stats
```bash
docker exec wa_postgres_c1 psql -U client1_user -d client1_wa_db -c "SELECT COUNT(*) FROM messages;"
```

---

## 🛡️ Security

### Firewall
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Limit NPM Access
```bash
ufw allow from YOUR_IP to any port 81
```

### Regular Updates
```bash
cd /opt/whatsapp-saas/client1
git pull
docker-compose build --no-cache
docker-compose up -d
```

---

## 🎯 Client Onboarding Process

1. **Sign Up** - Client subscribes to package
2. **Deploy** - Run `./deploy-new-client.sh <num> <domain>`
3. **DNS Setup** - Add domain in NPM
4. **Credentials** - Send login details to client
5. **WhatsApp Setup** - Client scans QR code
6. **Training** - Guide client on using platform
7. **Billing** - Setup recurring payment

---

## 📞 Customer Support

### Common Issues

**Q: Client can't access their domain**
```bash
# Check container status
docker ps | grep c2

# Check logs
docker logs wa_backend_c2

# Restart if needed
cd /opt/whatsapp-saas/client2
docker-compose restart
```

**Q: Messages not sending**
```bash
# Check worker
docker logs wa_worker_c2

# Check queue
docker exec wa_redis_c2 redis-cli LLEN bull:messages:wait

# Restart worker
docker restart wa_worker_c2
```

**Q: WhatsApp disconnected**
```bash
# Client needs to scan QR again
# They can do this from their dashboard
# Or check WAHA logs:
docker logs wa_waha_c2
```

---

## 🚀 Scaling Beyond 10 Clients

### Option 1: Bigger VPS
- Upgrade to 16GB RAM = 20 clients
- Upgrade to 32GB RAM = 40 clients

### Option 2: Multiple VPS
- VPS 1: Clients 1-10
- VPS 2: Clients 11-20
- VPS 3: Clients 21-30

### Option 3: Dedicated Database Server
- Separate VPS for PostgreSQL
- All clients connect to central DB
- Better performance

---

## ✅ Checklist

Before launching SaaS:

- [ ] VPS setup complete
- [ ] Nginx Proxy Manager running
- [ ] Client 1 deployed and tested
- [ ] All DNS records configured
- [ ] Deployment script tested
- [ ] Backup system setup
- [ ] Monitoring tools ready
- [ ] Pricing packages defined
- [ ] Payment gateway integrated
- [ ] Support process documented
- [ ] Marketing materials ready
- [ ] Terms of service created

---

**Your WhatsApp Broadcast SaaS is ready to launch! 🎉**

Read full guide: `MULTI-TENANT-GUIDE.md`
