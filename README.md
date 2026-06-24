# Jualin.ai - AI Sales Agent untuk WhatsApp

Jualin.ai adalah platform SaaS yang kuat untuk mengelola penjualan Anda melalui WhatsApp Business. Aplikasi ini dirancang untuk bisnis Indonesia yang ingin mengotomatisasi proses penjualan dan meningkatkan konversi.

## Fitur Utama

### 1. **Dashboard Analytics**
- Statistik real-time tentang leads, chat, conversion rate, dan revenue
- Visualisasi lead status (Hot, Warm, Cold)
- Monitoring aktivitas terbaru

### 2. **Lead Management**
- Daftar lengkap semua leads dengan informasi kontak
- Scoring sistem otomatis (0-100 points)
- Kategorisasi lead berdasarkan temperature (Hot, Warm, Cold)
- Tracking interaksi terakhir
- Search dan filter leads

### 3. **Chat Interface**
- Integrasi WhatsApp Business API
- Real-time messaging
- Chat history dan conversation tracking
- Ready untuk implementasi chat AI

### 4. **Quotation System**
- Buat dan kelola quotations untuk leads
- Track status quotations (Draft, Sent, Accepted, Rejected)
- Automation pengiriman quotation
- Management expiry dates

### 5. **Invoice Management**
- Generate invoices dari quotations
- Track pembayaran status (Paid, Pending, Overdue)
- Invoice history dan archiving
- Download dan share invoices

### 6. **Settings & Configuration**
- Pengaturan perusahaan
- Integrasi WhatsApp Business API
- Notification preferences
- Team management
- Billing & subscription
- Security settings

## Teknologi yang Digunakan

- **Frontend**: Next.js 16 dengan React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Language**: TypeScript

## Struktur Project

```
/app
  /auth
    /login        - Halaman login
    /signup       - Halaman registrasi
  /dashboard
    /            - Dashboard utama
    /leads       - Lead management
    /chat        - Chat interface
    /quotations  - Quotation management
    /invoices    - Invoice management
    /settings    - Settings & config
/components
  /layout
    - dashboard-layout.tsx - Layout dashboard dengan sidebar
    - sidebar.tsx         - Navigation sidebar
    - header.tsx          - Top navigation header
  /ui
    - Shadcn UI components (button, card, input, dll)
/lib
  /supabase
    - client.ts           - Supabase client
    - proxy.ts            - Server-side auth middleware
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- pnpm (atau npm/yarn)
- Supabase account

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd jualin-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   Buat file `.env.development.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## Authentication Flow

1. User mengakses aplikasi → redirect ke login jika belum authenticated
2. User login dengan email & password
3. Supabase Auth mengelola session
4. Middleware mengupdate session di cookie
5. User diarahkan ke dashboard

## Database Schema

Database Supabase mencakup tables:
- `users` - User profiles
- `leads` - Lead data
- `quotations` - Quotation records
- `invoices` - Invoice records
- `chat_messages` - Chat history
- `company_settings` - Company configuration

## Roadmap

### Phase 1: Core Setup ✅
- ✅ Authentication & Database
- ✅ Dashboard with Analytics
- ✅ Lead Management Page
- ✅ Quotation Management
- ✅ Invoice Management
- ✅ Settings Page

### Phase 2: WhatsApp Integration
- [ ] Chat UI with real-time messaging
- [ ] WhatsApp Business API integration
- [ ] Message templates
- [ ] Auto-response setup

### Phase 3: Advanced Features
- [ ] AI chat assistant
- [ ] Automated lead scoring
- [ ] Email integration
- [ ] Advanced analytics & reporting
- [ ] Multi-user team support

### Phase 4: Optimization
- [ ] Performance optimization
- [ ] Advanced caching
- [ ] Mobile app
- [ ] API documentation

## Deployment

### Deploy to Vercel

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect ke Vercel**
   - Go to vercel.com
   - Import project dari GitHub
   - Add environment variables
   - Deploy

### Deploy ke Platform Lain
Project ini juga dapat di-deploy ke:
- Netlify
- Railway
- Render
- Aws Amplify

## API Endpoints (Future)

```
GET    /api/leads              - Get all leads
POST   /api/leads              - Create new lead
GET    /api/leads/:id          - Get lead details
PUT    /api/leads/:id          - Update lead
DELETE /api/leads/:id          - Delete lead

GET    /api/quotations         - Get all quotations
POST   /api/quotations         - Create quotation
GET    /api/quotations/:id     - Get quotation details

GET    /api/invoices           - Get all invoices
POST   /api/invoices           - Create invoice from quotation

GET    /api/messages           - Get chat messages
POST   /api/messages           - Send message
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use semantic HTML
- Follow Tailwind CSS utility patterns
- Use shadcn/ui components

### Naming Conventions
- Components: PascalCase (MyComponent.tsx)
- Functions: camelCase (myFunction)
- Constants: UPPER_SNAKE_CASE (MY_CONSTANT)
- Files: kebab-case for utilities (my-utility.ts)

### Git Workflow
```bash
git checkout -b feature/description
# make changes
git add .
git commit -m "feat: add description"
git push origin feature/description
# Create pull request on GitHub
```

## Troubleshooting

### Login issues
- Check Supabase environment variables
- Verify database is running
- Check browser console for errors

### Build errors
- Clear .next folder: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Restart dev server: `pnpm dev`

### Database errors
- Check Supabase connection
- Verify database schema
- Check Row Level Security (RLS) policies

## Support & Contribution

For issues, bugs, or feature requests, please create an issue on GitHub.

## License

MIT License - feel free to use this project for personal or commercial use.

## Future Enhancements

- [ ] Slack integration
- [ ] Telegram integration
- [ ] CRM integration (HubSpot, Salesforce)
- [ ] Payment gateway integration
- [ ] Advanced reporting dashboards
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

---

**Created with ❤️ for Indonesian businesses**
