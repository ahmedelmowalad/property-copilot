import { NextRequest, NextResponse } from 'next/server'

interface Msg { role: 'user' | 'agent'; content: string }
interface Out { reply: string; card: string | null; nextStage: string }

// ─── Demo state machine ────────────────────────────────────────────────────

function demo(msgs: Msg[], stage: string, trigger?: string): Out {
  const last = msgs.filter(m => m.role === 'user').slice(-1)[0]?.content.toLowerCase() ?? ''

  // Role selection triggers
  const ROLE_LABELS: Record<string, string> = {
    role_tenant: 'Existing Tenant',
    role_prospective: 'Prospective Tenant',
    role_landlord: 'Landlord',
    role_buyer: 'Buyer',
    role_seller: 'Seller',
    role_pm: 'Property Manager',
    role_broker: 'Broker / Agent',
  }

  if (trigger && trigger.startsWith('role_')) {
    const role = ROLE_LABELS[trigger] ?? trigger
    const isProspective = trigger === 'role_prospective'
    return {
      reply: isProspective
        ? `**Role detected: Prospective Tenant** ✅\n\nI\'m your HomeFlow Agent. I can help you find a home, arrange viewings, understand your legal rights, and guide you through move-in.\n\n**What are you looking for?** For example: "2BR Dubai Marina, budget AED 100k" or "studio in JVC under AED 60k"`
        : `**Role detected: ${role}** ✅\n\nI\'m your HomeFlow Agent. Tell me what you need help with — whether it\'s a maintenance issue, lease renewal, property search, or something else.`,
      card: 'intake-router',
      nextStage: 'workflow_input',
    }
  }

  if (trigger === 'vendor_approved') {
    return {
      reply: '**Permission granted** ✅\n\nForwarding your details to all three property managers now. You\'ll receive viewing confirmations within the hour.',
      card: 'viewings-scheduled',
      nextStage: 'viewings_scheduled',
    }
  }

  if (trigger === 'vendor_rejected') {
    return {
      reply: 'Understood — contact not forwarded. Would you like to search a different area, or proceed anonymously through a broker?',
      card: null,
      nextStage: 'workflow_input',
    }
  }

  if (trigger === 'escalation_accepted') {
    return {
      reply: '**Connecting you to a RERA-licensed property consultant.** ✅\n\nThey\'ll review your question and respond within 2 business hours. In the meantime, I\'ll continue managing your viewing schedule.',
      card: 'escalation-complete',
      nextStage: 'complete',
    }
  }

  switch (stage) {
    case 'initial':
      return {
        reply: 'Welcome to **HomeFlow Agent** — your AI assistant for every stage of your property journey in the UAE.\n\nI work for *you*, not any agency. Before I can help, I need to understand your role.',
        card: 'role-selection',
        nextStage: 'initial',
      }

    case 'workflow_input': {
      const isBudget = last.match(/\d[\d,k]+/)
      const isSearch = last.match(/look|search|find|want|need|2br|1br|studio|bedroom|apartment|flat|villa/)
      const isArea = last.match(/marina|jvc|jbr|downtown|business bay|palm|reem|saadiyat|yas|abu dhabi|dubai/)

      if (isBudget || isSearch || isArea) {
        const area = last.match(/marina/) ? 'Dubai Marina'
          : last.match(/jvc/) ? 'JVC'
          : last.match(/downtown/) ? 'Downtown Dubai'
          : last.match(/palm/) ? 'Palm Jumeirah'
          : 'Dubai'
        const beds = last.match(/studio/) ? 'Studio' : last.match(/1\s*br|1\s*bed/) ? '1BR' : '2BR'
        return {
          reply: `**Search parameters captured** ✅\n\n• Type: ${beds}\n• Area: ${area}\n• I\'ll now search active listings, verify them against the DLD database, and check for any undisclosed issues.\n\n*Searching verified listings…*`,
          card: 'orchestrator-plan',
          nextStage: 'searching',
        }
      }

      return {
        reply: 'Tell me what you\'re looking for — include the area, number of bedrooms, and your budget. For example: *"2BR in Dubai Marina, max AED 100k/year"*',
        card: null,
        nextStage: 'workflow_input',
      }
    }

    case 'searching':
      return {
        reply: '**3 verified listings found** matching your criteria. All checked against DLD records — no disputes or encumbrances detected.',
        card: 'property-matches',
        nextStage: 'search_done',
      }

    case 'search_done':
      return {
        reply: 'To book viewings, I need to forward your name and contact to the property managers of these 3 units. **Please review and approve this before I proceed.**',
        card: 'vendor-approval-request',
        nextStage: 'pending_approval',
      }

    case 'pending_approval':
      return {
        reply: 'Waiting for your approval to share contact details with the property managers.',
        card: null,
        nextStage: 'pending_approval',
      }

    case 'viewings_scheduled': {
      const isLegal = last.match(/right|legal|law|evict|deposit|refund|dispute|court|rera|damage|deduct|notice/)
      const isFinancial = last.match(/mortgage|loan|bank|finance|afford|down payment|dld fee|transfer fee/)

      if (isLegal) {
        return {
          reply: 'That\'s a legal question — HomeFlow Agent cannot provide legal advice.\n\nI\'m flagging this for escalation to a **RERA-licensed property consultant** who can answer it accurately and safely.',
          card: 'escalation-card',
          nextStage: 'escalation_pending',
        }
      }
      if (isFinancial) {
        return {
          reply: 'That\'s a mortgage/financing question — I\'ll connect you with a regulated mortgage advisor.\n\n*Disclosure: HomeFlow may receive a referral fee from partnering mortgage brokers. You\'re free to use any provider.*',
          card: 'escalation-card',
          nextStage: 'escalation_pending',
        }
      }
      if (last.match(/yes|ok|great|confirm|proceed|next|thanks|what|when|where/)) {
        return {
          reply: '**Your 3 viewings are confirmed** ✅\n\n• Marina Heights Unit 1205 — Tomorrow 11 AM\n• Dubai Marina Walk Tower — Tomorrow 3 PM\n• The Residences Tower B — Saturday 10 AM\n\nYou\'ll receive SMS reminders 2 hours before each. Is there anything else you\'d like to know before the viewings?',
          card: 'viewing-checklist',
          nextStage: 'complete',
        }
      }
      return {
        reply: 'Your viewings are scheduled. Do you have any questions about what to look for during the visits, your legal rights as a prospective tenant, or next steps?',
        card: null,
        nextStage: 'viewings_scheduled',
      }
    }

    case 'escalation_pending':
      return {
        reply: 'A licensed consultant has been notified. Would you like to proceed with that escalation, or continue with your viewings in the meantime?',
        card: null,
        nextStage: 'escalation_pending',
      }

    case 'complete':
      return {
        reply: 'Is there anything else I can help you with on your property search?',
        card: null,
        nextStage: 'complete',
      }

    default:
      return {
        reply: 'How can I assist you?',
        card: null,
        nextStage: stage,
      }
  }
}

async function callAI(msgs: Msg[], stage: string): Promise<Out> {
  const system = `You are HomeFlow Agent — a UAE property lifecycle AI assistant.
Operating principles: user permission first, role clarity, conflict transparency, compliance-aware, data minimization, escalate legal/financial/regulated matters.

Sub-agents: Intake Router (classify role/intent), Workflow Orchestrator (structured plans), Permission Gatekeeper (approval before external action), Escalation Manager (route to specialists).

Current demo persona: Ahmed Al-Rashid, prospective tenant searching for 2BR in Dubai Marina, ~AED 100k budget.

STAGES: initial → workflow_input → searching → search_done → pending_approval → viewings_scheduled → complete

PERMISSION LEVELS:
- Level 2: Share contact with external party → requires explicit approval
- Level 4: Government submission
- Level 5: Financial transaction → requires approval + human review flag

ESCALATE if tenant asks about: legal rights, deposit disputes, eviction, RERA complaints, mortgage advice.

Return JSON: {"reply":"...","card":"name or null","nextStage":"stage"}`

  const ak = process.env.ANTHROPIC_API_KEY
  if (ak) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ak, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 500, system,
        messages: msgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      }),
    })
    if (r.ok) { const d = await r.json(); return JSON.parse(d.content[0].text) }
  }
  const ok = process.env.OPENAI_API_KEY
  if (ok) {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini', max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, ...msgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))],
      }),
    })
    if (r.ok) { const d = await r.json(); return JSON.parse(d.choices[0].message.content) }
  }
  throw new Error('no ai')
}

export async function POST(req: NextRequest) {
  try {
    const { messages = [], stage = 'initial', trigger } = await req.json()
    let result: Out
    try {
      if (trigger) throw new Error('demo handles triggers')
      result = await callAI(messages as Msg[], stage)
    } catch {
      result = demo(messages as Msg[], stage, trigger)
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
