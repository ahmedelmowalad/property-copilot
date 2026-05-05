import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const [
      propertyCount,
      unitCount,
      activeTenantCount,
      activeLeaseCount,
      openTicketCount,
      urgentTicketCount,
      recentTickets,
      recentRequests,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.unit.count(),
      prisma.tenant.count({ where: { status: 'Active' } }),
      prisma.lease.count({ where: { status: { in: ['Active', 'ExpiringSoon'] } } }),
      prisma.maintenanceTicket.count({ where: { status: { notIn: ['Completed', 'Cancelled'] } } }),
      prisma.maintenanceTicket.count({ where: { urgency: { in: ['High', 'Emergency'] }, status: { notIn: ['Completed', 'Cancelled'] } } }),
      prisma.maintenanceTicket.findMany({
        include: {
          property: { select: { name: true } },
          unit: { select: { unitNumber: true } },
          tenant: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.request.findMany({
        include: {
          relatedProperty: { select: { name: true } },
          relatedTenant: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json({
      stats: {
        properties: propertyCount,
        units: unitCount,
        activeTenants: activeTenantCount,
        activeLeases: activeLeaseCount,
        openTickets: openTicketCount,
        urgentTickets: urgentTicketCount,
      },
      recentTickets,
      recentRequests,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
