import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        unit: { include: { property: { select: { id: true, name: true } } } },
      },
      orderBy: { endDate: 'asc' },
    })
    return NextResponse.json(leases)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantId, unitId, startDate, endDate, rentAmount, currency, securityDeposit, paymentFrequency, status, notes } = body

    if (!tenantId || !unitId || !startDate || !endDate || !rentAmount) {
      return NextResponse.json({ error: 'tenantId, unitId, startDate, endDate, and rentAmount are required' }, { status: 400 })
    }

    const lease = await prisma.lease.create({
      data: {
        tenantId,
        unitId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: parseFloat(rentAmount),
        currency: currency || 'AED',
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
        paymentFrequency: paymentFrequency || 'Annual',
        status: status || 'Active',
        notes,
      },
    })

    // Update unit status to Occupied
    await prisma.unit.update({ where: { id: unitId }, data: { status: 'Occupied' } })

    return NextResponse.json(lease, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create lease' }, { status: 500 })
  }
}
