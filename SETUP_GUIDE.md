# Setup Guide: GitHub, Vercel, dan Cursor

## 1. SETUP GITHUB REPOSITORY

### Langkah 1: Buat Repository di GitHub
1. Buka https://github.com/new
2. Beri nama repository: `websensial-ai`
3. Pilih "Private" (opsional, untuk keamanan)
4. Jangan check "Initialize with README"
5. Klik "Create Repository"

### Langkah 2: Push Project ke GitHub
Buka terminal dan jalankan perintah berikut di folder project:

```bash
# Initialize git jika belum ada
git init

# Add files
git add .

# Create initial commit
git commit -m "Initial commit: Websensial AI Sales Automation Platform"

# Add remote repository
git remote add origin https://github.com/USERNAME/websensial-ai.git

# Push ke GitHub (sesuaikan branch jika perlu)
git branch -M main
git push -u origin main
```

**Ganti USERNAME dengan GitHub username Anda**

### Troubleshooting GitHub
- **Error: "Repository not found"**: Pastikan repository sudah dibuat di GitHub
- **Error: "Permission denied"**: Setup SSH key atau gunakan Personal Access Token
  - Buat PAT: https://github.com/settings/tokens
  - Gunakan: `git clone https://USERNAME:TOKEN@github.com/USERNAME/websensial-ai.git`

---

## 2. DEPLOY KE VERCEL

### Langkah 1: Connect GitHub ke Vercel
1. Buka https://vercel.com/dashboard
2. Klik "New Project"
3. Klik "Import Git Repository"
4. Authorize GitHub (jika diminta)
5. Pilih repository `websensial-ai`

### Langkah 2: Configure Project
1. **Framework Preset**: Pilih "Next.js"
2. **Build Command**: Tetap default (`npm run build` atau `pnpm build`)
3. **Environment Variables**: 
   - Klik "Environment Variables"
   - Tambahkan:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
     ```

### Langkah 3: Deploy
1. Klik "Deploy"
2. Tunggu proses selesai (±3-5 menit)
3. Vercel akan memberikan URL production

### Set Custom Domain (Opsional)
1. Di Vercel Dashboard → Settings → Domains
2. Add custom domain (contoh: websensial-ai.com)
3. Ikuti instruksi untuk pointing DNS

---

## 3. SETUP CURSOR IDE

### Langkah 1: Install Cursor
1. Download di https://www.cursor.sh
2. Install sesuai OS (Windows/Mac/Linux)
3. Buka Cursor

### Langkah 2: Clone Repository
1. Di Cursor: `Cmd/Ctrl + Shift + P`
2. Ketik: "Git: Clone"
3. Paste repository URL:
   ```
   https://github.com/USERNAME/websensial-ai.git
   ```
4. Pilih folder tempat menyimpan
5. Klik "Open in Cursor"

### Langkah 3: Setup Development Environment
1. Buka Terminal di Cursor: `` Ctrl + ` ``
2. Jalankan:
   ```bash
   # Install dependencies
   pnpm install
   
   # Setup environment variables
   cp .env.example .env.local
   
   # Edit .env.local dengan Supabase credentials
   # Lihat file .env.example untuk format
   
   # Mulai dev server
   pnpm dev
   ```

### Langkah 4: Setup Cursor Features (Opsional)
1. **Enable Cursor Extensions**:
   - Ctrl + Shift + X (Extensions)
   - Install: TypeScript Vue Syntax Highlighter, Tailwind CSS IntelliSense

2. **Setup Git Integration**:
   - Cursor → Preferences → Source Control
   - Auto fetch & auto reveal enabled (recommended)

### Cursor Keyboard Shortcuts
- `Cmd/Ctrl + K`: AI Code completion
- `Cmd/Ctrl + Shift + L`: Chat dengan AI
- `Cmd/Ctrl + I`: Inline edit dengan AI
- `Cmd/Ctrl + Shift + P`: Command Palette

---

## 4. WORKFLOW DEVELOPMENT

### Dari Local (Cursor) ke GitHub ke Vercel (CI/CD)

```
1. LOCAL DEVELOPMENT (Cursor)
   - Edit code di Cursor
   - Test di localhost:3000
   - Commit perubahan: git add . && git commit -m "message"

2. PUSH KE GITHUB
   - git push origin main
   - Otomatis trigger Vercel build

3. VERCEL AUTO-DEPLOY
   - Vercel terdeteksi perubahan
   - Build project
   - Deploy ke production
   - Kamu bisa lihat progress di vercel.com/dashboard
```

### Git Workflow Commands
```bash
# Pull latest changes
git pull origin main

# Create new branch untuk fitur baru
git checkout -b feature/nama-fitur

# Commit changes
git add .
git commit -m "feat: deskripsi fitur"

# Push branch
git push origin feature/nama-fitur

# Di GitHub, buat Pull Request untuk review
# Setelah approve, merge ke main
```

---

## 5. ENVIRONMENT VARIABLES

### File .env.local (Local Development)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Di Vercel (Production)
1. Dashboard → Settings → Environment Variables
2. Add untuk Production environment
3. Nilai sama seperti .env.local

---

## 6. MONITORING & MAINTENANCE

### Check Deployment Status
- **Vercel**: https://vercel.com/dashboard → Select Project
- **GitHub**: https://github.com/USERNAME/websensial-ai → Actions

### View Logs
- **Vercel Logs**: Dashboard → Deployments → Select → Logs
- **Production Logs**: Dashboard → Monitoring

### Rollback ke Versi Sebelumnya
1. Vercel Dashboard → Deployments
2. Klik deployment sebelumnya
3. Klik "Promote to Production"

---

## 7. TROUBLESHOOTING

### Build Error di Vercel
1. Cek logs: Dashboard → Select Deploy → Logs
2. Install dependencies: `pnpm install`
3. Build locally: `pnpm build`
4. Push fix ke GitHub

### Environment Variables Tidak Terdeteksi
1. Vercel Dashboard → Settings → Environment Variables
2. Pastikan variable sudah ditambah
3. Redeploy: Dashboard → Deployments → Redeploy

### Supabase Connection Error
1. Cek .env.local variables
2. Verif URL dan API key di Supabase Dashboard
3. Pastikan RLS policies sudah benar

---

## 8. NEXT STEPS SETELAH DEPLOY

1. **Setup Custom Domain**: Arahkan DNS ke Vercel
2. **Add SSL Certificate**: Otomatis dari Vercel (free)
3. **Setup CI/CD**: Already configured!
4. **Monitor Performance**: Vercel Analytics
5. **Add Tests**: Setup Jest + Vitest

---

## CHECKLIST SEBELUM PRODUCTION

- [ ] Supabase credentials sudah di env variables
- [ ] Development build berjalan (`pnpm build`)
- [ ] Tidak ada console errors/warnings
- [ ] Responsive design sudah ditest
- [ ] Auth login/signup berfungsi
- [ ] Database connections tested
- [ ] Environment variables sudah di Vercel
- [ ] Deploy successful di Vercel
- [ ] Testing production URL

---

**Selamat! Aplikasi Anda sekarang live dan ready untuk production! 🚀**
