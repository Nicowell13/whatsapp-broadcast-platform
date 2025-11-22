# ⚙️ Message Pacing & Batching Configuration

## 🎯 Current Settings (Anti-Ban Optimized)

### Delay per Message
```
7-8 seconds random delay
```
- Setiap pesan dikirim dengan jeda acak 7-8 detik
- Random delay untuk terlihat lebih natural

### Batch Pause
```
15 seconds pause every 10 messages
```
- Setiap 10 pesan → pause 15 detik
- Pattern: Kirim 10 → Pause 15s → Kirim 10 → Pause 15s...

### Max Messages per Session
```
500 messages maximum per batch
```
- Kalau ada 1000 contacts → otomatis limit ke 500 pertama
- Harus send dalam 2 batch terpisah untuk keamanan

---

## 📊 Calculation Examples

### Example 1: 100 Messages
```
Messages: 100
Base delay: 7-8s per message
Batch pauses: 9 pauses × 15s = 135s

Time calculation:
- Base time: 100 × 7.5s (avg) = 750s = 12.5 minutes
- Batch pauses: 9 × 15s = 135s = 2.25 minutes
- Total: ~14-15 minutes

Pattern:
Msg 1-10   → 70-80s  → PAUSE 15s
Msg 11-20  → 70-80s  → PAUSE 15s
Msg 21-30  → 70-80s  → PAUSE 15s
...
Msg 91-100 → 70-80s  → DONE ✅
```

### Example 2: 500 Messages (Max Batch)
```
Messages: 500
Base delay: 7-8s per message
Batch pauses: 49 pauses × 15s = 735s

Time calculation:
- Base time: 500 × 7.5s = 3,750s = 62.5 minutes
- Batch pauses: 49 × 15s = 735s = 12.25 minutes
- Total: ~75 minutes (1 jam 15 menit)

Pattern:
Msg 1-10    → PAUSE 15s
Msg 11-20   → PAUSE 15s
...
Msg 491-500 → DONE ✅
```

### Example 3: 1000 Messages (Auto-Limited)
```
⚠️ DIBATASI ke 500 messages!

Warning: "Campaign limited to 500 messages per batch"

Harus kirim dalam 2 batch:
Batch 1: 500 messages → ~75 minutes
[Manual wait 1-2 hours for safety]
Batch 2: 500 messages → ~75 minutes

Total: ~2.5 hours + manual pause
```

---

## 🔧 Environment Variables

### .env Configuration
```bash
# Delay per message (milliseconds)
MESSAGE_PACING_MIN=7000    # 7 seconds
MESSAGE_PACING_MAX=8000    # 8 seconds

# Batch pause settings
BATCH_PAUSE_INTERVAL=10     # Every 10 messages
BATCH_PAUSE_DURATION=15000  # 15 seconds pause

# Max messages per session
MAX_MESSAGES_PER_BATCH=500

# Worker concurrency (recommended: 1)
WORKER_CONCURRENCY=1
```

---

## 📈 Throughput Performance

### Messages per Minute
```
With 7-8s delay + batch pause:
- Without pause: 60/7.5 = 8 msg/min
- With pause: ~6.5 msg/min (average)
```

### Messages per Hour
```
Theoretical max: 6.5 × 60 = 390 messages/hour
Actual (with safety): ~360-380 messages/hour
```

### Daily Capacity (Safe)
```
8 hours active sending: ~3,000 messages/day
16 hours: ~6,000 messages/day
24/7 (not recommended): ~8,600 messages/day
```

---

## 🛡️ Anti-Ban Strategy

### Why These Settings?
1. **7-8s delay**: Mimics human typing/sending speed
2. **15s pause every 10**: Simulates breaks (read messages, switch apps)
3. **500 max**: WhatsApp internal limit detection avoidance
4. **Random delays**: Avoid pattern detection

### Safety Levels
```
🟢 SAFE (Recommended)
- 500 messages per batch
- 7-8s delay
- 15s pause/10 msgs
- Max 2 batches/day

🟡 MODERATE (Use with Caution)
- 800 messages/day
- 5-6s delay
- Same pauses

🔴 RISKY (Not Recommended)
- 1000+ messages/day
- <5s delay
- No pauses
```

---

## 📝 How It Works

### Queue Service Logic
```javascript
// Counter tracks message number
messageCounter = 0

for each message:
  messageCounter++
  
  // Base delay 7-8s
  delay = random(7000, 8000)
  
  // Every 10th message, add 15s
  if (messageCounter % 10 === 0):
    delay += 15000
    log("⏸️ Batch pause after 10 messages")
  
  queue.add(message, { delay })
```

### Worker Processing
```javascript
Process message:
  → Send via WAHA API
  → Update status
  → Log: "Message #45 sent successfully"
  → If #50, log: "⏸️ Batch pause (15s delay)"
```

---

## 🧪 Testing Delays

### Test with Small Batch
```bash
# Create campaign with 20 contacts
# Expected time: ~3-4 minutes

Timeline:
00:00 - Msg 1-10 sent (70-80s)
01:15 - PAUSE 15s
01:30 - Msg 11-20 sent (70-80s)
02:50 - PAUSE 15s
03:05 - DONE

Total: ~3 minutes
```

### Monitor Logs
```bash
docker logs -f wa_worker_c1

Output:
[Worker] Processing message #1 to 628123...
[Worker] Message #1 sent successfully
[Worker] Processing message #2 to 628456...
...
[Worker] Message #10 sent successfully
[Worker] ⏸️ Batch pause after 10 messages (15s delay)
[Worker] Processing message #11 to 628789...
```

---

## 💡 Optimization Tips

### For Fast Campaigns (Risk: Medium)
```bash
MESSAGE_PACING_MIN=5000
MESSAGE_PACING_MAX=6000
BATCH_PAUSE_DURATION=10000
MAX_MESSAGES_PER_BATCH=300
```
→ ~50% faster, slightly higher risk

### For Ultra-Safe Campaigns (Risk: Very Low)
```bash
MESSAGE_PACING_MIN=10000
MESSAGE_PACING_MAX=12000
BATCH_PAUSE_DURATION=20000
MAX_MESSAGES_PER_BATCH=300
```
→ Slower, but safest option

### For Multiple Workers (Advanced)
```bash
WORKER_CONCURRENCY=2
# Doubles throughput but doubles risk
# Use only if you have multiple WhatsApp numbers
```

---

## 📋 Recommended Workflows

### Daily Broadcast (500 contacts)
```
09:00 - Start batch 1 (500 msgs)
10:30 - Batch 1 complete
[Rest 2-3 hours]
13:00 - (Optional) Batch 2 if needed
```

### Large Campaign (2000 contacts)
```
Day 1:
  09:00 - Batch 1 (500)
  15:00 - Batch 2 (500)
  
Day 2:
  09:00 - Batch 3 (500)
  15:00 - Batch 4 (500)
```

### Emergency Blast (High Risk)
```
Not Recommended!
If absolutely needed:
- Max 1000 messages
- 2 batches with 4-hour gap
- Monitor session closely
- Have backup number ready
```

---

## 🔍 Monitoring

### Check Queue Progress
```bash
# Current active
docker exec wa_redis_c1 redis-cli LLEN bull:messages:active

# Waiting in queue
docker exec wa_redis_c1 redis-cli LLEN bull:messages:wait

# Calculate ETA
waiting = 450
avg_time = 7.5s + (450/10 * 15s) = 7.5s + 675s
eta = 450 * 7.5 + 675 = 4050s = 67.5 minutes
```

### Watch Real-time
```bash
# Worker logs
docker logs -f wa_worker_c1 | grep "Message #"

# Count sent
docker exec wa_postgres_c1 psql -U user -d db -c \
  "SELECT COUNT(*) FROM messages WHERE status='sent';"
```

---

## ⚠️ Important Notes

1. **Don't bypass limits!** 500 message limit is for safety
2. **Random delays are intentional** - don't make them fixed
3. **Batch pause is critical** - simulates natural behavior
4. **Monitor session health** - if disconnected, STOP immediately
5. **Backup your WhatsApp number** - always have spare

---

**Current Config: Production-Ready & Anti-Ban Optimized! ✅**
