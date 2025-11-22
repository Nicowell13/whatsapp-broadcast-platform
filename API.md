# API Documentation

## Base URL
```
Production: https://api-broadcast.yourdomain.com/api
Development: http://localhost:3000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### Campaigns

#### Get All Campaigns
```http
GET /campaigns
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "name": "Campaign 1",
    "message": "Hello World",
    "status": "draft",
    "totalRecipients": 100,
    "sentCount": 50,
    "deliveredCount": 45,
    "failedCount": 5,
    "createdAt": "2023-11-22T10:00:00Z"
  }
]
```

#### Create Campaign
```http
POST /campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Campaign",
  "message": "Hello, this is a broadcast message!",
  "sessionId": "default"
}

Response:
{
  "id": "uuid",
  "name": "New Campaign",
  "status": "draft",
  ...
}
```

#### Get Campaign Details
```http
GET /campaigns/:id
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "name": "Campaign 1",
  "message": "Hello World",
  "status": "sending",
  "messages": [
    {
      "id": "uuid",
      "recipientPhone": "628123456789",
      "status": "sent"
    }
  ]
}
```

#### Send Campaign
```http
POST /campaigns/:id/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "contactIds": ["uuid1", "uuid2", "uuid3"]
}

Response:
{
  "success": true,
  "totalQueued": 3
}
```

### Contacts

#### Get All Contacts
```http
GET /contacts
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "name": "Contact 1",
    "phone": "628123456789",
    "email": "contact@example.com",
    "isActive": true
  }
]
```

#### Create Contact
```http
POST /contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Contact",
  "phone": "628123456789",
  "email": "contact@example.com"
}

Response:
{
  "id": "uuid",
  "name": "New Contact",
  "phone": "628123456789",
  "isActive": true
}
```

#### Import Contacts (CSV)
```http
POST /contacts/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: file (CSV file with columns: name, phone, email)

CSV Format:
name,phone,email
John Doe,628123456789,john@example.com
Jane Smith,628987654321,jane@example.com

Response:
{
  "success": true,
  "imported": 2
}
```

#### Delete Contact
```http
DELETE /contacts/:id
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

### Messages

#### Get All Messages
```http
GET /messages
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "recipientName": "Contact 1",
    "recipientPhone": "628123456789",
    "content": "Hello World",
    "status": "delivered",
    "sentAt": "2023-11-22T10:30:00Z",
    "deliveredAt": "2023-11-22T10:30:05Z"
  }
]
```

#### Get Message Statistics
```http
GET /messages/stats
Authorization: Bearer <token>

Response:
{
  "total": 1000,
  "sent": 800,
  "delivered": 750,
  "failed": 50,
  "pending": 200
}
```

### WAHA (WhatsApp) Sessions

#### Get All Sessions
```http
GET /waha/sessions
Authorization: Bearer <token>

Response:
[
  {
    "name": "default",
    "status": "WORKING",
    "me": {
      "id": "628123456789@c.us",
      "pushName": "My WhatsApp"
    }
  }
]
```

#### Create Session
```http
POST /waha/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionName": "session1"
}

Response:
{
  "name": "session1",
  "status": "SCAN_QR_CODE"
}
```

#### Get QR Code
```http
GET /waha/sessions/:name/qr
Authorization: Bearer <token>

Response:
{
  "qr": "data:image/png;base64,..."
}
```

#### Get Session Status
```http
GET /waha/sessions/:name/status
Authorization: Bearer <token>

Response:
{
  "status": "WORKING"
}
```

#### Delete Session
```http
DELETE /waha/sessions/:name
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

### Dashboard

#### Get Dashboard Statistics
```http
GET /dashboard/stats
Authorization: Bearer <token>

Response:
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

#### Get Recent Activity
```http
GET /dashboard/activity
Authorization: Bearer <token>

Response:
{
  "recentCampaigns": [...],
  "recentMessages": [...]
}
```

### Webhooks (Internal - No Auth Required)

#### WAHA Webhook
```http
POST /webhooks/waha
Content-Type: application/json

{
  "event": "message.ack",
  "payload": {
    "id": "waha_message_id",
    "ack": 2
  }
}

Response:
{
  "received": true
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

## Rate Limiting

No rate limiting implemented by default. Configure nginx for rate limiting if needed.

## Message Pacing

Messages are automatically queued with 2-4 second delays (configurable via env vars) to prevent WhatsApp bans.

## Best Practices

1. Always use HTTPS in production
2. Keep JWT tokens secure
3. Don't send too many messages at once
4. Monitor failed messages and adjust pacing
5. Regular backup of database
6. Use strong passwords and secrets
