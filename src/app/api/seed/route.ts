import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Demo data pre-seeded in memory', seeded: true, alreadySeeded: true })
}
