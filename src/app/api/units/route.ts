import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const propertyId = searchParams.get('propertyId')

    const units = await prisma.unit.findMany({
      where: propertyId ? { propertyId } : undefined,
      include: {
        property: { select: { id: true, name: true } },
        tenants: { where: { status: 'Active' } },
        leases: { where: { status: { in: ['Active', 'ExpiringSoon'] } }, orderBy: { endDate: 'asc' } },
        _count: { select: { tickets: true } },
      },
      orderBy: [{ property: { name: 'asc' } }, { unitNumber: 'asc' }],
    })
    return NextResponse.json(units)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { propertyId, unitNumber, bedrooms, bathrooms, rentAmount, currency, status, notes } = body

    if (!propertyId || !unitNumber) {
      return NextResponse.json({ error: 'propertyId and unitNumber are required' }, { status: 400 })
    }

    const unit = await prisma.unit.create({
      data: {
        propertyId,
        unitNumber,
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        rentAmount: rentAmount || 0,
        currency: currency || 'AED',
        status: status || 'Vacant',
        notes,
      },
    })
    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
