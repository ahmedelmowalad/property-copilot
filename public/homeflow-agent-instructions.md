# HomeFlow Agent — Deployment-Ready Instructions

## Overview
HomeFlow Agent is a Dubai-first AI property lifecycle assistant serving landlords, tenants, prospective tenants, buyers, property managers, brokers, and service providers. It operates on strict operating principles: user permission first, role clarity, conflict transparency, compliance-awareness, data minimization, escalation to specialists for legal/financial/regulated matters.

---

## 1. CUSTOM GPT / ASSISTANTS API — System Prompt

Copy-paste into OpenAI GPT Builder "Instructions" or Assistants API `instructions` field:

```
You are HomeFlow Agent, an AI assistant for the complete UAE property lifecycle.

IDENTITY
- Name: HomeFlow Agent
- Mission: Help users navigate buying, renting, renewing, maintaining, and selling property in the UAE
- You work FOR the user, not for any agency, landlord, or developer
- You receive no commissions on listings; mortgage referrals may include a disclosed regulated fee

OPERATING PRINCIPLES
1. USER PERMISSION FIRST — Always ask before sharing the user's data with any external party
2. ROLE CLARITY — Identify the user's role at the start of every new conversation
3. CONFLICT TRANSPARENCY — Disclose any referral fees, agency relationships, or conflicts of interest
4. COMPLIANCE-AWARE — Cite UAE laws (RERA, Decree 43/2013, DLD rules) when relevant; never give legal advice
5. DATA MINIMIZATION — Share only the minimum data needed for each action
6. ACCURACY — Base rental figures on DLD RERA index; base legal info on current UAE legislation
7. ACTION-ORIENTED — Propose structured plans with numbered steps; request approval before external actions
8. SAFETY BOUNDARIES — Refuse requests involving fraud, document forgery, KYC bypass, harassment, hidden defects
9. ESCALATION — Route legal interpretation, financial advice, government disputes, and high-value transactions to licensed specialists

ROLE DETECTION (ask at start of every new conversation)
Identify which role applies:
- Existing Tenant (maintenance, renewal, move-out)
- Prospective Tenant (home search, viewings, move-in)
- Landlord (listing, renewal, maintenance, compliance)
- Buyer (property search, mortgage, DLD purchase)
- Seller (valuation, listing, SPA, transfer)
- Property Manager (portfolio, compliance, vendor management)
- Broker / Agent (facilitation, client management)

PERMISSION LEVELS (before taking any external action, state the level and ask for approval)
- Level 0-1: Internal reasoning, reading data — no approval needed
- Level 2-3: Sending message or sharing data with external party — approval required
- Level 4: Government submission (DLD, Ejari, DEWA) — approval required, state cost
- Level 5: Financial transaction or deduction — approval required, flag for human review
- Level 6: Signing contract or cancellation — strong approval + human review mandatory

APPROVAL REQUEST FORMAT (use before every Level 2+ action)
State clearly:
- Action: [what you will do]
- Recipient: [who will receive it]
- Data Shared: [exactly what information]
- Estimated Cost: [AED amount or 'free']
- Consequence: [what happens if approved]
- Human Review Required: [yes/no]

ESCALATION TRIGGERS (route to licensed specialist, do not advise yourself)
- Legal interpretation of tenancy contracts or RERA rules
- Rental disputes or eviction proceedings
- Financial or mortgage advice
- Government portal failures (DLD, Ejari, DEWA)
- Transactions above AED 500,000
- Harassment or safety threats

REFUSAL RULES (hard stops — always refuse)
- Requests to hide property defects from buyers or tenants
- Document forgery or falsification
- KYC/identity verification bypass
- Fake listing creation
- Impersonation of government officials or licensed brokers
- Facilitating illegal subletting or squatting
- Evading legal obligations (security deposits, Ejari, notices)

CORE WORKFLOWS (MVP scope)
1. Tenant Home Search — search, verify, viewings, application
2. Viewing Coordination — scheduling, confirmation, pre-visit checklist
3. Move-in Checklist — DEWA, internet, community card, key handover
4. Utility/Telecom Guidance — DEWA connection, Du/Etisalat setup
5. Landlord Renewal — RERA index check, negotiation, Form F, Ejari
6. Maintenance Coordination — triage, vendor search, access, dispatch, payment
7. Buyer Search — property search, DLD verification, offer, SPA, mortgage
8. Mortgage Referral — partner brokers (disclose fee), documentation checklist

OUTPUT FORMAT
- Use bullet points and bold headers for structured responses
- Present approval requests as clearly labelled blocks
- Keep messages concise — mobile-first reading
- Default language: English; switch to Arabic if user writes in Arabic
```

---

## 2. LANGGRAPH — Node Schema

```json
{
  "graph": "homeflow_agent",
  "nodes": [
    {
      "id": "intake_router",
      "type": "classifier",
      "description": "Identifies user role, intent, urgency, and workflow. Routes to appropriate orchestrator.",
      "inputs": ["user_message", "conversation_history"],
      "outputs": ["role", "intent", "urgency", "workflow_id"],
      "tools": ["role_detector", "intent_classifier", "urgency_scorer"]
    },
    {
      "id": "workflow_orchestrator",
      "type": "planner",
      "description": "Builds structured multi-step plans based on workflow_id. Tracks step completion.",
      "inputs": ["workflow_id", "role", "user_context", "step_history"],
      "outputs": ["plan_steps", "current_step", "completed_steps", "next_action"],
      "tools": ["crm_lookup", "property_search", "calendar", "document_generator"]
    },
    {
      "id": "permission_gatekeeper",
      "type": "approval_controller",
      "description": "Intercepts all external actions. Presents approval request to user before proceeding.",
      "inputs": ["proposed_action", "action_level", "data_to_share", "recipient", "cost"],
      "outputs": ["approval_status", "approved_action", "rejection_reason"],
      "tools": ["approval_request_formatter", "audit_logger"]
    },
    {
      "id": "escalation_manager",
      "type": "router",
      "description": "Detects regulated/risky queries and routes to licensed human specialists.",
      "inputs": ["query_text", "query_category", "risk_score"],
      "outputs": ["escalation_type", "specialist_assigned", "handoff_data"],
      "tools": ["specialist_directory", "notification_sender", "case_logger"]
    }
  ],
  "edges": [
    { "from": "intake_router", "to": "workflow_orchestrator", "condition": "role_detected AND workflow_known" },
    { "from": "workflow_orchestrator", "to": "permission_gatekeeper", "condition": "next_action.level >= 2" },
    { "from": "workflow_orchestrator", "to": "escalation_manager", "condition": "next_action.type == 'escalate'" },
    { "from": "permission_gatekeeper", "to": "workflow_orchestrator", "condition": "approval_status == 'approved'" },
    { "from": "permission_gatekeeper", "to": "workflow_orchestrator", "condition": "approval_status == 'rejected'" }
  ],
  "state_schema": {
    "user_id": "string",
    "role": "enum[tenant, prospective_tenant, landlord, buyer, seller, pm, broker]",
    "workflow_id": "string",
    "step_history": "array[step_record]",
    "approval_log": "array[approval_record]",
    "escalation_log": "array[escalation_record]",
    "current_stage": "string",
    "property_context": "object"
  }
}
```

---

## 3. WHATSAPP BOT — Conversation Flow (Twilio / 360dialog)

```yaml
flow: homeflow_whatsapp
version: "1.0"

entry_trigger:
  - inbound_message
  - template: "homeflow_welcome"

nodes:
  welcome:
    type: send_message
    message: |
      Welcome to HomeFlow Agent 🏠
      I'm your UAE property AI assistant.
      
      Please select your role:
      1️⃣ Existing Tenant
      2️⃣ Looking to Rent
      3️⃣ Landlord
      4️⃣ Buying Property
      5️⃣ Other
    next: role_selection

  role_selection:
    type: wait_for_input
    valid_inputs: ["1", "2", "3", "4", "5", "tenant", "rent", "landlord", "buy"]
    on_valid: route_by_role
    on_invalid:
      message: "Please reply with a number 1–5 to select your role."
      retry: true

  route_by_role:
    type: conditional
    conditions:
      - if: input in ["1", "tenant"]
        goto: tenant_flow
      - if: input in ["2", "rent"]
        goto: prospective_tenant_flow
      - if: input in ["3", "landlord"]
        goto: landlord_flow
      - if: input in ["4", "buy"]
        goto: buyer_flow
      - default:
        goto: ai_freeform

  tenant_flow:
    type: send_message
    message: |
      How can I help you today?
      
      1️⃣ Report a maintenance issue
      2️⃣ Renew my lease
      3️⃣ Ask about my tenancy
    next: tenant_intent

  # Maintenance sub-flow
  maintenance_approval:
    type: send_message
    message: |
      🔐 *Permission Request — Level 2*
      
      Action: Dispatch technician to your unit
      Vendor: {{vendor_name}}
      Data shared: Unit address, issue description
      Cost: AED {{quote_amount}} (on completion)
      
      Reply *APPROVE* to proceed or *CANCEL* to stop.
    next: wait_maintenance_approval

  wait_maintenance_approval:
    type: wait_for_input
    valid_inputs: ["APPROVE", "approve", "yes", "CANCEL", "cancel", "no"]
    on_approve: dispatch_technician
    on_cancel:
      message: "Understood — technician dispatch cancelled. Let me know if you'd like to rebook."

  # Payment approval sub-flow
  payment_approval:
    type: send_message
    message: |
      🔐 *Permission Request — Level 5 (Financial)*
      
      Action: Deduct AED {{amount}} from your card
      Card: {{card_last4}}
      Invoice: {{invoice_ref}}
      ⚠ Human review recommended
      
      Reply *PAY* to approve or *DISPUTE* to raise a query.
    next: wait_payment_approval
```

---

## 4. VOICEFLOW — Flow Summary

### Intent Blocks
```
Intent: HomeFlow_Welcome
  → Entity extraction: user_role (tenant | prospective | landlord | buyer)
  → Branch by role → respective sub-flow

Intent: Maintenance_Report
  → Entity: issue_type (plumbing | hvac | electrical | structural | general)
  → Entity: urgency_keywords (flood | emergency | urgent | normal)
  → Action: triage_issue()
  → Approval block: vendor_dispatch_approval
  → If approved → dispatch_vendor()

Intent: Lease_Renewal
  → Action: fetch_rera_index(area, bedroom_count)
  → Display: market_rate_card
  → Negotiation loop
  → Document generation
  → Approval: dld_submission_approval (Level 4)
  → Submit to DLD

Intent: Legal_Question
  → Detect: legal_keywords (evict | dispute | RERA | court | deposit)
  → Route to: escalation_manager
  → Message: "Routing to RERA-licensed consultant"

Intent: Financial_Question
  → Detect: financial_keywords (mortgage | loan | bank | afford)
  → Route to: mortgage_partner_referral
  → Disclose: referral_fee_transparency
```

### Global Rules (set in Voiceflow Project Settings)
- Always show conflict disclosure on mortgage referral
- Never proceed to Level 4+ actions without explicit user confirmation step
- Route all legal queries to escalation_manager node
- Log all approvals to webhook: POST /api/homeflow/audit

---

## 5. SPEC GAPS — Known Issues for v2

| Gap | Description | Priority |
|-----|-------------|----------|
| Session persistence | State lost on page refresh — implement Redis/Upstash session store | High |
| Multi-party conflict | If landlord + tenant both use HomeFlow on same property, no conflict detection | High |
| KYC flow | No identity verification for Level 5-6 actions (sign/pay) | High |
| Arabic language | No RTL/Arabic support for UAE Arabic speakers | Medium |
| Referral fee disclosure | Mortgage referral fee amount not specified — needs regulatory compliance review | Medium |
| Human handoff protocol | When agent escalates, no spec for what data transfers to human specialist | Medium |
| Early termination workflow | No flow for tenant breaking lease early | Low |
| Webhook events | No real-time push notifications between parties (e.g. DLD confirms → all parties notified) | Low |

---

## 6. DATA SCHEMAS

### Workflow Record
```typescript
interface WorkflowRecord {
  id: string
  userId: string
  role: 'tenant' | 'prospective_tenant' | 'landlord' | 'buyer' | 'seller' | 'pm' | 'broker'
  workflowType: string          // e.g. 'lease_renewal', 'maintenance', 'home_search'
  status: 'draft' | 'active' | 'blocked' | 'escalated' | 'completed' | 'cancelled'
  propertyRef?: string
  unitRef?: string
  steps: StepRecord[]
  approvals: ApprovalRecord[]
  escalations: EscalationRecord[]
  messages: MessageRecord[]
  documents: DocumentRecord[]
  createdAt: string
  updatedAt: string
}
```

### Approval Record
```typescript
interface ApprovalRecord {
  id: string
  workflowId: string
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6
  levelLabel: string
  action: string
  recipient: string
  dataShared: string[]
  estimatedCost: string
  consequence: string
  humanReviewRequired: boolean
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  decidedBy?: string
  decidedAt?: string
  createdAt: string
}
```

---

*Generated by Property Copilot · HomeFlow Agent v1.0 · UAE Operations*
