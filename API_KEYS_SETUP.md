# API Keys Setup Guide - Priority 1 Integration

Panduan lengkap untuk setup semua API yang diperlukan untuk Priority 1 features.

## 📋 Table of Contents
1. OpenAI/Claude API Setup
2. WhatsApp Business API Setup
3. Sendgrid Email Setup
4. Environment Variables Configuration
5. Testing Integration

---

## 1. OpenAI/Claude API Setup

### Option A: Using OpenAI (GPT-4 Turbo)

**Step 1: Create OpenAI Account**
- Go to https://platform.openai.com/signup
- Sign up dengan email Anda
- Verify email

**Step 2: Get API Key**
1. Login ke https://platform.openai.com
2. Klik profile > "API keys"
3. Click "Create new secret key"
4. Copy key (jangan share ke orang lain!)
5. Simpan di: `OPENAI_API_KEY`

**Step 3: Setup Billing**
- Go to "Billing" > "Overview"
- Add payment method (credit card)
- Set usage limit untuk safety

**Pricing:**
- GPT-4 Turbo: ~$0.01 per 1K tokens (input), ~$0.03 per 1K (output)
- Estimate: ~$5-50/month tergantung usage

---

### Option B: Using Claude (Anthropic)

**Step 1: Create Anthropic Account**
- Go ke https://console.anthropic.com
- Sign up
- Verify email

**Step 2: Get API Key**
1. Login ke Anthropic console
2. Go ke "API Keys"
3. Click "Generate API Key"
4. Copy & save di: `ANTHROPIC_API_KEY`

**Step 3: Setup Billing**
- Add payment method
- Set up billing preferences

**Pricing:**
- Claude 3.5 Sonnet: ~$0.003 per 1K tokens (input), ~$0.015 per 1K (output)
- Lebih murah dari GPT-4, sama bagusnya

**Rekomendasi:** Gunakan Claude 3.5 Sonnet - lebih murah & bagus!

---

## 2. WhatsApp Business API Setup

### Step 1: Create Facebook Business Account
1. Go ke https://business.facebook.com
2. Klik "Create Account"
3. Fill information (Nama bisnis, email, password)
4. Verify email

### Step 2: Create Meta App
1. Go ke https://developers.facebook.com/apps
2. Click "Create App"
3. Choose "Business" app type
4. Fill app details:
   - App Name: "Websensial"
   - Contact Email: your@email.com
   - App Purpose: "WhatsApp Integration"
5. Click "Create App"

### Step 3: Add WhatsApp Product
1. In app dashboard, click "+ Add Product"
2. Search "WhatsApp"
3. Click "Set Up"
4. Choose "WhatsApp Business Account"

### Step 4: Get Credentials
1. Go ke "WhatsApp" > "Getting Started"
2. Catat:
   - **Phone Number ID** (dari setup wizard)
   - **Access Token** (temporary - nanti ganti jadi permanent)
   - **Business Account ID**

### Step 5: Generate Permanent Access Token
1. Go ke Settings > Accounts
2. Find Business Account
3. Generate permanent token (5 tahun)
4. Copy & save: `WHATSAPP_ACCESS_TOKEN`

### Step 6: Setup Webhook
1. Dalam app, go ke WhatsApp > Configuration
2. Masukkan Webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
3. Verify Token: Generate random string
4. Save token sebagai: `WHATSAPP_VERIFY_TOKEN`

### Step 7: Setup Webhook Events
Subscribe ke events:
- `messages` - incoming messages
- `message_status` - delivery status

**Pricing:**
- Free untuk setup & testing (first 1000 messages/month free)
- Production: ~$0.003-0.004 per message

---

## 3. Sendgrid Email Setup

### Step 1: Create Sendgrid Account
1. Go ke https://sendgrid.com
2. Click "Sign Up"
3. Fill details
4. Verify email

### Step 2: Verify Sender Identity
1. Login ke Sendgrid dashboard
2. Go ke Settings > Sender Authentication
3. Click "Verify a Domain" atau "Verify an Address"
4. Follow instructions

**Recommended:** Verify domain untuk professional image

### Step 3: Get API Key
1. Go ke Settings > API Keys
2. Click "Create API Key"
3. Choose permissions: "Mail Send"
4. Generate & copy key
5. Save sebagai: `SENDGRID_API_KEY`

### Step 4: Set Sender Email
1. Dari sender identity yang verified
2. Copy email address
3. Save sebagai: `SENDGRID_FROM_EMAIL`

**Pricing:**
- Free: 100 emails/day
- Pro: ~$10/month untuk unlimited

---

## 4. Environment Variables Configuration

### Create `.env.local` file
```bash
# AI Service (Choose one)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
# OR
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id
WHATSAPP_VERIFY_TOKEN=your-verify-token
WHATSAPP_APP_SECRET=your-app-secret

# SendGrid Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Push ke Vercel Production
```bash
# Untuk setiap variable, jalankan:
vercel env add OPENAI_API_KEY
# Paste key & select environment (production)

# Or gunakan Vercel Dashboard:
# 1. Go ke Project Settings
# 2. Go ke Environment Variables
# 3. Add each variable
```

---

## 5. Testing Integration

### Test AI Response
```bash
curl -X POST http://localhost:3000/api/ai/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Berapa harga produk terbaru Anda?",
    "tone": "profesional",
    "previousMessages": []
  }'
```

Expected response:
```json
{
  "message": "Harga produk terbaru kami adalah Rp 999.000. Apakah ada yang bisa saya bantu lebih lanjut?",
  "tone": "profesional"
}
```

### Test Email
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "customer@email.com",
    "customerName": "John"
  }'
```

### Test WhatsApp Webhook
```bash
# GET verification
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=your-verify-token&hub.challenge=test-challenge"

# POST webhook event
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "1234567890",
            "text": {"body": "Hi there!"},
            "id": "msg_123"
          }]
        }
      }]
    }]
  }'
```

---

## 📝 Cost Estimate (Monthly)

| Service | Free Tier | Paid Tier | Estimate |
|---------|-----------|-----------|----------|
| OpenAI | - | $5-50/month | ~$20/month |
| Claude | - | $1-20/month | ~$5/month |
| WhatsApp | 1000 msgs | $0.003/msg | ~$30/month |
| Sendgrid | 100 emails/day | $10/month | ~$10/month |
| **Total** | - | - | **~$35-55/month** |

---

## ✅ Checklist

- [ ] OpenAI/Claude API key obtained & saved
- [ ] WhatsApp Business Account created
- [ ] WhatsApp credentials saved
- [ ] Sendgrid account created & verified
- [ ] Sendgrid API key obtained
- [ ] `.env.local` file created with all keys
- [ ] Local testing done (curl commands work)
- [ ] Vercel env variables set
- [ ] Production deployment tested

---

## 🆘 Troubleshooting

**"OPENAI_API_KEY is not configured"**
- Check `.env.local` has the key
- Restart dev server: `pnpm dev`
- Verify key is valid (try on OpenAI dashboard)

**"WHATSAPP_ACCESS_TOKEN is not configured"**
- Get token dari Meta App Dashboard
- Make sure it's permanent token (not temporary)
- Check token is active (not expired)

**"Failed to send email"**
- Verify Sendgrid API key is correct
- Check sender email is verified
- Check email address format is valid

**"WhatsApp webhook not receiving messages"**
- Verify webhook URL is publicly accessible
- Check webhook is subscribed to `messages` event
- Verify token in Meta App matches `WHATSAPP_VERIFY_TOKEN`

---

**Questions? Check the README or COMPLETE_LAUNCH_GUIDE.md**
