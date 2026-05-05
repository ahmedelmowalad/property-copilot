import { NextRequest, NextResponse } from 'next/server'
import { getTicketById, updateTicket, deleteTicket } from '@/lib/db/store'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ticket = getTicketById(id)
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

    const ticket = updateTicket(id, {
      title: body.title,
      description: body.description,
      category: body.category,
      urgency: body.urgency,
      status: body.status,
      assignedVendor: body.assignedVendor,
      vendorType: body.vendorType,
      dueDate: body.dueDate,
    })

    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(ticket)
  } catch {
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = deleteTicket(id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 })
  }
}
