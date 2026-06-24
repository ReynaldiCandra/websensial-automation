╔════════════════════════════════════════════════════════════════════════════╗
║                  OPTION A: GRATIS SETUP - WAHA + GROQ                      ║
║                                                                            ║
║                    100% FREE WhatsApp + AI Integration                     ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stack yang kita gunakan:
✅ WAHA (WhatsApp Automation) - GRATIS
✅ Groq API - GRATIS (5000 req/hari free tier)
✅ Supabase - GRATIS (sudah terpakai)
✅ Vercel - GRATIS (hobby plan)

Total Cost: $0 ✨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 STEP 1: SETUP GROQ API (5 MENIT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.1 Get Free Groq API Key:
   → https://console.groq.com/keys
   → Sign up (free tier: 5000 requests/day)
   → Copy API key

1.2 Add ke .env.local:
   GROQ_API_KEY=gsk_xxxxxxxxxxxxx

Selesai! Groq sudah siap.

Model yang kami gunakan: mixtral-8x7b-32768 (gratis unlimited pada free tier)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 STEP 2: SETUP WAHA (SELF-HOSTED WHATSAPP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WAHA adalah WhatsApp API alternative yang gratis dan self-hosted.

2.1 Install Docker:
   Windows/Mac: https://www.docker.com/products/docker-desktop
   Linux: sudo apt-get install docker.io

2.2 Run WAHA Docker Container:
   docker run -it --rm \
     -p 3001:3001 \
     -e WHATSAPP_API_PORT=3001 \
     -v ~/.waha:/data \
     devlikeapproach/waha:latest

   Atau dengan docker-compose:

   # Create docker-compose.yml:
   version: '3.8'
   services:
     waha:
       image: devlikeapproach/waha:latest
       ports:
         - "3001:3001"
       environment:
         - WHATSAPP_API_PORT=3001
       volumes:
         - ~/.waha:/data

   # Run:
   docker-compose up

2.3 Test WAHA:
   curl http://localhost:3001/health

   Expected: { "status": "ok" }

2.4 Add env variables:
   WAHA_API_URL=http://localhost:3001
   WAHA_WEBHOOK_URL=http://localhost:3000/api/webhooks/waha
   WAHA_VERIFY_TOKEN=websensial-verify-token

WAHA sudah siap!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 STEP 3: PRODUCTION DEPLOYMENT (OPTIONAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kalau mau production, Anda perlu VPS untuk WAHA:

Option A: Railway.app (Recommended for beginners)
   → https://railway.app
   → Free tier: $5 credit/bulan (cukup!)
   → Deploy Docker image dengan mudah
   → Cost: Gratis untuk free tier (selamanya)

Option B: Render.com
   → https://render.com
   → Free tier dengan auto-sleep
   → Cost: Gratis (tapi auto-sleep)

Option C: VPS Murah (DigitalOcean, Linode)
   → $5-6/bulan
   → Run 24/7
   → Full control

Untuk kali ini, gunakan WAHA lokal (localhost:3001) untuk testing!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ STEP 4: TEST SEMUANYA LOCALLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4.1 Start dev server:
   pnpm dev

4.2 Test Groq API:
   curl -X POST http://localhost:3000/api/ai/groq-response \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Berapa harga produk Anda?",
       "tone": "profesional"
     }'

   Expected: { "message": "[Generated response from Groq]", "tone": "profesional" }

4.3 Test WAHA Webhook:
   curl -X GET "http://localhost:3000/api/webhooks/waha?hub.mode=subscribe&hub.verify_token=websensial-verify-token&hub.challenge=test123"

   Expected: test123

4.4 Test Chat Page:
   → http://localhost:3000/dashboard/chat
   → Click AI Assistant button
   → Generate responses with Groq ✨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ENVIRONMENT VARIABLES (.env.local)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Groq (GRATIS)
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# WAHA (Self-hosted)
WAHA_API_URL=http://localhost:3001
WAHA_WEBHOOK_URL=http://localhost:3000/api/webhooks/waha
WAHA_VERIFY_TOKEN=websensial-verify-token

# Supabase (already setup)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxx

# Vercel (optional)
VERCEL_ENV=development

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 CONNECTING WHATSAPP ACCOUNT (WAHA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WAHA menggunakan Baileys (WhatsApp Web automation) - tidak perlu official WhatsApp Business API!

Cara connect:

1. Open WAHA Dashboard:
   → http://localhost:3001

2. Start New Session:
   → Click "Start Session"
   → Scan QR code dengan WhatsApp mobile app Anda
   → Session aktif!

3. Test Send Message:
   → Di dashboard WAHA, kirim test message
   → Message muncul di WhatsApp Anda ✓

Selesai! Sekarang Anda bisa receive/send messages via Websensial.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 FEATURES YANG SEKARANG LIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ AI Assistant (Groq):
   - Generate response dengan 4 tone options
   - Free: 5000 requests/day (more than enough!)
   - Speed: Very fast (Groq LPU)
   - Endpoint: POST /api/ai/groq-response

✅ WhatsApp Chat (WAHA):
   - Receive incoming messages
   - Send messages
   - Multi-chat support
   - Webhook integration
   - Endpoint: POST /api/webhooks/waha

✅ Landing Page:
   - Professional Websensial branding
   - Pricing, features, how it works
   - Email signup form
   - Responsive design
   - URL: /landing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 DEPLOYMENT TO PRODUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Untuk production, ikuti langkah ini:

1. Deploy aplikasi ke Vercel:
   git push origin main
   Vercel auto-deploy

2. Deploy WAHA ke Railway/VPS:
   Railway: https://railway.app
   → Create new project
   → Link GitHub repo WAHA
   → Deploy
   → Update WAHA_API_URL di Vercel env vars

3. Setup Webhook URL:
   Update WAHA_WEBHOOK_URL ke:
   https://your-domain.vercel.app/api/webhooks/waha

4. Add Environment Variables di Vercel:
   Settings → Environment Variables → Add all vars

5. Test Production:
   → Login ke https://your-domain.vercel.app
   → Test chat & AI features
   → Done!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ LIMITATIONS & NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Groq Free Tier:
  ✓ 5000 requests/day (unlimited responses per request)
  ✓ Super fast (150ms average)
  ✓ Perfect untuk business SMB
  ✗ Shared infrastructure (shared limits)

WAHA:
  ✓ Gratis selamanya
  ✓ Unlimited messages
  ✓ Multiple sessions support
  ✓ Full control atas data
  ✗ Unofficial WhatsApp API (bisa disconnect if WhatsApp updates)
  ✗ Perlu maintain sendiri kalau di production

Rekomendasi:
  • Pakai Groq free tier untuk long-term
  • Upgrade ke WAHA pro kalau ada budget
  • Atau upgrade ke official WhatsApp Business API nanti

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆘 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: Groq API returns error
Solution:
  → Check GROQ_API_KEY di .env.local
  → Verify key dari https://console.groq.com
  → Check rate limit (5000/day)
  → Try test: curl https://api.groq.com (no auth needed)

Problem: WAHA not connecting
Solution:
  → Check Docker is running: docker ps
  → Check port 3001: curl http://localhost:3001/health
  → Restart container: docker restart [container_id]

Problem: Webhook not receiving messages
Solution:
  → Check WAHA_WEBHOOK_URL is correct
  → Check firewall allowing port 3000
  → Enable tunnel: ngrok http 3000 (for local testing)
  → Test webhook: curl -X GET "http://localhost:3000/api/webhooks/waha?..."

Problem: WAHA session disconnect
Solution:
  → Rescan QR code di WAHA dashboard
  → Check internet connection
  → Check WhatsApp mobile app is active on phone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 ADDITIONAL RESOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Groq:
  • Docs: https://console.groq.com/docs
  • API Ref: https://console.groq.com/docs/text-chat
  • Models: mixtral, llama2, gemma

WAHA:
  • GitHub: https://github.com/devlikeapproach/waha
  • Docs: https://waha.devlike.pro
  • Issues: https://github.com/devlikeapproach/waha/issues

Docker:
  • Docker Docs: https://docs.docker.com
  • Docker Hub: https://hub.docker.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ Get Groq API key (5 min)
2. ✅ Install & run WAHA Docker (10 min)
3. ✅ Setup .env.local (2 min)
4. ✅ Run pnpm dev (2 min)
5. ✅ Test endpoints (5 min)
6. ✅ Test landing page (2 min)
7. ✅ Deploy to Vercel (5 min)

TOTAL TIME: ~30 minutes to production! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Congratulations!

Anda sekarang punya production-ready AI Sales Automation platform
TANPA perlu bayar untuk WhatsApp atau AI!

Websensial.ai + Groq + WAHA = 100% FREE ✨

Butuh bantuan? Tanya aja! 💪
