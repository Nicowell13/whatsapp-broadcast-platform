# WhatsApp Broadcast Platform

Platform broadcast WhatsApp Business menggunakan WAHA API dengan arsitektur production-ready untuk multi-domain deployment.

## 🏗️ Arsitektur

- **Frontend**: NextJS (Static/SSR)
- **Backend**: NestJS (REST API)
- **Database**: PostgreSQL (Central DB)
- **Queue**: Redis (Message Queue & Pacing)
- **WhatsApp**: WAHA API (Containerized)
- **Reverse Proxy**: Nginx Proxy Manager
- **Deployment**: Docker Compose

## 🚀 Fitur Utama

- ✅ **Rich Messages**: Gambar + Text + 2 Tombol URL (WhatsApp Business format)
- ✅ **Smart Pacing**: 7-8 detik delay + 15s pause setiap 10 pesan (anti-ban)
- ✅ **Batch Limiting**: Max 500 pesan per session untuk keamanan
- ✅ Multi-domain support (5-10 domain per VPS)
- ✅ Queue-based delivery dengan Redis
- ✅ Scalable worker consumers
- ✅ SSL otomatis via Nginx Proxy Manager
- ✅ Memory limiting per container
- ✅ Production-ready mode
- ✅ Health monitoring
- ✅ CSV Contact Import
- ✅ Campaign Management
- ✅ Real-time Statistics

## 📋 Prerequisites

- Docker & Docker Compose
- VPS dengan minimal 4GB RAM
- Domain dengan DNS pointing ke VPS

## 🔧 Setup

### 1. Clone & Environment

```bash
cd /opt
git clone <repository-url> whatsapp-broadcast-platform
cd whatsapp-broadcast-platform
cp .env.example .env
nano .env  # Edit sesuai konfigurasi
```

### 2. Setup Nginx Proxy Manager (First Time)

```bash
# Create network untuk reverse proxy
docker network create nginx_proxy_manager_default

# Deploy Nginx Proxy Manager
cd nginx-proxy-manager
docker-compose up -d
```

Akses: `http://your-vps-ip:81`
- Default: `admin@example.com` / `changeme`
- Ganti password setelah login pertama

### 3. Deploy Application

```bash
# Build dan jalankan semua services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Setup Domain di Nginx Proxy Manager

1. Buka Nginx Proxy Manager (port 81)
2. Add Proxy Host untuk **Frontend**:
   - Domain: `broadcast1.domain.com`
   - Forward to: `wa_frontend:3001`
   - Enable SSL (Let's Encrypt)
3. Add Proxy Host untuk **Backend API**:
   - Domain: `api-broadcast1.domain.com`
   - Forward to: `wa_backend:3000`
   - Enable SSL (Let's Encrypt)

## 🔄 Multi-Project Deployment

Untuk deploy project ke-2, ke-3, dst pada VPS yang sama:

```bash
# Copy project
cp -r whatsapp-broadcast-platform whatsapp-project2
cd whatsapp-project2

# Edit docker-compose.yml - ubah semua container_name
# wa_postgres -> wa_postgres_p2
# wa_backend -> wa_backend_p2
# dst...

# Edit .env dengan database & secret berbeda

# Deploy
docker-compose up -d --build
```

Tambahkan domain baru di Nginx Proxy Manager untuk setiap project.

## 📊 Monitoring

### Check Queue Status

```bash
docker exec -it wa_redis redis-cli
> LLEN message_queue
> KEYS *
```

### Check Database

```bash
docker exec -it wa_postgres psql -U wa_admin -d whatsapp_broadcast
> SELECT COUNT(*) FROM campaigns;
> SELECT COUNT(*) FROM messages;
```

### Check Logs

```bash
# Backend logs
docker logs wa_backend -f

# Worker logs
docker logs wa_worker -f

# WAHA logs
docker logs wa_waha -f
```

## 🔐 Security Checklist

- [ ] Ganti semua password di `.env`
- [ ] Ganti JWT_SECRET dengan string random panjang
- [ ] Enable firewall (hanya port 80, 443, 22)
- [ ] Setup SSL untuk semua domain
- [ ] Batasi akses Nginx Proxy Manager (port 81)
- [ ] Regular backup database

## 📈 Scaling

### Scale Workers

```bash
docker-compose up -d --scale worker=5
```

### Adjust Memory Limits

Edit `deploy.resources.limits.memory` di `docker-compose.yml`

## 🛠️ Maintenance

### Backup Database

```bash
docker exec wa_postgres pg_dump -U wa_admin whatsapp_broadcast > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker exec -i wa_postgres psql -U wa_admin whatsapp_broadcast < backup_20231122.sql
```

### Update Containers

```bash
docker-compose pull
docker-compose up -d --build
```

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

### Campaigns
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - Get campaign details
- `POST /campaigns/:id/send` - Send campaign

### Contacts
- `GET /contacts` - List contacts
- `POST /contacts` - Add contact
- `POST /contacts/import` - Import CSV

### Messages
- `GET /messages` - List messages
- `GET /messages/stats` - Message statistics

### WAHA Session
- `GET /waha/sessions` - List WhatsApp sessions
- `POST /waha/sessions` - Create session
- `GET /waha/sessions/:id/qr` - Get QR code

## 🐛 Troubleshooting

### Container tidak start
```bash
docker-compose logs <service_name>
docker-compose restart <service_name>
```

### Queue macet
```bash
docker exec -it wa_redis redis-cli FLUSHALL
docker-compose restart worker
```

### Database connection error
```bash
docker-compose restart postgres
# Tunggu 10 detik
docker-compose restart backend worker
```

## 📞 Support

Untuk issue dan pertanyaan, silakan buka issue di repository ini.

## 📄 License

MIT License
