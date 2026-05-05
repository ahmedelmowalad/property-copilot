import { NextRequest, NextResponse } from 'next/server'
import { getTenants, createTenant } from '@/lib/db/store'

export async function GET() {
  try {
    const tenants = getTenants()
    return NextResponse.json(tenants)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, preferredChannel, unitId, status, notes } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })
    }

    const tenant = createTenant({
      firstName, lastName, email, phone, preferredChannel, unitId, status, notes,
    })
    return NextResponse.json(tenant, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
