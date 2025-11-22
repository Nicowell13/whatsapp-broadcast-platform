# 📱 WhatsApp Rich Messages Guide

## Format Pesan dengan Gambar + Tombol

Sesuai request, platform support format WhatsApp Business seperti:
- ✅ **1 Gambar**
- ✅ **Text message**
- ✅ **Max 2 tombol URL** (tombol hijau)

---

## 🎨 Cara Membuat Campaign dengan Gambar + Tombol

### Via Frontend (UI)

1. **Buka Campaigns** → Klik **"New Campaign"**

2. **Isi Form:**
   ```
   Name: Promo Akhir Tahun
   
   Message:
   Perhatian hanya untuk pemilik akun dengan ID: {{name}}!
   
   Sunlaku dapet minimal 50 ribu. Langsung kita bantu 
   akan kamu sekarang juga..Dep??
   
   Image URL:
   https://example.com/mobil.jpg
   
   Button 1:
   - Text: Ini Link GACOR
   - URL: https://promo.example.com
   
   Button 2:
   - Text: Ini juga
   - URL: https://promo2.example.com
   
   Session ID: default
   ```

3. **Klik "Create"** ✅

4. **Klik "Send"** untuk broadcast ke semua contacts

---

## 📡 Via API (Postman/cURL)

### Create Campaign dengan Gambar + Buttons

```bash
POST https://api.siripku.id/api/campaigns
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Promo Akhir Tahun",
  "message": "Perhatian hanya untuk pemilik akun dengan ID: {{name}}!\n\nSunlaku dapet minimal 50 ribu. Langsung kita bantu akan kamu sekarang juga..Dep??",
  "sessionId": "default",
  "imageUrl": "https://example.com/mobil.jpg",
  "buttons": [
    {
      "text": "Ini Link GACOR",
      "url": "https://promo.example.com"
    },
    {
      "text": "Ini juga",
      "url": "https://promo2.example.com"
    }
  ]
}
```

### Response:
```json
{
  "id": "campaign-uuid",
  "name": "Promo Akhir Tahun",
  "message": "Perhatian hanya untuk...",
  "imageUrl": "https://example.com/mobil.jpg",
  "buttons": [
    { "text": "Ini Link GACOR", "url": "https://promo.example.com" },
    { "text": "Ini juga", "url": "https://promo2.example.com" }
  ],
  "status": "draft",
  "createdAt": "2025-11-22T10:30:00Z"
}
```

---

## 🔄 Format Pesan yang Dikirim

Saat campaign di-send, **worker** otomatis deteksi format:

### Scenario 1: Text + Gambar + 2 Tombol (Seperti Screenshot)
```javascript
// Worker otomatis kirim via WAHA API:
POST http://waha:3000/api/sendButtons
{
  "session": "default",
  "chatId": "6281234567890@c.us",
  "text": "Perhatian hanya untuk pemilik akun dengan ID: John Doe!...",
  "image": {
    "url": "https://example.com/mobil.jpg"
  },
  "buttons": [
    {
      "id": "btn_0",
      "text": "Ini Link GACOR",
      "url": "https://promo.example.com"
    },
    {
      "id": "btn_1",
      "text": "Ini juga",
      "url": "https://promo2.example.com"
    }
  ]
}
```

**Hasil di WhatsApp:**
```
[GAMBAR MOBIL]

Perhatian hanya untuk pemilik akun dengan ID: John Doe!

Sunlaku dapet minimal 50 ribu. Langsung kita bantu 
akan kamu sekarang juga..Dep??

[🟢 Ini Link GACOR]
[🟢 Ini juga]
```

### Scenario 2: Hanya Text + Gambar (Tanpa Tombol)
```javascript
POST http://waha:3000/api/sendImage
{
  "session": "default",
  "chatId": "6281234567890@c.us",
  "file": {
    "url": "https://example.com/mobil.jpg"
  },
  "caption": "Pesan promo..."
}
```

### Scenario 3: Text Saja (Tanpa Gambar & Tombol)
```javascript
POST http://waha:3000/api/sendText
{
  "session": "default",
  "chatId": "6281234567890@c.us",
  "text": "Pesan promo..."
}
```

---

## 🎯 Variable Template

Gunakan `{{name}}` untuk personalisasi:

```
Message: "Halo {{name}}, ada promo khusus untuk kamu!"

Hasil:
- John Doe → "Halo John Doe, ada promo khusus untuk kamu!"
- Jane Smith → "Halo Jane Smith, ada promo khusus untuk kamu!"
```

---

## 📋 Validasi & Limitasi

### ✅ Yang Didukung:
- **Max 2 tombol** per message (sesuai WhatsApp API)
- **1 gambar** per message
- **Format URL valid** untuk image dan button links
- **Text unlimited** (recommended max 1000 chars)

### ❌ Yang Tidak Didukung:
- Lebih dari 2 tombol (akan di-slice ke 2 tombol pertama)
- Video/Audio (hanya image)
- Quick reply buttons (hanya URL buttons)

---

## 🧪 Testing

### Test via Frontend:
1. Create campaign dengan gambar + 2 buttons
2. Import 1 test contact
3. Send campaign
4. Check WhatsApp phone

### Test via Logs:
```bash
# Monitor worker
docker logs -f wa_worker_c1

# Cek output:
[Worker] Processing message xxx to 6281234567890
[Worker] Sending image + buttons to 6281234567890
[Worker] Message xxx sent successfully
```

---

## 🐛 Troubleshooting

### Q: Tombol tidak muncul?
**A:** Pastikan:
- WAHA versi terbaru support buttons API
- WhatsApp Business account (bukan regular WA)
- Format URL valid (https://)

### Q: Gambar tidak muncul?
**A:** Pastikan:
- URL gambar publicly accessible
- Format: JPG, PNG (max 5MB)
- HTTPS (bukan HTTP)

### Q: Error "sendButtons not found"?
**A:** Update WAHA container:
```bash
docker pull devlikeapro/waha:latest
docker-compose up -d --build
```

---

## 💡 Tips

1. **Upload Gambar**: Gunakan image hosting (Imgur, Cloudinary, Google Drive public link)
2. **Short URLs**: Gunakan bit.ly untuk URLs yang lebih pendek
3. **Testing**: Test dulu ke 1 nomor sebelum broadcast ke ribuan contacts
4. **Anti-Ban**: Platform sudah auto delay 2-4 detik antar message

---

**Sekarang Anda bisa kirim broadcast seperti di screenshot! 🚀**
