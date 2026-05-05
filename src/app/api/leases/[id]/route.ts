import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: { include: { property: true } },
      },
    })
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
    const lease = await prisma.lease.update({
      where: { id },
      data: {
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        rentAmount: body.rentAmount ? parseFloat(body.rentAmount) : undefined,
        currency: body.currency,
        securityDeposit: body.securityDeposit ? parseFloat(body.securityDeposit) : undefined,
        paymentFrequency: body.paymentFrequency,
        status: body.status,
        notes: body.notes,
      },
    })
    return NextResponse.json(lease)
  } catch {
    return NextResponse.json({ error: 'Failed to update lease' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.lease.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete lease' }, { status: 500 })
  }
}
