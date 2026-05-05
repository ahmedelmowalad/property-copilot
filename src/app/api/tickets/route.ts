import { NextRequest, NextResponse } from 'next/server'
import { getTickets, createTicket } from '@/lib/db/store'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const urgency = searchParams.get('urgency') || undefined
    const status = searchParams.get('status') || undefined
    const propertyId = searchParams.get('propertyId') || undefined

    const tickets = getTickets({ urgency, status, propertyId })
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

    const ticket = createTicket({
      title, description, category, urgency, status, propertyId, unitId, tenantId,
      sourceMessage, aiSummary, aiSuggestedResponse, assignedVendor, vendorType, dueDate,
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
