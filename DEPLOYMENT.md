# WhatsApp Broadcast Platform - Deployment Guide

## 📦 Quick Deploy

### Step 1: Persiapan VPS

```bash
# Login ke VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install git
apt install git -y
```

### Step 2: Clone & Setup

```bash
# Pindah ke direktori optimal
cd /opt

# Clone repository
git clone <repository-url> whatsapp-broadcast-platform
cd whatsapp-broadcast-platform

# Copy dan edit environment
cp .env.example .env
nano .env
```

**Edit .env - Ganti nilai berikut:**
```env
POSTGRES_PASSWORD=your_strong_password_here
JWT_SECRET=your_jwt_secret_minimum_32_characters_random_string
FRONTEND_URL=https://broadcast.yourdomain.com
NEXT_PUBLIC_API_URL=https://api-broadcast.yourdomain.com
```

### Step 3: Deploy

```bash
# Jalankan deployment script
chmod +x deploy.sh
sudo ./deploy.sh
```

Script akan otomatis:
- Install Docker & Docker Compose
- Setup network
- Deploy Nginx Proxy Manager
- Build & deploy semua services

### Step 4: Setup Domain & SSL

1. **Akses Nginx Proxy Manager**
   - URL: `http://YOUR_VPS_IP:81`
   - Login: `admin@example.com` / `changeme`
   - **PENTING: Ganti password setelah login pertama!**

2. **Add Proxy Host untuk Frontend**
   - Klik "Proxy Hosts" → "Add Proxy Host"
   - Domain Names: `broadcast.yourdomain.com`
   - Scheme: `http`
   - Forward Hostname/IP: `wa_frontend`
   - Forward Port: `3001`
   - ✅ Block Common Exploits
   - ✅ Websockets Support
   - Tab "SSL":
     - ✅ Request a new SSL Certificate
     - ✅ Force SSL
     - ✅ HTTP/2 Support
     - Email: your@email.com
     - ✅ I Agree to Terms

3. **Add Proxy Host untuk Backend API**
   - Domain Names: `api-broadcast.yourdomain.com`
   - Forward Hostname/IP: `wa_backend`
   - Forward Port: `3000`
   - (Same SSL settings as above)

### Step 5: Testing

```bash
# Check semua container running
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f waha

# Test API
curl https://api-broadcast.yourdomain.com/api

# Test Frontend
# Buka browser: https://broadcast.yourdomain.com
```

## 🔄 Multi-Project Deployment (1 VPS untuk 5-10 Domain)

### Deploy Project Kedua

```bash
# Copy folder project
cd /opt
cp -r whatsapp-broadcast-platform whatsapp-project2
cd whatsapp-project2

# Edit .env dengan konfigurasi berbeda
nano .env
# Ganti DATABASE password, JWT_SECRET, dan URLs

# Edit docker-compose.yml - ganti semua container names
nano docker-compose.yml
# Contoh:
# wa_postgres -> wa_postgres_p2
# wa_backend -> wa_backend_p2
# wa_frontend -> wa_frontend_p2
# dst...

# Deploy
docker-compose up -d --build
```

### Add Domain di Nginx Proxy Manager

- Frontend Project 2: `broadcast2.yourdomain.com` → `wa_frontend_p2:3001`
- Backend Project 2: `api-broadcast2.yourdomain.com` → `wa_backend_p2:3000`

Ulangi untuk project 3, 4, 5, dst...

## 📊 Monitoring & Maintenance

### Check Queue Status

```bash
# Redis queue
docker exec -it wa_redis redis-cli
> LLEN message_queue
> KEYS *
> INFO stats
```

### Check Database

```bash
# PostgreSQL
docker exec -it wa_postgres psql -U wa_admin -d whatsapp_broadcast

# Queries
SELECT COUNT(*) FROM campaigns;
SELECT COUNT(*) FROM messages WHERE status = 'sent';
SELECT status, COUNT(*) FROM messages GROUP BY status;
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f waha

# Last 100 lines
docker-compose logs --tail=100 worker
```

### Scale Workers

```bash
# Increase workers untuk throughput lebih tinggi
docker-compose up -d --scale worker=5

# Check worker status
docker-compose ps worker
```

## 🔐 Security Checklist

- [ ] Ganti password PostgreSQL di .env
- [ ] Ganti JWT_SECRET dengan string random panjang
- [ ] Ganti password Nginx Proxy Manager default
- [ ] Enable UFW firewall:
  ```bash
  ufw allow 22
  ufw allow 80
  ufw allow 443
  ufw enable
  ```
- [ ] Batasi akses port 81 (NPM admin):
  ```bash
  ufw allow from YOUR_IP to any port 81
  ```
- [ ] Regular backup database
- [ ] Update container images secara berkala

## 💾 Backup & Restore

### Backup Database

```bash
# Manual backup
docker exec wa_postgres pg_dump -U wa_admin whatsapp_broadcast > backup_$(date +%Y%m%d).sql

# Automated daily backup (crontab)
crontab -e
# Add:
0 2 * * * docker exec wa_postgres pg_dump -U wa_admin whatsapp_broadcast > /opt/backups/wa_$(date +\%Y\%m\%d).sql
```

### Restore Database

```bash
# Restore from backup
docker exec -i wa_postgres psql -U wa_admin whatsapp_broadcast < backup_20231122.sql
```

### Backup WAHA Sessions

```bash
# Backup WhatsApp sessions
docker cp wa_waha:/app/.sessions ./waha_sessions_backup

# Restore
docker cp ./waha_sessions_backup/. wa_waha:/app/.sessions
docker-compose restart waha
```

## 🚨 Troubleshooting

### Container tidak start

```bash
# Check logs
docker-compose logs <service_name>

# Restart service
docker-compose restart <service_name>

# Rebuild container
docker-compose up -d --build <service_name>
```

### Queue macet / tidak terkirim

```bash
# Check worker logs
docker-compose logs -f worker

# Restart worker
docker-compose restart worker

# Clear failed jobs
docker exec -it wa_redis redis-cli FLUSHALL
```

### Database connection error

```bash
# Restart postgres
docker-compose restart postgres

# Wait 10 seconds
sleep 10

# Restart dependent services
docker-compose restart backend worker
```

### WAHA disconnected

```bash
# Check WAHA logs
docker-compose logs -f waha

# Restart WAHA
docker-compose restart waha

# Delete dan create session baru via frontend
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Adjust memory limits di docker-compose.yml
# Restart services
docker-compose restart
```

## 📈 Performance Tuning

### Adjust Message Pacing

Edit .env:
```env
# Lebih lambat (lebih aman)
MESSAGE_PACING_MIN=4000
MESSAGE_PACING_MAX=6000

# Lebih cepat (higher risk)
MESSAGE_PACING_MIN=1000
MESSAGE_PACING_MAX=2000
```

### Scale Workers

```bash
# More workers = faster delivery
docker-compose up -d --scale worker=10
```

### Increase Memory Limits

Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 1G  # increase from 512M
```

## 🔄 Update Application

```bash
# Pull latest changes
cd /opt/whatsapp-broadcast-platform
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📞 Support

Untuk issue dan pertanyaan, silakan buka issue di repository.
