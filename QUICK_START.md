# ⚡ Quick Start - Priority 1 Integration

**TL;DR: 3 steps, 30 minutes to live!**

---

## 🎯 What You Get

✅ AI Assistant (Claude/OpenAI)  
✅ WhatsApp Business API integration  
✅ Email system (Sendgrid)  
✅ Production-ready code  
✅ Complete documentation  

---

## 📋 3-Step Setup

### Step 1️⃣: Get API Keys (10 min)

**OpenAI/Claude**
```
1. https://platform.openai.com → API keys
2. Create new secret key
3. Copy it
```

**WhatsApp**
```
1. https://business.facebook.com → Create app
2. Add WhatsApp product
3. Get access token & phone ID
4. Set webhook URL
```

**Sendgrid**
```
1. https://sendgrid.com → Login
2. Settings → API Keys
3. Create & copy key
```

**Total time: ~10 minutes**

---

### Step 2️⃣: Setup Environment (5 min)

Create `.env.local`:
```bash
# AI (pick one)
OPENAI_API_KEY=sk-proj-xxx
# OR
ANTHROPIC_API_KEY=sk-ant-xxx

# WhatsApp
WHATSAPP_ACCESS_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
WHATSAPP_VERIFY_TOKEN=random-string
WHATSAPP_APP_SECRET=xxx

# Sendgrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

**Then:**
```bash
pnpm dev  # Test locally
```

---

### Step 3️⃣: Deploy to Vercel (10 min)

```bash
# Set production env vars
vercel env add OPENAI_API_KEY
vercel env add WHATSAPP_ACCESS_TOKEN
# ... (add all keys)

# Deploy
vercel deploy --prod
```

**Done! 🎉**

---

## 🧪 Quick Testing

### Test AI
```bash
curl -X POST http://localhost:3000/api/ai/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Berapa harga?",
    "tone": "profesional"
  }'
```

### Test Email
```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "customerName": "John"
  }'
```

### Test WhatsApp Webhook
```bash
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=your-token&hub.challenge=test"
```

---

## 📚 Full Docs

| Document | Purpose |
|----------|---------|
| `API_KEYS_SETUP.md` | Detailed API key steps |
| `PRIORITY_1_INTEGRATION.md` | Complete integration guide |
| `PRIORITY_1_READY.md` | Implementation status |
| `README_START_HERE.md` | Project overview |

---

## 🚨 Common Issues

**"API key not found"**
→ Check `.env.local` has the key, restart `pnpm dev`

**"WhatsApp webhook not verifying"**
→ Verify token must match in Meta App settings

**"Email not sending"**
→ Verify sender email in Sendgrid dashboard

---

## ✨ Features Ready

| Feature | Status | UI | API |
|---------|--------|----|----|
| AI Assistant | ✅ | ✅ | ✅ |
| WhatsApp | ✅ | ✅ | ✅ |
| Email | ✅ | ✅ | ✅ |
| Chat Interface | ✅ | ✅ | - |
| Webhook | ✅ | - | ✅ |

---

## 💰 Cost

- OpenAI: ~$5-20/month
- WhatsApp: ~$30/month (10K msgs)
- Sendgrid: ~$10/month
- **Total: ~$45-50/month**

Free tiers available for testing!

---

## 🚀 Next (After Priority 1)

- Phase 2: Real-time chat (WebSocket)
- Phase 3: Automation rules
- Phase 4: Advanced features

---

## ❓ Need Help?

1. Check `API_KEYS_SETUP.md`
2. Check `PRIORITY_1_INTEGRATION.md`
3. See server logs: `pnpm dev`

---

**Let's launch! 🎯**
