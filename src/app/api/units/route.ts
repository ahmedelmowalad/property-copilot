import { NextRequest, NextResponse } from 'next/server'
import { getUnits, createUnit } from '@/lib/db/store'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const propertyId = searchParams.get('propertyId')

    const units = getUnits(propertyId || undefined)
    return NextResponse.json(units)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { propertyId, unitNumber, bedrooms, bathrooms, rentAmount, currency, status, notes } = body

    if (!propertyId || !unitNumber) {
      return NextResponse.json({ error: 'propertyId and unitNumber are required' }, { status: 400 })
    }

    const unit = createUnit({
      propertyId, unitNumber, bedrooms, bathrooms, rentAmount, currency, status, notes,
    })
    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
