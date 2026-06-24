# Priority 1 Integration Guide - Complete Implementation

Panduan lengkap untuk mengintegrasikan Priority 1 features: WhatsApp, AI Assistant, dan Email.

## 📋 Quick Start (TL;DR)

**3 Langkah:**
1. Get API keys dari: OpenAI, WhatsApp Business, Sendgrid
2. Set environment variables di Vercel
3. Test endpoints & deploy

**Estimated Time:** 30-45 menit

---

## 1. AI Assistant Integration (OpenAI/Claude)

### Current Status
✅ **Backend Ready** - API route sudah built  
✅ **Frontend Ready** - Chat page sudah diupdate  
✅ **Services Ready** - AI service dengan Claude & OpenAI support  
⏳ **Pending** - API key setup

### How It Works

**User Flow:**
1. User di chat page ketik pertanyaan
2. Klik tombol ✨ (Sparkles)
3. Pilih tone: Profesional / Ramah / Rendah Hati / Energik
4. AI generate response sesuai tone
5. Click suggestion → message input auto-fill
6. Send message

**Tech Stack:**
- Frontend: React component dengan tone selector
- Backend: `/api/ai/generate-response`
- AI: Claude 3.5 Sonnet atau GPT-4 Turbo

### Setup Steps

#### Step 1: Get OpenAI API Key
```bash
# 1. Go ke https://platform.openai.com/api/keys
# 2. Create new secret key
# 3. Copy key (jangan lupa, hanya 1x show!)
# 4. Save ke .env.local:
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

#### Step 2: Test Locally
```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Test API
curl -X POST http://localhost:3000/api/ai/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Berapa harga produk?",
    "tone": "profesional"
  }'

# Expected output:
# {
#   "message": "Produk kami tersedia dengan berbagai pilihan harga...",
#   "tone": "profesional"
# }
```

#### Step 3: Test UI
1. Go ke http://localhost:3000/dashboard/chat
2. Klik tombol ✨
3. Pilih tone
4. Klik suggestion
5. Response harus terisi di input

#### Step 4: Deploy to Vercel
```bash
# Set environment variable di Vercel
vercel env add OPENAI_API_KEY
# Paste API key & select production
```

---

## 2. WhatsApp Business API Integration

### Current Status
✅ **Backend Ready** - Webhook route & service built  
✅ **Frontend Ready** - Chat UI ready untuk WhatsApp messages  
⏳ **Pending** - Meta App setup & webhook configuration

### Architecture

```
WhatsApp Message
      ↓
WhatsApp Business API
      ↓
Webhook: /api/whatsapp/webhook
      ↓
Process Message
      ↓
Save to Database
      ↓
Trigger AI (optional)
      ↓
Send Response via WhatsApp
```

### Setup Steps

#### Step 1: Create Meta Business Account
```
1. Go ke https://business.facebook.com
2. Sign up
3. Create workspace
4. Verify identity
```

#### Step 2: Create Meta App
```
1. Go https://developers.facebook.com/apps
2. Create App → Business type
3. App Name: "Websensial"
4. Add WhatsApp product
```

#### Step 3: Setup WhatsApp Business Account
```
1. Choose business account atau create baru
2. Verify phone number (untuk testing)
3. Get Phone Number ID & Business Account ID
```

#### Step 4: Generate Access Token
```
1. Go ke Settings → Accounts
2. Create permanent access token (5 years)
3. Save ke .env.local:
WHATSAPP_ACCESS_TOKEN=your-token-here
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id
```

#### Step 5: Setup Webhook
```
1. In Meta App Dashboard
2. Go ke WhatsApp → Configuration
3. Set webhook URL:
   https://yourdomain.com/api/whatsapp/webhook
4. Generate verify token:
   WHATSAPP_VERIFY_TOKEN=random-secret-string
5. Subscribe to events:
   - messages
   - message_status
```

#### Step 6: Test Webhook
```bash
# Verify webhook
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=your-verify-token&hub.challenge=test"

# Expected: Status 200 dengan challenge value
```

#### Step 7: Send Test Message
```bash
curl -X POST "https://graph.instagram.com/v18.0/PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "62812345678",
    "type": "text",
    "text": {
      "body": "Hello from Websensial!"
    }
  }'
```

---

## 3. Email (Sendgrid) Integration

### Current Status
✅ **Backend Ready** - Email service dengan templates  
✅ **Frontend Ready** - Ready untuk integrate  
⏳ **Pending** - Sendgrid API key setup

### Email Types Ready
- Welcome email (new user signup)
- Invoice email (dengan link)
- Quotation email (dengan expiry)

### Setup Steps

#### Step 1: Create Sendgrid Account
```
1. Go ke https://sendgrid.com
2. Sign up
3. Verify email
```

#### Step 2: Verify Sender
```
1. Settings → Sender Authentication
2. Verify domain (recommended) atau email address
3. Follow verification steps
```

#### Step 3: Get API Key
```
1. Settings → API Keys
2. Create API Key
3. Permissions: "Mail Send"
4. Save:
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### Step 4: Test Email
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "customerName": "John"
  }'

# Expected: { "success": true }
```

---

## 4. Complete Environment Variables

### Local (.env.local)
```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# AI - Choose ONE
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
# OR ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# WhatsApp Business
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id
WHATSAPP_VERIFY_TOKEN=random-secret-string
WHATSAPP_APP_SECRET=your-app-secret

# Sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Vercel Production
```bash
# Setup via CLI or Vercel Dashboard
vercel env add OPENAI_API_KEY
vercel env add WHATSAPP_ACCESS_TOKEN
vercel env add WHATSAPP_PHONE_NUMBER_ID
vercel env add WHATSAPP_BUSINESS_ACCOUNT_ID
vercel env add WHATSAPP_VERIFY_TOKEN
vercel env add WHATSAPP_APP_SECRET
vercel env add SENDGRID_API_KEY
vercel env add SENDGRID_FROM_EMAIL

# Or via Vercel Dashboard:
# Project Settings → Environment Variables → Add each one
```

---

## 5. API Endpoints Reference

### AI Assistant
```
POST /api/ai/generate-response
Body: {
  "message": string (required),
  "tone": "profesional" | "ramah" | "rendah_hati" | "energik" (required),
  "previousMessages": string[] (optional)
}
Response: {
  "message": string,
  "tone": string
}
```

### Email
```
POST /api/email/send
Body: {
  "type": "welcome" | "invoice" | "quotation" (required),
  "to": string (required),
  "customerName": string (for welcome),
  "invoiceNumber": string (for invoice),
  "invoiceUrl": string (for invoice),
  "totalAmount": number (for invoice),
  "quotationNumber": string (for quotation),
  "quotationUrl": string (for quotation),
  "expiresAt": string (for quotation)
}
Response: { "success": boolean }
```

### WhatsApp Webhook
```
GET /api/whatsapp/webhook
Query: hub.mode, hub.verify_token, hub.challenge

POST /api/whatsapp/webhook
Body: WhatsApp webhook event
```

---

## 6. Integration Checklist

### AI Assistant
- [ ] OpenAI API key obtained
- [ ] .env.local updated
- [ ] Local testing done (curl)
- [ ] UI testing done (chat page)
- [ ] Vercel env set
- [ ] Production test

### WhatsApp
- [ ] Meta Business account created
- [ ] Meta App created
- [ ] Phone number verified
- [ ] Access token generated
- [ ] Webhook URL set
- [ ] Webhook tested (GET)
- [ ] .env.local updated
- [ ] Vercel env set
- [ ] Send test message

### Email
- [ ] Sendgrid account created
- [ ] Sender verified
- [ ] API key generated
- [ ] .env.local updated
- [ ] Local email test done
- [ ] Vercel env set
- [ ] Production test

---

## 7. Troubleshooting

### AI Assistant

**Error: "OPENAI_API_KEY is not configured"**
```bash
# Check .env.local
cat .env.local | grep OPENAI_API_KEY

# Restart dev server
pnpm dev

# Verify API key valid at https://platform.openai.com/api/keys
```

**Error: "Failed to generate response"**
```bash
# Check:
1. API key is correct
2. API key has enough credits
3. Network connectivity
4. Log dari server (pnpm dev console)
```

### WhatsApp

**Webhook not verifying**
```bash
# Check:
1. WHATSAPP_VERIFY_TOKEN matches Meta App
2. Webhook URL is publicly accessible
3. Firewall/NAT not blocking
```

**Messages not coming in**
```bash
# Check:
1. Webhook events subscribed (messages, message_status)
2. Access token is valid & not expired
3. Phone number ID is correct
4. Check webhook logs in Meta App dashboard
```

### Email

**"SENDGRID_API_KEY not configured"**
```bash
# Check .env.local has key
# Restart dev server
# Verify key at https://sendgrid.com
```

**Email not sending**
```bash
# Check:
1. Sender email is verified
2. API key valid
3. Email address format correct
4. Account has sending quota
```

---

## 8. Cost Summary

| Service | Free | Cost |
|---------|------|------|
| OpenAI | - | ~$5-20/mo |
| Claude | - | ~$3-10/mo |
| WhatsApp | 1000 msg | $0.003/msg |
| Sendgrid | 100/day | $10/mo |
| **Total** | Free tier | **~$30-50/mo** |

---

## 9. What's Next?

After Priority 1 complete:

### Phase 2 (Week 2)
- Real-time chat updates (WebSocket)
- Message persistence to database
- User presence indicators
- Typing indicators

### Phase 3 (Week 3)
- Payment gateway integration
- Advanced automation rules
- Bulk messaging
- Message templates

---

## 📞 Support

Questions? Check:
1. `API_KEYS_SETUP.md` - Detailed API key instructions
2. `README_START_HERE.md` - Project overview
3. Server logs: `pnpm dev` console output
4. API responses: Check status code & error message

**Good luck! 🚀**
