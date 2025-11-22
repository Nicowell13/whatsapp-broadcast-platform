# ⏱️ Message Delivery Timeline

## Visual Timeline: 100 Messages Campaign

```
Time    | Messages | Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
00:00   | #1       | ━━━━━━━▶ Sent (7s delay)
00:07   | #2       | ━━━━━━━━▶ Sent (8s delay)
00:15   | #3       | ━━━━━━━▶ Sent (7s delay)
00:22   | #4       | ━━━━━━━━▶ Sent (8s delay)
00:30   | #5       | ━━━━━━━▶ Sent (7s delay)
00:37   | #6       | ━━━━━━━━▶ Sent (8s delay)
00:45   | #7       | ━━━━━━━▶ Sent (7s delay)
00:52   | #8       | ━━━━━━━━▶ Sent (8s delay)
01:00   | #9       | ━━━━━━━▶ Sent (7s delay)
01:07   | #10      | ━━━━━━━━▶ Sent (8s delay)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
01:15   |          | ⏸️  PAUSE 15 SECONDS (Batch break)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
01:30   | #11      | ━━━━━━━▶ Sent (7s delay)
01:37   | #12      | ━━━━━━━━▶ Sent (8s delay)
01:45   | #13      | ━━━━━━━▶ Sent (7s delay)
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
02:45   |          | ⏸️  PAUSE 15 SECONDS (Batch break)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
03:00   | #21      | ━━━━━━━▶ Sent
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14:00   | #100     | ━━━━━━━━▶ Sent ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ~14-15 minutes for 100 messages
```

---

## Batch Pattern Visualization

### Pattern Diagram
```
┌─────────────────────────────────────────────────────────┐
│  Message Batch Flow                                     │
└─────────────────────────────────────────────────────────┘

Msg 1-10  [██████████] 7-8s each  →  ⏸️ 15s PAUSE
Msg 11-20 [██████████] 7-8s each  →  ⏸️ 15s PAUSE
Msg 21-30 [██████████] 7-8s each  →  ⏸️ 15s PAUSE
Msg 31-40 [██████████] 7-8s each  →  ⏸️ 15s PAUSE
Msg 41-50 [██████████] 7-8s each  →  ⏸️ 15s PAUSE
...
Msg 491-500 [██████████] 7-8s each  →  ✅ COMPLETE
```

### Real-time Progress Bar (500 messages)
```
Progress: [████████░░░░░░░░░░░░░░░░░░░░░░] 32%

Status: Sending message #160 of 500
Sent: 155 | Failed: 5 | Remaining: 340
Next pause in: 5 messages (at #170)
Estimated time remaining: ~45 minutes
```

---

## Time Calculation Table

| Messages | Base Time | Pauses | Total Time | Hourly Rate |
|----------|-----------|--------|------------|-------------|
| 10       | 75s       | 0      | ~1.5 min   | 400/hour    |
| 50       | 375s      | 60s    | ~7 min     | 428/hour    |
| 100      | 750s      | 135s   | ~15 min    | 400/hour    |
| 200      | 1500s     | 285s   | ~30 min    | 400/hour    |
| 500      | 3750s     | 735s   | ~75 min    | 400/hour    |

---

## Worker Log Example (Live)

```
🔄 Worker started and processing messages...
   Pacing: 7000ms - 8000ms per message
   Batch Pause: 15s every 10 messages
   Max per Batch: 500 messages
   Concurrency: 1

[00:00:00] [Queue] Campaign started with 500 messages
[00:00:00] [Queue] Message counter reset

[00:00:01] [Worker] Processing message #1 (abc-123) to 6281234567890
[00:00:01] [Worker] Sending image + buttons to 6281234567890
[00:00:02] [Worker] Message #1 sent successfully

[00:00:09] [Worker] Processing message #2 (abc-124) to 6289876543210
[00:00:09] [Worker] Sending image + buttons to 6289876543210
[00:00:10] [Worker] Message #2 sent successfully

[00:00:17] [Worker] Processing message #3 (abc-125) to 6287771234567
...

[01:07:00] [Worker] Processing message #10 (abc-132) to 6285551234567
[01:07:00] [Worker] Sending image + buttons to 6285551234567
[01:07:01] [Worker] Message #10 sent successfully
[01:07:01] [Worker] ⏸️  Batch pause after 10 messages (15s delay)
[01:07:01] [Queue] Batch pause after 10 messages: +15000ms

[01:07:16] [Worker] Processing message #11 (abc-133) to 6281119876543
[01:07:16] [Worker] Sending image + buttons to 6281119876543
[01:07:17] [Worker] Message #11 sent successfully

...

[01:15:00] [Worker] Processing message #20 (abc-142) to 6282229876543
[01:15:00] [Worker] Message #20 sent successfully
[01:15:00] [Worker] ⏸️  Batch pause after 20 messages (15s delay)

...

[75:00:00] [Worker] Processing message #500 (abc-622) to 6289999876543
[75:00:00] [Worker] Message #500 sent successfully
[75:00:00] [Campaign] Campaign completed: 495 sent, 5 failed
```

---

## Redis Queue Visualization

```bash
$ watch -n 5 'docker exec wa_redis_c1 redis-cli LLEN bull:messages:wait'

Time    | Queue Size | Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
00:00   | 500        | Campaign started
00:05   | 495        | 5 messages processed
00:10   | 490        | Steady progress
01:15   | 485        | First pause complete
05:00   | 450        | 50 messages sent
15:00   | 400        | 100 messages sent
30:00   | 350        | 150 sent, pauses included
45:00   | 300        | 200 sent
60:00   | 250        | Halfway point!
75:00   | 0          | COMPLETE ✅
```

---

## Performance Dashboard

### Real-time Metrics View
```
┌─────────────────────────────────────────────────────────┐
│  Campaign: Promo Akhir Tahun                            │
│  Status: ● Sending                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Progress: 245 / 500 messages (49%)                    │
│  [████████████████████░░░░░░░░░░░░░░░░░░░]            │
│                                                         │
│  ✅ Sent: 240                                           │
│  ❌ Failed: 5                                           │
│  ⏳ Pending: 255                                        │
│                                                         │
│  Next pause: in 5 messages (at #250)                   │
│  Estimated completion: 14:30 WIB                        │
│  Elapsed time: 32 minutes                               │
│  Remaining time: ~33 minutes                            │
│                                                         │
│  Current rate: 6.5 msg/min (with pauses)               │
│  Success rate: 98.0%                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Comparison: Old vs New Settings

```
┌─────────────────────────┬──────────────┬──────────────┐
│                         │   OLD        │   NEW        │
├─────────────────────────┼──────────────┼──────────────┤
│ Delay per message       │ 2-4 sec      │ 7-8 sec      │
│ Batch pause interval    │ None         │ Every 10 msg │
│ Batch pause duration    │ None         │ 15 seconds   │
│ Max per batch           │ Unlimited    │ 500 messages │
│ Messages per minute     │ ~20          │ ~6.5         │
│ Ban risk                │ HIGH 🔴      │ LOW 🟢       │
│ Time for 100 msgs       │ 5 min        │ 15 min       │
│ Time for 500 msgs       │ 25 min       │ 75 min       │
│ Recommended daily max   │ 1000         │ 500-1000     │
└─────────────────────────┴──────────────┴──────────────┘
```

---

## Best Practice Timeline (Daily)

### Conservative Approach (Safest)
```
08:00 - Start Campaign 1 (500 messages)
09:15 - Campaign 1 complete
09:15 - REST 3 hours (account cooling)
12:00 - (Optional) Campaign 2 (500 messages)
13:15 - Campaign 2 complete
13:15 - STOP for the day

Total: 1000 messages/day max
Risk: Very Low 🟢
```

### Moderate Approach (Medium Risk)
```
08:00 - Campaign 1 (500 msgs)
09:15 - Complete
11:00 - Campaign 2 (500 msgs)
12:15 - Complete
15:00 - Campaign 3 (500 msgs)
16:15 - Complete

Total: 1500 messages/day
Risk: Medium 🟡
```

### Aggressive (Not Recommended)
```
24/7 operation with 500 msg batches
= ~8000 messages/day

Risk: VERY HIGH 🔴
Consequence: Account ban likely
```

---

## Emergency: Campaign Stuck?

### Check Progress
```bash
# How many waiting?
docker exec wa_redis_c1 redis-cli LLEN bull:messages:wait

# Any active?
docker exec wa_redis_c1 redis-cli LLEN bull:messages:active

# Check worker
docker logs --tail 50 wa_worker_c1
```

### Restart Worker (Safe)
```bash
docker restart wa_worker_c1

# Queue will resume automatically
# No messages lost
```

---

**Optimized for safety and longevity! ⏱️✅**
