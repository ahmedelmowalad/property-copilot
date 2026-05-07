import { NextRequest, NextResponse } from 'next/server'

interface Msg { role: 'tenant' | 'agent'; content: string }
interface Out { reply: string; card: string | null; nextStage: string }

function demo(msgs: Msg[], stage: string, trigger?: string): Out {
  const last = msgs.filter(m => m.role === 'tenant').slice(-1)[0]?.content.toLowerCase() ?? ''

  // Card-button triggers
  if (trigger === 'tenant_signed') return {
    reply: 'Signature verified via UAE Pass ✅\n\n**Processing with landlord & DLD…**',
    card: 'landlord-approval', nextStage: 'landlord_pending',
  }
  if (trigger === 'landlord_approved') return {
    reply: 'Landlord counter-signature confirmed ✅\n\nSubmitting to **Dubai Land Department** and initiating **Ejari registration**…',
    card: 'dld-submission', nextStage: 'dld_submitted',
  }
  if (trigger === 'dld_submitted') return {
    reply: 'DLD submission confirmed — Ref: **DLD-2025-MH-1204-78432** ✅\n\nEjari is being processed. Now, I need your **payment method** for the security deposit and first month rent.\n\n**Which would you prefer?**\n• Post-dated cheques (4 × AED 24,250)\n• Bank transfer (quarterly automatic payments)',
    card: null, nextStage: 'payment_method_selection',
  }
  if (trigger === 'payment_confirmed') return {
    reply: '**Processing final documents and uploading to Ejari…**',
    card: 'ejari-complete', nextStage: 'docs_requested',
  }

  switch (stage) {
    case 'initial':
      if (last.match(/renew|renewal|lease|yes|ok|hi|proceed/)) {
        return {
          reply: 'Great! Let me check your lease details and the market rates.\n\nI\'m now querying the **Dubai Land Department** RERA Rental Index to verify what changes are legally permitted under UAE law…',
          card: 'dld-card', nextStage: 'dld_checked',
        }
      }
      return {
        reply: 'I can help you renew your lease for **Unit 1204, Marina Heights**. Your current lease expires **31 Dec 2024**.\n\nWould you like to proceed with the renewal process?',
        card: null, nextStage: 'initial',
      }

    case 'dld_checked': {
      if (last.match(/same|95,?000|no (change|increase|raise)|keep/)) {
        return {
          reply: 'I understand. However, the DLD RERA data shows **2BR Dubai Marina** is at **AED 115k–125k** — you\'re 21% below market.\n\nPer **Decree 43/2013**, your landlord can legally increase up to **15%**. They\'re proposing only **5% → AED 99,750**, which is the minimum justified ask.\n\n**Would you accept AED 99,750, or counter-propose a different amount?**',
          card: null, nextStage: 'negotiating',
        }
      }
      if (last.match(/accept|agree|yes|ok|fine|99,?750/)) {
        return {
          reply: 'Perfect! **AED 99,750 confirmed** ✅\n\n**Confirmed renewal terms:**\n• Annual rent: AED 99,750 (+5%)\n• Payment: 4 quarterly cheques\n• Term: 1 Jan 2025 – 31 Dec 2025\n\nI\'m now generating your **DLD Form F tenancy contract**…',
          card: 'contract-prep', nextStage: 'contract_ready',
        }
      }
      return {
        reply: 'The DLD RERA index shows:\n• Market: **AED 115,000–125,000**\n• Your current: AED 95,000 (21% below)\n• Legally permitted increase: up to **15%**\n• Landlord proposal: **5% = AED 99,750**\n\n**Do you accept, or would you like to counter-propose?**',
        card: null, nextStage: 'dld_checked',
      }
    }

    case 'negotiating': {
      const num = last.match(/\b(9[6-9],?\d{3}|10[0-9],?\d{3})\b/)?.[0]
      const price = num ? parseInt(num.replace(/,/g, '')) : 0
      if (price >= 96000 && price <= 109250) {
        const pct = ((price - 95000) / 95000 * 100).toFixed(1)
        return {
          reply: `**AED ${price.toLocaleString()} (+${pct}%)** is within legal limits ✅. Landlord has accepted.\n\n**Terms confirmed:**\n• Rent: AED ${price.toLocaleString()}\n• Payment: 4 quarterly cheques\n• Term: 1 Jan 2025 – 31 Dec 2025\n\nGenerating your contract now…`,
          card: 'contract-prep', nextStage: 'contract_ready',
        }
      }
      if (last.match(/accept|agree|yes|ok|fine|proceed/)) {
        return {
          reply: '**AED 99,750 accepted** ✅\n\nGenerating your **DLD Form F contract**…',
          card: 'contract-prep', nextStage: 'contract_ready',
        }
      }
      return {
        reply: 'You can counter with any amount between **AED 96,000 and AED 109,250**. What would you like to propose?',
        card: null, nextStage: 'negotiating',
      }
    }

    case 'contract_ready':
      return {
        reply: 'Your contract is ready — Ref: **TC-MH-1204-2025-0117** ✅\n\n**Now I need to confirm your availability for signing.**\n\nWhen would you prefer to sign digitally via UAE Pass?\n\n• **Today 6–8 PM** (evening)\n• **Tomorrow 12–2 PM** (lunch)\n• **Tomorrow 5–7 PM** (evening)',
        card: 'contract-ready', nextStage: 'timing_confirmation',
      }

    case 'timing_confirmation':
      if (last.match(/today|6.*pm|evening|tonight|asap/)) {
        return {
          reply: 'Great! **Today 6–8 PM** noted ✅\n\nI\'ve pushed the contract to **UAE Pass**. Please sign digitally when you\'re ready.',
          card: 'uaepass-card', nextStage: 'tenant_signing',
        }
      }
      if (last.match(/tomorrow|12.*pm|lunch|afternoon|12.*2|5.*7/)) {
        return {
          reply: 'Perfect! Time slot confirmed ✅\n\nI\'ve pushed the contract to **UAE Pass**. Please sign digitally at your preferred time.',
          card: 'uaepass-card', nextStage: 'tenant_signing',
        }
      }
      return {
        reply: 'Which time works best for you?\n• Today 6–8 PM\n• Tomorrow 12–2 PM\n• Tomorrow 5–7 PM',
        card: null, nextStage: 'timing_confirmation',
      }

    case 'tenant_signing':
      return {
        reply: 'Please use the **UAE Pass button** in the card above to sign digitally. Once done, let me know and I\'ll proceed with landlord counter-signature and DLD submission.',
        card: null, nextStage: 'tenant_signing',
      }

    case 'landlord_pending':
      return {
        reply: 'Awaiting landlord counter-signature…\n\n*[Processing with landlord representative A. Al-Mansouri via secure channel]*',
        card: null, nextStage: 'landlord_pending',
      }

    case 'dld_submitted':
      return {
        reply: 'DLD submission confirmed — Ref: **DLD-2025-MH-1204-78432** ✅\n\nEjari registration is processing. Now, **how would you like to pay?**\n\n• **Post-dated cheques** (4 × AED 24,250 quarterly)\n• **Bank transfer** (quarterly automatic debit)',
        card: null, nextStage: 'payment_method_selection',
      }

    case 'payment_method_selection':
      if (last.match(/cheque|post.*date|paper|check/)) {
        return {
          reply: 'Post-dated cheques confirmed ✅\n\n**Please upload 4 cheques** made payable to **Marina Heights Holdings LLC**:\n• Cheque 1 — 01 Jan 2025 — AED 24,250\n• Cheque 2 — 01 Apr 2025 — AED 24,250\n• Cheque 3 — 01 Jul 2025 — AED 24,250\n• Cheque 4 — 01 Oct 2025 — AED 24,250',
          card: 'cheque-photos', nextStage: 'cheques_requested',
        }
      }
      if (last.match(/transfer|bank|automatic|debit/)) {
        return {
          reply: 'Bank transfer confirmed ✅\n\n**Please provide your bank details** for quarterly automatic payments (AED 24,250 each).\n\nWhich bank account should we use?',
          card: null, nextStage: 'cheques_requested',
        }
      }
      return {
        reply: '**Which payment method do you prefer?**\n• Post-dated cheques (4 × AED 24,250)\n• Bank transfer (quarterly automatic)',
        card: null, nextStage: 'payment_method_selection',
      }

    case 'cheques_requested':
      if (last.match(/upload|photo|done|send|attached/)) {
        return {
          reply: 'Cheque photos received ✅\n\nPlease drop the **originals at Marina Heights office** (Level 1, Marina Walk Tower A). Once the PM confirms receipt, I\'ll complete Ejari and we\'ll be done.',
          card: 'pm-confirmation', nextStage: 'pm_pending',
        }
      }
      return {
        reply: 'When you\'re ready, upload the cheque photos or provide your bank details.',
        card: null, nextStage: 'cheques_requested',
      }

    case 'pm_pending':
      return {
        reply: '**Awaiting PM confirmation of physical cheque receipt…**\n\n*[Notified PM Layla Khan. Typical processing: 1–2 business days]*',
        card: null, nextStage: 'pm_pending',
      }

    case 'docs_requested':
      return {
        reply: 'Almost done! **Please upload your updated documents**:\n\n• Emirates ID (front & back)\n• Passport bio-page\n\nThis keeps your tenant profile current for Ejari records.',
        card: 'document-upload', nextStage: 'documents_upload',
      }

    case 'documents_upload':
      if (last.match(/upload|attach|done|send|ready/)) {
        return {
          reply: 'Documents received ✅\n\nSecurely storing in your profile and completing Ejari registration…',
          card: 'completion', nextStage: 'complete',
        }
      }
      return {
        reply: 'Please upload your Emirates ID and passport when ready.',
        card: null, nextStage: 'documents_upload',
      }

    case 'complete':
      return {
        reply: '**Your lease renewal is fully complete!** 🎉\n\nAll steps have been processed:\n• Contract signed & counter-signed\n• DLD submission confirmed\n• Ejari registration complete\n• Payment method set\n• Records updated\n\nYour new lease is now active as of **1 Jan 2025** at **AED 99,750/year**.',
        card: null, nextStage: 'complete',
      }

    default:
      return {
        reply: 'How can I help with your lease renewal?',
        card: null, nextStage: stage,
      }
  }
}

async function callAI(msgs: Msg[], stage: string): Promise<Out> {
  const system = `You are a UAE property management AI handling a LEASE RENEWAL.
Tenant: Sarah Johnson | Unit 1204, Marina Heights, Dubai Marina
Current: AED 95,000/year | Expires: 31 Dec 2024

DLD RERA Q4 2024: 2BR Dubai Marina = AED 115,000–125,000 (21% above current)
Decree 43/2013: 21–30% below market → max 15% increase permitted
Landlord proposal: 5% = AED 99,750

STAGES (await tenant input at each step):
initial → dld_checked → negotiating → contract_ready → timing_confirmation →
tenant_signing → landlord_pending → dld_submitted → payment_method_selection →
cheques_requested → pm_pending → docs_requested → documents_upload → complete

TENANT INPUTS REQUIRED (no auto-skip):
1. Initial renewal intent
2. Accept rent amount (negotiable)
3. Confirm signing time slot
4. Choose payment method (cheque or bank)
5. Upload documents (ID + passport)

Respond naturally. Return JSON: {"reply":"...","card":"name or null","nextStage":"stage"}`

  const ak = process.env.ANTHROPIC_API_KEY
  if (ak) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ak, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 600, system,
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
        model: 'gpt-4o-mini', max_tokens: 600,
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
