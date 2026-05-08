import { NextRequest, NextResponse } from 'next/server'
import { parseIncomingMessages, WhatsAppWebhookPayload } from '@/lib/channels/whatsapp'
import { createCommunication, getCommunications, updateCommunication } from '@/lib/db/store'
import { runTriage } from '@/lib/ai'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'homeflow-verify-2026'

// GET: WhatsApp webhook verification challenge
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST: Receive incoming WhatsApp messages
export async function POST(req: NextRequest) {
  let payload: WhatsAppWebhookPayload

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Acknowledge immediately (WhatsApp requires < 5s response)
  const messages = parseIncomingMessages(payload)

  for (const msg of messages) {
    if (msg.type !== 'text' || !msg.text) continue

    // Deduplicate by WhatsApp message ID
    const existing = getCommunications().find(c => c.whatsappMessageId === msg.messageId)
    if (existing) continue

    // Resolve phone to E.164 format (add + prefix)
    const fromNumber = msg.from.startsWith('+') ? msg.from : `+${msg.from}`

    // Create communication record first (unprocessed)
    const comm = createCommunication({
      channel: 'whatsapp',
      direction: 'inbound',
      status: 'new',
      fromNumber,
      fromName: msg.profileName || null,
      toNumber: msg.phoneNumberId ? `+${msg.phoneNumberId}` : null,
      body: msg.text,
      whatsappMessageId: msg.messageId,
      threadId: `wa-${fromNumber}`,
    })

    // Run AI triage in the background (non-blocking for webhook response)
    runTriage({
      message: msg.text,
      senderType: 'Tenant',
      channel: 'WhatsApp',
    }).then(result => {
      updateCommunication(comm.id, {
        aiCategory: result.category,
        aiUrgency: result.urgency,
        aiSummary: result.summary,
        aiDraftReply: result.draftResponse,
      })
    }).catch(console.error)
  }

  return NextResponse.json({ status: 'ok' })
}
