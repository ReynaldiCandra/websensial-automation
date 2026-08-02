# TASK-005: WhatsApp Adapter - Full Implementation

## Status: COMPLETE ✅

WhatsApp Business API adapter fully implemented with webhook handling, message sending, and template support.

---

## What's Implemented

### 1. WhatsApp Adapter Core (`lib/adapters/whatsapp.ts`)
- **send()** - Send messages via WhatsApp Business API
- **parseWebhook()** - Parse incoming webhook messages
- **formatTemplate()** - Format templated messages with variables
- **getStatus()** - Health check for adapter
- **validateConfig()** - Configuration validation
- Phone number formatting (automatically adds country code)
- Template payload building

### 2. Webhook Handler (`app/api/webhooks/whatsapp/route.ts`)
- **POST** - Receive and process incoming messages
  - Stores messages in database
  - Creates chat records if needed
  - Updates last_message_at timestamp
  - Marks as processed
- **GET** - Webhook verification for Meta Business Platform setup
  - Handles hub.mode, hub.verify_token, hub.challenge

### 3. Configuration Helper (`lib/adapters/whatsapp-config.ts`)
- Load config from environment variables
- Validate required credentials
- Initialize adapter with proper config

---

## Environment Variables Required

```bash
# WhatsApp Business API credentials
WHATSAPP_API_KEY=your_access_token
WHATSAPP_API_SECRET=your_api_secret
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# Optional
WHATSAPP_API_URL=https://graph.instagram.com/v18.0
WHATSAPP_VERIFY_TOKEN=websensial_verify_token
```

---

## Setup Steps

### 1. Get WhatsApp Business Credentials
1. Create Meta Business Account (business.facebook.com)
2. Create WhatsApp Business App
3. Get Phone Number ID and Business Account ID
4. Generate Access Token with `whatsapp_business_messaging` permission

### 2. Set Environment Variables
```bash
# In Vercel dashboard or .env.local
WHATSAPP_API_KEY=your_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_API_SECRET=your_secret
```

### 3. Configure Webhook
1. Go to Meta Business Platform
2. Set Webhook URL to: `https://yourdomain.com/api/webhooks/whatsapp`
3. Set Verify Token to: `websensial_verify_token`
4. Subscribe to: `messages` webhook field

### 4. Test Webhook
```bash
# Send test message to your WhatsApp number
curl -X POST https://graph.instagram.com/v18.0/YOUR_PHONE_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "1234567890",
    "type": "text",
    "text": { "body": "Hello World" }
  }'
```

---

## API Usage

### Send Text Message
```typescript
import { initializeWhatsAppAdapter } from '@/lib/adapters/whatsapp-config'

const wa = initializeWhatsAppAdapter()

const result = await wa.send({
  id: 'msg_123',
  to: '62812345678',
  body: 'Hello from Websensial!',
  type: 'text',
  timestamp: new Date(),
})

// result.success = true
// result.messageId = 'wha_xxx'
// result.externalId = 'wha_xxx'
```

### Send Template Message
```typescript
const result = await wa.send({
  id: 'msg_124',
  to: '62812345678',
  type: 'template',
  templateId: 'hello_world',
  templateParams: {
    name: 'John Doe',
    time: '10:00 AM',
  },
})
```

### Handle Webhook
Automatically handled by `POST /api/webhooks/whatsapp`
- Parses incoming messages
- Creates/updates chats
- Stores in database

---

## Database Schema

Messages stored in:
- `chats` table - WhatsApp conversations
- `chat_messages` table - Individual messages
- `processed_messages` table - Message tracking

### chats
```sql
{
  id: uuid,
  channel: 'whatsapp',
  status: 'active' | 'archived',
  contact_id: string,
  company_id: string,
  last_message_at: timestamp
}
```

### chat_messages
```sql
{
  id: uuid,
  chat_id: uuid,
  sender_type: 'contact' | 'agent',
  message_body: text,
  message_type: string,
  external_message_id: string,
  created_at: timestamp
}
```

---

## Testing

### Unit Tests
```bash
npm test -- lib/adapters/whatsapp.test.ts
```

### Integration Tests
```bash
npm test -- __tests__/api/webhooks/whatsapp.test.ts
```

### Manual Testing
1. Send message to WhatsApp Business number
2. Check `/api/webhooks/whatsapp` logs
3. Verify message in database
4. Confirm in dashboard UI

---

## Error Handling

- **Invalid config** → Returns error in send result
- **Network timeout** → Configurable 30s timeout
- **Invalid phone** → Automatically formats with country code
- **Missing webhook** → GET endpoint returns 403

---

## Next Steps

- **TASK-006**: Rules Engine (lead automation)
- **TASK-007**: Dashboard UI
- **Integration Tests**: Add comprehensive test suite
- **Rate Limiting**: Implement WhatsApp rate limit handling

---

## References

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Webhook Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
