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
  "extractedDetails": { "key": "value pairs" },
  "suggestedActions": ["action 1", "action 2"],
  "draftResponse": "Professional draft response (DRAFT — human must approve)",
  "suggestedTicket": { "title": "...", "description": "...", "category": "...", "urgency": "...", "vendorType": "..." } or null,
  "complianceNotes": "notes or null",
  "requiresEscalation": true or false
}`

export async function runGeminiTriage(input: TriageInput, apiKey: string): Promise<TriageOutput> {
  const contextStr = input.context
    ? `Context: Property: ${input.context.propertyName || 'Unknown'}, Unit: ${input.context.unitNumber || 'Unknown'}, Tenant: ${input.context.tenantName || 'Unknown'}, Lease Status: ${input.context.leaseStatus || 'Unknown'}, Lease End: ${input.context.leaseEndDate || 'Unknown'}\n\n`
    : ''

  const fullPrompt = `${SYSTEM_PROMPT}\n\nSender type: ${input.senderType}\nChannel: ${input.channel}\n${contextStr}Incoming message:\n"${input.message}"\n\nRespond with JSON only.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Empty response from Gemini')

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse JSON from Gemini response')

  const parsed = JSON.parse(jsonMatch[0])
  return { ...parsed, provider: 'gemini', mode: 'real' }
}
