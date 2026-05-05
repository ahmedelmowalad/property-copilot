import { NextRequest, NextResponse } from 'next/server'
import { getTenantById, updateTenant, deleteTenant } from '@/lib/db/store'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tenant = getTenantById(id)
    if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(tenant)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const tenant = updateTenant(id, {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      preferredChannel: body.preferredChannel,
      unitId: body.unitId,
      status: body.status,
      notes: body.notes,
    })
    if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(tenant)
  } catch {
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = deleteTenant(id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 })
  }
}
