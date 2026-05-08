import { NextRequest, NextResponse } from 'next/server'
import { getContacts, createContact } from '@/lib/db/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contactType = searchParams.get('contactType') || undefined
  const leadStatus = searchParams.get('leadStatus') || undefined

  const contacts = getContacts({ contactType, leadStatus })
  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.firstName || !body.lastName) {
    return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })
  }
  const contact = createContact(body)
  return NextResponse.json(contact, { status: 201 })
}
