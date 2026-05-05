import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        unit: { include: { property: true } },
        leases: { orderBy: { createdAt: 'desc' } },
        tickets: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
    if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(tenant)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        preferredChannel: body.preferredChannel,
        unitId: body.unitId,
        status: body.status,
        notes: body.notes,
      },
    })
    return NextResponse.json(tenant)
  } catch {
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.tenant.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 })
  }
}
