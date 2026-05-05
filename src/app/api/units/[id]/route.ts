import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        property: true,
        tenants: true,
        leases: { orderBy: { createdAt: 'desc' } },
        tickets: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    if (!unit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(unit)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const unit = await prisma.unit.update({
      where: { id },
      data: {
        unitNumber: body.unitNumber,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        rentAmount: body.rentAmount,
        currency: body.currency,
        status: body.status,
        notes: body.notes,
      },
    })
    return NextResponse.json(unit)
  } catch {
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.unit.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 })
  }
}
