import { NextResponse } from 'next/server'
import { getRequests } from '@/lib/db/store'

export async function GET() {
  try {
    const requests = getRequests()
    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}
