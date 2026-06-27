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
- Groq SDK — model llama-3.1-8b-instant
- WAHA self-hosted Railway, engine NOWEB, tier CORE, API Key: websensial123
- Deploy: Vercel
- macOS, Cursor, npm

## Aturan Kerja WAJIB
- JANGAN heredoc untuk file panjang — korup saat paste
- JANGAN sed dengan ! di zsh tanpa set +H
- SELALU: cat > /tmp/fix.py << 'EOF' lalu python3 /tmp/fix.py
- Verifikasi tiap langkah sebelum lanjut
- JANGAN push sebelum npm run build bersih

## Data Penting
- DEFAULT_COMPANY_ID: 8e0bcf1e-44ee4-8bb3-70bb544e2bf3
- owner_id: 8ff8be09-a383-4498-94de-2ea53e67cd9c
- Nomor WA Websensial: 6281319963253
- WAHA session: default
- WAHA URL: https://waha-production-5547.up.railway.app
- Webhook URL: https://websensial-automation.vercel.app/api/webhooks/waha
- User email: demo@websensial.com
- Rekening BCA: 005.233.4444 a/n Yay Balai Pendidikan Laena (Kode Bank: 014)

## Info Bisnis: Alexandria Islamic School
- Alamat: Jl. Pengasean Raya No. 50, Rawa Lumbu, Bekasi Timur
- Telp: (021) 8243 3400 | Web: alexandriaschool.sch.id
- Jenjang: SD, SMP, SMA — Islamic Boarding & Fullday School
- Akreditasi A, Cambridge International Partner, 25+ tahun berdiri, 1.500+ siswa

### Biaya SMP
- Pendaftaran: Rp 500.000
- Uang Gedung: Rp 40 juta (PROMO 50% = Rp 20 juta, bisa cicil 3x, bisa ajukan turun s/d Rp 10.500.000)
- SPP Boarding: Rp 7.000.000/bulan (flat 3 tahun) — termasuk makan 3x, laundry, asrama AC, health care, PTS&PAS, konselor, psikolog
- SPP Fullday: Rp 3.000.000/bulan

### Biaya SMA
- Pendaftaran: Rp 500.000
- Uang Gedung: Rp 40 juta (PROMO 50% = Rp 20 juta, bisa cicil 3x, bisa ajukan turun s/d Rp 10.500.000)
- SPP Boarding: Rp 7.000.000/bulan (flat 3 tahun)
- SPP Fullday: Rp 3.000.000/bulan

### Strategi Harga (RAHASIA INTERNAL — jangan sebut ke customer)
-  ideal uang gedung: Rp 15-20 juta
- Minimum bisa turun sampai: Rp 10.500.000
- Inden T.A 2027-2028: booking Rp 5.500.000 untuk amankan harga promo
- Gunakan FOMO: promo hanya tahun ini, tahun depan balik ke Rp 40 juta

### Alur Pendaftaran
1. Registrasi Online: alexandriaschool.sch.id/online-registration
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

PENTING:
- Tenant key: company_id
- products & faqs pakai BOTH user_id DAN company_id
- Score kolom: lead_score

## Status Fitur

### WORKING ✅
- WAHA NOWEB: session WORKING, webhook terdaftar
- X-Api-Key header sudah ditambah ke sendText (fix hari ini)
- Flow WA masuk → webhook → DB → AI reply → kirim balik: WORKING
- AI hanya respond event 'message' (duplikat webhook sudah difix)
- Prompt AI: singkat, natural, max 3 kalimat, no markdown
- Dashboard /dashboard/chats: realtime, AI reply tamp-lead: working (pakai x-service-key header)
- Inline edit nama lead di chat list: DONE
- AI Training data Alexandria: sudah diisi (products + faqs + ai_training)
- Build Vercel: bersih

### MASALAH YANG BELUM SELESAI
1. Upload dokumen di AI Training gagal
   - Error: column "file_name" not found di ai_training_documents
   - Fix: ALTER TABLE ai_training_documents ADD COLUMN file_name, file_url, file_type, file_size
   - Status: SQL belum dijalankan

2. Nama kontak tampil nomor (bukan nama)
   - Limitasi WAHA NOWEB — tidak kirim pushName reliable
   - Solusi: inline edit nama manual (sudah ada)
   - Permanen fix: upgrade ke WA Business API resmi (Fonnte/Meta Cloud API)

3. Lead score masih 0 untuk beberapa lead lama
   - Score-lead working tapi lead lama belum di-rescore
   - Perlu: trigger rescore manual untuk lead yang sudah ada chat-nya

## NEXT STEPS PRIORITAS (Phase 2)

### IMMEDIATE (sesi berikutnya):
1. Fix upload dokumen AI Training (ALTER TABLE)
2. Leads page — tabel dengan filter horm/cold, temperature badge, aksi cepat
3. Pipeline Kanban — drag drop stage (Tanya → Penawaran → Invoice → Bukti Bayar → Closing)

### PHASE 2 (sesi berikutnya):
4. Quotation /quote/[slug] — generate & kirim via WA
5. Invoice /invoice/[slug] — generate & kirim via WA
6. Payment proof review — customer kirim foto bukti bayar
7. Reminder automation — follow up otomatis jika belum bayar

### PHASE 3:
8. Smart reply suggestions yang lebih kontekstual
9. Analytics / Business Intelligence dashboard
10. Multi-tenant (banyak user bisa daftar, bukan hanya 1 company)
11. Migrasi ke WA Business API resmi (Fonnte/Meta Cloud API) untuk hindari ban

## Pipeline Stages (urutan)
new → contacted → interested → quotation_sent → invoice_sent → payment_pending → won → lost

## Bug Pre-existing JANGAN DIKERJAKAN
- detect-closing/route.ts, payment/route.ts — cookies pattern lama
- ai-training/page.tsx — file_url type error (terkait upload dokumen)
- chat/page.tsx (beda dari chats) — tone typCSS aspect error
- midtrans.ts, ai-service.ts, groq-ai-service.ts — berbagai error
