# 🚀 Quick Reference: Kirim Broadcast dengan Gambar + Tombol

## Format WhatsApp Business (Seperti Screenshot)

```
[GAMBAR]
Text message
[🟢 Tombol 1]
[🟢 Tombol 2]
```

---

## ⚡ Cara Cepat

### 1. Buat Campaign (Frontend)

```
Dashboard → Campaigns → "New Campaign"

✏️ Isi:
- Name: Promo Akhir Tahun
- Message: Perhatian hanya untuk pemilik akun dengan ID: {{name}}!...
- Image URL: https://example.com/mobil.jpg
- Button 1: "Ini Link GACOR" → https://promo.com
- Button 2: "Ini juga" → https://promo2.com
- Session: default

Klik "Create" ✅
```

### 2. Import Contacts (CSV)

```
Contacts → "Import CSV"

Format CSV:
name,phone
John Doe,6281234567890
Jane Smith,6289876543210

Upload → Import ✅
```

### 3. Send Broadcast

```
Campaigns → Klik "Send" pada campaign

Confirm: "Send to 1000 contacts?" → YES

✅ Messages masuk queue
✅ Worker kirim otomatis dengan delay 2-4 detik
✅ Progress update real-time
```

---

## 📡 Via API (Automation)

```bash
# 1. Login
curl -X POST https://api.siripku.id/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@example.com","password":"password123"}'

# Response: { "access_token": "eyJhbGc..." }

# 2. Create Campaign
curl -X POST https://api.siripku.id/api/campaigns \\
  -H "Authorization: Bearer eyJhbGc..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Promo Akhir Tahun",
    "message": "Halo {{name}}! Ada promo khusus...",
    "sessionId": "default",
    "imageUrl": "https://example.com/image.jpg",
    "buttons": [
      {"text": "Lihat Promo", "url": "https://promo.com"},
      {"text": "Hubungi CS", "url": "https://wa.me/628123456"}
    ]
  }'

# Response: { "id": "campaign-uuid", ... }

# 3. Send Campaign
curl -X POST https://api.siripku.id/api/campaigns/campaign-uuid/send \\
  -H "Authorization: Bearer eyJhbGc..." \\
  -H "Content-Type: application/json" \\
  -d '{"contactIds": ["contact-id-1", "contact-id-2"]}'

# Response: { "success": true, "totalQueued": 2 }
```

---

## 🎨 Format Message

### Plain Text
```json
{
  "message": "Halo, ada promo nih!",
  "imageUrl": null,
  "buttons": null
}
```
→ Kirim text biasa

### Text + Gambar
```json
{
  "message": "Halo, ada promo nih!",
  "imageUrl": "https://example.com/image.jpg",
  "buttons": null
}
```
→ Kirim gambar dengan caption

### Text + Gambar + Tombol (FULL)
```json
{
  "message": "Halo {{name}}! Promo khusus untuk kamu!",
  "imageUrl": "https://example.com/image.jpg",
  "buttons": [
    {"text": "Lihat Promo", "url": "https://promo.com"},
    {"text": "Beli Sekarang", "url": "https://shop.com"}
  ]
}
```
→ Kirim seperti screenshot! 🎯

---

## 🔍 Monitoring

### Dashboard
```
https://api.siripku.id/dashboard

Lihat:
- Total messages sent
- Success rate
- Active campaigns
- Daily charts
```

### Logs (Terminal)
```bash
# Worker logs
docker logs -f wa_worker_c1

# Backend logs
docker logs -f wa_backend_c1

# Queue status
docker exec wa_redis_c1 redis-cli LLEN bull:messages:wait
```

### API Stats
```bash
curl https://api.siripku.id/api/dashboard/stats \\
  -H "Authorization: Bearer TOKEN"

Response:
{
  "totalMessages": 12345,
  "sentToday": 450,
  "successRate": 98.5,
  "activeCampaigns": 3
}
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Tombol tidak muncul | Update WAHA ke versi terbaru |
| Gambar tidak load | Pastikan URL public & HTTPS |
| WhatsApp disconnect | Scan QR lagi di Sessions |
| Queue stuck | Restart worker: `docker restart wa_worker_c1` |
| Rate limit banned | Kurangi concurrency atau tambah delay |

---

## 📱 Variables

```
{{name}}  → Ganti dengan contact name
{{phone}} → Ganti dengan contact phone

Example:
"Halo {{name}}, nomor {{phone}} dapat hadiah!"

Result:
"Halo John Doe, nomor 6281234567890 dapat hadiah!"
```

---

## 🎯 Best Practices

1. **Test dulu** ke 1-5 nomor sebelum broadcast ribuan
2. **Delay 2-4 detik** sudah otomatis (anti-ban)
3. **Max 2 tombol** per message
4. **Gambar max 5MB**, format JPG/PNG
5. **Short URLs** lebih baik (bit.ly)
6. **Backup database** sebelum broadcast besar
7. **Monitor logs** saat sending
8. **Check session** sebelum broadcast

---

## 🚦 Workflow

```
1. Login → 2. Scan QR → 3. Import Contacts
    ↓
4. Create Campaign (+ Image + Buttons)
    ↓
5. Preview → 6. Send
    ↓
7. Monitor Dashboard → 8. Check Logs
```

---

## 📊 Metrics

```
Current Performance Settings:
- Delay: 7-8 seconds per message
- Batch Pause: 15s every 10 messages
- Max per Batch: 500 messages
- Throughput: ~6.5 messages/minute
- Time for 100 msgs: ~15 minutes
- Time for 500 msgs: ~75 minutes (1h 15min)
```

---

## 💡 Pro Tips

1. **Waktu Terbaik**: 09:00-17:00 WIB (business hours)
2. **Avoid**: Malam hari (00:00-06:00)
3. **Personalisasi**: Gunakan `{{name}}` untuk engagement lebih tinggi
4. **Call-to-Action**: Tombol pertama = tindakan utama
5. **Image Quality**: Compress image untuk loading cepat

---

**Dokumentasi Lengkap:**
- Setup: `QUICKSTART.md`
- Rich Messages: `RICH-MESSAGES-GUIDE.md`
- Multi-Tenant: `SAAS-QUICKSTART.md`
- API Reference: `API.md`

**Support:** Cek `FAQ.md` atau logs!
