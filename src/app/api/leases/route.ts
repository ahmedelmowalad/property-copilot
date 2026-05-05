import { NextRequest, NextResponse } from 'next/server'
import { getLeases, createLease } from '@/lib/db/store'

export async function GET() {
  try {
    const leases = getLeases()
    return NextResponse.json(leases)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantId, unitId, startDate, endDate, rentAmount, currency, securityDeposit, paymentFrequency, status, notes } = body

    if (!tenantId || !unitId || !startDate || !endDate || !rentAmount) {
      return NextResponse.json({ error: 'tenantId, unitId, startDate, endDate, and rentAmount are required' }, { status: 400 })
    }

    const lease = createLease({
      tenantId, unitId, startDate, endDate,
      rentAmount: parseFloat(rentAmount),
      currency, securityDeposit, paymentFrequency, status, notes,
    })

    return NextResponse.json(lease, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create lease' }, { status: 500 })
  }
}
