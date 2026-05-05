import { NextRequest, NextResponse } from 'next/server'
import { getPropertyById, updateProperty, deleteProperty } from '@/lib/db/store'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const property = getPropertyById(id)
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, address, emirate, area, propertyType, status, notes } = body
    const property = updateProperty(id, { name, address, emirate, area, propertyType, status, notes })
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = deleteProperty(id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
