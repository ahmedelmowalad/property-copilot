import { NextRequest, NextResponse } from 'next/server'
import { getCallLogs, createCallLog } from '@/lib/db/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const direction = searchParams.get('direction') || undefined
  const tenantId = searchParams.get('tenantId') || undefined

  const calls = getCallLogs({ status, direction, tenantId })
  return NextResponse.json(calls)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.fromNumber || !body.toNumber) {
    return NextResponse.json({ error: 'fromNumber and toNumber are required' }, { status: 400 })
  }
  const call = createCallLog(body)
  return NextResponse.json(call, { status: 201 })
}
