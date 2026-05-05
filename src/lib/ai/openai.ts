import type { TriageInput, TriageOutput } from '@/types'

const SYSTEM_PROMPT = `You are Property Copilot, an AI operations assistant for UAE residential real-estate management.

Your job is to triage incoming messages from tenants, landlords, vendors, and property managers.

CRITICAL RULES:
- Never claim to send messages automatically
- Never provide legal, tax, financial, or regulatory advice
- For legal/compliance questions, recommend escalation to a qualified professional
- Always recommend human review before any action
- For emergencies (fire, flood, gas leak, structural damage), mark urgency as Emergency and requiresEscalation as true
- For buyer/seller inquiries, classify as BuyerSupportFutureModule or SellerSupportFutureModule
- Use professional, neutral English

Respond ONLY with valid JSON matching this exact schema:
{
  "category": "Maintenance|Rent|Lease|Renewal|Complaint|OwnerUpdate|VendorCoordination|TenantSupport|LandlordSupport|BuyerSupportFutureModule|SellerSupportFutureModule|GeneralInquiry|Emergency|Unknown",
  "urgency": "Low|Medium|High|Emergency",
  "summary": "1-2 sentence summary of the request",
  "extractedDetails": { "key": "value pairs of important extracted information" },
  "suggestedActions": ["action 1", "action 2", "..."],
  "draftResponse": "Professional draft response to send to the sender (this is a DRAFT — human must approve before sending)",
  "suggestedTicket": {
    "title": "Short ticket title",
    "description": "Ticket description",
    "category": "Maintenance category",
    "urgency": "Low|Medium|High|Emergency",
    "vendorType": "Optional vendor type needed"
  } or null if no ticket needed,
  "complianceNotes": "Any compliance, legal, or safety notes — or null",
  "requiresEscalation": true or false
}`

export async function runOpenAITriage(input: TriageInput, apiKey: string): Promise<TriageOutput> {
  const contextStr = input.context
    ? `\nContext: Property: ${input.context.propertyName || 'Unknown'}, Unit: ${input.context.unitNumber || 'Unknown'}, Tenant: ${input.context.tenantName || 'Unknown'}, Lease Status: ${input.context.leaseStatus || 'Unknown'}, Lease End: ${input.context.leaseEndDate || 'Unknown'}`
    : ''

  const userMessage = `Sender type: ${input.senderType}
Channel: ${input.channel}${contextStr}

Incoming message:
"${input.message}"

Triage this message and respond with JSON only.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')

  const parsed = JSON.parse(content)
  return { ...parsed, provider: 'openai', mode: 'real' }
}
