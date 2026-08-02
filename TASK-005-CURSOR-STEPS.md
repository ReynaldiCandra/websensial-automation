# TASK-005: Pull to Cursor & Deploy

## Step-by-step guide untuk pull TASK-005 WhatsApp Adapter ke Cursor dan deploy ke Vercel

---

## STEP 1: Pull Latest from GitHub (di Cursor Terminal)

```bash
cd "/Users/apple/Downloads/SIDE PROJECT REYNALDI/jualin-ai-analysis (1)"
git fetch origin
git pull origin master
```

**Expected output:**
```
remote: Counting objects: 5, done.
Receiving objects: 100% (5/5), done.
Updating f88652a..24bf4cc
Fast-forward
 app/api/webhooks/whatsapp/route.ts | 133 ++++
 docs/TASK-005-WHATSAPP-ADAPTER.md  | 210 ++++++
 lib/adapters/whatsapp-config.ts    | 44 ++
 3 files changed, 387 insertions(+)
```

---

## STEP 2: Verify Files Downloaded

```bash
ls -la app/api/webhooks/whatsapp/
ls -la lib/adapters/whatsapp-config.ts
cat docs/TASK-005-WHATSAPP-ADAPTER.md | head -20
```

Should show:
- ✅ `app/api/webhooks/whatsapp/route.ts` exists
- ✅ `lib/adapters/whatsapp-config.ts` exists  
- ✅ Documentation loaded

---

## STEP 3: Install Dependencies (if any new ones)

```bash
npm install
```

---

## STEP 4: Type Check & Build

```bash
npm run build
```

**Should be:** `✓ Compiled successfully`

---

## STEP 5: Add Environment Variables to Vercel

Go to: https://vercel.com/dashboard → websensial-automation → Settings → Environment Variables

Add these (or leave blank if not ready):
```
WHATSAPP_API_KEY=your_access_token
WHATSAPP_API_SECRET=your_api_secret
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=websensial_verify_token
```

---

## STEP 6: Commit & Push (if changes)

```bash
git add .
git commit -m "feat: TASK-005 WhatsApp Adapter integrated from GitHub"
git push origin master
```

**Optional** - Vercel will auto-deploy anyway after pull

---

## STEP 7: Deploy to Vercel

```bash
vercel deploy --prod
```

**Expected:**
```
✓ Production      https://websensial-automation.vercel.app
✓ Ready in 45s
```

---

## STEP 8: Verify Deployment

### Check Webhook Endpoint
```bash
curl https://websensial-automation.vercel.app/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=websensial_verify_token&hub.challenge=test_challenge
```

Should return: `test_challenge`

### Check Docs
```bash
curl https://websensial-automation.vercel.app/docs/TASK-005-WHATSAPP-ADAPTER.md
```

Or visit: https://github.com/ReynaldiCandra/websensial-automation/blob/master/docs/TASK-005-WHATSAPP-ADAPTER.md

---

## STEP 9: Setup WhatsApp Business Platform (Optional)

1. Go to: https://developers.facebook.com/
2. Create/Select WhatsApp Business App
3. Get credentials:
   - Access Token → `WHATSAPP_API_KEY`
   - Business Account ID → `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`

4. Set Webhook:
   - Callback URL: `https://websensial-automation.vercel.app/api/webhooks/whatsapp`
   - Verify Token: `websensial_verify_token`
   - Subscribe to: `messages`

---

## DONE! ✅

TASK-005 is now:
- ✅ Pulled to Cursor
- ✅ Built successfully  
- ✅ Deployed to Vercel
- ✅ Webhook ready at `/api/webhooks/whatsapp`
- ✅ WhatsApp adapter functional

**Next:** TASK-006 (Rules Engine) or TASK-007 (Dashboard)
