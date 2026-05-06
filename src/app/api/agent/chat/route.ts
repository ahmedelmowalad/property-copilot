import { NextRequest, NextResponse } from 'next/server'
import { runAgentChat, type ChatMessage } from '@/lib/ai/agentChat'
import { getTenantById, getLeases, createTicket } from '@/lib/db/store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantId, messages, confirmAction } = body

    if (!tenantId || !messages?.length) {
      return NextResponse.json({ error: 'tenantId and messages are required' }, { status: 400 })
    }

    // Build tenant context
    const tenant = getTenantById(tenantId)
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const allLeases = getLeases()
    const lease = allLeases.find(l => l.tenantId === tenantId && ['Active', 'ExpiringSoon'].includes(l.status))

    const ctx = {
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      unitNumber: (tenant.unit as { unitNumber?: string })?.unitNumber ?? 'Unknown',
      propertyName: (tenant.unit as { property?: { name?: string } })?.property?.name ?? 'Unknown',
      leaseStatus: lease?.status ?? 'Unknown',
      leaseEndDate: lease?.endDate ?? 'Unknown',
      rentAmount: lease?.rentAmount ?? 0,
      currency: lease?.currency ?? 'AED',
    }

    // If client is confirming a create_ticket action, actually create it
    if (confirmAction?.type === 'create_ticket') {
      const { title, description, category, urgency } = confirmAction.data
      const ticket = createTicket({
        title,
        description,
        category,
        urgency,
        status: 'New',
        propertyId: (tenant.unit as { propertyId?: string })?.propertyId ?? undefined,
        unitId: tenant.unitId ?? undefined,
        tenantId,
        sourceMessage: messages.filter((m: ChatMessage) => m.role === 'tenant').map((m: ChatMessage) => m.content).join(' | '),
        aiSummary: description,
      })
      return NextResponse.json({ ticketId: ticket.id, created: true })
    }

    const typedMessages: ChatMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'tenant' | 'agent',
      content: m.content,
    }))

    const output = await runAgentChat(typedMessages, ctx)
    return NextResponse.json({ ...output, ctx })
  } catch (error) {
    console.error('Agent chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agent chat failed' },
      { status: 500 }
    )
  }
}
