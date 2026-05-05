import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Property Copilot demo data...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@propertycopilot.ai' },
    update: {},
    create: {
      name: 'Demo Property Manager',
      email: 'demo@propertycopilot.ai',
      role: 'PropertyManager',
    },
  })

  // ─── Property 1: Marina Heights Residence ──────────────────────────────────
  const marina = await prisma.property.upsert({
    where: { id: 'prop-marina-heights' },
    update: {},
    create: {
      id: 'prop-marina-heights',
      ownerUserId: demoUser.id,
      name: 'Marina Heights Residence',
      address: 'Dubai Marina, Dubai, UAE',
      emirate: 'Dubai',
      area: 'Dubai Marina',
      propertyType: 'ResidentialBuilding',
      status: 'Active',
      notes: '32-floor residential tower with 128 units. Mixed 1BR and 2BR apartments.',
    },
  })

  const unit1204 = await prisma.unit.upsert({
    where: { id: 'unit-marina-1204' },
    update: {},
    create: {
      id: 'unit-marina-1204',
      propertyId: marina.id,
      unitNumber: '1204',
      bedrooms: 2,
      bathrooms: 2,
      rentAmount: 95000,
      currency: 'AED',
      status: 'Occupied',
      notes: 'High floor, sea view',
    },
  })

  const unit1205 = await prisma.unit.upsert({
    where: { id: 'unit-marina-1205' },
    update: {},
    create: {
      id: 'unit-marina-1205',
      propertyId: marina.id,
      unitNumber: '1205',
      bedrooms: 1,
      bathrooms: 1,
      rentAmount: 72000,
      currency: 'AED',
      status: 'Vacant',
      notes: 'Recently renovated',
    },
  })

  const unit1802 = await prisma.unit.upsert({
    where: { id: 'unit-marina-1802' },
    update: {},
    create: {
      id: 'unit-marina-1802',
      propertyId: marina.id,
      unitNumber: '1802',
      bedrooms: 2,
      bathrooms: 2,
      rentAmount: 100000,
      currency: 'AED',
      status: 'Occupied',
      notes: 'Corner unit, panoramic view',
    },
  })

  // Tenant for 1204
  const sarah = await prisma.tenant.upsert({
    where: { id: 'tenant-sarah-johnson' },
    update: {},
    create: {
      id: 'tenant-sarah-johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+971 50 123 4567',
      preferredChannel: 'WebDashboard',
      unitId: unit1204.id,
      status: 'Active',
      notes: 'Long-term tenant, 3 years. Generally pays on time.',
    },
  })

  await prisma.lease.upsert({
    where: { id: 'lease-sarah-1204' },
    update: {},
    create: {
      id: 'lease-sarah-1204',
      tenantId: sarah.id,
      unitId: unit1204.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rentAmount: 95000,
      currency: 'AED',
      securityDeposit: 9500,
      paymentFrequency: 'Annual',
      status: 'ExpiringSoon',
      notes: 'Renewal discussion pending',
    },
  })

  // Tenant for 1802
  const omar = await prisma.tenant.upsert({
    where: { id: 'tenant-omar-hassan' },
    update: {},
    create: {
      id: 'tenant-omar-hassan',
      firstName: 'Omar',
      lastName: 'Hassan',
      email: 'omar.hassan@email.com',
      phone: '+971 55 987 6543',
      preferredChannel: 'WhatsApp',
      unitId: unit1802.id,
      status: 'Active',
    },
  })

  await prisma.lease.upsert({
    where: { id: 'lease-omar-1802' },
    update: {},
    create: {
      id: 'lease-omar-1802',
      tenantId: omar.id,
      unitId: unit1802.id,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-02-28'),
      rentAmount: 100000,
      currency: 'AED',
      securityDeposit: 10000,
      paymentFrequency: 'Annual',
      status: 'Active',
    },
  })

  // ─── Property 2: JVC Garden Apartments ────────────────────────────────────
  const jvc = await prisma.property.upsert({
    where: { id: 'prop-jvc-garden' },
    update: {},
    create: {
      id: 'prop-jvc-garden',
      ownerUserId: demoUser.id,
      name: 'JVC Garden Apartments',
      address: 'Jumeirah Village Circle, Dubai, UAE',
      emirate: 'Dubai',
      area: 'JVC',
      propertyType: 'Apartment',
      status: 'Active',
      notes: 'Low-rise apartment building, 4 floors, 24 units.',
    },
  })

  const unitA301 = await prisma.unit.upsert({
    where: { id: 'unit-jvc-a301' },
    update: {},
    create: {
      id: 'unit-jvc-a301',
      propertyId: jvc.id,
      unitNumber: 'A-301',
      bedrooms: 1,
      bathrooms: 1,
      rentAmount: 55000,
      currency: 'AED',
      status: 'Occupied',
    },
  })

  const unitA302 = await prisma.unit.upsert({
    where: { id: 'unit-jvc-a302' },
    update: {},
    create: {
      id: 'unit-jvc-a302',
      propertyId: jvc.id,
      unitNumber: 'A-302',
      bedrooms: 1,
      bathrooms: 1,
      rentAmount: 55000,
      currency: 'AED',
      status: 'Occupied',
    },
  })

  const emily = await prisma.tenant.upsert({
    where: { id: 'tenant-emily-carter' },
    update: {},
    create: {
      id: 'tenant-emily-carter',
      firstName: 'Emily',
      lastName: 'Carter',
      email: 'emily.carter@email.com',
      phone: '+971 52 345 6789',
      preferredChannel: 'WebDashboard',
      unitId: unitA301.id,
      status: 'Active',
    },
  })

  await prisma.lease.upsert({
    where: { id: 'lease-emily-a301' },
    update: {},
    create: {
      id: 'lease-emily-a301',
      tenantId: emily.id,
      unitId: unitA301.id,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      rentAmount: 55000,
      currency: 'AED',
      securityDeposit: 5500,
      paymentFrequency: 'Annual',
      status: 'Active',
    },
  })

  const daniel = await prisma.tenant.upsert({
    where: { id: 'tenant-daniel-lee' },
    update: {},
    create: {
      id: 'tenant-daniel-lee',
      firstName: 'Daniel',
      lastName: 'Lee',
      email: 'daniel.lee@email.com',
      phone: '+971 56 789 0123',
      preferredChannel: 'WebDashboard',
      unitId: unitA302.id,
      status: 'Active',
    },
  })

  await prisma.lease.upsert({
    where: { id: 'lease-daniel-a302' },
    update: {},
    create: {
      id: 'lease-daniel-a302',
      tenantId: daniel.id,
      unitId: unitA302.id,
      startDate: new Date('2023-12-01'),
      endDate: new Date('2024-11-30'),
      rentAmount: 55000,
      currency: 'AED',
      securityDeposit: 5500,
      paymentFrequency: 'Annual',
      status: 'ExpiringSoon',
      notes: 'Tenant has not confirmed renewal intent',
    },
  })

  // ─── Property 3: Al Reem Island Tower ────────────────────────────────────
  const alReem = await prisma.property.upsert({
    where: { id: 'prop-alreem-tower' },
    update: {},
    create: {
      id: 'prop-alreem-tower',
      ownerUserId: demoUser.id,
      name: 'Al Reem Island Tower',
      address: 'Al Reem Island, Abu Dhabi, UAE',
      emirate: 'Abu Dhabi',
      area: 'Al Reem Island',
      propertyType: 'ResidentialBuilding',
      status: 'Active',
      notes: '28-floor tower, mixed residential. Near Shams Abu Dhabi.',
    },
  })

  const unit905 = await prisma.unit.upsert({
    where: { id: 'unit-alreem-905' },
    update: {},
    create: {
      id: 'unit-alreem-905',
      propertyId: alReem.id,
      unitNumber: '905',
      bedrooms: 2,
      bathrooms: 2,
      rentAmount: 85000,
      currency: 'AED',
      status: 'Occupied',
    },
  })

  await prisma.unit.upsert({
    where: { id: 'unit-alreem-906' },
    update: {},
    create: {
      id: 'unit-alreem-906',
      propertyId: alReem.id,
      unitNumber: '906',
      bedrooms: 2,
      bathrooms: 2,
      rentAmount: 85000,
      currency: 'AED',
      status: 'Maintenance',
      notes: 'Under maintenance — AC system replacement in progress',
    },
  })

  const fatima = await prisma.tenant.upsert({
    where: { id: 'tenant-fatima-ali' },
    update: {},
    create: {
      id: 'tenant-fatima-ali',
      firstName: 'Fatima',
      lastName: 'Ali',
      email: 'fatima.ali@email.com',
      phone: '+971 50 444 5555',
      preferredChannel: 'WebDashboard',
      unitId: unit905.id,
      status: 'Active',
    },
  })

  await prisma.lease.upsert({
    where: { id: 'lease-fatima-905' },
    update: {},
    create: {
      id: 'lease-fatima-905',
      tenantId: fatima.id,
      unitId: unit905.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      rentAmount: 85000,
      currency: 'AED',
      securityDeposit: 8500,
      paymentFrequency: 'Annual',
      status: 'Active',
    },
  })

  // ─── Maintenance Tickets ──────────────────────────────────────────────────
  await prisma.maintenanceTicket.upsert({
    where: { id: 'ticket-001' },
    update: {},
    create: {
      id: 'ticket-001',
      propertyId: marina.id,
      unitId: unit1204.id,
      tenantId: sarah.id,
      title: 'AC Unit Not Working — Unit 1204',
      description: 'Tenant reports AC stopped working overnight. High urgency given UAE climate.',
      category: 'HVAC',
      urgency: 'High',
      status: 'InReview',
      sourceMessage: 'Hi, the AC in unit 1204 stopped working last night and it\'s getting really hot. Can someone come today?',
      aiSummary: 'Tenant reports complete AC failure in unit 1204. High urgency due to UAE heat. HVAC technician required.',
      assignedVendor: 'CoolTech HVAC Services',
      vendorType: 'HVAC Technician',
    },
  })

  await prisma.maintenanceTicket.upsert({
    where: { id: 'ticket-002' },
    update: {},
    create: {
      id: 'ticket-002',
      propertyId: jvc.id,
      unitId: unitA302.id,
      tenantId: daniel.id,
      title: 'Bathroom Sink Leak — Unit A-302',
      description: 'Tenant reports bathroom sink leaking for three days. Attempted self-repair made it worse.',
      category: 'Plumbing',
      urgency: 'Medium',
      status: 'Assigned',
      sourceMessage: 'The bathroom sink in A-302 has been leaking for three days. I tried tightening it but it\'s worse now.',
      aiSummary: 'Persistent sink leak in unit A-302. Tenant attempted repair — issue worsened. Licensed plumber required.',
      assignedVendor: 'ProPlumb Dubai',
      vendorType: 'Licensed Plumber',
    },
  })

  await prisma.maintenanceTicket.upsert({
    where: { id: 'ticket-003' },
    update: {},
    create: {
      id: 'ticket-003',
      propertyId: marina.id,
      unitId: unit1802.id,
      tenantId: omar.id,
      title: 'Front Door Access Card Not Working',
      description: 'Access card for building entry not functioning. Repeated issue.',
      category: 'Access Control',
      urgency: 'Medium',
      status: 'New',
      sourceMessage: 'The tenant at Marina Heights says the front door access card is not working again. Please update me on what\'s happening.',
    },
  })

  await prisma.maintenanceTicket.upsert({
    where: { id: 'ticket-004' },
    update: {},
    create: {
      id: 'ticket-004',
      propertyId: alReem.id,
      unitId: unit905.id,
      tenantId: fatima.id,
      title: 'Water Heater Leak — Kitchen Flooding',
      description: 'EMERGENCY: Water heater leaking and water spreading in kitchen. Immediate response required.',
      category: 'Emergency',
      urgency: 'Emergency',
      status: 'InReview',
      sourceMessage: 'The water heater is leaking and water is spreading in the kitchen.',
      aiSummary: 'Emergency water heater leak with active flooding in kitchen. Immediate plumber dispatch required. Check for structural water damage.',
    },
  })

  await prisma.maintenanceTicket.upsert({
    where: { id: 'ticket-005' },
    update: {},
    create: {
      id: 'ticket-005',
      propertyId: alReem.id,
      title: 'Unit 906 AC System Replacement',
      description: 'Full AC system replacement in progress. Unit not available for lease until complete.',
      category: 'HVAC',
      urgency: 'Medium',
      status: 'WaitingOnVendor',
      assignedVendor: 'Gulf Cool Systems',
      vendorType: 'HVAC Contractor',
    },
  })

  // Add activity logs for tickets
  await prisma.activityLog.createMany({
    data: [
      { id: 'log-001', entityType: 'MaintenanceTicket', entityId: 'ticket-001', ticketId: 'ticket-001', action: 'Created', notes: 'Ticket created from AI triage' },
      { id: 'log-002', entityType: 'MaintenanceTicket', entityId: 'ticket-001', ticketId: 'ticket-001', action: 'StatusChanged', notes: 'Status: New → InReview' },
      { id: 'log-003', entityType: 'MaintenanceTicket', entityId: 'ticket-002', ticketId: 'ticket-002', action: 'Created', notes: 'Ticket created from AI triage' },
      { id: 'log-004', entityType: 'MaintenanceTicket', entityId: 'ticket-002', ticketId: 'ticket-002', action: 'StatusChanged', notes: 'Status: New → Assigned. Vendor: ProPlumb Dubai' },
      { id: 'log-005', entityType: 'MaintenanceTicket', entityId: 'ticket-004', ticketId: 'ticket-004', action: 'Created', notes: 'EMERGENCY ticket created — immediate response required' },
    ],
  })

  console.log('✅ Seed complete!')
  console.log(`   Properties: 3`)
  console.log(`   Units: 7`)
  console.log(`   Tenants: 5`)
  console.log(`   Leases: 5`)
  console.log(`   Maintenance Tickets: 5`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
