import { NextRequest, NextResponse } from 'next/server'
import { getCommunicationById, updateCommunication, createCommunication } from '@/lib/db/store'
import { sendWhatsAppMessage } from '@/lib/channels/whatsapp'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { replyBody } = body

  if (!replyBody?.trim()) {
    return NextResponse.json({ error: 'replyBody is required' }, { status: 400 })
  }

  const original = getCommunicationById(id)
  if (!original) return NextResponse.json({ error: 'Communication not found' }, { status: 404 })

  // For WhatsApp: send via API
  if (original.channel === 'whatsapp' && original.fromNumber) {
    const result = await sendWhatsAppMessage(original.fromNumber, replyBody)

    if (!result.success) {
      // Still log the attempted reply even if send failed
      console.error('[WhatsApp send failed]', result.error)
    }

    // Create outbound communication record
    const outbound = createCommunication({
      channel: 'whatsapp',
      direction: 'outbound',
      status: 'replied',
      fromNumber: original.toNumber,
      fromName: 'HomeFlow',
      toNumber: original.fromNumber,
      body: replyBody,
      whatsappMessageId: result.messageId || null,
      threadId: original.threadId,
      relatedTenantId: original.relatedTenantId,
      relatedContactId: original.relatedContactId,
    })

    // Mark original as replied
    updateCommunication(id, { status: 'replied' })

    return NextResponse.json({
      success: result.success,
      outboundCommunication: outbound,
      error: result.error || null,
    })
  }

  // For other channels: just log as manual reply
  const outbound = createCommunication({
    channel: original.channel,
    direction: 'outbound',
    status: 'replied',
    fromNumber: original.toNumber,
    fromName: 'HomeFlow',
    toNumber: original.fromNumber,
    body: replyBody,
    threadId: original.threadId,
    relatedTenantId: original.relatedTenantId,
    relatedContactId: original.relatedContactId,
  })

  updateCommunication(id, { status: 'replied' })

  return NextResponse.json({ success: true, outboundCommunication: outbound })
}
