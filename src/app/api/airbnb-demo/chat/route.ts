import { NextRequest, NextResponse } from 'next/server'

interface Msg { role: 'host' | 'agent'; content: string }
interface Out { reply: string; card: string | null; nextStage: string }

const AUTO_STEPS: Record<string, Out> = {
  booking_received: {
    reply: '**Guest profile verified** ✅ James Wilson · London, UK · 4.9★ · 47 reviews · Verified ID & payment. Risk: **Low** — no prior disputes or damage claims. Notifying staff…',
    card: 'guest-profile',
    nextStage: 'guest_screened',
  },
  guest_screened: {
    reply: '**Staff notified simultaneously** 📲 Maria Gonzalez (cleaner) and Saif Al-Mansoori (ops manager) have received booking details, assigned tasks, and access codes. Generating smart lock code…',
    card: 'team-notified',
    nextStage: 'team_notified',
  },
  team_notified: {
    reply: '**Smart lock code generated** 🔐 Unique 6-digit PIN created for James\'s stay window: Nov 25 at 2:00 PM → Nov 28 at 12:00 PM. Auto-expires at checkout. Sending welcome guide…',
    card: 'smart-lock',
    nextStage: 'key_generated',
  },
  key_generated: {
    reply: '**Welcome guide delivered** 📋 Personalized PDF + WhatsApp message sent to James. Includes WiFi, parking, house rules, Marina dining recommendations. Confirming cleaning slot…',
    card: 'welcome-guide',
    nextStage: 'guide_sent',
  },
  guide_sent: {
    reply: '**Maria confirmed** ✅ Pre-arrival clean slot accepted: Nov 25, 10:00–11:30 AM. Full checklist assigned (linens, towels, amenities, kitchen, bathrooms). Running stock check…',
    card: 'cleaner-confirmed',
    nextStage: 'cleaner_confirmed',
  },
  cleaner_confirmed: {
    reply: '**Arrival prep complete** ✅ All items at 100%. Concierge welcome message queued for 2:00 PM. Sending check-in instructions to James now…',
    card: 'arrival-prep',
    nextStage: 'arrival_prepped',
  },
  arrival_prepped: {
    reply: '**Check-in instructions sent** 📱 Lock code, building access, parking bay, WiFi — all delivered via Airbnb message and WhatsApp. James acknowledged receipt.',
    card: 'checkin-message',
    nextStage: 'checkin_msg_sent',
  },
  checkin_msg_sent: {
    reply: '**Guest checked in** 🏠 James confirmed arrival at 2:47 PM. Welcome message delivered. **12 automations now running:** guest messaging, lock management, pricing watcher, review monitor…',
    card: 'active-stay',
    nextStage: 'guest_checked_in',
  },
  guest_checked_in: {
    reply: '**Guest message auto-handled** 💬 James asked: *"Hey, what\'s the WiFi password?"* — AI replied within 8 seconds. No host action needed.',
    card: 'guest-message',
    nextStage: 'message_handled',
  },
  message_handled: {
    reply: '**⚠ Maintenance issue flagged** — James reported the bedroom AC is not cooling. AI triaged: HVAC / Medium urgency. Dispatching Ali Hassan (certified HVAC tech)…',
    card: 'maintenance-raised',
    nextStage: 'maintenance_raised',
  },
  maintenance_raised: {
    reply: '**✅ AC fixed** — Ali replaced faulty capacitor. Unit back to 22°C. James confirmed it\'s working. No extra charge to guest. **📈 Demand spike detected for open dates:**',
    card: 'maintenance-done',
    nextStage: 'maintenance_done',
  },
  maintenance_done: {
    reply: '**Dubai Marathon weekend (Dec 6–8):** demand in Marina is up 32% above baseline. AI recommends AED 720/night for your 3 open dates (up from AED 650). **Your approval required:**',
    card: null,
    nextStage: 'pricing_review',
  },
  pricing_updated: {
    reply: 'Preparing checkout logistics for Nov 28. Sending personalized checkout reminder to James now…',
    card: null,
    nextStage: 'checkout_reminder',
  },
  checkout_reminder: {
    reply: '**Checkout reminder sent** ⏰ James received instructions at 9:00 AM: 12:00 PM deadline, bag storage option, lock code auto-expiry on checkout.',
    card: 'checkout-reminder',
    nextStage: 'guest_checked_out',
  },
  guest_checked_out: {
    reply: '**James checked out** ✅ Departure confirmed at 11:42 AM (18 minutes early). Lock code expired automatically. Dispatching Maria for turnover clean…',
    card: null,
    nextStage: 'cleaner_dispatched',
  },
  cleaner_dispatched: {
    reply: '**Maria on-site** 🧹 Arrived at 12:05 PM. Turnover clean in progress — estimated completion 1:30 PM. Awaiting inspection report…',
    card: null,
    nextStage: 'inspection_done',
  },
  inspection_done: {
    reply: '**Inspection complete** ✅ Maria submitted photo checklist — unit in excellent condition, hotel-standard. No damage detected. Releasing security deposit…',
    card: 'inspection-report',
    nextStage: 'deposit_cleared',
  },
  deposit_cleared: {
    reply: '**Security deposit cleared** 💳 AED 0 damage — full deposit released automatically. Payout of **AED 2,041.50** initiated to your Emirates NBD account. Review monitoring active…',
    card: 'deposit-cleared',
    nextStage: 'review_received',
  },
  review_received: {
    reply: '**⭐⭐⭐⭐⭐ 5-star review received from James Wilson!** AI has drafted a personalized host response. **Your approval needed before it posts publicly:**',
    card: 'guest-review',
    nextStage: 'review_response',
  },
}

function demo(msgs: Msg[], stage: string, trigger?: string): Out {
  if (trigger === 'auto_next') {
    return AUTO_STEPS[stage] ?? { reply: 'Processing next step…', card: null, nextStage: stage }
  }
  if (trigger === 'pricing_approved') {
    return {
      reply: '✅ **Rate updated** — AED 720/night applied to Dec 6–8 (3 open dates). Estimated additional revenue: **+AED 210** if all 3 book. Monitoring competitor rates. Moving to checkout phase…',
      card: 'pricing-confirmed',
      nextStage: 'pricing_updated',
    }
  }
  if (trigger === 'pricing_rejected') {
    return {
      reply: 'Understood — keeping AED 650/night for open dates. Marathon demand spike noted for future reference. Moving to checkout phase…',
      card: 'pricing-confirmed',
      nextStage: 'pricing_updated',
    }
  }
  if (trigger === 'review_approved') {
    return {
      reply: '✅ **Review response posted publicly.** Your reply is now live on the Airbnb listing. This improves your search ranking and signals to future guests that you\'re a responsive host. Here\'s your booking summary:',
      card: 'revenue-summary',
      nextStage: 'complete',
    }
  }

  switch (stage) {
    case 'initial':
    default: {
      const lower = (msgs.filter(m => m.role === 'host').slice(-1)[0]?.content ?? '').toLowerCase()
      if (lower.match(/booking|new|start|demo|simulation|show|airbnb|guest|check/) || msgs.length <= 1) {
        return {
          reply: '**Airbnb webhook received** 🔔 `booking.created`\n\nGuest: **James Wilson** · London, UK · Nov 25–28 · 3 nights · AED 650/night\n\nStarting automated pre-arrival workflow…',
          card: 'booking-webhook',
          nextStage: 'booking_received',
        }
      }
      return {
        reply: 'Welcome to **Airbnb Ops AI** — the Hive Brain for your Marina Heights STR.\n\nTry: *"New booking simulation"* or *"Show me a booking"* to see the full autonomous lifecycle.',
        card: null,
        nextStage: 'initial',
      }
    }
    case 'complete':
      return { reply: 'The full Airbnb lifecycle was handled autonomously — **22 steps, 2 host decisions, zero operations work.** Ready for the next booking?', card: null, nextStage: 'complete' }
  }
}

async function callAI(msgs: Msg[], stage: string): Promise<Out> {
  const system = `You are Airbnb Ops AI — autonomous "hive brain" for a Dubai short-term rental.
Host: Khalid Al-Hamdan · Unit 1205, Marina Heights, 1BR · AED 650/night
Staff: Maria (cleaner), Saif (ops manager), Ali (HVAC tech)
Current stage: ${stage}
Return JSON only: {"reply":"...","card":"cardType or null","nextStage":"stage"}`

  const ak = process.env.ANTHROPIC_API_KEY
  if (ak) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ak, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 400, system,
        messages: msgs.map(m => ({ role: m.role === 'host' ? 'user' : 'assistant', content: m.content })),
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
        messages: [{ role: 'system', content: system }, ...msgs.map(m => ({ role: m.role === 'host' ? 'user' : 'assistant', content: m.content }))],
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
