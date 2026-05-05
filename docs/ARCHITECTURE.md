# Property Copilot — Architecture Overview

## System Overview

Property Copilot is a Next.js full-stack application with a provider-agnostic AI layer. The architecture is designed for:
- Local/demo operation (SQLite + Demo AI)
- Production operation (Postgres + Real AI)
- Multi-channel extension (Web → WhatsApp → ChatGPT)

---

## Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # REST API Routes
│   │   ├── triage/             # AI triage endpoint
│   │   ├── properties/         # Property CRUD
│   │   ├── units/              # Unit CRUD
│   │   ├── tenants/            # Tenant CRUD
│   │   ├── leases/             # Lease CRUD
│   │   ├── tickets/            # Maintenance ticket CRUD
│   │   ├── dashboard/          # Dashboard stats
│   │   ├── settings/           # AI/channel status
│   │   └── seed/               # Demo data seed
│   └── dashboard/              # UI Pages
├── components/
│   ├── layout/                 # Sidebar, TopBar
│   └── ui/                     # Button, Card, Badge, Modal
├── lib/
│   ├── ai/                     # AI Provider Layer
│   │   ├── index.ts            # Provider selector
│   │   ├── anthropic.ts        # Anthropic Claude adapter
│   │   ├── openai.ts           # OpenAI adapter
│   │   ├── gemini.ts           # Gemini adapter
│   │   └── demo.ts             # Demo mode (no key)
│   ├── agent/
│   │   └── triageRequest.ts    # Triage orchestrator
│   ├── db/
│   │   └── prisma.ts           # Prisma client singleton
│   └── utils.ts                # Shared utilities
└── types/
    └── index.ts                # Shared TypeScript types
```

---

## Request Triage Flow

```
User inputs message in AI Copilot page
    ↓
POST /api/triage
    ↓
triageRequest() — agent orchestrator
    ├── Fetch related entity context (property, unit, tenant, lease)
    ├── Build TriageInput object
    └── Call AI provider via runTriage()
            ↓
        lib/ai/index.ts — provider selection
            ├── ANTHROPIC_API_KEY → Anthropic adapter
            ├── OPENAI_API_KEY → OpenAI adapter
            ├── GEMINI_API_KEY → Gemini adapter
            └── none → Demo adapter
                    ↓
                Returns TriageOutput (JSON)
    ↓
Save Request + AgentRun to database
    ↓
Return TriageOutput to frontend
    ↓
User reviews: category, urgency, summary, draft response, suggested ticket
    ↓
User clicks "Create Ticket" (manual approval)
    ↓
POST /api/tickets → MaintenanceTicket created
```

---

## AI Provider Interface

All providers implement the same pattern:

```typescript
// TriageInput
{
  message: string
  senderType: SenderType
  channel: Channel
  context?: {
    propertyName?: string
    unitNumber?: string
    tenantName?: string
    leaseStatus?: string
    leaseEndDate?: string
  }
}

// TriageOutput
{
  category: RequestCategory
  urgency: Urgency
  summary: string
  extractedDetails: Record<string, string>
  suggestedActions: string[]
  draftResponse: string
  suggestedTicket: { title, description, category, urgency, vendorType } | null
  complianceNotes: string | null
  requiresEscalation: boolean
  provider: AIProvider
  mode: 'real' | 'demo'
}
```

---

## Database Layer

Prisma ORM with SQLite (dev) / PostgreSQL (production).

Key design decisions:
- All string enums stored as strings (portable across databases)
- JSON fields stored as serialized strings (compatible with SQLite)
- `AgentRun` model logs every AI call for debugging and audit
- `ActivityLog` model tracks ticket state changes
- Schema designed for Postgres migration without model changes

---

## Channel Abstraction

Current: Web Dashboard only
Future: WhatsApp + ChatGPT Custom GPT

All channels use the same `/api/triage` endpoint and the same AI service layer. Channel-specific adapters handle:
- Message parsing (WhatsApp → TriageInput format)
- Response delivery (triage result → human operator dashboard)
- No automatic outbound messaging

---

## Human-in-the-Loop Design

1. AI output is always marked as a suggestion
2. Draft responses shown with "requires human approval" warning
3. "Create Ticket" button is explicit user action — not automatic
4. No message sending capability exists in the current codebase
5. Compliance notes surfaced prominently for legal/regulatory queries
6. Emergency tickets flagged with separate alert UI

---

## Security Notes (MVP Caveats)

- No authentication in MVP — add NextAuth.js for production
- API routes are unprotected — add middleware for production
- SQLite file is local — secure appropriately in production
- AI API keys are server-side only (never exposed to client)
- No rate limiting in MVP — add for production
