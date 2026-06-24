# WEBSENSIAL.AI - QUICK REFERENCE

## 🎯 OPTION A: 100% GRATIS

**Stack:**
- Groq API (Free tier: 5000 req/day)
- WAHA WhatsApp (Self-hosted)
- Supabase (Free tier)
- Vercel (Free tier)

**Cost: $0/bulan** ✨

---

## ⚡ QUICK START (30 MIN)

```bash
# 1. Get Groq key
# → https://console.groq.com/keys
# → Copy: GROQ_API_KEY

# 2. Install Docker & run WAHA
docker run -p 3001:3001 devlikeapproach/waha:latest

# 3. Create .env.local
GROQ_API_KEY=gsk_xxxxx
WAHA_API_URL=http://localhost:3001
WAHA_WEBHOOK_URL=http://localhost:3000/api/webhooks/waha
WAHA_VERIFY_TOKEN=websensial-verify-token

# 4. Run locally
pnpm dev

# 5. Deploy
git push origin main
# → Vercel auto-deploys
```

---

## 📋 API ENDPOINTS

### AI Assistant
```
POST /api/ai/groq-response
{
  "message": "Berapa harga?",
  "tone": "profesional" | "ramah" | "rendah_hati" | "energik"
}
```

### WhatsApp Webhook
```
POST /api/webhooks/waha
(Incoming messages)

GET /api/webhooks/waha?hub.verify_token=X&hub.challenge=Y
(Verification)
```

---

## 🎛️ ENVIRONMENT VARIABLES

```env
# Required
GROQ_API_KEY=gsk_xxxxx
WAHA_API_URL=http://localhost:3001
WAHA_WEBHOOK_URL=http://localhost:3000/api/webhooks/waha
WAHA_VERIFY_TOKEN=websensial-verify-token

# Existing (Supabase)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📍 ROUTES

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Redirect | → /landing or /dashboard |
| `/landing` | Public | Marketing page |
| `/auth/login` | Public | Login |
| `/auth/sign-up` | Public | Sign up |
| `/dashboard` | Protected | Main dashboard |
| `/dashboard/chat` | Protected | AI Chat interface |

---

## 🧪 TEST COMMANDS

```bash
# Test Groq
curl -X POST http://localhost:3000/api/ai/groq-response \
  -H "Content-Type: application/json" \
  -d '{"message":"Halo","tone":"ramah"}'

# Test WAHA webhook
curl -X GET "http://localhost:3000/api/webhooks/waha?hub.verify_token=websensial-verify-token&hub.challenge=test"
```

---

## 📦 NEW FILES

```
lib/services/
  groq-ai-service.ts
  waha-whatsapp-service.ts

app/api/
  ai/groq-response/route.ts
  webhooks/waha/route.ts

app/landing/
  page.tsx
  layout.tsx
```

---

## 📚 DOCUMENTATION

1. **OPTION_A_GRATIS_SETUP.md** ← START HERE
2. OPTION_A_COMPLETE.md - Full status
3. README_START_HERE.md - Project overview

---

## ⚙️ TROUBLESHOOTING

**Groq error?**
→ Check GROQ_API_KEY at https://console.groq.com

**WAHA not connecting?**
→ docker ps (check if running)
→ curl http://localhost:3001/health

**Webhook not receiving?**
→ Check WAHA_WEBHOOK_URL correct
→ Check firewall allowing port 3000

---

## 🚀 DEPLOYMENT

```bash
# Push & deploy
git add .
git commit -m "Add Option A"
git push

# Vercel auto-deploys
# Set env vars in Vercel dashboard
# Done!
```

---

## 💰 COSTS

| Item | Cost |
|------|------|
| Groq | Free (5000 req/day) |
| WAHA | Free (self-hosted) |
| Vercel | Free (hobby) |
| Supabase | Free (tier) |
| **Total** | **$0/month** ✨ |

---

## 📞 QUICK LINKS

- Groq: https://console.groq.com
- WAHA: https://waha.devlike.pro
- Docker: https://docker.com
- Vercel: https://vercel.com

---

**Status: READY FOR PRODUCTION** 🎉
