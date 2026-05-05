import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          include: {
            tenants: true,
            leases: { where: { status: { in: ['Active', 'ExpiringSoon'] } } },
          },
        },
        tickets: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, address, emirate, area, propertyType, status, notes } = body
    const property = await prisma.property.update({
      where: { id },
      data: { name, address, emirate, area, propertyType, status, notes },
    })
    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.property.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
