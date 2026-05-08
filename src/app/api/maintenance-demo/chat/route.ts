import { NextRequest, NextResponse } from 'next/server'

interface Msg { role: 'tenant' | 'agent'; content: string }
interface Out { reply: string; card: string | null; nextStage: string }

const AUTO_STEPS: Record<string, Out> = {
  triaged: {
    reply: '**Checking JVC community rules** for contractor access & insurance requirements…',
    card: 'hoa-rules', nextStage: 'hoa_checked',
  },
  hoa_checked: {
    reply: '**Searching 3 verified plumbers** within JVC area, requesting emergency availability…',
    card: 'provider-search', nextStage: 'providers_found',
  },
  providers_found: {
    reply: 'All quotes received. **Analysing price, rating, availability…**',
    card: 'quote-comparison', nextStage: 'quote_selected',
  },
  quote_selected: {
    reply: '**Best option: Pro Plumbing Solutions (AED 330, 4.8⭐).** Calling them now to confirm booking and exact timing…',
    card: 'phone-call-out', nextStage: 'provider_call_done',
  },
  provider_call_done: {
    reply: 'Booking **confirmed by phone** ✅. Now requesting **JVC security access clearance** for technician…',
    card: 'security-approval', nextStage: 'security_cleared',
  },
  security_cleared: {
    reply: 'Security **approved** ✅. Technician **Rashid Al-Mansoori (Lic: PM-5847-2024)** is confirmed. The AI is now calling you to go over the details before he arrives.',
    card: 'phone-call-in', nextStage: 'phone_in_pending',
  },
  tenant_call_done: {
    reply: '**Technician confirmed and en route.** ETA 5:15 PM. **Live GPS tracking active.**',
    card: 'technician-assigned', nextStage: 'tech_dispatched',
  },
  tech_dispatched: {
    reply: '**En route to JVC.** Current location: Al Wasl Road. ETA 5:10 PM.',
    card: 'status-en-route', nextStage: 'en_route',
  },
  en_route: {
    reply: '**Arrived at JVC Gate A.** Security verified. Heading to Block A now.',
    card: 'status-arrived', nextStage: 'arrived',
  },
  arrived: {
    reply: '**Inside your unit.** Inspecting the kitchen sink…',
    card: 'status-diagnosing', nextStage: 'diagnosing',
  },
  diagnosing: {
    reply: '**Diagnosis:** Corroded P-trap. **Replacing with new brass assembly…**',
    card: 'status-in-progress', nextStage: 'repairing',
  },
  repairing: {
    reply: '**✅ Repair complete.** New P-trap installed. Pressure tested — **zero leaks**. Documenting work…',
    card: 'completion-photos', nextStage: 'work_done',
  },
  work_done: {
    reply: '**Generating itemised invoice…**',
    card: 'invoice-card', nextStage: 'invoiced',
  },
  invoiced: {
    reply: 'Invoice ready. **Processing payment from Emirates NBD debit card ••4521…**',
    card: 'payment-processed', nextStage: 'paid',
  },
  paid: {
    reply: '**✅ All done! Zero human decisions required.** Here\'s your complete maintenance summary:',
    card: 'final-summary', nextStage: 'complete',
  },
}

function demo(msgs: Msg[], stage: string, trigger?: string): Out {
  const last = msgs.filter(m => m.role === 'tenant').slice(-1)[0]?.content.toLowerCase() ?? ''

  if (trigger === 'auto_next') {
    return AUTO_STEPS[stage] ?? { reply: 'Processing…', card: null, nextStage: stage }
  }

  if (trigger === 'call_answered') {
    return {
      reply: 'Great! I\'ll send you **live tracking updates** here as Rashid travels to you. You\'ll also get a call from him 10 minutes before arrival.',
      card: null, nextStage: 'tenant_call_done',
    }
  }

  switch (stage) {
    case 'initial': {
      const isPlumbing = last.match(/water|leak|pipe|drain|tap|toilet|sink/)
      const isAC = last.match(/ac|air con|cool|heat|temperature|hot/)
      const isElectric = last.match(/electric|power|light|socket|trip|switch/)
      const category = isPlumbing ? 'Plumbing' : isAC ? 'HVAC' : isElectric ? 'Electrical' : 'General'
      const urgency = last.match(/flood|emergency|burst|no power|smoke/) ? 'EMERGENCY' : last.match(/leak|drip|break|broken/) ? 'HIGH' : 'MEDIUM'

      if (isPlumbing || isAC || isElectric || last.match(/lock|door|window|broken/)) {
        return {
          reply: `Issue registered: **${category}** · Urgency: **${urgency}** ✅\n\nStarting automated workflow…\n\n**When would you prefer the technician to visit?**\n\n• **Today 5:15–6:30 PM** (evening)\n• **Tomorrow 10 AM–12 PM** (morning)\n• **Tomorrow 4–6 PM** (afternoon)`,
          card: 'triage-card', nextStage: 'time_slot_selection',
        }
      }
      return {
        reply: 'I can arrange a repair. **Describe the issue** — e.g. *"water leak under sink"*, *"AC not cooling"*, *"power socket sparking"*.',
        card: null, nextStage: 'initial',
      }
    }

    case 'time_slot_selection':
      if (last.match(/today|5.*pm|evening|asap|now/)) {
        return {
          reply: '**Today 5:15–6:30 PM confirmed** ✅\n\nStarting automated workflow…',
          card: 'availability-check', nextStage: 'triaged',
        }
      }
      if (last.match(/tomorrow|10.*am|morning|12.*pm|4.*pm|afternoon/)) {
        return {
          reply: '**Time slot confirmed** ✅\n\nStarting automated workflow…',
          card: 'availability-check', nextStage: 'triaged',
        }
      }
      return {
        reply: 'Which time works best?\n• Today 5:15–6:30 PM\n• Tomorrow 10 AM–12 PM\n• Tomorrow 4–6 PM',
        card: null, nextStage: 'time_slot_selection',
      }

    case 'complete':
      return { reply: 'Is there anything else I can help you with?', card: null, nextStage: 'complete' }

    default:
      return { reply: 'How can I assist you?', card: null, nextStage: stage }
  }
}

async function callAI(msgs: Msg[], stage: string): Promise<Out> {
  const system = `You are an autonomous property management AI handling MAINTENANCE for a Dubai apartment.
Tenant: Emily Carter | Unit A-301, JVC Garden Apartments
STAGES: initial → time_slot_selection → triaged → hoa_checked → providers_found → quote_selected → security_cleared → tech_dispatched → en_route → arrived → diagnosing → repairing → work_done → invoiced → paid → complete
Return JSON: {"reply":"...","card":"name or null","nextStage":"stage"}`

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
