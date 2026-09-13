# Zenith Software Hub 🚀

A commercial, production-ready unified download platform for **Computer Games**, **Computer Software**, **Mobile Apps (APKs)**, and **Mobile Games** — engineered for **1000+ concurrent users**, per-user data isolation via PostgreSQL Row-Level Security (RLS), Cloudflare R2 / S3 signed expiring download delivery, and grounded AI catalog discovery.

Designed to be operated and maintained by a **single solo developer** and hosted with zero server ops on **Vercel + Managed Postgres (Neon / Supabase / Railway) + Cloudflare R2**.

---

## 🌟 Key Architecture & Features

1. **Four Core Categories**:
   - **Computer Games** (Windows, macOS, Linux - Steam/Direct/GOG binaries)
   - **Computer Software** (Developer suites, IDEs, neural video editors, security tools)
   - **Mobile Apps** (Android APKs, productivity planners, camera engines)
   - **Mobile Games** (Action platformers, tower defense, arcade)

2. **Per-User Isolation & PostgreSQL Row-Level Security (RLS)**:
   - Single-database multi-tenant schema where all private tables (`download_logs`, `saved_items`, `reviews`) are foreign-keyed by `user_id`.
   - Production SQL migration (`prisma/rls-policies.sql`) enforces security policies at the database engine layer.

3. **Multi-Select Bulk Download Basket**:
   - Checkboxes on every software card and list view.
   - Persistent floating dock and slide-over drawer showing item counts and total package size.
   - 1-click **"Download All"** queue runner that signs secure expiring URLs sequentially, automatically triggers browser downloads, and logs individual entries to the user's isolated history.

4. **Zenith AI Chatbot (Catalog Grounded RAG)**:
   - Natural language search and recommendation engine (*"Find me a photo editor under 200MB"* or *"Best cyberpunk RPG games"*).
   - Queries the live PostgreSQL catalog and injects matching candidates into context to prevent hallucinations.
   - Interactive preview cards with deep-links to detail pages and 1-click basket additions.
   - Built-in intelligent fallback agent that works seamlessly out-of-the-box even before adding an LLM API key.

5. **Expiring Signed CDN URLs (Cloudflare R2 / AWS S3)**:
   - Prevents hotlinking and unauthorized binary scraping.
   - Local mock streaming gateway included for instantaneous zero-config local development.

6. **Solo-Developer Admin Panel (`/admin`)**:
   - Platform KPIs (Total software, total downloads, registered users, reviews).
   - Full in-app Content Management: Add, edit, or delete software items, upload binaries/screenshots, manage versions, and configure system requirements.
   - Review moderation & real-time live download activity logs.

---

## 📁 Folder Structure

```
zenith-hub/
├── prisma/
│   ├── schema.prisma           # Complete Prisma database models
│   ├── seed.ts                 # Realistic catalog seed script with 20+ titles
│   └── rls-policies.sql        # PostgreSQL Row-Level Security isolation SQL
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/          # Admin CRUD, moderation & stats API routes
│   │   │   ├── ai/chat/        # AI grounded chatbot search API
│   │   │   ├── auth/           # NextAuth credentials & signup routes
│   │   │   ├── downloads/      # Signed expiring URLs & batch queue endpoints
│   │   │   ├── reviews/        # User reviews & ratings submission
│   │   │   ├── software/       # Catalog search, filtering & detail routes
│   │   │   ├── user/           # Isolated user history & profile endpoints
│   │   │   └── wishlist/       # User saved wishlist toggle & fetch
│   │   ├── admin/              # Solo-dev CMS & Platform Dashboard
│   │   ├── auth/               # Sign In & Sign Up custom pages
│   │   ├── catalog/            # Full faceted catalog browsing & search
│   │   ├── dashboard/          # Isolated user history & wishlist dashboard
│   │   ├── software/[slug]/    # Software detail page & download engine
│   │   ├── globals.css         # Dark theme & glassmorphic styles
│   │   ├── layout.tsx          # Root layout with Providers & Floating Widgets
│   │   └── page.tsx            # High-conversion Home page
│   ├── components/
│   │   ├── ai/                 # Zenith AI floating chat widget
│   │   ├── basket/             # Multi-select bulk download drawer & dock
│   │   ├── catalog/            # Cards, list items, filters, screenshots, specs, reviews
│   │   └── layout/             # Navbar and Footer
│   ├── context/
│   │   ├── AuthSessionProvider.tsx
│   │   └── DownloadBasketContext.tsx
│   ├── lib/
│   │   ├── ai-assistant.ts     # RAG catalog search & Gemini/OpenAI handler
│   │   ├── auth.ts             # NextAuth credentials configuration
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── rate-limit.ts       # Sliding window rate limiter
│   │   ├── storage.ts          # S3 / Cloudflare R2 signed URL generator
│   │   ├── utils.ts            # Formatting & badge helpers
│   │   └── validations.ts      # Zod validation schemas
│   └── types/                  # TypeScript data interfaces
├── .env.example                # Environment variable configuration template
├── package.json
└── README.md
```

---

## 🚀 Quickstart: Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed Sample Catalog
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Demo Accounts

- **Admin Account**:
  - Email: `admin@zenithhub.com`
  - Password: `AdminPassword123!`
  - Access: Full access to `/admin` CMS panel.

- **Demo User Account**:
  - Email: `user@zenithhub.com`
  - Password: `UserPassword123!`
  - Access: Isolated download history and saved wishlist in `/dashboard`.

*(You can also use the 1-click **"Fill Admin"** / **"Fill User"** shortcut buttons on the `/auth/signin` page!)*

---

## 🚢 Solo-Developer Production Deployment Guide

Deploying Zenith Software Hub takes less than 5 minutes:

### 1. Database (Neon / Supabase / Railway Postgres)
1. Create a free PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the PostgreSQL connection string.
3. In `prisma/schema.prisma`, update the datasource provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run `npx prisma db push` to create tables.
5. In your Postgres SQL editor (e.g. Neon Console or Supabase SQL Editor), execute `prisma/rls-policies.sql` to activate Row-Level Security policies.
6. Run `npx tsx prisma/seed.ts` to populate initial catalog data.

### 2. Object Storage (Cloudflare R2)
1. Create an R2 bucket in your Cloudflare dashboard (e.g. `zenith-downloads`).
2. Generate an R2 API token with Read & Write permissions.
3. Set `STORAGE_PROVIDER="r2"`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`.

### 3. Frontend & API (Vercel)
1. Push your repository to GitHub / GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Set the Environment Variables in Vercel settings:
   - `DATABASE_URL` = your Neon/Supabase Postgres connection string
   - `NEXTAUTH_URL` = `https://your-domain.vercel.app`
   - `NEXTAUTH_SECRET` = `(generate a 32+ character random string)`
   - `STORAGE_PROVIDER` = `r2`
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
   - `GEMINI_API_KEY` = `(optional for enhanced LLM assistant)`
4. Click **Deploy**!

---

## 🛡️ Security & Scalability

- **Rate Limiting**: Built-in sliding-window limiter on `/api/downloads/sign`, `/api/auth/register`, `/api/reviews`, and `/api/ai/chat`.
- **Zod Validation**: Strict schema enforcement on every API request and form.
- **Signed Expiring CDN URLs**: 30-minute HMAC / S3 SigV4 expiring tokens prevent hotlinking.
- **Postgres RLS**: Database-level multi-tenant isolation.
