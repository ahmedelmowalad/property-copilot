import { NextRequest, NextResponse } from 'next/server'
import { getCommunicationById, updateCommunication } from '@/lib/db/store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const comm = getCommunicationById(id)
  if (!comm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(comm)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = updateCommunication(id, body)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}
