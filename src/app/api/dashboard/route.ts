import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/db/store'

export async function GET() {
  try {
    const data = getDashboardStats()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
