import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        property: true,
        unit: true,
        tenant: true,
        activityLogs: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(ticket)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.maintenanceTicket.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const ticket = await prisma.maintenanceTicket.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        urgency: body.urgency,
        status: body.status,
        assignedVendor: body.assignedVendor,
        vendorType: body.vendorType,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    })

    // Log status change
    if (body.status && body.status !== existing.status) {
      await prisma.activityLog.create({
        data: {
          entityType: 'MaintenanceTicket',
          entityId: id,
          ticketId: id,
          action: 'StatusChanged',
          notes: `Status changed from ${existing.status} to ${body.status}`,
        },
      })
    }

    return NextResponse.json(ticket)
  } catch {
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.activityLog.deleteMany({ where: { ticketId: id } })
    await prisma.maintenanceTicket.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 })
  }
}
