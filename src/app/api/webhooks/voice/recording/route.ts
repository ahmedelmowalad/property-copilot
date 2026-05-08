import { NextRequest, NextResponse } from 'next/server'
import { getStore, updateCallLog } from '@/lib/db/store'
import { runTriage } from '@/lib/ai'

// POST: Twilio calls this with recording URL and/or transcription
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const callSid = formData.get('CallSid') as string || ''
  const recordingUrl = formData.get('RecordingUrl') as string || null
  const transcriptionText = formData.get('TranscriptionText') as string || null
  const transcriptionStatus = formData.get('TranscriptionStatus') as string || null
  const recordingDuration = formData.get('RecordingDuration') as string || null

  if (!callSid) return NextResponse.json({ ok: true })

  const store = getStore()
  const call = store.callLogs.find(c => c.twilioCallSid === callSid)
  if (!call) return NextResponse.json({ ok: true })

  const updates: Parameters<typeof updateCallLog>[1] = {}

  if (recordingUrl) {
    updates.recordingUrl = recordingUrl + '.mp3'
  }
  if (recordingDuration) {
    updates.durationSeconds = parseInt(recordingDuration, 10)
  }
  if (transcriptionStatus === 'completed' && transcriptionText) {
    updates.transcription = transcriptionText

    // Run AI to summarize transcription and extract action items
    try {
      const triageResult = await runTriage({
        message: `[Phone call transcription] ${transcriptionText}`,
        senderType: 'Tenant',
        channel: 'WhatsApp',
      })
      updates.aiSummary = triageResult.summary
      updates.aiActionItems = triageResult.suggestedActions
    } catch {
      // Non-critical — proceed without AI summary
    }
  }

  if (Object.keys(updates).length > 0) {
    updateCallLog(call.id, updates)
  }

  return NextResponse.json({ ok: true })
}
