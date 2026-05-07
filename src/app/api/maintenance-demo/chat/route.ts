import { NextRequest, NextResponse } from 'next/server'

interface Msg { role: 'tenant' | 'agent'; content: string }
interface Out { reply: string; card: string | null; nextStage: string }

// ─── Auto-progression steps (zero human intervention) ────────────────────────

const AUTO_STEPS: Record<string, Out> = {
  triaged: {
    reply: 'Checking **JVC community rules** for emergency contractor access requirements…',
    card: 'hoa-rules', nextStage: 'hoa_checked',
  },
  hoa_checked: {
    reply: 'JVC rules confirmed ✅. Emergency repairs allowed 24/7 with notice. Technician must be on approved list and have a verified license. Your calendar shows you\'re available after 5 PM today — confirming with the system…',
    card: 'availability-check', nextStage: 'availability_set',
  },
  availability_set: {
    reply: 'Sending emergency RFQ to **3 vetted plumbers** within 10 km of JVC…',
    card: 'provider-search', nextStage: 'providers_found',
  },
  providers_found: {
    reply: 'All 3 quotes received. Analysing price, rating, availability, and proximity…',
    card: 'quote-comparison', nextStage: 'quote_selected',
  },
  quote_selected: {
    reply: '**Best match selected:** Pro Plumbing Solutions — AED 330 all-in, 4.8⭐, available 5:15 PM today. Sending security access request to JVC Gate now…',
    card: 'security-approval', nextStage: 'security_cleared',
  },
  security_cleared: {
    reply: 'Security clearance granted ✅. Technician **Rashid Al-Mansoori** (Licence: PM-5847-2024) confirmed and dispatched. ETA **5:15 PM**. Live tracking active.',
    card: 'technician-assigned', nextStage: 'tech_dispatched',
  },
  tech_dispatched: {
    reply: '🚗 Rashid is en route — current location: Al Wasl Road, ETA 5:10 PM.',
    card: 'status-en-route', nextStage: 'en_route',
  },
  en_route: {
    reply: '📍 Rashid has arrived at **JVC Gate A**. Security confirmed check-in. Heading to Block A now.',
    card: 'status-arrived', nextStage: 'arrived',
  },
  arrived: {
    reply: '🔍 Rashid is inside your unit and inspecting the kitchen sink…',
    card: 'status-diagnosing', nextStage: 'diagnosing',
  },
  diagnosing: {
    reply: '**Diagnosis confirmed:** Corroded P-trap. Replacing with new brass assembly + shutoff valve. Work in progress…',
    card: 'status-in-progress', nextStage: 'repairing',
  },
  repairing: {
    reply: '✅ **Repair complete.** New P-trap installed, pressure tested — zero leaks detected. Rashid is documenting the work:',
    card: 'completion-photos', nextStage: 'work_done',
  },
  work_done: {
    reply: 'Generating itemised invoice…',
    card: 'invoice-card', nextStage: 'invoiced',
  },
  invoiced: {
    reply: 'Charging your registered **Emirates NBD debit card** (••4521)…',
    card: 'payment-processed', nextStage: 'paid',
  },
  paid: {
    reply: 'Payment processed ✅. Rashid has been compensated. How was the service?',
    card: 'feedback-card', nextStage: 'feedback_collected',
  },
  feedback_collected: {
    reply: 'Thank you for your feedback! Rating recorded, records updated. Here\'s your complete workflow summary:',
    card: 'final-summary', nextStage: 'complete',
  },
}

// ─── Demo mode ───────────────────────────────────────────────────────────────

function demo(msgs: Msg[], stage: string, trigger?: string): Out {
  // Auto-progression trigger
  if (trigger === 'auto_next' && AUTO_STEPS[stage]) {
    return AUTO_STEPS[stage]
  }

  const last = msgs.filter(m => m.role === 'tenant').slice(-1)[0]?.content.toLowerCase() ?? ''

  switch (stage) {
    case 'initial': {
      // Detect the issue type from the tenant message
      const isPlumbing = last.match(/water|leak|pipe|drain|tap|toilet|sink/)
      const isAC = last.match(/ac|air con|cool|heat|temperature/)
      const isElectric = last.match(/electric|power|light|socket|trip/)
      const category = isPlumbing ? 'Plumbing' : isAC ? 'HVAC' : isElectric ? 'Electrical' : 'General'
      const urgency = last.match(/flood|emergency|burst|no power|smoke/) ? 'Emergency' : last.match(/leak|drip|break|broken/) ? 'HIGH' : 'MEDIUM'

      return {
        reply: `I've registered your issue and immediately starting the autonomous repair workflow.\n\n**Triage:** ${category} issue · Urgency: **${urgency}**\n\nNo action needed from you — I'll handle everything from here. You'll receive live updates as the AI coordinates providers, security access, and scheduling.`,
        card: 'triage-card', nextStage: 'triaged',
      }
    }

    default:
      if (AUTO_STEPS[stage]) {
        return AUTO_STEPS[stage]
      }
      if (stage === 'complete') {
        return {
          reply: 'Your repair has been fully completed and documented. Is there anything else I can help you with?',
          card: null, nextStage: 'complete',
        }
      }
      return {
        reply: 'I\'m monitoring the situation. You\'ll receive updates as the workflow progresses. Is there anything you\'d like to know in the meantime?',
        card: null, nextStage: stage,
      }
  }
}

// ─── Real AI call ────────────────────────────────────────────────────────────

async function callAI(msgs: Msg[], stage: string): Promise<Out> {
  const system = `You are a fully autonomous UAE property management AI handling a MAINTENANCE REQUEST.
Tenant: Emily Carter | Unit A-301, JVC Garden Apartments, Jumeirah Village Circle
Issue: Water leak under kitchen sink (plumbing)
Current repair stage: ${stage}

WORKFLOW (fully automated — zero human intervention):
initial → triaged → hoa_checked → availability_set → providers_found →
quote_selected → security_cleared → tech_dispatched → en_route → arrived →
diagnosing → repairing → work_done → invoiced → paid → feedback_collected → complete

You have already:
- Triaged: HIGH urgency plumbing, JVC Garden
- Verified JVC community access rules
- Confirmed tenant available after 5 PM
- Sourced 3 providers, selected Pro Plumbing Solutions (AED 330, 4.8⭐, Rashid Al-Mansoori)
- Obtained security clearance for technician (Licence PM-5847-2024)

CARDS you can trigger:
triage-card, hoa-rules, availability-check, provider-search, quote-comparison,
security-approval, technician-assigned, status-en-route, status-arrived,
status-diagnosing, status-in-progress, completion-photos, invoice-card,
payment-processed, feedback-card, final-summary

Respond naturally to tenant questions. Provide updates. Keep responses concise.
Return ONLY valid JSON: {"reply":"...","card":"name or null","nextStage":"stage"}`

  const ak = process.env.ANTHROPIC_API_KEY
  if (ak) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ak, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 400, system,
        messages: msgs.map(m => ({ role: m.role === 'tenant' ? 'user' : 'assistant', content: m.content })),
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
        model: 'gpt-4o-mini', max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, ...msgs.map(m => ({ role: m.role === 'tenant' ? 'user' : 'assistant', content: m.content }))],
      }),
    })
    if (r.ok) { const d = await r.json(); return JSON.parse(d.choices[0].message.content) }
  }
  throw new Error('no ai')
}

// ─── Route handler ────────────────────────────────────────────────────────────

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
