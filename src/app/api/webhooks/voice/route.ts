import { NextRequest, NextResponse } from 'next/server'
import { buildGreetingTwiml, buildVoicemailTwiml, mapTwilioStatus } from '@/lib/channels/voice'
import { createCallLog, getStore } from '@/lib/db/store'

// POST: Twilio calls this when an inbound call arrives
// Returns TwiML instructions
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const callSid = formData.get('CallSid') as string || ''
  const from = formData.get('From') as string || ''
  const to = formData.get('To') as string || ''
  const callStatus = formData.get('CallStatus') as string || ''
  const callerName = formData.get('CallerName') as string || null
  const direction = formData.get('Direction') as string || 'inbound'

  // Create initial call log entry
  if (callSid) {
    const store = getStore()
    const existingCall = store.callLogs.find(c => c.twilioCallSid === callSid)

    if (!existingCall) {
      // Try to match caller to a known tenant by phone
      const normalizedFrom = from.replace(/\D/g, '')
      const matchedTenant = store.tenants.find(t => t.phone && t.phone.replace(/\D/g, '') === normalizedFrom)
      const matchedContact = store.contacts.find(c => c.phone && c.phone.replace(/\D/g, '') === normalizedFrom)

      createCallLog({
        status: mapTwilioStatus(callStatus) as Parameters<typeof createCallLog>[0]['status'],
        direction: direction.includes('inbound') ? 'inbound' : 'outbound',
        fromNumber: from,
        toNumber: to,
        callerName: callerName || (matchedTenant ? `${matchedTenant.firstName} ${matchedTenant.lastName}` : null),
        twilioCallSid: callSid,
        startedAt: new Date().toISOString(),
        relatedTenantId: matchedTenant?.id || null,
        relatedContactId: matchedContact?.id || null,
      })
    }
  }

  // Return TwiML to greet and record the call
  const twiml = buildGreetingTwiml('HomeFlow')

  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
