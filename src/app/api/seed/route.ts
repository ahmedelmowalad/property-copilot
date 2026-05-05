import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// This endpoint seeds demo data via the web — only for development/demo use
export async function POST() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    return NextResponse.json({ error: 'Seed not allowed in production' }, { status: 403 })
  }

  try {
    // Check if already seeded
    const existingProperty = await prisma.property.findFirst({ where: { id: 'prop-marina-heights' } })
    if (existingProperty) {
      return NextResponse.json({ message: 'Already seeded', alreadySeeded: true })
    }

    // Create demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@propertycopilot.ai' },
      update: {},
      create: { name: 'Demo Property Manager', email: 'demo@propertycopilot.ai', role: 'PropertyManager' },
    })

    const marina = await prisma.property.create({
      data: {
        id: 'prop-marina-heights',
        ownerUserId: demoUser.id,
        name: 'Marina Heights Residence',
        address: 'Dubai Marina, Dubai, UAE',
        emirate: 'Dubai',
        area: 'Dubai Marina',
        propertyType: 'ResidentialBuilding',
        notes: '32-floor residential tower with 128 units.',
      },
    })

    const unit1204 = await prisma.unit.create({ data: { id: 'unit-marina-1204', propertyId: marina.id, unitNumber: '1204', bedrooms: 2, bathrooms: 2, rentAmount: 95000, currency: 'AED', status: 'Occupied', notes: 'High floor, sea view' } })
    await prisma.unit.create({ data: { id: 'unit-marina-1205', propertyId: marina.id, unitNumber: '1205', bedrooms: 1, bathrooms: 1, rentAmount: 72000, currency: 'AED', status: 'Vacant', notes: 'Recently renovated' } })
    const unit1802 = await prisma.unit.create({ data: { id: 'unit-marina-1802', propertyId: marina.id, unitNumber: '1802', bedrooms: 2, bathrooms: 2, rentAmount: 100000, currency: 'AED', status: 'Occupied' } })

    const jvc = await prisma.property.create({
      data: {
        id: 'prop-jvc-garden',
        ownerUserId: demoUser.id,
        name: 'JVC Garden Apartments',
        address: 'Jumeirah Village Circle, Dubai, UAE',
        emirate: 'Dubai',
        area: 'JVC',
        propertyType: 'Apartment',
      },
    })
    const unitA301 = await prisma.unit.create({ data: { id: 'unit-jvc-a301', propertyId: jvc.id, unitNumber: 'A-301', bedrooms: 1, bathrooms: 1, rentAmount: 55000, currency: 'AED', status: 'Occupied' } })
    const unitA302 = await prisma.unit.create({ data: { id: 'unit-jvc-a302', propertyId: jvc.id, unitNumber: 'A-302', bedrooms: 1, bathrooms: 1, rentAmount: 55000, currency: 'AED', status: 'Occupied' } })

    const alReem = await prisma.property.create({
      data: {
        id: 'prop-alreem-tower',
        ownerUserId: demoUser.id,
        name: 'Al Reem Island Tower',
        address: 'Al Reem Island, Abu Dhabi, UAE',
        emirate: 'Abu Dhabi',
        area: 'Al Reem Island',
        propertyType: 'ResidentialBuilding',
      },
    })
    const unit905 = await prisma.unit.create({ data: { id: 'unit-alreem-905', propertyId: alReem.id, unitNumber: '905', bedrooms: 2, bathrooms: 2, rentAmount: 85000, currency: 'AED', status: 'Occupied' } })
    await prisma.unit.create({ data: { id: 'unit-alreem-906', propertyId: alReem.id, unitNumber: '906', bedrooms: 2, bathrooms: 2, rentAmount: 85000, currency: 'AED', status: 'Maintenance', notes: 'AC system replacement in progress' } })

    const sarah = await prisma.tenant.create({ data: { id: 'tenant-sarah-johnson', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com', phone: '+971 50 123 4567', unitId: unit1204.id, status: 'Active' } })
    const omar = await prisma.tenant.create({ data: { id: 'tenant-omar-hassan', firstName: 'Omar', lastName: 'Hassan', email: 'omar.hassan@email.com', phone: '+971 55 987 6543', preferredChannel: 'WhatsApp', unitId: unit1802.id, status: 'Active' } })
    const emily = await prisma.tenant.create({ data: { id: 'tenant-emily-carter', firstName: 'Emily', lastName: 'Carter', email: 'emily.carter@email.com', phone: '+971 52 345 6789', unitId: unitA301.id, status: 'Active' } })
    const daniel = await prisma.tenant.create({ data: { id: 'tenant-daniel-lee', firstName: 'Daniel', lastName: 'Lee', email: 'daniel.lee@email.com', phone: '+971 56 789 0123', unitId: unitA302.id, status: 'Active' } })
    const fatima = await prisma.tenant.create({ data: { id: 'tenant-fatima-ali', firstName: 'Fatima', lastName: 'Ali', email: 'fatima.ali@email.com', phone: '+971 50 444 5555', unitId: unit905.id, status: 'Active' } })

    await prisma.lease.createMany({
      data: [
        { id: 'lease-sarah-1204', tenantId: sarah.id, unitId: unit1204.id, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), rentAmount: 95000, currency: 'AED', securityDeposit: 9500, paymentFrequency: 'Annual', status: 'ExpiringSoon' },
        { id: 'lease-omar-1802', tenantId: omar.id, unitId: unit1802.id, startDate: new Date('2024-03-01'), endDate: new Date('2025-02-28'), rentAmount: 100000, currency: 'AED', securityDeposit: 10000, paymentFrequency: 'Annual', status: 'Active' },
        { id: 'lease-emily-a301', tenantId: emily.id, unitId: unitA301.id, startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), rentAmount: 55000, currency: 'AED', securityDeposit: 5500, paymentFrequency: 'Annual', status: 'Active' },
        { id: 'lease-daniel-a302', tenantId: daniel.id, unitId: unitA302.id, startDate: new Date('2023-12-01'), endDate: new Date('2024-11-30'), rentAmount: 55000, currency: 'AED', securityDeposit: 5500, paymentFrequency: 'Annual', status: 'ExpiringSoon' },
        { id: 'lease-fatima-905', tenantId: fatima.id, unitId: unit905.id, startDate: new Date('2024-02-01'), endDate: new Date('2025-01-31'), rentAmount: 85000, currency: 'AED', securityDeposit: 8500, paymentFrequency: 'Annual', status: 'Active' },
      ],
    })

    await prisma.maintenanceTicket.createMany({
      data: [
        { id: 'ticket-001', propertyId: marina.id, unitId: unit1204.id, tenantId: sarah.id, title: 'AC Unit Not Working — Unit 1204', description: 'Tenant reports AC stopped working overnight.', category: 'HVAC', urgency: 'High', status: 'InReview', sourceMessage: "Hi, the AC in unit 1204 stopped working last night and it's getting really hot. Can someone come today?", aiSummary: 'Tenant reports complete AC failure in unit 1204. HVAC technician required.', assignedVendor: 'CoolTech HVAC Services', vendorType: 'HVAC Technician' },
        { id: 'ticket-002', propertyId: jvc.id, unitId: unitA302.id, tenantId: daniel.id, title: 'Bathroom Sink Leak — Unit A-302', description: 'Tenant reports bathroom sink leaking for three days.', category: 'Plumbing', urgency: 'Medium', status: 'Assigned', sourceMessage: "The bathroom sink in A-302 has been leaking for three days. I tried tightening it but it's worse now.", assignedVendor: 'ProPlumb Dubai', vendorType: 'Licensed Plumber' },
        { id: 'ticket-003', propertyId: marina.id, unitId: unit1802.id, tenantId: omar.id, title: 'Front Door Access Card Not Working', description: 'Access card for building entry not functioning.', category: 'Access Control', urgency: 'Medium', status: 'New' },
        { id: 'ticket-004', propertyId: alReem.id, unitId: unit905.id, tenantId: fatima.id, title: 'EMERGENCY: Water Heater Leak — Kitchen', description: 'Water heater leaking and water spreading in kitchen.', category: 'Emergency', urgency: 'Emergency', status: 'InReview', sourceMessage: 'The water heater is leaking and water is spreading in the kitchen.', aiSummary: 'Emergency water heater leak with active flooding in kitchen.' },
        { id: 'ticket-005', propertyId: alReem.id, title: 'Unit 906 AC System Replacement', description: 'Full AC system replacement in progress.', category: 'HVAC', urgency: 'Medium', status: 'WaitingOnVendor', assignedVendor: 'Gulf Cool Systems', vendorType: 'HVAC Contractor' },
      ],
    })

    await prisma.activityLog.createMany({
      data: [
        { id: 'log-001', entityType: 'MaintenanceTicket', entityId: 'ticket-001', ticketId: 'ticket-001', action: 'Created', notes: 'Ticket created from AI triage' },
        { id: 'log-002', entityType: 'MaintenanceTicket', entityId: 'ticket-001', ticketId: 'ticket-001', action: 'StatusChanged', notes: 'Status: New → InReview' },
        { id: 'log-003', entityType: 'MaintenanceTicket', entityId: 'ticket-002', ticketId: 'ticket-002', action: 'Created', notes: 'Ticket created from AI triage' },
        { id: 'log-004', entityType: 'MaintenanceTicket', entityId: 'ticket-002', ticketId: 'ticket-002', action: 'StatusChanged', notes: 'Assigned to ProPlumb Dubai' },
        { id: 'log-005', entityType: 'MaintenanceTicket', entityId: 'ticket-004', ticketId: 'ticket-004', action: 'Created', notes: 'EMERGENCY ticket — immediate response required' },
      ],
    })

    return NextResponse.json({ message: 'Demo data seeded successfully', seeded: true })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
