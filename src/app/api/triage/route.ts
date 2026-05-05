import { NextRequest, NextResponse } from 'next/server'
import { triageRequest } from '@/lib/agent/triageRequest'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      message,
      senderType,
      senderName,
      senderEmail,
      senderPhone,
      channel,
      relatedPropertyId,
      relatedUnitId,
      relatedTenantId,
    } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    if (!senderType) {
      return NextResponse.json({ error: 'senderType is required' }, { status: 400 })
    }

    const result = await triageRequest({
      message: message.trim(),
      senderType,
      senderName,
      senderEmail,
      senderPhone,
      channel: channel || 'WebDashboard',
      relatedPropertyId,
      relatedUnitId,
      relatedTenantId,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Triage error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Triage failed' },
      { status: 500 }
    )
  }
}
