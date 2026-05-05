# Property Copilot

**AI operations agent for UAE residential real-estate management.**

Property Copilot helps property managers and landlords triage tenant/owner/vendor messages using AI, manage their UAE residential portfolio (properties, units, tenants, leases, maintenance tickets), and draft professional responses — all with human approval before any action is taken.

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Edit `.env.local`. At minimum, confirm:

```
DATABASE_URL="file:./prisma/dev.db"
```

To enable real AI (optional — demo mode works without a key):

```
ANTHROPIC_API_KEY="sk-ant-..."    # Recommended
# OR
OPENAI_API_KEY="sk-..."
# OR
GEMINI_API_KEY="AIza..."
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Load demo data

On the dashboard, click **Load Demo Data**. This loads:
- 3 UAE residential properties (Dubai Marina, JVC, Al Reem Island)
- 7 units with tenants, leases, and maintenance tickets
- 5 demo maintenance tickets

---

## AI Provider Setup

The app is provider-agnostic. Priority order:
1. **Anthropic Claude** (`ANTHROPIC_API_KEY`) — uses `claude-haiku-4-5-20251001`
2. **OpenAI** (`OPENAI_API_KEY`) — uses `gpt-4o-mini`
3. **Google Gemini** (`GEMINI_API_KEY`) — uses `gemini-1.5-flash`
4. **Demo Mode** — deterministic template responses, no API key needed

Set one key in `.env.local` and restart the dev server. The Settings page shows which mode is active.

---

## Demo Mode

If no AI key is configured, the app runs in **Demo Mode**:
- All triage requests return deterministic, clearly-labeled template responses
- Responses are categorized by keyword matching (AC, plumbing, access, renewal, legal, emergency, buyer/seller)
- Labeled as "Demo Mode" in the UI
- Full CRUD and ticket creation still works

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Operations overview dashboard |
| `/dashboard/copilot` | AI Triage / Copilot (main feature) |
| `/dashboard/properties` | Properties CRUD |
| `/dashboard/units` | Units CRUD |
| `/dashboard/tenants` | Tenants CRUD |
| `/dashboard/leases` | Leases CRUD |
| `/dashboard/tickets` | Maintenance tickets CRUD |
| `/dashboard/settings` | API status and configuration |

---

## API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/triage` | POST | AI message triage |
| `/api/properties` | GET, POST | Properties |
| `/api/properties/[id]` | GET, PUT, DELETE | Property detail |
| `/api/units` | GET, POST | Units |
| `/api/units/[id]` | GET, PUT, DELETE | Unit detail |
| `/api/tenants` | GET, POST | Tenants |
| `/api/tenants/[id]` | GET, PUT, DELETE | Tenant detail |
| `/api/leases` | GET, POST | Leases |
| `/api/leases/[id]` | GET, PUT, DELETE | Lease detail |
| `/api/tickets` | GET, POST | Tickets |
| `/api/tickets/[id]` | GET, PUT, DELETE | Ticket detail |
| `/api/dashboard` | GET | Dashboard stats |
| `/api/settings` | GET | AI mode and channel status |
| `/api/seed` | POST | Load demo data (dev only) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite + Prisma ORM |
| AI | Provider-agnostic (OpenAI / Anthropic / Gemini / Demo) |
| Deployment | Vercel-ready |

---

## Project Structure

```
src/
  app/              Next.js App Router pages + API routes
    api/            REST API endpoints
    dashboard/      Dashboard pages
  components/
    layout/         Sidebar, TopBar
    ui/             Button, Card, Badge, Modal
  lib/
    ai/             AI provider adapters (openai, anthropic, gemini, demo)
    agent/          Triage orchestration
    db/             Prisma client singleton
    utils.ts        Formatting helpers
  types/            Shared TypeScript types
prisma/
  schema.prisma     Database schema
  seed.ts           Demo data seed
docs/               Architecture documentation
MVP_PLAN.md         Implementation plan
NEXT_STEPS.md       Roadmap and next steps
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `DATABASE_URL` — use Postgres for production (Supabase, Neon, Vercel Postgres)
   - `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` — one AI key
4. Prisma will auto-generate during build

See `NEXT_STEPS.md` for full migration path to production.

---

## Disclaimer

Property Copilot is a PoC/MVP tool. It does **not** provide legal, tax, financial, regulatory, or real-estate compliance advice. AI outputs are suggestions only and require human review and approval.

For UAE tenancy law, RERA regulations, and compliance matters, consult a qualified professional.

No messages are sent automatically. The AI never acts autonomously.
