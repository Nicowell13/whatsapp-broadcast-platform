# Perintah CURL untuk WhatsApp Broadcast Platform

## Domain
- **Frontend**: https://app.siripku.id
- **API Backend**: https://api.siripku.id

## Autentikasi

Sistem menggunakan **JWT (JSON Web Token)** untuk autentikasi. Setiap request ke endpoint yang dilindungi memerlukan token JWT di header Authorization.

---

## Quick Setup & Restart

### Menggunakan Script Helper (Recommended)

Saya sudah membuat script helper untuk memudahkan restart dan check status:

**1. Restart semua services dengan urutan yang benar:**
```bash
# Make script executable
chmod +x restart-services.sh check-status.sh

# Run restart script
./restart-services.sh
```

**2. Check status semua services:**
```bash
./check-status.sh
```

### Manual Restart (Jika script tidak bisa digunakan)

```bash
# Stop semua services
docker-compose down

# Start dengan urutan yang benar
docker-compose up -d postgres
sleep 10  # Tunggu database ready
docker-compose up -d redis waha
docker-compose up -d backend worker frontend

# Monitor logs
docker-compose logs -f backend
```

---

## 1. Menambah User Baru (Register)

```bash
curl -X POST https://api.siripku.id/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Nama User Baru\",
    \"email\": \"user@example.com\",
    \"password\": \"password123\"
  }"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-user-id",
    "email": "user@example.com",
    "name": "Nama User Baru"
  }
}
```

---

## 2. Login untuk Mendapatkan JWT Token

Sebelum menghapus user atau mengakses endpoint lain, Anda harus login terlebih dahulu:

```bash
curl -X POST https://api.siripku.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@example.com\",
    \"password\": \"password123\"
  }"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1dWlkIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTYzMjE0MDAwMCwiZXhwIjoxNjMyMTQzNjAwfQ.signature",
  "user": {
    "id": "uuid-user-id",
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

**Simpan `access_token` untuk digunakan di request berikutnya.**

---

## 3. Menghapus User

**Langkah 1:** Lihat daftar user untuk mendapatkan ID user yang akan dihapus:

```bash
curl -X GET https://api.siripku.id/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
[
  {
    "id": "uuid-123",
    "email": "user1@example.com",
    "name": "User 1",
    "isActive": true,
    "createdAt": "2025-11-20T10:00:00Z"
  },
  {
    "id": "uuid-456",
    "email": "user2@example.com",
    "name": "User 2",
    "isActive": true,
    "createdAt": "2025-11-21T10:00:00Z"
  }
]
```

**Langkah 2:** Hapus user berdasarkan ID:

```bash
curl -X DELETE https://api.siripku.id/api/users/uuid-123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "User and all associated data deleted"
}
```

**⚠️ PERINGATAN:** Menghapus user akan menghapus semua data terkait (campaigns, contacts, messages) karena cascade delete.

---

## 4. Melihat Statistik Pesan Sukses Worker dalam 24 Jam

### A. Statistik Pesan Global (Semua Worker)

```bash
curl -X GET https://api.siripku.id/api/messages/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "total": 10000,
  "sent": 8000,
  "delivered": 7500,
  "failed": 500,
  "pending": 1500
}
```

### B. Melihat Pesan Spesifik Worker/User

Untuk melihat pesan dari satu worker tertentu, gunakan query parameter:

```bash
curl -X GET "https://api.siripku.id/api/messages?userId=uuid-worker-id" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### C. Statistik Dashboard (Termasuk Success Rate)

```bash
curl -X GET https://api.siripku.id/api/dashboard/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "campaigns": {
    "total": 50,
    "active": 5
  },
  "messages": {
    "total": 10000,
    "sent": 8000,
    "delivered": 7500,
    "failed": 500,
    "successRate": "75.00"
  },
  "contacts": {
    "total": 1000
  }
}
```

---

## Contoh Lengkap: Workflow Menambah dan Menghapus User

### Step 1: Login sebagai Admin
```bash
curl -X POST https://api.siripku.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```

Simpan token dari response, misalnya:
```
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIn0.abc123"
```

### Step 2: Tambah User Baru
```bash
curl -X POST https://api.siripku.id/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Worker Baru\",\"email\":\"worker@example.com\",\"password\":\"worker123\"}"
```

### Step 3: Lihat Daftar User
```bash
curl -X GET https://api.siripku.id/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Hapus User (gunakan ID dari step 3)
```bash
curl -X DELETE https://api.siripku.id/api/users/uuid-worker-id \
  -H "Authorization: Bearer $TOKEN"
```

### Step 5: Cek Statistik Pesan
```bash
curl -X GET https://api.siripku.id/api/messages/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Tips Penggunaan

1. **Menyimpan Token:**
   ```bash
   # Linux/Mac
   export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   
   # Windows PowerShell
   $TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. **Menggunakan Token yang Tersimpan:**
   ```bash
   # Linux/Mac
   curl -X GET https://api.siripku.id/api/users \
     -H "Authorization: Bearer $TOKEN"
   
   # Windows PowerShell
   curl -X GET https://api.siripku.id/api/users `
     -H "Authorization: Bearer $TOKEN"
   ```

3. **Format JSON yang Rapi:**
   ```bash
   curl -X GET https://api.siripku.id/api/users \
     -H "Authorization: Bearer $TOKEN" | json_pp
   ```

4. **Debugging (Lihat Header):**
   ```bash
   curl -v -X GET https://api.siripku.id/api/users \
     -H "Authorization: Bearer $TOKEN"
   ```

---

## Troubleshooting

### Error 500 Internal Server Error (Register/Login)

Kemungkinan penyebab:
1. **Database belum siap atau tidak terkoneksi**
2. **Environment variables tidak terset**
3. **Tabel database belum dibuat**
4. **Body parser tidak terkonfigurasi (sudah diperbaiki di code)**

**Solusi:**

```bash
# 1. Cek status semua container
docker ps -a

# 2. Pastikan PostgreSQL sudah running
docker logs wa_postgres_c1 -n 50

# 3. Jika PostgreSQL belum ready, tunggu atau restart
docker restart wa_postgres_c1
docker logs wa_postgres_c1 -f  # Tunggu sampai "database system is ready to accept connections"

# 4. Setelah database ready, rebuild dan restart backend
cd /path/to/whatsapp-broadcast-platform
docker-compose build backend
docker-compose up -d backend

# 5. Cek log backend untuk memastikan tidak ada error
docker logs wa_backend_c1 -f

# 6. Cek koneksi database dari dalam container
docker exec -it wa_postgres_c1 psql -U wa_admin -d whatsapp_broadcast -c "\dt"

# 7. Cek environment variables
docker exec wa_backend_c1 env | grep DATABASE
```

**Verifikasi database sudah ada:**
```bash
docker exec -it wa_postgres_c1 psql -U wa_admin -d whatsapp_broadcast -c "SELECT tablename FROM pg_tables WHERE schemaname='public';"
```

**Expected output:**
- users
- campaigns
- contacts
- messages

**Jika database connection refused:**
```bash
# Cek apakah postgres container running
docker ps | grep postgres

# Restart semua services dalam urutan yang benar
docker-compose down
docker-compose up -d postgres
# Tunggu 10 detik untuk database ready
sleep 10
docker-compose up -d redis waha
docker-compose up -d backend worker frontend

# Monitor logs
docker-compose logs -f backend
```

**Jika ada perubahan kode, rebuild backend:**
```bash
# Rebuild dan restart backend container
docker-compose up -d --build backend

# Atau restart semua services
docker-compose restart
```

### Error 401 Unauthorized
- Token expired atau tidak valid
- Solusi: Login ulang untuk mendapatkan token baru

### Error 404 Not Found
- Endpoint salah atau resource tidak ada
- Periksa URL dan ID yang digunakan

### Error 400 Bad Request
- Data yang dikirim tidak sesuai format
- Periksa JSON payload

### Error "Email already exists"
- Email sudah terdaftar di database
- Gunakan email lain atau hapus user lama terlebih dahulu

### Token Tidak Bekerja
Token JWT memiliki masa berlaku (biasanya 24 jam). Jika sudah kadaluarsa, login kembali untuk mendapatkan token baru.

---

## Keamanan

- **Jangan bagikan JWT token** ke orang lain
- **Gunakan HTTPS** (sudah digunakan di domain Anda)
- **Ganti password default** setelah setup pertama
- **Rotate token** secara berkala dengan login ulang
- **Simpan token di tempat aman**, jangan commit ke git

---

## Catatan Tambahan

- Endpoint `/api/messages/stats` menampilkan semua pesan, bukan hanya 24 jam terakhir
- Untuk filter pesan 24 jam terakhir, endpoint khusus perlu ditambahkan
- Semua endpoint (kecuali `/auth/register` dan `/auth/login`) memerlukan JWT token
- JWT token berisi informasi user (userId, email) dan digunakan untuk identifikasi dan authorization
