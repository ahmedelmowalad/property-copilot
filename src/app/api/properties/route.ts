import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        units: { include: { tenants: true } },
        _count: { select: { units: true, tickets: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(properties)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, address, emirate, area, propertyType, status, notes, ownerUserId } = body

    if (!name || !address || !area) {
      return NextResponse.json({ error: 'name, address, and area are required' }, { status: 400 })
    }

    const property = await prisma.property.create({
      data: { name, address, emirate: emirate || 'Dubai', area, propertyType: propertyType || 'Apartment', status: status || 'Active', notes, ownerUserId },
    })
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}
