import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      include: {
        relatedProperty: { select: { id: true, name: true } },
        relatedUnit: { select: { id: true, unitNumber: true } },
        relatedTenant: { select: { id: true, firstName: true, lastName: true } },
        createdTicket: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}
