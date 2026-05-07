import { NextRequest, NextResponse } from 'next/server'

interface Msg { role: 'tenant' | 'agent'; content: string }
interface Out { reply: string; card: string | null; nextStage: string }

// Auto-progression stages (with long delays for realism)
const AUTO_STEPS: Record<string, [number, Out]> = {
  // delay (ms), response
  triaged: [3000, {
    reply: '**Checking JVC community rules** for contractor access & insurance requirements…',
    card: 'hoa-rules', nextStage: 'hoa_checked',
  }],
  hoa_checked: [4000, {
    reply: '**Searching 3 verified plumbers** within JVC area, requesting emergency availability…',
    card: 'provider-search', nextStage: 'providers_found',
  }],
  providers_found: [4500, {
    reply: 'All quotes received. **Analysing price, rating, availability…**',
    card: 'quote-comparison', nextStage: 'quote_selected',
  }],
  quote_selected: [2500, {
    reply: '**Best option: Pro Plumbing Solutions (AED 330, 4.8⭐).** Calling them now to confirm booking and exact timing…',
    card: 'phone-call-out', nextStage: 'provider_call_done',
  }],
  provider_call_done: [3500, {
    reply: 'Booking **confirmed by phone** ✅. Now requesting **JVC security access clearance** for technician…',
    card: 'security-approval', nextStage: 'security_cleared',
  }],
  security_cleared: [2500, {
    reply: 'Security **approved** ✅. Technician **Rashid Al-Mansoori (Lic: PM-5847-2024)** is confirmed. The AI is now calling you to go over the details before he arrives.',
    card: 'phone-call-in', nextStage: 'phone_in_pending',
  }],
  tenant_call_done: [1500, {
    reply: '**Technician confirmed and en route.** ETA 5:15 PM. **Live GPS tracking active.**',
    card: 'technician-assigned', nextStage: 'tech_dispatched',
  }],
  tech_dispatched: [5000, {
    reply: '**En route to JVC.** Current location: Al Wasl Road. ETA 5:10 PM.',
    card: 'status-en-route', nextStage: 'en_route',
  }],
  en_route: [4500, {
    reply: '**Arrived at JVC Gate A.** Security verified. Heading to Block A now.',
    card: 'status-arrived', nextStage: 'arrived',
  }],
  arrived: [3500, {
    reply: '**Inside your unit.** Inspecting the kitchen sink…',
    card: 'status-diagnosing', nextStage: 'diagnosing',
  }],
  diagnosing: [5500, {
    reply: '**Diagnosis:** Corroded P-trap. **Replacing with new brass assembly…**',
    card: 'status-in-progress', nextStage: 'repairing',
  }],
  repairing: [4500, {
    reply: '**✅ Repair complete.** New P-trap installed. Pressure tested — **zero leaks**. Documenting work…',
    card: 'completion-photos', nextStage: 'work_done',
  }],
  work_done: [3000, {
    reply: '**Generating itemised invoice…**',
    card: 'invoice-card', nextStage: 'invoiced',
  }],
  invoiced: [3500, {
    reply: 'Invoice ready. **Processing payment from Emirates NBD debit card ••4521…**',
    card: 'payment-processed', nextStage: 'paid',
  }],
  paid: [2500, {
    reply: '**Payment confirmed ✅.** Technician compensated. **Updating maintenance records in system…**',
    card: null, nextStage: 'complete',
  }],
}

function demo(msgs: Msg[], stage: string, trigger?: string): Out {
  const last = msgs.filter(m => m.role === 'tenant').slice(-1)[0]?.content.toLowerCase() ?? ''

  // Handle auto-progression trigger
  if (trigger === 'auto_next' && AUTO_STEPS[stage]) {
    return AUTO_STEPS[stage][1]
  }

  // Handle incoming call answer
  if (trigger === 'call_answered') {
    return {
      reply: 'Great! I\'ll send you **live tracking updates** here as Rashid travels to you. You\'ll also get a call from him 10 minutes before arrival.',
      card: null, nextStage: 'tenant_call_done',
    }
  }

  switch (stage) {
    case 'initial': {
      // Detect issue type
      const isPlumbing = last.match(/water|leak|pipe|drain|tap|toilet|sink/)
      const isAC = last.match(/ac|air con|cool|heat|temperature|hot/)
      const isElectric = last.match(/electric|power|light|socket|trip|switch/)
      const category = isPlumbing ? 'Plumbing' : isAC ? 'HVAC' : isElectric ? 'Electrical' : 'General'
      const urgency = last.match(/flood|emergency|burst|no power|smoke/) ? 'EMERGENCY' : last.match(/leak|drip|break|broken/) ? 'HIGH' : 'MEDIUM'

      if (isPlumbing || isAC || isElectric) {
        return {
          reply: `Issue registered: **${category}** · Urgency: **${urgency}** ✅\n\nI\'m now **automatically processing your repair:**\n1. Checking community rules & contractor approval\n2. Searching 3 vetted providers\n3. Comparing quotes & selecting best\n4. Requesting security access\n5. Dispatching technician\n\n**But first, when would you prefer the technician to visit?**\n\n• **Today 5:15–6:30 PM** (evening)\n• **Tomorrow 10 AM–12 PM** (morning)\n• **Tomorrow 4–6 PM** (afternoon)`,
          card: 'triage-card', nextStage: 'time_slot_selection',
        }
      }
      return {
        reply: 'I can help arrange a repair. **Describe the issue** — e.g., "water leak", "AC not working", "electrical problem".',
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
        reply: '**Which time works best?**\n• Today 5:15–6:30 PM\n• Tomorrow 10 AM–12 PM\n• Tomorrow 4–6 PM',
        card: null, nextStage: 'time_slot_selection',
      }

    case 'triaged':
      // Auto-advance with trigger
      if (trigger === 'auto_next' && AUTO_STEPS['triaged']) {
        return AUTO_STEPS['triaged'][1]
      }
      return {
        reply: '**Processing your repair request…**',
        card: 'triage-card', nextStage: 'triaged',
      }

    // All other auto-stages
    case 'hoa_checked': return AUTO_STEPS['hoa_checked'][1]
    case 'providers_found': return AUTO_STEPS['providers_found'][1]
    case 'quote_selected': return AUTO_STEPS['quote_selected'][1]
    case 'security_cleared': return AUTO_STEPS['security_cleared'][1]
    case 'tech_dispatched': return AUTO_STEPS['tech_dispatched'][1]
    case 'en_route': return AUTO_STEPS['en_route'][1]
    case 'arrived': return AUTO_STEPS['arrived'][1]
    case 'diagnosing': return AUTO_STEPS['diagnosing'][1]
    case 'repairing': return AUTO_STEPS['repairing'][1]
    case 'work_done': return AUTO_STEPS['work_done'][1]
    case 'invoiced': return AUTO_STEPS['invoiced'][1]
    case 'paid': {
      return {
        reply: '**Almost done!** How would you rate this service?\n\n• 5⭐ Excellent\n• 4⭐ Good\n• 3⭐ Average\n• 2⭐ Below expectations',
        card: 'feedback-card', nextStage: 'feedback_requested',
      }
    }

    case 'feedback_requested':
      if (last.match(/5|excellent|great|perfect|amazing|best/)) {
        return {
          reply: 'Thank you for the 5-star feedback! 🙏\n\n**Your maintenance is fully complete.** All records updated in the system. You\'re all set!',
          card: 'final-summary', nextStage: 'complete',
        }
      }
      if (last.match(/[234]/)) {
        return {
          reply: 'Thank you for your feedback. We appreciate it and will work to improve.\n\n**Your maintenance is complete.** All records updated.',
          card: 'final-summary', nextStage: 'complete',
        }
      }
      return {
        reply: 'Please rate the service: 5⭐, 4⭐, 3⭐, or 2⭐',
        card: null, nextStage: 'feedback_requested',
      }

    case 'complete':
      return {
        reply: 'Is there anything else I can help you with?',
        card: null, nextStage: 'complete',
      }

    default:
      return {
        reply: 'How can I assist you?',
        card: null, nextStage: stage,
      }
  }
}

async function callAI(msgs: Msg[], stage: string): Promise<Out> {
  const system = `You are an autonomous property management AI handling EMERGENCY MAINTENANCE.
Tenant: Emily Carter | Unit A-301, JVC Garden Apartments
Issue: Water leak under kitchen sink (plumbing)

WORKFLOW (AUTO with tenant input gates):
initial → time_slot_selection → [AUTO PROCEEDS WITH LONG DELAYS] →
triaged → hoa_checked → providers_found → quote_selected → security_cleared →
tech_dispatched → en_route → arrived → diagnosing → repairing → work_done →
invoiced → paid → feedback_requested → complete

TENANT INPUT POINTS (do not skip):
1. Initial issue description
2. Confirm time slot (3 options)
3. Rate the service (feedback)

All other stages auto-process with realistic delays.

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
