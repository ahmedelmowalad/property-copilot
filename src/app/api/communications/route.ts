import { NextRequest, NextResponse } from 'next/server'
import { getCommunications, createCommunication } from '@/lib/db/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const channel = searchParams.get('channel') || undefined
  const status = searchParams.get('status') || undefined
  const tenantId = searchParams.get('tenantId') || undefined
  const contactId = searchParams.get('contactId') || undefined

  const comms = getCommunications({ channel, status, tenantId, contactId })
  return NextResponse.json(comms)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.body || !body.channel) {
    return NextResponse.json({ error: 'body and channel are required' }, { status: 400 })
  }
  const comm = createCommunication(body)
  return NextResponse.json(comm, { status: 201 })
}
