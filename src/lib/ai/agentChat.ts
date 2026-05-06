// Conversational tenant-facing agent
// Handles multi-turn conversations about maintenance and lease renewal

import { getActiveProvider } from './index'

export interface ChatMessage {
  role: 'tenant' | 'agent'
  content: string
}

export interface AgentAction {
  type: 'create_ticket' | 'flag_renewal' | 'confirm_renewal'
  label: string
  data: Record<string, string>
}

export interface AgentChatOutput {
  reply: string
  action: AgentAction | null
}

export interface TenantContext {
  tenantName: string
  unitNumber: string
  propertyName: string
  leaseStatus: string
  leaseEndDate: string
  rentAmount: number
  currency: string
}

// ─── Demo Mode ─────────────────────────────────────────────────────────────

function lastTenantMessage(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find(m => m.role === 'tenant')
  return (last?.content ?? '').toLowerCase()
}

function hasKeyword(text: string, words: string[]): boolean {
  return words.some(w => text.includes(w))
}

function getDemoResponse(messages: ChatMessage[], ctx: TenantContext): AgentChatOutput {
  const msg = lastTenantMessage(messages)
  const turnCount = messages.filter(m => m.role === 'tenant').length
  const prevAgent = messages.filter(m => m.role === 'agent').map(m => m.content.toLowerCase())

  const isMaintenance = hasKeyword(msg, ['ac', 'air', 'cooling', 'heat', 'leak', 'water', 'pipe', 'plumb', 'door', 'lock', 'window', 'electric', 'power', 'light', 'broken', 'fix', 'repair', 'maintenance', 'issue', 'problem', 'not working', "doesn't work", 'stopped', 'broken'])
  const isRenewal = hasKeyword(msg, ['renew', 'renewal', 'extend', 'extension', 'lease', 'contract', 'stay', 'continue', 'another year', 'new term'])
  const isUrgent = hasKeyword(msg, ['emergency', 'urgent', 'asap', 'immediately', 'now', 'today', 'burning', 'flood', 'fire', 'gas'])

  // If previous agent message already proposed an action and tenant is confirming
  const agentProposedTicket = prevAgent.some(m => m.includes('shall i create') || m.includes('create a maintenance ticket') || m.includes('log this'))
  const agentProposedRenewal = prevAgent.some(m => m.includes('renewal request') || m.includes('shall i flag') || m.includes('same terms'))
  const tenantConfirming = hasKeyword(msg, ['yes', 'please', 'sure', 'ok', 'okay', 'go ahead', 'do it', 'confirm', 'correct', 'right', 'proceed'])

  if (agentProposedTicket && tenantConfirming) {
    const urgency = isUrgent ? 'Emergency' : (hasKeyword(msg + messages.map(m => m.content).join(' '), ['hot', 'flood', 'urgent', 'asap']) ? 'High' : 'Medium')
    const topicMsg = messages.find(m => m.role === 'tenant')?.content ?? ''
    const title = `Maintenance Request — Unit ${ctx.unitNumber}`
    const description = topicMsg

    let category = 'General'
    const allText = messages.map(m => m.content).join(' ').toLowerCase()
    if (hasKeyword(allText, ['ac', 'air', 'cooling', 'heat', 'hvac'])) category = 'HVAC'
    else if (hasKeyword(allText, ['leak', 'water', 'pipe', 'plumb', 'heater'])) category = 'Plumbing'
    else if (hasKeyword(allText, ['electric', 'power', 'light'])) category = 'Electrical'
    else if (hasKeyword(allText, ['door', 'lock', 'access', 'key'])) category = 'Access Control'
    else if (hasKeyword(allText, ['window', 'roof', 'wall', 'floor'])) category = 'Structural'

    return {
      reply: `Done! I've created a **${urgency.toLowerCase()} priority** maintenance ticket for you:\n\n**Ticket:** ${title}\n**Category:** ${category}\n**Status:** New — our team will follow up shortly.\n\nIs there anything else I can help you with?`,
      action: {
        type: 'create_ticket',
        label: 'View Ticket',
        data: { title, description, category, urgency },
      },
    }
  }

  if (agentProposedRenewal && tenantConfirming) {
    return {
      reply: `Your lease renewal request has been submitted to the property manager for review. Here's a summary:\n\n**Unit:** ${ctx.unitNumber} — ${ctx.propertyName}\n**Renewal terms:** Same as current (AED ${ctx.rentAmount.toLocaleString()}/year)\n**Current end date:** ${ctx.leaseEndDate}\n\nYou'll receive a confirmation from the property manager within 2–3 business days. Is there anything else I can help you with?`,
      action: {
        type: 'flag_renewal',
        label: 'Renewal Submitted',
        data: { requestType: 'same_terms', notes: `Tenant requested renewal via agent chat` },
      },
    }
  }

  // First message — greet
  if (turnCount === 1) {
    if (isMaintenance) {
      const urgencyText = isUrgent ? 'This sounds urgent. ' : ''
      return {
        reply: `I'm sorry to hear about that, ${ctx.tenantName.split(' ')[0]}! ${urgencyText}Can you give me a bit more detail — specifically where in the unit and when did it start? This will help me prioritise the request correctly.`,
        action: null,
      }
    }
    if (isRenewal) {
      return {
        reply: `Of course, ${ctx.tenantName.split(' ')[0]}! Your current lease details:\n\n**Unit:** ${ctx.unitNumber} — ${ctx.propertyName}\n**End date:** ${ctx.leaseEndDate}\n**Rent:** AED ${ctx.rentAmount.toLocaleString()}/${ctx.currency === 'AED' ? 'year' : 'period'}\n**Status:** ${ctx.leaseStatus}\n\nWould you like to renew on the same terms, or do you want to discuss different arrangements?`,
        action: null,
      }
    }
    return {
      reply: `Hi ${ctx.tenantName.split(' ')[0]}! I'm your property assistant. I can help you with:\n\n• **Maintenance issues** — log a repair request\n• **Lease renewal** — check your lease and request renewal\n• **General questions** about your unit or tenancy\n\nWhat can I help you with today?`,
      action: null,
    }
  }

  // Second turn in maintenance flow
  if (isMaintenance && !agentProposedTicket) {
    const urgency = isUrgent ? 'Emergency' : 'Medium'
    return {
      reply: `Got it, thank you for the details. I'll log this as a **${urgency.toLowerCase()} priority** maintenance request.\n\nShall I create a maintenance ticket now and notify the property management team?`,
      action: null,
    }
  }

  // Second turn in renewal flow — tenant said same terms
  if (isRenewal && hasKeyword(msg, ['same', 'current', 'yes', 'please', 'ok', 'sure'])) {
    return {
      reply: `Great choice! I'll submit a renewal request on the same terms:\n\n• **Unit:** ${ctx.unitNumber}\n• **Rent:** AED ${ctx.rentAmount.toLocaleString()}/year\n• **Proposed new end date:** one year from ${ctx.leaseEndDate}\n\nShall I send this renewal request to the property manager for approval?`,
      action: null,
    }
  }

  // Renewal — tenant wants different terms
  if (isRenewal && hasKeyword(msg, ['different', 'change', 'negotiate', 'lower', 'reduce', 'more', 'less', 'new'])) {
    return {
      reply: `Understood. I'll flag your renewal request with a note that you'd like to discuss new terms. The property manager will reach out to negotiate.\n\nShall I submit this renewal inquiry now?`,
      action: null,
    }
  }

  // Fallback
  return {
    reply: `Thank you, ${ctx.tenantName.split(' ')[0]}. I've noted your message. Is there a maintenance issue I can log for you, or would you like to discuss your lease renewal?`,
    action: null,
  }
}

// ─── Real AI Mode ──────────────────────────────────────────────────────────

const AGENT_SYSTEM_PROMPT = `You are a friendly and professional property management assistant for UAE residential properties. You help tenants through a conversational interface.

Your capabilities:
1. Log maintenance requests (AC, plumbing, electrical, structural, access control, etc.)
2. Handle lease renewal requests
3. Answer general tenancy questions

RULES:
- Address the tenant by first name when you know it
- Be empathetic, clear, and concise — avoid overly formal language
- Never make promises about timelines you can't guarantee
- Never provide legal advice
- For emergencies (flooding, fire, gas leak), escalate urgency immediately
- Always confirm with the tenant before creating a ticket or flagging a renewal

When you decide to propose creating a ticket or flagging a renewal, include it in your "action" field.

Respond ONLY with this exact JSON structure:
{
  "reply": "Your conversational message to the tenant (supports **bold** markdown)",
  "action": null
}

OR when proposing an action AFTER the tenant has confirmed:
{
  "reply": "Confirmation message",
  "action": {
    "type": "create_ticket",
    "label": "View Ticket",
    "data": {
      "title": "Short ticket title",
      "description": "Detailed description",
      "category": "HVAC|Plumbing|Electrical|Access Control|Structural|General",
      "urgency": "Low|Medium|High|Emergency"
    }
  }
}

OR for renewal:
{
  "reply": "Confirmation message",
  "action": {
    "type": "flag_renewal",
    "label": "Renewal Submitted",
    "data": {
      "requestType": "same_terms|new_terms",
      "notes": "Brief note"
    }
  }
}`

async function callRealAI(messages: ChatMessage[], ctx: TenantContext, apiKey: string, provider: string): Promise<AgentChatOutput> {
  const contextStr = `Tenant: ${ctx.tenantName} | Unit: ${ctx.unitNumber} | Property: ${ctx.propertyName} | Lease Status: ${ctx.leaseStatus} | Lease End: ${ctx.leaseEndDate} | Rent: AED ${ctx.rentAmount.toLocaleString()}`

  const systemWithContext = `${AGENT_SYSTEM_PROMPT}\n\nCurrent tenant context: ${contextStr}`

  const apiMessages = messages.map(m => ({
    role: m.role === 'tenant' ? 'user' : 'assistant',
    content: m.content,
  }))

  let rawContent = ''

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemWithContext,
        messages: apiMessages,
      }),
    })
    if (!res.ok) throw new Error(`Anthropic error: ${res.status}`)
    const data = await res.json()
    rawContent = data.content?.[0]?.text ?? ''
  } else if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemWithContext }, ...apiMessages],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    })
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`)
    const data = await res.json()
    rawContent = data.choices?.[0]?.message?.content ?? ''
  } else if (provider === 'gemini') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemWithContext }] },
        contents: apiMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
        generationConfig: { responseMimeType: 'application/json' },
      }),
    })
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
    const data = await res.json()
    rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }

  const parsed = JSON.parse(rawContent)
  return { reply: parsed.reply ?? '', action: parsed.action ?? null }
}

// ─── Public entry point ────────────────────────────────────────────────────

export async function runAgentChat(messages: ChatMessage[], ctx: TenantContext): Promise<AgentChatOutput> {
  const { provider, mode } = getActiveProvider()

  if (mode === 'demo') {
    return getDemoResponse(messages, ctx)
  }

  const apiKey =
    provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY! :
    provider === 'openai' ? process.env.OPENAI_API_KEY! :
    process.env.GEMINI_API_KEY!

  try {
    return await callRealAI(messages, ctx, apiKey, provider)
  } catch {
    return getDemoResponse(messages, ctx)
  }
}
