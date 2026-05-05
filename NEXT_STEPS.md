# Property Copilot — Next Steps & Roadmap

## What Was Built (MVP/PoC)

### Core Features
- **Landing page** — Professional marketing page for Property Copilot
- **Operations Dashboard** — Stats, recent tickets, recent AI triage requests, quick actions
- **Properties CRUD** — Create, view, edit, delete UAE residential properties
- **Units CRUD** — Manage units within properties, track status (Vacant/Occupied/Maintenance)
- **Tenants CRUD** — Manage tenants, assign to units, track status
- **Leases CRUD** — Track tenancy agreements, flag expiring leases
- **Maintenance Tickets CRUD** — Full ticket lifecycle with status tracking and activity logs
- **AI Copilot / Triage** — Main feature: paste any message, get AI analysis, create ticket from suggestion
- **Settings page** — AI mode status, provider config, channel status

### AI Triage Outputs
- Category (Maintenance, Rent, Lease, Emergency, Buyer/Seller Future Module, etc.)
- Urgency (Low/Medium/High/Emergency)
- Summary and extracted details
- Suggested next actions
- Draft professional response
- Suggested ticket fields
- Compliance/legal notices
- Escalation flags

### Technical Architecture
- Provider-agnostic AI layer (Anthropic → OpenAI → Gemini → Demo)
- Demo mode with deterministic keyword-based responses
- Human-in-the-loop: no automatic message sending
- Full REST API under `/api/`
- SQLite via Prisma (portable to Postgres)
- Seeded UAE residential demo data

---

## What Was Mocked / Skipped

| Feature | Status | Notes |
|---------|--------|-------|
| Production authentication | Skipped | No login for demo. Add NextAuth.js or Clerk for production. |
| WhatsApp sending | Placeholder only | Webhook route architecture defined but not implemented |
| ChatGPT Custom GPT Actions | Placeholder only | OpenAPI spec outlined in docs |
| Live email sending | Not implemented | Requires SendGrid/Resend integration |
| SMS sending | Not implemented | Requires Twilio/MessageBird |
| Role-based permissions | Skipped | Single demo user |
| Multi-tenant SaaS | Skipped | Single workspace demo |
| Payments / rent collection | Explicitly out of scope |
| Accounting | Explicitly out of scope |
| Advanced analytics | Skipped | Basic stats on dashboard |
| Mobile app | Out of scope |

---

## Known Limitations

1. **SQLite is not suitable for production** — use Postgres/Supabase for multi-user deployment
2. **No authentication** — anyone with the URL can access the demo
3. **Demo mode is keyword-based** — real AI providers give much better results
4. **No file uploads** — lease documents, photos not supported yet
5. **No real-time updates** — dashboard requires refresh to see new data
6. **Single workspace** — no multi-tenancy

---

## Recommended Next Features (Priority Order)

### Phase 1: Production Readiness
1. **Authentication** — Add NextAuth.js with Google/email sign-in
2. **Database migration** — Move from SQLite to Supabase Postgres
3. **Role-based access** — Property Manager, Owner, Admin roles
4. **Vercel deployment** — CI/CD pipeline with environment management

### Phase 2: Core Operations
5. **Lease renewal workflow** — Automated expiry alerts, renewal templates
6. **Vendor management** — Vendor registry, assignment, rating
7. **Owner/landlord updates** — Generate owner portfolio update reports
8. **Document storage** — Upload lease PDFs, inspection reports (Supabase Storage)
9. **Activity timeline** — Full audit trail per entity

### Phase 3: Channels
10. **WhatsApp integration** — Receive tenant messages via WhatsApp Business API
11. **ChatGPT Custom GPT** — Deploy as ChatGPT Action using `/api/actions/` endpoints
12. **Email integration** — Receive and send emails via SendGrid/Resend

### Phase 4: Advanced
13. **Analytics dashboard** — Portfolio performance, ticket trends, response times
14. **Scheduled notifications** — Lease expiry alerts, ticket SLA reminders
15. **Multi-workspace** — SaaS multi-tenancy with billing
16. **Mobile app** — React Native or PWA

---

## Migration Path: SQLite → Supabase/Postgres

### Steps

1. **Create Supabase project** at supabase.com

2. **Update Prisma schema** — change provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Set DATABASE_URL** to Supabase Postgres connection string

4. **Run migration:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Update .env.local** with Supabase DATABASE_URL

6. **Deploy to Vercel** with Supabase DATABASE_URL set in project env vars

The Prisma schema is already designed to be Postgres-compatible. No model changes required.

---

## ChatGPT Custom GPT Plan

See `docs/CHATGPT_ACTIONS_PLAN.md` for full plan.

**Summary:**
1. Create `/api/actions/` endpoints with OpenAPI schema
2. Key actions: `triageMessage`, `listProperties`, `listTickets`, `createTicket`
3. Add API key authentication header
4. Register as ChatGPT Action in Custom GPT builder
5. Set system prompt for property management context

---

## WhatsApp Integration Plan

See `docs/WHATSAPP_INTEGRATION_PLAN.md` for full plan.

**Summary:**
1. Register WhatsApp Business API via Meta Developer Portal
2. Create webhook at `/api/webhooks/whatsapp`
3. Parse incoming messages → call triage service
4. Show triage output to property manager in dashboard
5. Property manager reviews draft response → manually copies and sends
6. Track messages per tenant/unit

**Critical:** No automatic message sending. All responses require human approval.

---

## Deployment Instructions (Production)

### Vercel + Supabase

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login and link
vercel login
vercel link

# 3. Set environment variables
vercel env add DATABASE_URL
vercel env add ANTHROPIC_API_KEY

# 4. Deploy
vercel --prod
```

### Environment Variables (Production)
```
DATABASE_URL=postgresql://...supabase...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Architecture Decision Log

| Decision | Rationale |
|----------|-----------|
| SQLite for MVP | Zero-config local development |
| Prisma as ORM | Type-safe, Postgres-portable, excellent DX |
| Next.js App Router | Full-stack in one repo, Vercel-optimized |
| Provider-agnostic AI | Flexibility, cost control, no vendor lock-in |
| Demo mode | Works without API keys, great for demos |
| No auto-send | Core product principle: human approval required |
| Tailwind CSS | Fast, maintainable, B2B dashboard-appropriate |
