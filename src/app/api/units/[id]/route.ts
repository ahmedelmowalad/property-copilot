import { NextRequest, NextResponse } from 'next/server'
import { getUnitById, updateUnit, deleteUnit } from '@/lib/db/store'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const unit = getUnitById(id)
    if (!unit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(unit)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const unit = updateUnit(id, {
      unitNumber: body.unitNumber,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      rentAmount: body.rentAmount,
      currency: body.currency,
      status: body.status,
      notes: body.notes,
    })
    if (!unit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(unit)
  } catch {
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = deleteUnit(id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 })
  }
}
