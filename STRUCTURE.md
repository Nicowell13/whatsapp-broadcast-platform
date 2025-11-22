# 📁 Project Structure

```
whatsapp-broadcast-platform/
│
├── 📄 README.md                    # Main documentation
├── 📄 QUICKSTART.md               # Quick installation guide
├── 📄 DEPLOYMENT.md               # Detailed deployment guide
├── 📄 API.md                      # API documentation
├── 📄 FAQ.md                      # Frequently asked questions
├── 📄 CHANGELOG.md                # Version history
├── 📄 LICENSE                     # MIT License
├── 📄 CONTRIBUTING.md             # Contribution guidelines
│
├── 🐳 docker-compose.yml          # Main Docker Compose config
├── 🐳 docker-compose.prod.yml    # Production overrides
├── 📄 .env.example                # Environment variables template
├── 📄 .gitignore                  # Git ignore rules
│
├── 🔧 deploy.sh                   # Auto deployment script
├── 🔧 backup.sh                   # Backup automation script
├── 🔧 restore.sh                  # Restore from backup script
├── 🔧 health-check.sh             # System health checker
├── 📄 contacts-example.csv        # Example CSV for import
│
├── 📁 nginx-proxy-manager/        # Reverse proxy container
│   └── docker-compose.yml
│
├── 📁 backend/                    # NestJS Backend
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 nest-cli.json
│   ├── 🐳 Dockerfile
│   ├── 📄 .dockerignore
│   │
│   └── 📁 src/
│       ├── 📄 main.js             # Backend entry point
│       ├── 📄 app.module.js       # Main app module
│       ├── 📄 worker.js           # Queue worker process
│       │
│       └── 📁 modules/
│           │
│           ├── 📁 auth/           # Authentication module
│           │   ├── auth.module.js
│           │   ├── auth.service.js
│           │   ├── auth.controller.js
│           │   ├── 📁 strategies/
│           │   │   ├── local.strategy.js
│           │   │   └── jwt.strategy.js
│           │   └── 📁 guards/
│           │       ├── local-auth.guard.js
│           │       └── jwt-auth.guard.js
│           │
│           ├── 📁 users/          # User management
│           │   ├── user.entity.js
│           │   ├── users.module.js
│           │   ├── users.service.js
│           │   └── users.controller.js
│           │
│           ├── 📁 campaigns/      # Campaign management
│           │   ├── campaign.entity.js
│           │   ├── campaigns.module.js
│           │   ├── campaigns.service.js
│           │   └── campaigns.controller.js
│           │
│           ├── 📁 contacts/       # Contact management
│           │   ├── contact.entity.js
│           │   ├── contacts.module.js
│           │   ├── contacts.service.js
│           │   └── contacts.controller.js
│           │
│           ├── 📁 messages/       # Message tracking
│           │   ├── message.entity.js
│           │   ├── messages.module.js
│           │   ├── messages.service.js
│           │   └── messages.controller.js
│           │
│           ├── 📁 queue/          # Redis queue management
│           │   ├── queue.module.js
│           │   └── queue.service.js
│           │
│           ├── 📁 waha/           # WAHA API integration
│           │   ├── waha.module.js
│           │   ├── waha.service.js
│           │   └── waha.controller.js
│           │
│           ├── 📁 webhooks/       # Webhook handlers
│           │   ├── webhooks.module.js
│           │   ├── webhooks.service.js
│           │   └── webhooks.controller.js
│           │
│           └── 📁 dashboard/      # Dashboard statistics
│               ├── dashboard.module.js
│               ├── dashboard.service.js
│               └── dashboard.controller.js
│
└── 📁 frontend/                   # NextJS Frontend
    ├── 📄 package.json
    ├── 📄 next.config.js
    ├── 📄 tailwind.config.js
    ├── 📄 postcss.config.js
    ├── 🐳 Dockerfile
    ├── 📄 .dockerignore
    │
    └── 📁 src/
        ├── 📁 styles/
        │   └── globals.css        # Global styles
        │
        ├── 📁 lib/
        │   └── api.js             # API client
        │
        ├── 📁 store/
        │   └── authStore.js       # Auth state management
        │
        ├── 📁 components/
        │   └── Layout.js          # Main layout component
        │
        └── 📁 pages/
            ├── _app.js            # App wrapper
            ├── _document.js       # HTML document
            ├── index.js           # Home/redirect page
            ├── login.js           # Login/register page
            ├── dashboard.js       # Dashboard page
            ├── campaigns.js       # Campaigns page
            ├── contacts.js        # Contacts page
            ├── messages.js        # Messages page
            └── sessions.js        # WhatsApp sessions page
```

## 🏗️ Architecture Overview

### Backend (NestJS)
- **Framework**: NestJS + Express
- **Database**: PostgreSQL with TypeORM
- **Queue**: Redis + Bull
- **Authentication**: JWT + Passport
- **WhatsApp**: WAHA API integration

### Frontend (NextJS)
- **Framework**: NextJS + React
- **Styling**: Tailwind CSS
- **State**: Zustand
- **API**: React Query + Axios
- **Charts**: Recharts

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx Proxy Manager
- **SSL**: Let's Encrypt (automatic)
- **Queue Engine**: Redis
- **Database**: PostgreSQL

### Key Features
- ✅ Campaign Management
- ✅ Contact Management (CSV import)
- ✅ Message Queue with Pacing
- ✅ WhatsApp Session Management
- ✅ Real-time Dashboard
- ✅ Multi-domain Support
- ✅ Scalable Workers
- ✅ Health Monitoring
- ✅ Backup/Restore

## 📊 Data Flow

```
User → Frontend → Backend API → Redis Queue → Worker → WAHA → WhatsApp
                      ↓
                  PostgreSQL
                      ↑
                  Webhooks ← WAHA (delivery status)
```

## 🔄 Message Processing Flow

1. User creates campaign
2. Backend saves to database
3. User sends campaign
4. Backend creates message records
5. Messages added to Redis queue with delay
6. Worker picks message from queue
7. Worker sends via WAHA API
8. WAHA sends to WhatsApp
9. Webhook receives delivery status
10. Database updated with status
11. Frontend shows real-time updates

## 🚀 Deployment Flow

1. Run `deploy.sh`
2. Docker Compose builds containers
3. Nginx Proxy Manager starts
4. PostgreSQL initializes
5. Redis starts
6. WAHA container ready
7. Backend API starts
8. Workers start processing
9. Frontend serves on port 3001
10. Setup domains in NPM
11. SSL certificates auto-generated

## 📈 Scalability

- **Horizontal**: Scale workers (`--scale worker=10`)
- **Vertical**: Increase container resources
- **Multi-project**: Deploy multiple instances
- **Database**: Single shared or separate per project
- **Sessions**: Multiple WhatsApp sessions supported

## 🔐 Security Layers

1. **Authentication**: JWT tokens
2. **Authorization**: Route guards
3. **Database**: SQL injection protection
4. **Passwords**: Bcrypt hashing
5. **SSL/TLS**: Automatic HTTPS
6. **CORS**: Configured origins
7. **Environment**: Secret management

## 📦 Docker Containers

1. **nginx_proxy_manager** - Reverse proxy + SSL
2. **wa_postgres** - PostgreSQL database
3. **wa_redis** - Redis queue engine
4. **wa_waha** - WAHA WhatsApp API
5. **wa_backend** - NestJS API server
6. **wa_worker** (x2) - Queue processors
7. **wa_frontend** - NextJS web app

## 🌐 Network Architecture

```
Internet
   ↓
Nginx Proxy Manager (ports 80, 443, 81)
   ↓
Docker Network: proxy_network
   ├── Frontend (port 3001)
   └── Backend (port 3000)
       ↓
Docker Network: wa_network
   ├── PostgreSQL (port 5432)
   ├── Redis (port 6379)
   ├── WAHA (port 3000)
   └── Workers (no exposed ports)
```

## 💡 Technology Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend API | NestJS | REST API server |
| Frontend | NextJS | Web dashboard |
| Database | PostgreSQL | Data persistence |
| Queue | Redis + Bull | Message queue |
| WhatsApp | WAHA | WA integration |
| Proxy | Nginx PM | Reverse proxy + SSL |
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Multi-container mgmt |
| Auth | JWT + Passport | Authentication |
| ORM | TypeORM | Database queries |
| State | Zustand | Frontend state |
| HTTP | Axios | API calls |
| Styling | Tailwind CSS | UI framework |
| Charts | Recharts | Data visualization |

## 📝 File Count Summary

- Backend: ~50 files
- Frontend: ~15 files
- Config/Scripts: ~15 files
- Documentation: ~8 files
- **Total: ~88 files**

## 🎯 Production Ready Features

✅ Docker containerization
✅ Auto SSL certificates  
✅ Health checks
✅ Memory limits
✅ Scalable workers
✅ Automatic restart policies
✅ Backup/restore scripts
✅ Monitoring tools
✅ Multi-domain support
✅ Production Docker compose
✅ Security best practices
✅ Comprehensive docs

This is a complete, production-ready WhatsApp broadcast platform! 🚀
