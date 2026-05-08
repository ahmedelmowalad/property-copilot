// Twilio Voice integration
// Docs: https://www.twilio.com/docs/voice/twiml

export interface TwilioCallPayload {
  CallSid: string
  CallStatus: string
  Direction: string
  From: string
  To: string
  CallerName?: string
  Duration?: string
  RecordingUrl?: string
  RecordingDuration?: string
  TranscriptionText?: string
  TranscriptionStatus?: string
}

export function buildGreetingTwiml(companyName = 'HomeFlow'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Thank you for calling ${companyName}. Your call is important to us and may be recorded for quality purposes. Please stay on the line.
  </Say>
  <Record
    action="/api/webhooks/voice/recording"
    recordingStatusCallback="/api/webhooks/voice/recording"
    transcribe="true"
    transcribeCallback="/api/webhooks/voice/recording"
    maxLength="300"
    playBeep="false"
  />
</Response>`
}

export function buildHoldTwiml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Please hold while we connect you to the next available agent.</Say>
  <Play loop="10">https://api.twilio.com/cowbell.mp3</Play>
</Response>`
}

export function buildVoicemailTwiml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    You have reached HomeFlow property management. We are currently unavailable.
    Please leave your name, phone number, and a brief message after the beep and we will call you back shortly. Thank you.
  </Say>
  <Record
    action="/api/webhooks/voice/recording"
    transcribe="true"
    transcribeCallback="/api/webhooks/voice/recording"
    maxLength="120"
    playBeep="true"
  />
</Response>`
}

export function mapTwilioStatus(twilioStatus: string): string {
  const map: Record<string, string> = {
    'queued': 'ringing',
    'ringing': 'ringing',
    'in-progress': 'in_progress',
    'completed': 'completed',
    'busy': 'missed',
    'no-answer': 'missed',
    'canceled': 'missed',
    'failed': 'failed',
  }
  return map[twilioStatus] || 'completed'
}

export async function lookupCallerName(phoneNumber: string): Promise<string | null> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) return null

  try {
    const encoded = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const res = await fetch(
      `https://lookups.twilio.com/v1/PhoneNumbers/${encodeURIComponent(phoneNumber)}?Type=caller-name`,
      { headers: { Authorization: `Basic ${encoded}` } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.caller_name?.caller_name || null
  } catch {
    return null
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}
