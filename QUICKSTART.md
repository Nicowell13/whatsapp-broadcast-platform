# ⚡ Quick Start Guide

Get your WhatsApp Broadcast Platform running in 10 minutes!

## Prerequisites

- VPS with Ubuntu 20.04+ (4GB RAM minimum)
- Domain name pointing to your VPS
- Root/sudo access

## 🚀 Installation

### Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Run One-Line Install

```bash
cd /opt && \
git clone <YOUR_REPO_URL> whatsapp-broadcast-platform && \
cd whatsapp-broadcast-platform && \
cp .env.example .env && \
chmod +x deploy.sh && \
nano .env
```

### Step 3: Edit Environment Variables

Update these in `.env`:

```env
# Strong passwords!
POSTGRES_PASSWORD=YourStrongPassword123!
JWT_SECRET=YourVeryLongRandomSecretKey32CharsMin

# Your domains
FRONTEND_URL=https://broadcast.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Save and exit (Ctrl+X, Y, Enter)

### Step 4: Deploy

```bash
sudo ./deploy.sh
```

Wait 5-10 minutes for deployment to complete.

### Step 5: Setup Domains

1. Open Nginx Proxy Manager: `http://your-vps-ip:81`
2. Login: `admin@example.com` / `changeme`
3. **Change password immediately!**

4. Add Frontend Proxy:
   - Hosts → Add Proxy Host
   - Domain: `broadcast.yourdomain.com`
   - Forward to: `wa_frontend` port `3001`
   - SSL: Request certificate, Force SSL

5. Add Backend Proxy:
   - Domain: `api.yourdomain.com`
   - Forward to: `wa_backend` port `3000`
   - SSL: Request certificate, Force SSL

### Step 6: Access Platform

Open browser: `https://broadcast.yourdomain.com`

## 🎯 First Campaign

### 1. Register Account
- Open frontend URL
- Click "Register"
- Fill in your details

### 2. Create WhatsApp Session
- Go to "WhatsApp Sessions"
- Click "New Session"
- Name it: `default`
- Click "Show QR"
- Scan with WhatsApp

### 3. Add Contacts
- Go to "Contacts"
- Click "Add Contact" or "Import CSV"
- Add at least 1 contact

### 4. Create Campaign
- Go to "Campaigns"
- Click "New Campaign"
- Fill in:
  - Name: "Test Campaign"
  - Message: "Hello from WhatsApp Broadcast!"
  - Session ID: `default`
- Click "Create"

### 5. Send Campaign
- Find your campaign
- Click Send icon
- Confirm
- Check "Messages" page for status

## ✅ Verify Installation

```bash
# Check all services running
docker-compose ps

# Should see all services "Up"

# Check health
./health-check.sh

# View logs
docker-compose logs -f
```

## 🔧 Common Issues

### Ports not accessible?
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
```

### Domain not working?
- Wait 5-10 minutes for DNS propagation
- Check domain DNS is pointing to VPS IP
- Check firewall allows port 80 & 443

### WhatsApp won't connect?
- Wait 30 seconds after scanning QR
- Try creating new session
- Check WAHA logs: `docker logs wa_waha -f`

### Messages not sending?
- Check worker logs: `docker-compose logs -f worker`
- Check queue: `docker exec wa_redis redis-cli LLEN bull:messages:wait`
- Restart worker: `docker-compose restart worker`

## 📚 Next Steps

1. Read full documentation: `README.md`
2. Setup automatic backups: `./backup.sh`
3. Monitor your system: `./health-check.sh`
4. Scale workers if needed: `docker-compose up -d --scale worker=5`

## 🆘 Need Help?

- Check `FAQ.md` for common questions
- Check `API.md` for API documentation
- Open an issue on GitHub
- Check logs: `docker-compose logs`

## 🎉 Congratulations!

Your WhatsApp Broadcast Platform is now running!

---

**Security Reminder:**
- Change all default passwords
- Use strong JWT secret
- Enable firewall
- Regular backups
- Keep system updated

**Legal Reminder:**
- Only send to opted-in contacts
- Respect WhatsApp terms of service
- Follow local regulations
- Don't spam!
