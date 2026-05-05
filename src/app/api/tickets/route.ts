import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const urgency = searchParams.get('urgency')
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')

    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        ...(urgency ? { urgency } : {}),
        ...(status ? { status } : {}),
        ...(propertyId ? { propertyId } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true } },
        tenant: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    return NextResponse.json(tickets)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, description, category, urgency, status, propertyId, unitId, tenantId,
      sourceMessage, aiSummary, aiSuggestedResponse, assignedVendor, vendorType, dueDate,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        title,
        description,
        category: category || 'Maintenance',
        urgency: urgency || 'Medium',
        status: status || 'New',
        propertyId,
        unitId,
        tenantId,
        sourceMessage,
        aiSummary,
        aiSuggestedResponse,
        assignedVendor,
        vendorType,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        entityType: 'MaintenanceTicket',
        entityId: ticket.id,
        ticketId: ticket.id,
        action: 'Created',
        notes: `Ticket created with urgency: ${ticket.urgency}`,
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
