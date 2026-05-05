# Property Copilot — MVP Plan

## 1. MVP Interpretation

Property Copilot is an AI-powered operations assistant for UAE residential real-estate management. The MVP is a web dashboard where property managers and landlords can:

- Maintain a structured portfolio of properties, units, tenants, leases, and maintenance tickets
- Paste incoming messages (from tenants, owners, vendors, etc.) into an AI triage screen
- Receive AI-generated classification, urgency, summary, extracted details, suggested actions, a draft professional response, and suggested ticket fields
- Create maintenance tickets directly from AI recommendations with one click
- Review and approve all AI outputs before acting — nothing is sent automatically

The AI runs in real mode when an API key is configured (OpenAI, Anthropic, or Gemini) or falls back to clearly-labeled demo mode.

---

## 2. Scope (1–3 Day Vertical Slice)

**In scope:**
- Landing page → Dashboard → Properties/Units/Tenants/Leases/Tickets CRUD
- AI triage screen with all required outputs
- Demo seed data (UAE residential)
- Provider-agnostic AI layer with demo fallback
- Settings/API status page
- README, .env.example, NEXT_STEPS.md, architecture docs

**Out of scope for MVP:**
- Production authentication
- Live WhatsApp / SMS / email sending
- ChatGPT Custom GPT actions (placeholder only)
- Payments, rent collection, accounting
- Buyer/seller workflows (classified as future modules)
- Advanced role-based permissions
- Mobile app

---

## 3. Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma ORM |
| Future DB | Schema designed for Postgres/Supabase migration |
| API | Next.js API Routes |
| AI | Provider-agnostic service layer |
| AI Providers | OpenAI, Anthropic Claude, Google Gemini |
| Fallback | Demo mode (deterministic template responses) |
| Auth | Demo user (no login required for PoC) |
| Deployment | Vercel-ready |

---

## 4. Architecture

### Web Dashboard
Next.js App Router. Server components for data fetching, client components for interactive UI. API routes under `/api/` for all mutations and AI calls.

### AI Agent Service (`src/lib/agent/`)
- `triageRequest.ts` — orchestrates the triage pipeline
- `buildPrompt.ts` — constructs the triage prompt with context
- `validateOutput.ts` — validates and normalizes AI JSON output

### AI Provider Layer (`src/lib/ai/`)
- `index.ts` — selects provider based on env vars
- `openai.ts` — OpenAI adapter
- `anthropic.ts` — Anthropic Claude adapter
- `gemini.ts` — Google Gemini adapter
- `demo.ts` — deterministic demo mode responses

### Channel Abstraction (`src/lib/channels/`)
- `web.ts` — current web dashboard channel
- `whatsapp.ts` — future placeholder
- `chatgpt.ts` — future placeholder

### Database Layer (`src/lib/db/`)
- `prisma.ts` — Prisma client singleton

### Request Flow
```
User pastes message
  → POST /api/triage
    → agent/triageRequest.ts
      → agent/buildPrompt.ts (adds property/tenant context)
      → ai/index.ts (routes to provider or demo)
      → agent/validateOutput.ts (validates JSON)
    → saves AgentRun + Request to DB
    → returns structured triage result
  → User reviews output
  → User clicks "Create Ticket"
    → POST /api/tickets (creates MaintenanceTicket)
  → Ticket appears in dashboard
```

---

## 5. Future-Ready Architecture

### ChatGPT Custom GPT Actions
- Expose clean REST endpoints under `/api/actions/`
- OpenAPI spec in `docs/openapi.yaml`
- Same triage, ticket, and property endpoints
- Auth via API key header

### WhatsApp Channel Adapter
- Webhook receiver at `/api/webhooks/whatsapp`
- Parses incoming message → calls same triage service
- Returns structured output to human operator dashboard
- No automatic message sending

### Provider-Agnostic AI Layer
- Env var `AI_PROVIDER` selects: `openai` | `anthropic` | `gemini` | `demo`
- All providers implement the same `AIProvider` interface
- Prompt templates versioned for reproducibility

---

## 6. Implementation Task List

- [x] Create MVP_PLAN.md
- [ ] Set up Prisma schema (all entities + enums)
- [ ] Build AI service layer + demo mode
- [ ] Build API routes (CRUD + triage)
- [ ] Build shared layout + navigation
- [ ] Landing page
- [ ] Dashboard page
- [ ] Properties CRUD pages
- [ ] Units CRUD pages
- [ ] Tenants CRUD pages
- [ ] Leases CRUD pages
- [ ] Maintenance Tickets CRUD pages
- [ ] AI Triage/Copilot page
- [ ] Settings page
- [ ] Seed demo data
- [ ] .env.example + README.md
- [ ] NEXT_STEPS.md
- [ ] Architecture docs
- [ ] Run build, fix errors
- [ ] Commit and push
