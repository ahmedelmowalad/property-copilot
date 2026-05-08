import { NextRequest, NextResponse } from 'next/server'
import { mapTwilioStatus } from '@/lib/channels/voice'
import { getStore, updateCallLog } from '@/lib/db/store'

// POST: Twilio calls this on call status changes (ringing, completed, no-answer, etc.)
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const callSid = formData.get('CallSid') as string || ''
  const callStatus = formData.get('CallStatus') as string || ''
  const callDuration = formData.get('CallDuration') as string || null

  if (!callSid) return NextResponse.json({ ok: true })

  const store = getStore()
  const call = store.callLogs.find(c => c.twilioCallSid === callSid)

  if (call) {
    const updates: Parameters<typeof updateCallLog>[1] = {
      status: mapTwilioStatus(callStatus) as Parameters<typeof updateCallLog>[1]['status'],
    }

    if (callDuration) updates.durationSeconds = parseInt(callDuration, 10)
    if (['completed', 'busy', 'no-answer', 'canceled', 'failed'].includes(callStatus)) {
      updates.endedAt = new Date().toISOString()
    }

    updateCallLog(call.id, updates)
  }

  return NextResponse.json({ ok: true })
}
