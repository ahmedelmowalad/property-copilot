# Property Copilot — WhatsApp Integration Plan

> **Status:** Planned — not implemented in MVP
> **IMPORTANT:** This integration MUST NOT send messages automatically. All responses require human approval.

## Overview

WhatsApp integration allows tenants and property managers to send messages via WhatsApp, which are automatically triaged by the AI and surfaced in the Property Copilot dashboard for human review and response.

## Architecture

```
Tenant sends WhatsApp message
    ↓
WhatsApp Business API → Webhook
    ↓
POST /api/webhooks/whatsapp
    ↓
Parse incoming message
    ↓
Match to tenant record in database
    ↓
Call /api/triage (same as web triage)
    ↓
Save Request to database
    ↓
Show in dashboard with "WhatsApp" channel tag
    ↓
Property manager reviews AI triage output
    ↓
Property manager manually copies draft response
    ↓
Property manager sends response via WhatsApp Business dashboard or API (MANUAL STEP)
```

## Webhook Implementation

```typescript
// /api/webhooks/whatsapp/route.ts (placeholder)

// GET — WhatsApp webhook verification
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// POST — Receive incoming messages
export async function POST(req: NextRequest) {
  const body = await req.json()
  // Parse WhatsApp message
  // Match to tenant by phone number
  // Call triage service
  // Save to database
  // Notify dashboard (future: WebSocket/SSE)
  return Response.json({ status: 'received' })
}
```

## Setup Steps

1. **Meta Developer Account** — Create at developers.facebook.com
2. **WhatsApp Business API** — Register business phone number
3. **Webhook Configuration:**
   - URL: `https://your-domain.com/api/webhooks/whatsapp`
   - Verify Token: Set `WHATSAPP_VERIFY_TOKEN` env var
4. **Subscribe to message events** in Meta developer portal
5. **Set environment variables:**
   ```
   WHATSAPP_ACCESS_TOKEN=...
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_VERIFY_TOKEN=...
   ```

## Phone Number Matching

When a WhatsApp message arrives, match the sender's phone number to the `Tenant.phone` field in the database to auto-populate `relatedTenantId` in the triage request.

## Dashboard Integration

- Add "WhatsApp" indicator on triage requests
- Show tenant's WhatsApp phone number
- Allow property manager to copy draft response to clipboard
- Track whether response was sent (manual confirmation checkbox)

## Important Constraints

- **Never send messages automatically** — WhatsApp Business API allows outbound, but Property Copilot must NOT use it without explicit human action
- **Rate limits** — WhatsApp has strict rate limits and quality ratings
- **24-hour window** — Standard messages can only be sent within 24 hours of tenant's last message
- **Template messages** — Outside 24h window, only pre-approved templates can be sent
- **UAE regulations** — Ensure compliance with UAE telecommunications regulations

## Timeline

- Phase 1 (current): Web dashboard
- Phase 2: WhatsApp webhook receiver + dashboard integration
- Phase 3: Manual response workflow (copy-to-clipboard + confirmation)
- Phase 4 (future, with caution): Semi-automated response with explicit manager approval per message
