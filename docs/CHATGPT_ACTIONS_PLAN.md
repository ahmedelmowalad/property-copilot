# Property Copilot — ChatGPT Custom GPT Actions Plan

> **Status:** Planned — not implemented in MVP

## Overview

Property Copilot can be deployed as a ChatGPT Custom GPT using OpenAI's Actions feature. This allows property managers to interact with the system via ChatGPT's interface.

## Planned API Actions

The following API endpoints would be exposed as ChatGPT Actions:

### 1. Triage Message
```
POST /api/actions/triage
Body: { message, senderType, relatedPropertyId?, relatedUnitId?, relatedTenantId? }
Returns: TriageOutput (category, urgency, summary, draftResponse, suggestedTicket)
```

### 2. List Properties
```
GET /api/actions/properties
Returns: Array of properties with unit counts
```

### 3. List Open Tickets
```
GET /api/actions/tickets?status=open&urgency=High
Returns: Array of maintenance tickets
```

### 4. Create Ticket
```
POST /api/actions/tickets
Body: { title, description, category, urgency, propertyId?, unitId?, tenantId? }
Returns: Created ticket
```

### 5. Get Tenant Info
```
GET /api/actions/tenants/:id
Returns: Tenant details with lease and tickets
```

## Authentication

Add `X-API-Key` header authentication:
```
X-API-Key: your-property-copilot-key
```

## OpenAPI Schema Location

The OpenAPI schema will be at: `/api/actions/openapi.json`

## Implementation Steps

1. Create `/src/app/api/actions/` directory
2. Implement action-specific API routes with API key auth
3. Create `openapi.json` schema
4. Register in ChatGPT Custom GPT builder:
   - Set schema URL
   - Set authentication method (API Key)
5. Write Custom GPT system prompt:
   ```
   You are Property Copilot, an AI assistant for UAE residential property management.
   Help property managers triage tenant requests, view portfolio data, and manage maintenance tickets.
   Always recommend human review before sending any response to tenants.
   Never provide legal or regulatory advice — recommend consulting a qualified professional.
   ```

## Important Constraints

- Never send messages to tenants automatically through ChatGPT
- Always surface compliance notes in responses
- All action outputs should include human-review recommendations
- Rate limit API actions per workspace

## Timeline

- Phase 1 (current): Web dashboard + REST API
- Phase 2: OpenAPI schema + action endpoints
- Phase 3: ChatGPT Custom GPT registration and testing
- Phase 4: Production deployment with API key management
