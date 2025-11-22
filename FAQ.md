# FAQ - Frequently Asked Questions

## General

### Q: Berapa kapasitas maksimal platform ini?
A: Platform ini bisa handle:
- 10,000+ contacts
- 1,000+ messages per campaign
- 5-10 projects dalam 1 VPS (4GB RAM)
- Multiple WhatsApp sessions

### Q: Apakah aman dari banned WhatsApp?
A: Platform menggunakan:
- Message pacing 2-4 detik
- Queue-based delivery
- WAHA API yang stabil
- Best practices untuk menghindari ban

Namun, tetap ikuti guidelines WhatsApp Business dan jangan spam.

### Q: Berapa minimum spec VPS yang dibutuhkan?
A: Minimum requirements:
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Bandwidth: Unlimited

Recommended untuk production:
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD

## Deployment

### Q: Bagaimana cara deploy multiple domain di 1 VPS?
A: Lihat section "Multi-Project Deployment" di DEPLOYMENT.md. Intinya:
1. Copy folder project
2. Ganti container names di docker-compose.yml
3. Ganti credentials di .env
4. Deploy dengan docker-compose
5. Setup domain di Nginx Proxy Manager

### Q: Apakah bisa running di Windows?
A: Tidak direkomendasikan. Platform ini didesain untuk Linux (Ubuntu/Debian). Gunakan VPS Linux untuk production.

### Q: Berapa lama setup awal?
A: Sekitar 15-30 menit untuk:
- Deploy semua services
- Setup domain & SSL
- Create first campaign

## Technical

### Q: Bagaimana cara mengubah message pacing?
A: Edit file `.env`:
```env
MESSAGE_PACING_MIN=2000  # 2 detik
MESSAGE_PACING_MAX=4000  # 4 detik
```
Restart worker: `docker-compose restart worker`

### Q: Bagaimana cara scale worker?
A: 
```bash
docker-compose up -d --scale worker=5
```
Atau edit `docker-compose.yml` dan set replicas.

### Q: Database connection error, bagaimana fix?
A:
```bash
docker-compose restart postgres
sleep 10
docker-compose restart backend worker
```

### Q: Queue macet, message tidak terkirim?
A: Check worker logs:
```bash
docker-compose logs -f worker
```

Clear failed jobs:
```bash
docker exec -it wa_redis redis-cli FLUSHALL
docker-compose restart worker
```

### Q: WAHA disconnected terus, kenapa?
A: Beberapa kemungkinan:
- WhatsApp Web logout
- Session corrupt
- Container restart

Solusi:
1. Delete session di frontend
2. Create session baru
3. Scan QR code lagi

### Q: Bagaimana cara backup data?
A: Gunakan script backup otomatis:
```bash
chmod +x backup.sh
./backup.sh

# Atau setup cron untuk auto backup
crontab -e
# Add: 0 2 * * * /opt/whatsapp-broadcast-platform/backup.sh
```

### Q: Bagaimana cara restore backup?
A:
```bash
chmod +x restore.sh
./restore.sh 20231122_140000
```

## Performance

### Q: Berapa kecepatan pengiriman message?
A: Tergantung pacing:
- Pacing 2-4s = ~15-30 messages per menit
- Dengan 5 workers = ~75-150 messages per menit
- 1000 messages ≈ 7-15 menit

### Q: Bagaimana cara increase throughput?
A:
1. Scale workers: `docker-compose up -d --scale worker=10`
2. Reduce pacing (risiko ban lebih tinggi)
3. Upgrade VPS specs
4. Use multiple WhatsApp sessions

### Q: Memory usage tinggi, normal?
A: Memory usage normal:
- WAHA: 512MB - 1GB (per session)
- PostgreSQL: 256MB - 512MB
- Backend: 256MB - 512MB
- Frontend: 256MB - 512MB
- Worker: 128MB - 256MB (per worker)

Total ≈ 2-4GB untuk 1 project.

Jika lebih tinggi, check:
```bash
docker stats
```

## Security

### Q: Apakah data aman?
A: Ya, jika:
- Ganti default passwords
- Gunakan strong JWT secret
- Enable firewall
- Setup SSL/HTTPS
- Regular backup
- Update container images

### Q: Bagaimana cara secure Nginx Proxy Manager admin panel?
A:
```bash
# Limit access to your IP only
ufw allow from YOUR_IP to any port 81

# Or change to different port
# Edit nginx-proxy-manager/docker-compose.yml
```

### Q: API bisa diakses public?
A: Ya, tapi semua endpoint protected dengan JWT authentication kecuali /auth/login dan /auth/register.

Sebaiknya:
- Rate limiting di nginx
- Strong password policy
- Monitor failed login attempts

## Troubleshooting

### Q: Frontend tidak bisa connect ke backend?
A: Check:
1. NEXT_PUBLIC_API_URL di .env frontend
2. CORS settings di backend
3. Network connectivity
4. Firewall rules

### Q: SSL certificate gagal?
A: Pastikan:
- Domain sudah pointing ke VPS IP
- Port 80 & 443 terbuka
- Email valid di Let's Encrypt setup
- Tunggu beberapa menit untuk DNS propagation

### Q: Container restart terus?
A:
```bash
docker-compose logs <container_name>
# Check error messages

# Rebuild container
docker-compose up -d --build <container_name>
```

### Q: Disk space penuh?
A:
```bash
# Clean unused docker resources
docker system prune -a

# Clean old logs
docker-compose logs --tail=0 -f &
```

## Billing & Costs

### Q: Berapa biaya per bulan?
A: Estimasi:
- VPS 4GB: $10-20/bulan
- Domain: $10-15/tahun
- SSL: Free (Let's Encrypt)
- Software: Free (Open Source)

Total ≈ $15-25/bulan untuk 1 project.

### Q: Bisa menggunakan shared hosting?
A: Tidak. Platform ini memerlukan VPS dengan Docker support.

## Support

### Q: Dimana bisa dapat help?
A: 
- Baca dokumentasi di README.md, DEPLOYMENT.md, API.md
- Check FAQ ini
- Open issue di repository
- Check logs untuk error messages

### Q: Apakah ada support berbayar?
A: Tidak. Platform ini open source dan community supported.

### Q: Bisa request fitur baru?
A: Ya! Open issue di repository dengan label "feature request".

## Best Practices

### Q: Tips untuk menghindari WhatsApp ban?
A:
1. Gunakan WhatsApp Business API resmi jika volume tinggi
2. Jangan spam - kirim message relevan saja
3. Respect opt-out requests
4. Gunakan pacing 3-5 detik
5. Maksimal 1000 messages per hari per number
6. Jangan gunakan new number langsung untuk broadcast
7. Warm up number dulu dengan chat normal

### Q: Rekomendasi struktur project?
A:
1. 1 project = 1 client/brand
2. 1 project = 1 WhatsApp number
3. Separate database per project
4. Use clear naming convention
5. Regular backup per project

### Q: Monitoring yang perlu diperhatikan?
A:
- Queue status (pending messages)
- Failed message rate
- Worker health
- Database size
- Disk space
- Memory usage
- CPU usage
- WAHA session status
