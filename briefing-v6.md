# Briefing Project: Websensial Automation
_Last updated: 27 Juni 2026_

## Konteks
Dashboard WhatsApp Business automation untuk Alexandria Islamic School (SD/SMP/SMA, Bekasi Timur).
Next.js + Supabase + WAHA di Railway + Vercel.
Repo: https://github.com/ReynaldiCandra/websensial-automation
Live: https://websensial-automation.vercel.app/dashboard
Referensi fitur: https://jualin.ai

## Stack Teknis
- Next.js 16 (Turbopack), React 19, TypeScript, Tailwind, shadcn/ui
- Supabase (Postgres + Auth + Realtime)
- Groq SDK — model llama-3.3-70b-versatile (upgrade dari llama3-8b-8192)
- WAHA self-hosted Railway, engine NOWEB, tier CORE, API Key: websensial123
- Deploy: Vercel
- macOS, Cursor, npm

## Aturan Kerja WAJIB
- JANGAN heredoc untuk file panjang — korup saat paste
- JANGAN sed dengan ! di zsh tanpa set +H
- SELALU: cat > /tmp/fix.py << 'EOF' lalu python3 /tmp/fix.py
- Verifikasi tiap langkah sebelum lanjut
- JANGAN push sebelum npm run build bersih Data Penting
- DEFAULT_COMPANY_ID: 8e0bcf1e-490b-4ee4-8bb3-70bb544e2bf3
- owner_id: 8ff8be09-a383-4498-94de-2ea53e67cd9c
- Nomor WA Websensial: 6281319963253
- WAHA session: default
- WAHA URL: https://waha-production-5547.up.railway.app
- Webhook URL: https://websensial-automation.vercel.app/api/webhooks/waha
- User email: demo@websensial.com
- Rekening BCA: 005.233.4444 a/n Yay Balai Pendidikan Laena (Kode Bank: 014)
- CRON_SECRET: 9fa3a94a6c228fab360ce79427e5757f8fce9d1d3371c1f792527eae5a5db1c8

## Info Bisnis: Alexandria Islamic School
- Alamat: Jl. Pengasean Raya No. 50, Rawa Lumbu, Bekasi Timur
- Telp: (021) 8243 3400 | Web: alexandriaschool.sch.id
- Jenjang: SD, SMP, SMA — Islamic Boarding & Fullday School
- Akreditasi A, Cambridge International Partner, 25+ tahun berdiri, 1.500+ siswa

### Biaya SMP
- Pendaftaran: Rp 550.000
- Uang Gedung: Rp 40 juta (PROMO 50% = Rp 20 juta, bisa cicil 3x, bisa ajukan turun s/d Rp 10.500.000)
- SPP Boarding: Rp 7.000.000/bulan (flat 3 tahun) — termasuk makan 3x, laundry, asrama AC, health care, PTS&PAS, konselor, psikolog
- SPP Fullday: Rp 3.000.000/bulan

### Biaya SMA
- Pendaftaran: Rp 500.000
- Uang Gedung: Rp 40 juta (PROMO 50% = Rp 20 juta, bisa cicil 3x, bisa ajukan turun s/d Rp 10.500.000)
- SPP Boarding: Rp 7.000.000/bulan (flat 3 tahun)
- SPP Fullday: Rp 3.000.000/bulan

### Strategi Harga (RAHASIA INTERNAL — jangan sebut ke customer)
- Target ideal uang gedung: Rp 15-20 juta
- Minimum bisa turun sampai: Rp 10.500.000
- Inden T.A 2027-2028: booking Rp 5.500.000 untuk amankan harga promo
- Gunakan FOMO: promo hanya tahun ini, tahun depan balik ke Rp 40 juta

### Alur Pendaftaran
1. Registrasi Online: alexandriascch.id/online-registration
2. Psikotes: alexandriaschool.sch.id/tespsikotespmb
3. DP minimal Rp 5.500.000 ke BCA 005.233.4444
4. Isi Formulir: alexandriaschool.sch.id/formulir/
5. Jika keberatan: alexandriaschool.sch.id/permohonan-uang-gedung

### Open House
- Setiap Sabtu 09.00-12.00 WIB, kampus Bekasi Timur, gratis
- Hadir Open House dapat harga spesial Rp 20 juta

### Tim Admisi
- Mr. Farhan (Marketing Staff): 087837062893
- Mr. Ramram (Marketing Staff): 085196425916
- Mr. Reynaldi (Marketing Manager): 081319963253

## Skema Database
companies: id, name, owner_id, logo_url, whatsapp_number, subscription_plan, subscription_status
leads: id, company_id, name, phone, email, source, status, lead_score, temperature, notes,
       assigned_to, pipeline_stage, deal_value, stage_changed_at, is_escalated, escalated_at,
       last_message, last_seen_at
chats: id, company_id, lead_id, whatsapp_contact_id, status, last_message_at
chat_messages: id, chat_id, sender_type, sender_id, message_text, message_type, image_url, created_at
products: id, user_id, company_id, name, price, description
faqs: id, user_id, question, answer
ai_training: id, user_id, business_name, tone, special_instructions, ai_mode, default_language, multi_language, fallback_message
ai_training_documents: id, file_name, file_url, file_type, file_size (ALTER TABLE sudah dijalankan)
reminder_logs: id, company_id, lead_id, invoice_id, phone, message, status, sent_at, created_at

PENTING:
- Tenant key: company_id
- products & faqs pakai BOTH user_id DAN company_id
- Score kolom: lead_score
- Hanya 1 company aktif: 8e0bcf1e-490b-4ee4-8bb3-70bb544e2bf3 (company duplikat 23c99038 sudah dihapus)

## AI Configuration
- Model: llama-3.3-70b-versatile (Groq)
- Temperature: 0.5
- Max tokens: 256
- Stop sequence: ['[Confidence', '[Action', '[Lead']
- Persona: "Kak Alexa" — CS Alexandria, ramah, pakai "kak/kakak", sebut diri "saya", closing hook di setiap pesan
- File: lib/groq.ts (main), app/api/webhooks/waha/route.ts (webhook), lib/services/groq-ai-service.ts Dashboard AI Training: Cara Menjawab → Instruksi Khusus AI (override system prompt)

## Status Fitur

### WORKING ✅
- WAHA NOWEB: session WORKING, webhook terdaftar
- Flow WA masuk → webhook → DB → AI reply → kirim balik: WORKING
- AI persona Kak Alexa: natural, pakai kakak, closing hook, tidak bocor metadata
- AI gathering data customer: nama → daerah → jenjang (satu per satu)
- Dashboard /dashboard/chats: realtime, AI reply tampil
- Leads page: filter hot/warm/cold, score bar, pipeline quick edit dropdown, time ago, clickable stat cards
- Pipeline Kanban: drag drop, stage sesuai DB (new/contacted/interested/quotation_sent/invoice_sent/payment_pending/won/lost)
- Score-lead: working
- AI Training upload dokumen: ALTER TABLE sudah dijalankan, interface TrainingDocument sudah fix
- Reminder automation: cron 3x sehari (09.00, 14.00, 19.00 WIB), CRON_SECRET sudah di Vercel env
- Build Vercel: bersih

### BUG PRE-EXISTING JANGAN DIKERJAKAN
- oute.ts, payment/route.ts — cookies pattern lama
- chat/page.tsx (beda dari chats) — tone type mismatch
- payment-proof/page.tsx — CSS aspect error
- midtrans.ts, ai-service.ts — berbagai error

## NEXT STEPS PRIORITAS

### PHASE 2 (next sesi):
1. Quotation /quote/[slug] — generate & kirim via WA
2. Invoice /invoice/[slug] — generate & kirim via WA
3. Payment proof review — customer kirim foto bukti bayar

### PHASE 3:
4. Smart reply — saran balasan lebih kontekstual per situasi
5. Analytics/BI dashboard — revenue, conversion rate, funnel
6. Multi-tenant — banyak bisnis bisa daftar

### PHASE 4 (Big moves):
7. Migrasi WA Business API — Fonnte/Meta Cloud API, hindari ban
8. Website widget — tombol chat WA di website Alexandria
9. Scan Brabsite/Instagram lalu auto-isi training data

### IDE TAMBAHAN (backlog):
10. Notifikasi desktop — pop up kalau ada hot lead masuk
11. Auto-assign lead — distribusi otomatis ke Farhan/Ramram
12. Export leads — download CSV/Excel untuk reporting
13. WhatsApp blast — kirim pesan massal ke leads lama
14. Mobile-friendly dashboard — akses dari HP

## Pipeline Stages (urutan)
new → contacted → interested → quotation_sent → invoice_sent → payment_pending → won → lost
