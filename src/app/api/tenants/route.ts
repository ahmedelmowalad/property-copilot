import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        unit: { include: { property: { select: { id: true, name: true } } } },
        leases: { where: { status: { in: ['Active', 'ExpiringSoon'] } }, orderBy: { endDate: 'asc' } },
        _count: { select: { tickets: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tenants)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, preferredChannel, unitId, status, notes } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })
    }

    const tenant = await prisma.tenant.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        preferredChannel: preferredChannel || 'WebDashboard',
        unitId,
        status: status || 'Active',
        notes,
      },
    })
    return NextResponse.json(tenant, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
