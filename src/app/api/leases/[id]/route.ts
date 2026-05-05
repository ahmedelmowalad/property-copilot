import { NextRequest, NextResponse } from 'next/server'
import { getLeaseById, updateLease, deleteLease } from '@/lib/db/store'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const lease = getLeaseById(id)
    if (!lease) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(lease)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lease' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const lease = updateLease(id, {
      startDate: body.startDate,
      endDate: body.endDate,
      rentAmount: body.rentAmount ? parseFloat(body.rentAmount) : undefined,
      currency: body.currency,
      securityDeposit: body.securityDeposit ? parseFloat(body.securityDeposit) : undefined,
      paymentFrequency: body.paymentFrequency,
      status: body.status,
      notes: body.notes,
    })
    if (!lease) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(lease)
  } catch {
    return NextResponse.json({ error: 'Failed to update lease' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = deleteLease(id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete lease' }, { status: 500 })
  }
}
