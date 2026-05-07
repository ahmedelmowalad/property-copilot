import { NextRequest, NextResponse } from 'next/server'

interface Msg { role: 'tenant' | 'agent'; content: string }
interface Out { reply: string; card: string | null; nextStage: string }

// ─── Demo mode state machine ────────────────────────────────────────────────

function demo(msgs: Msg[], stage: string, trigger?: string): Out {
  const last = msgs.filter(m => m.role === 'tenant').slice(-1)[0]?.content.toLowerCase() ?? ''

  // Card-button triggers bypass normal stage flow
  if (trigger === 'tenant_signed') return {
    reply: 'Tenant signature verified via UAE Pass ✅. Forwarding to **Mr. Ahmed Al-Mansouri** (Marina Heights Holdings) for counter-signature.',
    card: 'landlord-approval', nextStage: 'landlord_pending',
  }
  if (trigger === 'landlord_approved') return {
    reply: 'Counter-signature confirmed ✅. Submitting signed contract to **Dubai Land Department** now…',
    card: 'dld-submission', nextStage: 'dld_submitted',
  }
  if (trigger === 'dld_submitted') return {
    reply: 'DLD accepted — Ref: **DLD-2025-MH-1204-78432** ✅\n\nEjari is processing. To finalise I need your **4 post-dated cheques** payable to *Marina Heights Holdings LLC*:\n\n• Cheque 1 — 01 Jan 2025 — AED 24,250\n• Cheque 2 — 01 Apr 2025 — AED 24,250\n• Cheque 3 — 01 Jul 2025 — AED 24,250\n• Cheque 4 — 01 Oct 2025 — AED 24,250\n\nPlease upload photos of each cheque.',
    card: 'cheque-photos', nextStage: 'cheques_requested',
  }
  if (trigger === 'cheques_uploaded') return {
    reply: 'All 4 cheque photos validated ✅. Please drop the originals at:\n📍 **Marina Heights Holdings — Level 1, Marina Walk Tower A**\n\nPM Layla Khan has been notified. I\'ll wait for her receipt confirmation.',
    card: 'pm-confirmation', nextStage: 'pm_pending',
  }
  if (trigger === 'pm_confirmed') return {
    reply: 'Physical cheques confirmed by PM ✅. Completing Ejari registration now…',
    card: 'ejari-complete', nextStage: 'ejari_done',
  }
  if (trigger === 'ejari_done') return {
    reply: 'Ejari #2748293-2025 issued ✅\n\nFinal step — please upload your updated **Emirates ID** (front & back) and **passport bio-page** for our records.',
    card: 'document-upload', nextStage: 'docs_requested',
  }
  if (trigger === 'docs_uploaded') return {
    reply: 'All documents securely stored 🔒. Your lease renewal is **fully complete**. Here\'s your summary:',
    card: 'completion', nextStage: 'complete',
  }

  switch (stage) {
    case 'initial':
      return {
        reply: 'Hi Sarah! I can see your lease for **Unit 1204, Marina Heights** expires **31 Dec 2024**.\n\nBefore I can confirm any terms, I need to check the **RERA Rental Index** published by Dubai Land Department to verify what rent changes (if any) are legally permitted.\n\nPulling the latest market data now…',
        card: 'dld-card', nextStage: 'dld_checked',
      }

    case 'dld_checked': {
      if (last.match(/same|95,?000|no (change|increase)|keep|current price/)) {
        return {
          reply: 'I understand you\'d prefer to keep AED 95,000. However, the DLD data shows the market for a 2BR in Dubai Marina is **AED 115,000–125,000** — roughly **21% above** your current rent.\n\nPer **Decree No. 43 of 2013**, when rent is 21–30% below market, the landlord is legally permitted to increase by up to **15%**. Your landlord is requesting only **5% → AED 99,750**, which is actually the minimum justified ask.\n\nWould you accept **AED 99,750**, or would you like to counter-propose a different amount?',
          card: null, nextStage: 'negotiating',
        }
      }
      return {
        reply: 'Here\'s what the DLD RERA index shows for Q4 2024:\n\n• **Market range:** AED 115,000–125,000 (median AED 120,000)\n• **Your current rent:** AED 95,000 (21% below market)\n• **Max permitted increase:** 15% per Decree 43/2013\n• **Landlord\'s proposal:** 5% increase → AED 99,750\n\nWould you like to accept, counter-propose, or do you have questions about the data?',
        card: null, nextStage: 'negotiating',
      }
    }

    case 'negotiating': {
      const num = last.match(/\b(9[6-9],?\d{3}|10[0-9],?\d{3})\b/)?.[0]
      const price = num ? parseInt(num.replace(/,/g, '')) : 0
      if (price >= 96000 && price <= 109250) {
        const pct = ((price - 95000) / 95000 * 100).toFixed(1)
        return {
          reply: `**AED ${price.toLocaleString()} (+${pct}%)** is within the RERA legal maximum ✅. The landlord has accepted your counter-offer.\n\n**Confirmed renewal terms:**\n• Annual rent: AED ${price.toLocaleString()}\n• Payment: 4 quarterly post-dated cheques\n• Term: 1 Jan 2025 – 31 Dec 2025\n• Security deposit: AED 9,500 (unchanged)\n\nShall I generate the DLD Form F contract?`,
          card: null, nextStage: 'terms_agreed',
        }
      }
      if (last.match(/accept|agree|yes|ok|fine|99,?750|proceed|confirm/)) {
        return {
          reply: '**AED 99,750 accepted** ✅\n\n**Confirmed renewal terms:**\n• Annual rent: AED 99,750 (+5%)\n• Payment: 4 quarterly post-dated cheques\n• Term: 1 Jan 2025 – 31 Dec 2025\n\nShall I generate the contract?',
          card: null, nextStage: 'terms_agreed',
        }
      }
      if (last.match(/\b95,?000\b|same|no increase|no change/)) {
        return {
          reply: 'Staying at AED 95,000 isn\'t feasible given the DLD data — the landlord would be accepting a rent 21% below market with zero increase, which Decree 43/2013 does not require them to do.\n\nCould you consider **AED 97,000** (2.1% increase)? That\'s a very reasonable middle ground I\'m confident the landlord will accept.',
          card: null, nextStage: 'negotiating',
        }
      }
      return {
        reply: 'You can counter-propose any amount between **AED 96,000 and AED 109,250**. The landlord\'s ask is AED 99,750. What would you like to offer?',
        card: null, nextStage: 'negotiating',
      }
    }

    case 'terms_agreed':
      if (last.match(/yes|confirm|go ahead|proceed|generate|ok|sure|please|do it/)) {
        return {
          reply: 'Generating your tenancy contract using the **DLD-approved Unified Contract (Form F)**…',
          card: 'contract-prep', nextStage: 'contract_ready',
        }
      }
      return {
        reply: 'Ready to generate the contract? Just type **confirm** and I\'ll create it using the DLD Form F template with the agreed terms.',
        card: null, nextStage: 'terms_agreed',
      }

    case 'contract_ready':
      return {
        reply: 'Contract ready ✅ — Ref: **TC-MH-1204-2025-0117**\n\nI\'ve pushed it to **UAE Pass** for your digital signature. Please sign using the card below, then confirm here.',
        card: 'uaepass-card', nextStage: 'tenant_signing',
      }

    case 'tenant_signing':
      return {
        reply: 'Please use the **UAE Pass** button in the card above to sign digitally. Once done, let me know and I\'ll proceed with the landlord counter-signature.',
        card: null, nextStage: 'tenant_signing',
      }

    default:
      return {
        reply: 'I\'m here to help with your lease renewal. What would you like to know?',
        card: null, nextStage: stage,
      }
  }
}

// ─── Real AI call ────────────────────────────────────────────────────────────

async function callAI(msgs: Msg[], stage: string): Promise<Out> {
  const system = `You are a UAE property management AI agent handling a LEASE RENEWAL conversation.
Tenant: Sarah Johnson | Unit 1204, Marina Heights Residence, Dubai Marina
Current rent: AED 95,000/year (2BR sea view) | Lease expires: 31 Dec 2024

DLD RERA Rental Index Q4 2024: 2BR Dubai Marina = AED 115,000–125,000 (21% above current)
Decree No. 43 of 2013: 21–30% below market → landlord may increase up to 15%
Landlord's proposal: 5% increase = AED 99,750

Current stage: ${stage}

WORKFLOW STAGES (advance in order based on conversation):
initial → dld_checked → negotiating → terms_agreed → contract_ready → tenant_signing → landlord_pending → dld_submitted → cheques_requested → pm_pending → ejari_done → docs_requested → complete

CARDS you can trigger by including their name in "card" field:
dld-card (show after initial message), contract-prep (when generating contract),
uaepass-card (after contract ready), landlord-approval (after tenant signs),
dld-submission (after landlord approves), cheque-photos (request cheques),
pm-confirmation (await PM), ejari-complete (Ejari done), document-upload (request docs),
completion (final summary)

Be professional, cite actual UAE law, be empathetic but firm on legal limits.
Return ONLY valid JSON (no markdown fences): {"reply":"...","card":"name or null","nextStage":"stage"}`

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
