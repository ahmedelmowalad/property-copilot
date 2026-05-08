// HomeFlow in-memory data store — no external database required
// Seed data is pre-loaded; mutations persist within a warm serverless instance

function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

function nowIso(): string {
  return new Date().toISOString()
}

// ─── Raw stored types ──────────────────────────────────────────────────────

export interface Property {
  id: string; name: string; address: string; emirate: string; area: string
  propertyType: string; status: string; notes: string | null; ownerUserId: string | null
  createdAt: string; updatedAt: string
}
export interface Unit {
  id: string; propertyId: string; unitNumber: string; bedrooms: number; bathrooms: number
  rentAmount: number; currency: string; status: string; notes: string | null
  createdAt: string; updatedAt: string
}
export interface Tenant {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null
  preferredChannel: string; unitId: string | null; status: string; notes: string | null
  createdAt: string; updatedAt: string
}
export interface Lease {
  id: string; tenantId: string; unitId: string; startDate: string; endDate: string
  rentAmount: number; currency: string; securityDeposit: number; paymentFrequency: string
  status: string; notes: string | null; createdAt: string; updatedAt: string
}
export interface Ticket {
  id: string; propertyId: string | null; unitId: string | null; tenantId: string | null
  title: string; description: string | null; category: string; urgency: string; status: string
  sourceMessage: string | null; aiSummary: string | null; aiSuggestedResponse: string | null
  assignedVendor: string | null; vendorType: string | null; dueDate: string | null
  createdAt: string; updatedAt: string
}
export interface ActivityLog {
  id: string; entityType: string; entityId: string; ticketId: string | null
  action: string; notes: string | null; createdAt: string
}
export interface Communication {
  id: string; channel: string; direction: string; status: string
  fromNumber: string | null; fromName: string | null; toNumber: string | null
  body: string; mediaUrl: string | null
  aiCategory: string | null; aiUrgency: string | null; aiSummary: string | null; aiDraftReply: string | null
  relatedTenantId: string | null; relatedContactId: string | null; relatedTicketId: string | null
  whatsappMessageId: string | null; threadId: string | null
  createdAt: string; updatedAt: string
}
export interface CallLog {
  id: string; status: string; direction: string
  fromNumber: string; toNumber: string; callerName: string | null
  durationSeconds: number | null; recordingUrl: string | null
  transcription: string | null; aiSummary: string | null; aiActionItems: string[] | null
  relatedTenantId: string | null; relatedContactId: string | null
  twilioCallSid: string | null; startedAt: string; endedAt: string | null; createdAt: string
}
export interface Contact {
  id: string; firstName: string; lastName: string
  email: string | null; phone: string | null; whatsappNumber: string | null
  contactType: string; leadStatus: string; propertyInterest: string | null
  budgetAed: number | null; notes: string | null; createdAt: string; updatedAt: string
}
export interface Request {
  id: string; senderType: string; senderName: string | null; senderEmail: string | null
  senderPhone: string | null; channel: string; rawMessage: string; category: string | null
  urgency: string | null; extractedSummary: string | null; extractedDetailsJson: string | null
  suggestedActionsJson: string | null; draftResponse: string | null; complianceNotes: string | null
  relatedPropertyId: string | null; relatedUnitId: string | null; relatedTenantId: string | null
  createdTicketId: string | null; createdAt: string
}

// ─── Store singleton ───────────────────────────────────────────────────────

interface Store {
  properties: Property[]
  units: Unit[]
  tenants: Tenant[]
  leases: Lease[]
  tickets: Ticket[]
  activityLogs: ActivityLog[]
  requests: Request[]
  communications: Communication[]
  callLogs: CallLog[]
  contacts: Contact[]
}

const g = globalThis as unknown as { __pcStore?: Store }

function buildSeedData(): Store {
  const d1 = '2024-01-01T00:00:00.000Z'
  const d2 = '2024-02-01T00:00:00.000Z'

  const properties: Property[] = [
    { id: 'prop-marina-heights', name: 'Marina Heights Residence', address: 'Dubai Marina, Dubai, UAE', emirate: 'Dubai', area: 'Dubai Marina', propertyType: 'ResidentialBuilding', status: 'Active', notes: '32-floor residential tower with 128 units. Mixed 1BR and 2BR apartments.', ownerUserId: 'user-demo', createdAt: d1, updatedAt: d1 },
    { id: 'prop-jvc-garden', name: 'JVC Garden Apartments', address: 'Jumeirah Village Circle, Dubai, UAE', emirate: 'Dubai', area: 'JVC', propertyType: 'Apartment', status: 'Active', notes: 'Low-rise apartment building, 4 floors, 24 units.', ownerUserId: 'user-demo', createdAt: d1, updatedAt: d1 },
    { id: 'prop-alreem-tower', name: 'Al Reem Island Tower', address: 'Al Reem Island, Abu Dhabi, UAE', emirate: 'Abu Dhabi', area: 'Al Reem Island', propertyType: 'ResidentialBuilding', status: 'Active', notes: '28-floor tower, mixed residential. Near Shams Abu Dhabi.', ownerUserId: 'user-demo', createdAt: d1, updatedAt: d1 },
  ]

  const units: Unit[] = [
    { id: 'unit-marina-1204', propertyId: 'prop-marina-heights', unitNumber: '1204', bedrooms: 2, bathrooms: 2, rentAmount: 95000, currency: 'AED', status: 'Occupied', notes: 'High floor, sea view', createdAt: d1, updatedAt: d1 },
    { id: 'unit-marina-1205', propertyId: 'prop-marina-heights', unitNumber: '1205', bedrooms: 1, bathrooms: 1, rentAmount: 72000, currency: 'AED', status: 'Vacant', notes: 'Recently renovated', createdAt: d1, updatedAt: d1 },
    { id: 'unit-marina-1802', propertyId: 'prop-marina-heights', unitNumber: '1802', bedrooms: 2, bathrooms: 2, rentAmount: 100000, currency: 'AED', status: 'Occupied', notes: 'Corner unit, panoramic view', createdAt: d1, updatedAt: d1 },
    { id: 'unit-jvc-a301', propertyId: 'prop-jvc-garden', unitNumber: 'A-301', bedrooms: 1, bathrooms: 1, rentAmount: 55000, currency: 'AED', status: 'Occupied', notes: null, createdAt: d1, updatedAt: d1 },
    { id: 'unit-jvc-a302', propertyId: 'prop-jvc-garden', unitNumber: 'A-302', bedrooms: 1, bathrooms: 1, rentAmount: 55000, currency: 'AED', status: 'Occupied', notes: null, createdAt: d1, updatedAt: d1 },
    { id: 'unit-alreem-905', propertyId: 'prop-alreem-tower', unitNumber: '905', bedrooms: 2, bathrooms: 2, rentAmount: 85000, currency: 'AED', status: 'Occupied', notes: null, createdAt: d1, updatedAt: d1 },
    { id: 'unit-alreem-906', propertyId: 'prop-alreem-tower', unitNumber: '906', bedrooms: 2, bathrooms: 2, rentAmount: 85000, currency: 'AED', status: 'Maintenance', notes: 'AC system replacement in progress', createdAt: d1, updatedAt: d1 },
  ]

  const tenants: Tenant[] = [
    { id: 'tenant-sarah-johnson', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com', phone: '+971 50 123 4567', preferredChannel: 'WebDashboard', unitId: 'unit-marina-1204', status: 'Active', notes: 'Long-term tenant, 3 years. Generally pays on time.', createdAt: d1, updatedAt: d1 },
    { id: 'tenant-omar-hassan', firstName: 'Omar', lastName: 'Hassan', email: 'omar.hassan@email.com', phone: '+971 55 987 6543', preferredChannel: 'WhatsApp', unitId: 'unit-marina-1802', status: 'Active', notes: null, createdAt: d1, updatedAt: d1 },
    { id: 'tenant-emily-carter', firstName: 'Emily', lastName: 'Carter', email: 'emily.carter@email.com', phone: '+971 52 345 6789', preferredChannel: 'WebDashboard', unitId: 'unit-jvc-a301', status: 'Active', notes: null, createdAt: d1, updatedAt: d1 },
    { id: 'tenant-daniel-lee', firstName: 'Daniel', lastName: 'Lee', email: 'daniel.lee@email.com', phone: '+971 56 789 0123', preferredChannel: 'WebDashboard', unitId: 'unit-jvc-a302', status: 'Active', notes: null, createdAt: d1, updatedAt: d1 },
    { id: 'tenant-fatima-ali', firstName: 'Fatima', lastName: 'Ali', email: 'fatima.ali@email.com', phone: '+971 50 444 5555', preferredChannel: 'WebDashboard', unitId: 'unit-alreem-905', status: 'Active', notes: null, createdAt: d1, updatedAt: d1 },
  ]

  const leases: Lease[] = [
    { id: 'lease-sarah-1204', tenantId: 'tenant-sarah-johnson', unitId: 'unit-marina-1204', startDate: '2024-01-01', endDate: '2024-12-31', rentAmount: 95000, currency: 'AED', securityDeposit: 9500, paymentFrequency: 'Annual', status: 'ExpiringSoon', notes: 'Renewal discussion pending', createdAt: d1, updatedAt: d1 },
    { id: 'lease-omar-1802', tenantId: 'tenant-omar-hassan', unitId: 'unit-marina-1802', startDate: '2024-03-01', endDate: '2025-02-28', rentAmount: 100000, currency: 'AED', securityDeposit: 10000, paymentFrequency: 'Annual', status: 'Active', notes: null, createdAt: d1, updatedAt: d1 },
    { id: 'lease-emily-a301', tenantId: 'tenant-emily-carter', unitId: 'unit-jvc-a301', startDate: '2024-04-01', endDate: '2025-03-31', rentAmount: 55000, currency: 'AED', securityDeposit: 5500, paymentFrequency: 'Annual', status: 'Active', notes: null, createdAt: d1, updatedAt: d1 },
    { id: 'lease-daniel-a302', tenantId: 'tenant-daniel-lee', unitId: 'unit-jvc-a302', startDate: '2023-12-01', endDate: '2024-11-30', rentAmount: 55000, currency: 'AED', securityDeposit: 5500, paymentFrequency: 'Annual', status: 'ExpiringSoon', notes: 'Tenant has not confirmed renewal intent', createdAt: d1, updatedAt: d1 },
    { id: 'lease-fatima-905', tenantId: 'tenant-fatima-ali', unitId: 'unit-alreem-905', startDate: '2024-02-01', endDate: '2025-01-31', rentAmount: 85000, currency: 'AED', securityDeposit: 8500, paymentFrequency: 'Annual', status: 'Active', notes: null, createdAt: d1, updatedAt: d1 },
  ]

  const tickets: Ticket[] = [
    { id: 'ticket-001', propertyId: 'prop-marina-heights', unitId: 'unit-marina-1204', tenantId: 'tenant-sarah-johnson', title: 'AC Unit Not Working — Unit 1204', description: "Tenant reports AC stopped working overnight. High urgency given UAE climate.", category: 'HVAC', urgency: 'High', status: 'InReview', sourceMessage: "Hi, the AC in unit 1204 stopped working last night and it's getting really hot. Can someone come today?", aiSummary: 'Tenant reports complete AC failure in unit 1204. HVAC technician required.', aiSuggestedResponse: null, assignedVendor: 'CoolTech HVAC Services', vendorType: 'HVAC Technician', dueDate: null, createdAt: d1, updatedAt: d1 },
    { id: 'ticket-002', propertyId: 'prop-jvc-garden', unitId: 'unit-jvc-a302', tenantId: 'tenant-daniel-lee', title: 'Bathroom Sink Leak — Unit A-302', description: "Tenant reports bathroom sink leaking for three days. Attempted self-repair made it worse.", category: 'Plumbing', urgency: 'Medium', status: 'Assigned', sourceMessage: "The bathroom sink in A-302 has been leaking for three days. I tried tightening it but it's worse now.", aiSummary: 'Persistent sink leak in unit A-302. Licensed plumber required.', aiSuggestedResponse: null, assignedVendor: 'ProPlumb Dubai', vendorType: 'Licensed Plumber', dueDate: null, createdAt: d1, updatedAt: d1 },
    { id: 'ticket-003', propertyId: 'prop-marina-heights', unitId: 'unit-marina-1802', tenantId: 'tenant-omar-hassan', title: 'Front Door Access Card Not Working', description: 'Access card for building entry not functioning. Repeated issue.', category: 'Access Control', urgency: 'Medium', status: 'New', sourceMessage: "The tenant at Marina Heights says the front door access card is not working again.", aiSummary: null, aiSuggestedResponse: null, assignedVendor: null, vendorType: null, dueDate: null, createdAt: d1, updatedAt: d1 },
    { id: 'ticket-004', propertyId: 'prop-alreem-tower', unitId: 'unit-alreem-905', tenantId: 'tenant-fatima-ali', title: 'EMERGENCY: Water Heater Leak — Kitchen', description: 'Water heater leaking and water spreading in kitchen. Immediate response required.', category: 'Emergency', urgency: 'Emergency', status: 'InReview', sourceMessage: 'The water heater is leaking and water is spreading in the kitchen.', aiSummary: 'Emergency water heater leak with active flooding in kitchen. Immediate plumber dispatch required.', aiSuggestedResponse: null, assignedVendor: null, vendorType: null, dueDate: null, createdAt: d2, updatedAt: d2 },
    { id: 'ticket-005', propertyId: 'prop-alreem-tower', unitId: 'unit-alreem-906', tenantId: null, title: 'Unit 906 AC System Replacement', description: 'Full AC system replacement in progress. Unit not available for lease until complete.', category: 'HVAC', urgency: 'Medium', status: 'WaitingOnVendor', sourceMessage: null, aiSummary: null, aiSuggestedResponse: null, assignedVendor: 'Gulf Cool Systems', vendorType: 'HVAC Contractor', dueDate: null, createdAt: d1, updatedAt: d1 },
  ]

  const activityLogs: ActivityLog[] = [
    { id: 'log-001', entityType: 'MaintenanceTicket', entityId: 'ticket-001', ticketId: 'ticket-001', action: 'Created', notes: 'Ticket created from AI triage', createdAt: d1 },
    { id: 'log-002', entityType: 'MaintenanceTicket', entityId: 'ticket-001', ticketId: 'ticket-001', action: 'StatusChanged', notes: 'Status: New → InReview', createdAt: d1 },
    { id: 'log-003', entityType: 'MaintenanceTicket', entityId: 'ticket-002', ticketId: 'ticket-002', action: 'Created', notes: 'Ticket created from AI triage', createdAt: d1 },
    { id: 'log-004', entityType: 'MaintenanceTicket', entityId: 'ticket-002', ticketId: 'ticket-002', action: 'StatusChanged', notes: 'Status: New → Assigned. Vendor: ProPlumb Dubai', createdAt: d1 },
    { id: 'log-005', entityType: 'MaintenanceTicket', entityId: 'ticket-004', ticketId: 'ticket-004', action: 'Created', notes: 'EMERGENCY ticket — immediate response required', createdAt: d2 },
  ]

  const communications: Communication[] = [
    {
      id: 'comm-001', channel: 'whatsapp', direction: 'inbound', status: 'new',
      fromNumber: '+971501234567', fromName: 'Sarah Johnson', toNumber: '+971800123456',
      body: 'Hi, the AC in unit 1204 stopped working last night and it\'s getting really hot. Can someone come today?',
      mediaUrl: null,
      aiCategory: 'Maintenance', aiUrgency: 'High',
      aiSummary: 'Tenant reports AC failure in unit 1204. HVAC technician required same-day.',
      aiDraftReply: 'Dear Sarah, thank you for reaching out. We have received your request and are arranging an HVAC technician to visit unit 1204 today. We will confirm the appointment time shortly. Apologies for the inconvenience.',
      relatedTenantId: 'tenant-sarah-johnson', relatedContactId: null, relatedTicketId: 'ticket-001',
      whatsappMessageId: 'wamid.HBgLOTcxNTAxMjM0NTY3FQIAERgSMzZBQzE2MzI0NTY3ODEA', threadId: 'thread-sarah-001',
      createdAt: '2026-05-07T08:23:00.000Z', updatedAt: '2026-05-07T08:23:00.000Z',
    },
    {
      id: 'comm-002', channel: 'whatsapp', direction: 'inbound', status: 'read',
      fromNumber: '+971559876543', fromName: 'Omar Hassan', toNumber: '+971800123456',
      body: 'Good morning! Just wanted to check - is there any update on the lease renewal for unit 1802? My current lease ends in February.',
      mediaUrl: null,
      aiCategory: 'Renewal', aiUrgency: 'Medium',
      aiSummary: 'Tenant enquiring about lease renewal status for unit 1802. Lease expires February 2025.',
      aiDraftReply: 'Good morning Omar! We are currently preparing the renewal offer for unit 1802. You can expect to receive the new tenancy contract proposal within the next 3-5 business days. Please feel free to reach out if you have any questions.',
      relatedTenantId: 'tenant-omar-hassan', relatedContactId: null, relatedTicketId: null,
      whatsappMessageId: 'wamid.HBgLOTcxNTU5ODc2NTQzFQIAERgSMzZBQzE2MzI0NTY3ODEB', threadId: 'thread-omar-001',
      createdAt: '2026-05-07T09:45:00.000Z', updatedAt: '2026-05-07T09:47:00.000Z',
    },
    {
      id: 'comm-003', channel: 'whatsapp', direction: 'outbound', status: 'replied',
      fromNumber: '+971800123456', fromName: 'HomeFlow', toNumber: '+971559876543',
      body: 'Good morning Omar! We are currently preparing the renewal offer for unit 1802. You can expect to receive the new tenancy contract proposal within the next 3-5 business days. Please feel free to reach out if you have any questions.',
      mediaUrl: null,
      aiCategory: null, aiUrgency: null, aiSummary: null, aiDraftReply: null,
      relatedTenantId: 'tenant-omar-hassan', relatedContactId: null, relatedTicketId: null,
      whatsappMessageId: 'wamid.HBgLOTcxNTU5ODc2NTQzFQIAERgSMzZBQzE2MzI0NTY3ODEC', threadId: 'thread-omar-001',
      createdAt: '2026-05-07T10:02:00.000Z', updatedAt: '2026-05-07T10:02:00.000Z',
    },
    {
      id: 'comm-004', channel: 'whatsapp', direction: 'inbound', status: 'new',
      fromNumber: '+971524445555', fromName: null, toNumber: '+971800123456',
      body: 'Hello, I saw your listing for a 2BR in Dubai Marina. Is unit 1205 still available? What is the rent?',
      mediaUrl: null,
      aiCategory: 'Lease', aiUrgency: 'Low',
      aiSummary: 'Prospective tenant enquiring about 2BR unit 1205 in Dubai Marina. Rental enquiry.',
      aiDraftReply: 'Hello! Thank you for your interest in our Marina Heights property. Unit 1205 is a recently renovated 1-bedroom (not 2BR) available at AED 72,000/year. Would you like to schedule a viewing? Please let me know your preferred date and time.',
      relatedTenantId: null, relatedContactId: 'contact-lead-001', relatedTicketId: null,
      whatsappMessageId: 'wamid.HBgLOTcxNTI0NDQ1NTU1FQIAERgSMzZBQzE2MzI0NTY3ODED', threadId: 'thread-lead-001',
      createdAt: '2026-05-07T11:30:00.000Z', updatedAt: '2026-05-07T11:30:00.000Z',
    },
    {
      id: 'comm-005', channel: 'whatsapp', direction: 'inbound', status: 'new',
      fromNumber: '+971504445566', fromName: 'Fatima Ali', toNumber: '+971800123456',
      body: 'URGENT! There is water leaking from the ceiling in my kitchen. It is getting worse. Please send someone immediately!',
      mediaUrl: null,
      aiCategory: 'Emergency', aiUrgency: 'Emergency',
      aiSummary: 'EMERGENCY: Active water leak from ceiling in unit 905, Al Reem Tower. Immediate plumber dispatch required.',
      aiDraftReply: 'Fatima, we have received your emergency message. We are contacting a licensed plumber right now and they will be with you within the hour. As a precaution, please turn off the water supply valve under your kitchen sink. We will keep you updated every 15 minutes.',
      relatedTenantId: 'tenant-fatima-ali', relatedContactId: null, relatedTicketId: 'ticket-004',
      whatsappMessageId: 'wamid.HBgLOTcxNTA0NDQ1NTY2FQIAERgSMzZBQzE2MzI0NTY3ODEE', threadId: 'thread-fatima-001',
      createdAt: '2026-05-08T07:15:00.000Z', updatedAt: '2026-05-08T07:15:00.000Z',
    },
  ]

  const callLogs: CallLog[] = [
    {
      id: 'call-001', status: 'completed', direction: 'inbound',
      fromNumber: '+971523456789', toNumber: '+971800123456',
      callerName: 'Emily Carter', durationSeconds: 187,
      recordingUrl: null,
      transcription: 'Hi, this is Emily from unit A-301 in JVC. I just wanted to follow up on the bathroom sink repair. The plumber was supposed to come yesterday but no one showed up. I have been waiting all day. Can you please check what happened and let me know when they will reschedule?',
      aiSummary: 'Tenant Emily Carter (Unit A-301, JVC) called to follow up on missed plumber appointment for bathroom sink repair. Plumber no-show yesterday. Requesting reschedule.',
      aiActionItems: ['Contact ProPlumb Dubai to reschedule repair for unit A-301', 'Call Emily back to confirm new appointment time', 'Update ticket-002 with no-show note'],
      relatedTenantId: 'tenant-emily-carter', relatedContactId: null,
      twilioCallSid: 'CA1234567890abcdef1234567890abcdef',
      startedAt: '2026-05-07T14:30:00.000Z', endedAt: '2026-05-07T14:33:07.000Z',
      createdAt: '2026-05-07T14:33:07.000Z',
    },
    {
      id: 'call-002', status: 'completed', direction: 'inbound',
      fromNumber: '+971567890123', toNumber: '+971800123456',
      callerName: 'Daniel Lee', durationSeconds: 94,
      recordingUrl: null,
      transcription: 'Yes hello, I am calling about my lease renewal. My lease for unit A-302 expires in November. I want to renew but I heard there might be a rent increase. What is the new rate going to be? I would like to discuss before I make a decision.',
      aiSummary: 'Tenant Daniel Lee (Unit A-302, JVC) calling about lease renewal. Lease expires November 2024. Concerned about potential rent increase. Wants to negotiate before committing.',
      aiActionItems: ['Review current market rate for A-302 comparable units in JVC', 'Prepare renewal offer with rent options', 'Schedule callback with Daniel to discuss terms'],
      relatedTenantId: 'tenant-daniel-lee', relatedContactId: null,
      twilioCallSid: 'CA2345678901bcdef0123456789abcdef1',
      startedAt: '2026-05-07T16:10:00.000Z', endedAt: '2026-05-07T16:11:34.000Z',
      createdAt: '2026-05-07T16:11:34.000Z',
    },
    {
      id: 'call-003', status: 'missed', direction: 'inbound',
      fromNumber: '+971509998877', toNumber: '+971800123456',
      callerName: null, durationSeconds: 0,
      recordingUrl: null, transcription: null, aiSummary: null, aiActionItems: null,
      relatedTenantId: null, relatedContactId: null,
      twilioCallSid: 'CA3456789012cdef01234567890abcdef2',
      startedAt: '2026-05-07T18:45:00.000Z', endedAt: '2026-05-07T18:45:00.000Z',
      createdAt: '2026-05-07T18:45:00.000Z',
    },
    {
      id: 'call-004', status: 'completed', direction: 'inbound',
      fromNumber: '+971528887766', toNumber: '+971800123456',
      callerName: 'Ahmed Al-Rashidi', durationSeconds: 312,
      recordingUrl: null,
      transcription: 'Good morning. My name is Ahmed Al-Rashidi, I am interested in buying a 2 bedroom apartment in Dubai Marina. I have a budget of about 1.8 million dirhams. Do you have anything available? I would prefer a sea view and ideally on a higher floor. I am ready to move quickly if the right property comes up.',
      aiSummary: 'Buyer lead Ahmed Al-Rashidi seeking 2BR in Dubai Marina. Budget AED 1.8M. Preferences: sea view, high floor. Motivated buyer.',
      aiActionItems: ['Add Ahmed as a buyer contact with budget AED 1.8M', 'Check available 2BR Marina units in portfolio and network', 'Schedule property viewing'],
      relatedTenantId: null, relatedContactId: 'contact-buyer-001',
      twilioCallSid: 'CA4567890123def012345678901abcdef3',
      startedAt: '2026-05-08T09:20:00.000Z', endedAt: '2026-05-08T09:25:12.000Z',
      createdAt: '2026-05-08T09:25:12.000Z',
    },
  ]

  const contacts: Contact[] = [
    {
      id: 'contact-lead-001', firstName: 'Khalid', lastName: 'Al-Mansouri',
      email: null, phone: '+971524445555', whatsappNumber: '+971524445555',
      contactType: 'prospect_tenant', leadStatus: 'new',
      propertyInterest: 'Marina Heights — 1BR unit 1205', budgetAed: 72000,
      notes: 'Enquired via WhatsApp about unit 1205. Appears to be looking for 2BR but unit is 1BR.',
      createdAt: '2026-05-07T11:30:00.000Z', updatedAt: '2026-05-07T11:30:00.000Z',
    },
    {
      id: 'contact-buyer-001', firstName: 'Ahmed', lastName: 'Al-Rashidi',
      email: null, phone: '+971528887766', whatsappNumber: null,
      contactType: 'buyer', leadStatus: 'contacted',
      propertyInterest: '2BR Dubai Marina — sea view, high floor', budgetAed: 1800000,
      notes: 'Motivated buyer, ready to move quickly. Called in. Budget AED 1.8M.',
      createdAt: '2026-05-08T09:25:12.000Z', updatedAt: '2026-05-08T09:25:12.000Z',
    },
    {
      id: 'contact-seller-001', firstName: 'Rania', lastName: 'Khalil',
      email: 'rania.khalil@email.com', phone: '+971501112233', whatsappNumber: '+971501112233',
      contactType: 'seller', leadStatus: 'qualified',
      propertyInterest: 'Selling 3BR villa in Jumeirah', budgetAed: null,
      notes: 'Owner wants to sell her Jumeirah villa. Asking around AED 3.5M. Spoke by phone and WhatsApp.',
      createdAt: '2026-05-06T15:00:00.000Z', updatedAt: '2026-05-06T15:00:00.000Z',
    },
    {
      id: 'contact-landlord-001', firstName: 'Mohammed', lastName: 'Al-Farsi',
      email: 'mfarsi@business.ae', phone: '+971504443322', whatsappNumber: '+971504443322',
      contactType: 'landlord', leadStatus: 'contacted',
      propertyInterest: '12-unit building in Al Barsha, looking for management', budgetAed: null,
      notes: 'Portfolio owner looking for property management services. Has 12 units. High-value lead.',
      createdAt: '2026-05-05T11:00:00.000Z', updatedAt: '2026-05-05T11:00:00.000Z',
    },
  ]

  return { properties, units, tenants, leases, tickets, activityLogs, requests: [], communications, callLogs, contacts }
}

function getStore(): Store {
  if (!g.__pcStore) g.__pcStore = buildSeedData()
  return g.__pcStore
}

export { getStore }

// ─── Properties ────────────────────────────────────────────────────────────

function propertyWithIncludes(p: Property, s: Store) {
  const units = s.units.filter(u => u.propertyId === p.id).map(u => ({
    ...u,
    tenants: s.tenants.filter(t => t.unitId === u.id),
  }))
  return {
    ...p,
    units,
    _count: {
      units: units.length,
      tickets: s.tickets.filter(t => t.propertyId === p.id).length,
    },
  }
}

export function getProperties() {
  const s = getStore()
  return [...s.properties].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(p => propertyWithIncludes(p, s))
}

export function getPropertyById(id: string) {
  const s = getStore()
  const p = s.properties.find(x => x.id === id)
  if (!p) return null
  const units = s.units.filter(u => u.propertyId === id).map(u => ({
    ...u,
    tenants: s.tenants.filter(t => t.unitId === u.id),
    leases: s.leases.filter(l => l.unitId === u.id && ['Active', 'ExpiringSoon'].includes(l.status)),
  }))
  return {
    ...p,
    units,
    tickets: s.tickets.filter(t => t.propertyId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
  }
}

export function createProperty(data: Partial<Property>): Property {
  const s = getStore()
  const p: Property = {
    id: uid(), name: data.name!, address: data.address!, emirate: data.emirate || 'Dubai',
    area: data.area!, propertyType: data.propertyType || 'Apartment', status: data.status || 'Active',
    notes: data.notes || null, ownerUserId: data.ownerUserId || null,
    createdAt: nowIso(), updatedAt: nowIso(),
  }
  s.properties.unshift(p)
  return p
}

export function updateProperty(id: string, data: Partial<Property>): Property | null {
  const s = getStore()
  const idx = s.properties.findIndex(x => x.id === id)
  if (idx < 0) return null
  s.properties[idx] = { ...s.properties[idx], ...data, id, updatedAt: nowIso() }
  return s.properties[idx]
}

export function deleteProperty(id: string): boolean {
  const s = getStore()
  const idx = s.properties.findIndex(x => x.id === id)
  if (idx < 0) return false
  s.properties.splice(idx, 1)
  return true
}

// ─── Units ─────────────────────────────────────────────────────────────────

function unitWithIncludes(u: Unit, s: Store) {
  const prop = s.properties.find(p => p.id === u.propertyId)
  return {
    ...u,
    property: prop ? { id: prop.id, name: prop.name } : null,
    tenants: s.tenants.filter(t => t.unitId === u.id && t.status === 'Active'),
    leases: s.leases.filter(l => l.unitId === u.id && ['Active', 'ExpiringSoon'].includes(l.status)).sort((a, b) => a.endDate.localeCompare(b.endDate)),
    _count: { tickets: s.tickets.filter(t => t.unitId === u.id).length },
  }
}

export function getUnits(propertyId?: string) {
  const s = getStore()
  const filtered = propertyId ? s.units.filter(u => u.propertyId === propertyId) : s.units
  return filtered
    .sort((a, b) => {
      const pa = s.properties.find(p => p.id === a.propertyId)?.name || ''
      const pb = s.properties.find(p => p.id === b.propertyId)?.name || ''
      return pa.localeCompare(pb) || a.unitNumber.localeCompare(b.unitNumber)
    })
    .map(u => unitWithIncludes(u, s))
}

export function getUnitById(id: string) {
  const s = getStore()
  const u = s.units.find(x => x.id === id)
  if (!u) return null
  const prop = s.properties.find(p => p.id === u.propertyId)
  return {
    ...u,
    property: prop || null,
    tenants: s.tenants.filter(t => t.unitId === id),
    leases: s.leases.filter(l => l.unitId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    tickets: s.tickets.filter(t => t.unitId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
  }
}

export function createUnit(data: Partial<Unit>): Unit {
  const s = getStore()
  const u: Unit = {
    id: uid(), propertyId: data.propertyId!, unitNumber: data.unitNumber!,
    bedrooms: data.bedrooms || 1, bathrooms: data.bathrooms || 1,
    rentAmount: data.rentAmount || 0, currency: data.currency || 'AED',
    status: data.status || 'Vacant', notes: data.notes || null,
    createdAt: nowIso(), updatedAt: nowIso(),
  }
  s.units.push(u)
  return u
}

export function updateUnit(id: string, data: Partial<Unit>): Unit | null {
  const s = getStore()
  const idx = s.units.findIndex(x => x.id === id)
  if (idx < 0) return null
  s.units[idx] = { ...s.units[idx], ...data, id, updatedAt: nowIso() }
  return s.units[idx]
}

export function deleteUnit(id: string): boolean {
  const s = getStore()
  const idx = s.units.findIndex(x => x.id === id)
  if (idx < 0) return false
  s.units.splice(idx, 1)
  return true
}

// ─── Tenants ───────────────────────────────────────────────────────────────

function tenantWithIncludes(t: Tenant, s: Store) {
  const unit = t.unitId ? s.units.find(u => u.id === t.unitId) : null
  const prop = unit ? s.properties.find(p => p.id === unit.propertyId) : null
  return {
    ...t,
    unit: unit ? { ...unit, property: prop ? { id: prop.id, name: prop.name } : null } : null,
    leases: s.leases.filter(l => l.tenantId === t.id && ['Active', 'ExpiringSoon'].includes(l.status)).sort((a, b) => a.endDate.localeCompare(b.endDate)),
    _count: { tickets: s.tickets.filter(tk => tk.tenantId === t.id).length },
  }
}

export function getTenants() {
  const s = getStore()
  return [...s.tenants].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(t => tenantWithIncludes(t, s))
}

export function getTenantById(id: string) {
  const s = getStore()
  const t = s.tenants.find(x => x.id === id)
  if (!t) return null
  const unit = t.unitId ? s.units.find(u => u.id === t.unitId) : null
  const prop = unit ? s.properties.find(p => p.id === unit.propertyId) : null
  return {
    ...t,
    unit: unit ? { ...unit, property: prop || null } : null,
    leases: s.leases.filter(l => l.tenantId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    tickets: s.tickets.filter(tk => tk.tenantId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
  }
}

export function createTenant(data: Partial<Tenant>): Tenant {
  const s = getStore()
  const t: Tenant = {
    id: uid(), firstName: data.firstName!, lastName: data.lastName!,
    email: data.email || null, phone: data.phone || null,
    preferredChannel: data.preferredChannel || 'WebDashboard',
    unitId: data.unitId || null, status: data.status || 'Active', notes: data.notes || null,
    createdAt: nowIso(), updatedAt: nowIso(),
  }
  s.tenants.unshift(t)
  return t
}

export function updateTenant(id: string, data: Partial<Tenant>): Tenant | null {
  const s = getStore()
  const idx = s.tenants.findIndex(x => x.id === id)
  if (idx < 0) return null
  s.tenants[idx] = { ...s.tenants[idx], ...data, id, updatedAt: nowIso() }
  return s.tenants[idx]
}

export function deleteTenant(id: string): boolean {
  const s = getStore()
  const idx = s.tenants.findIndex(x => x.id === id)
  if (idx < 0) return false
  s.tenants.splice(idx, 1)
  return true
}

// ─── Leases ────────────────────────────────────────────────────────────────

function leaseWithIncludes(l: Lease, s: Store) {
  const tenant = s.tenants.find(t => t.id === l.tenantId)
  const unit = s.units.find(u => u.id === l.unitId)
  const prop = unit ? s.properties.find(p => p.id === unit.propertyId) : null
  return {
    ...l,
    tenant: tenant ? { id: tenant.id, firstName: tenant.firstName, lastName: tenant.lastName, email: tenant.email } : null,
    unit: unit ? { ...unit, property: prop ? { id: prop.id, name: prop.name } : null } : null,
  }
}

export function getLeases() {
  const s = getStore()
  return [...s.leases].sort((a, b) => a.endDate.localeCompare(b.endDate))
    .map(l => leaseWithIncludes(l, s))
}

export function getLeaseById(id: string) {
  const s = getStore()
  const l = s.leases.find(x => x.id === id)
  if (!l) return null
  const tenant = s.tenants.find(t => t.id === l.tenantId)
  const unit = s.units.find(u => u.id === l.unitId)
  const prop = unit ? s.properties.find(p => p.id === unit.propertyId) : null
  return { ...l, tenant: tenant || null, unit: unit ? { ...unit, property: prop || null } : null }
}

export function createLease(data: Partial<Lease>): Lease {
  const s = getStore()
  const l: Lease = {
    id: uid(), tenantId: data.tenantId!, unitId: data.unitId!,
    startDate: data.startDate!, endDate: data.endDate!,
    rentAmount: data.rentAmount!, currency: data.currency || 'AED',
    securityDeposit: data.securityDeposit || 0,
    paymentFrequency: data.paymentFrequency || 'Annual',
    status: data.status || 'Active', notes: data.notes || null,
    createdAt: nowIso(), updatedAt: nowIso(),
  }
  s.leases.push(l)
  // mark unit occupied
  const uidx = s.units.findIndex(u => u.id === l.unitId)
  if (uidx >= 0) s.units[uidx] = { ...s.units[uidx], status: 'Occupied', updatedAt: nowIso() }
  return l
}

export function updateLease(id: string, data: Partial<Lease>): Lease | null {
  const s = getStore()
  const idx = s.leases.findIndex(x => x.id === id)
  if (idx < 0) return null
  s.leases[idx] = { ...s.leases[idx], ...data, id, updatedAt: nowIso() }
  return s.leases[idx]
}

export function deleteLease(id: string): boolean {
  const s = getStore()
  const idx = s.leases.findIndex(x => x.id === id)
  if (idx < 0) return false
  s.leases.splice(idx, 1)
  return true
}

// ─── Tickets ───────────────────────────────────────────────────────────────

function ticketWithIncludes(t: Ticket, s: Store) {
  const prop = t.propertyId ? s.properties.find(p => p.id === t.propertyId) : null
  const unit = t.unitId ? s.units.find(u => u.id === t.unitId) : null
  const tenant = t.tenantId ? s.tenants.find(tn => tn.id === t.tenantId) : null
  return {
    ...t,
    property: prop ? { id: prop.id, name: prop.name } : null,
    unit: unit ? { id: unit.id, unitNumber: unit.unitNumber } : null,
    tenant: tenant ? { id: tenant.id, firstName: tenant.firstName, lastName: tenant.lastName } : null,
  }
}

export function getTickets(filters?: { urgency?: string; status?: string; propertyId?: string }) {
  const s = getStore()
  const urgencyOrder: Record<string, number> = { Emergency: 0, High: 1, Medium: 2, Low: 3 }
  return s.tickets
    .filter(t => {
      if (filters?.urgency && t.urgency !== filters.urgency) return false
      if (filters?.status && t.status !== filters.status) return false
      if (filters?.propertyId && t.propertyId !== filters.propertyId) return false
      return true
    })
    .sort((a, b) => (urgencyOrder[a.urgency] ?? 9) - (urgencyOrder[b.urgency] ?? 9) || b.createdAt.localeCompare(a.createdAt))
    .map(t => ticketWithIncludes(t, s))
}

export function getTicketById(id: string) {
  const s = getStore()
  const t = s.tickets.find(x => x.id === id)
  if (!t) return null
  const prop = t.propertyId ? s.properties.find(p => p.id === t.propertyId) : null
  const unit = t.unitId ? s.units.find(u => u.id === t.unitId) : null
  const tenant = t.tenantId ? s.tenants.find(tn => tn.id === t.tenantId) : null
  return {
    ...t,
    property: prop || null,
    unit: unit || null,
    tenant: tenant || null,
    activityLogs: s.activityLogs.filter(l => l.ticketId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }
}

export function createTicket(data: Partial<Ticket>): Ticket {
  const s = getStore()
  const t: Ticket = {
    id: uid(), propertyId: data.propertyId || null, unitId: data.unitId || null,
    tenantId: data.tenantId || null, title: data.title!, description: data.description || null,
    category: data.category || 'Maintenance', urgency: data.urgency || 'Medium',
    status: data.status || 'New', sourceMessage: data.sourceMessage || null,
    aiSummary: data.aiSummary || null, aiSuggestedResponse: data.aiSuggestedResponse || null,
    assignedVendor: data.assignedVendor || null, vendorType: data.vendorType || null,
    dueDate: data.dueDate || null, createdAt: nowIso(), updatedAt: nowIso(),
  }
  s.tickets.unshift(t)
  s.activityLogs.unshift({ id: uid(), entityType: 'MaintenanceTicket', entityId: t.id, ticketId: t.id, action: 'Created', notes: `Ticket created with urgency: ${t.urgency}`, createdAt: t.createdAt })
  return t
}

export function updateTicket(id: string, data: Partial<Ticket>): Ticket | null {
  const s = getStore()
  const idx = s.tickets.findIndex(x => x.id === id)
  if (idx < 0) return null
  const prev = s.tickets[idx]
  s.tickets[idx] = { ...prev, ...data, id, updatedAt: nowIso() }
  if (data.status && data.status !== prev.status) {
    s.activityLogs.unshift({ id: uid(), entityType: 'MaintenanceTicket', entityId: id, ticketId: id, action: 'StatusChanged', notes: `Status changed from ${prev.status} to ${data.status}`, createdAt: nowIso() })
  }
  return s.tickets[idx]
}

export function deleteTicket(id: string): boolean {
  const s = getStore()
  const idx = s.tickets.findIndex(x => x.id === id)
  if (idx < 0) return false
  s.tickets.splice(idx, 1)
  s.activityLogs = s.activityLogs.filter(l => l.ticketId !== id)
  return true
}

// ─── Requests ──────────────────────────────────────────────────────────────

export function getRequests() {
  const s = getStore()
  return [...s.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50)
    .map(r => {
      const prop = r.relatedPropertyId ? s.properties.find(p => p.id === r.relatedPropertyId) : null
      const unit = r.relatedUnitId ? s.units.find(u => u.id === r.relatedUnitId) : null
      const tenant = r.relatedTenantId ? s.tenants.find(t => t.id === r.relatedTenantId) : null
      const ticket = r.createdTicketId ? s.tickets.find(t => t.id === r.createdTicketId) : null
      return {
        ...r,
        relatedProperty: prop ? { id: prop.id, name: prop.name } : null,
        relatedUnit: unit ? { id: unit.id, unitNumber: unit.unitNumber } : null,
        relatedTenant: tenant ? { id: tenant.id, firstName: tenant.firstName, lastName: tenant.lastName } : null,
        createdTicket: ticket ? { id: ticket.id, title: ticket.title, status: ticket.status } : null,
      }
    })
}

export function createRequest(data: Partial<Request>): Request {
  const s = getStore()
  const r: Request = {
    id: uid(), senderType: data.senderType!, senderName: data.senderName || null,
    senderEmail: data.senderEmail || null, senderPhone: data.senderPhone || null,
    channel: data.channel!, rawMessage: data.rawMessage!, category: data.category || null,
    urgency: data.urgency || null, extractedSummary: data.extractedSummary || null,
    extractedDetailsJson: data.extractedDetailsJson || null, suggestedActionsJson: data.suggestedActionsJson || null,
    draftResponse: data.draftResponse || null, complianceNotes: data.complianceNotes || null,
    relatedPropertyId: data.relatedPropertyId || null, relatedUnitId: data.relatedUnitId || null,
    relatedTenantId: data.relatedTenantId || null, createdTicketId: data.createdTicketId || null,
    createdAt: nowIso(),
  }
  s.requests.unshift(r)
  return r
}

// ─── Communications ────────────────────────────────────────────────────────

export function getCommunications(filters?: { channel?: string; status?: string; tenantId?: string; contactId?: string }) {
  const s = getStore()
  return s.communications
    .filter(c => {
      if (filters?.channel && c.channel !== filters.channel) return false
      if (filters?.status && c.status !== filters.status) return false
      if (filters?.tenantId && c.relatedTenantId !== filters.tenantId) return false
      if (filters?.contactId && c.relatedContactId !== filters.contactId) return false
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(c => enrichCommunication(c, s))
}

function enrichCommunication(c: Communication, s: Store) {
  const tenant = c.relatedTenantId ? s.tenants.find(t => t.id === c.relatedTenantId) : null
  const contact = c.relatedContactId ? s.contacts.find(ct => ct.id === c.relatedContactId) : null
  const ticket = c.relatedTicketId ? s.tickets.find(t => t.id === c.relatedTicketId) : null
  return {
    ...c,
    relatedTenant: tenant ? { id: tenant.id, firstName: tenant.firstName, lastName: tenant.lastName, phone: tenant.phone } : null,
    relatedContact: contact ? { id: contact.id, firstName: contact.firstName, lastName: contact.lastName, contactType: contact.contactType } : null,
    relatedTicket: ticket ? { id: ticket.id, title: ticket.title, status: ticket.status } : null,
  }
}

export function getCommunicationById(id: string) {
  const s = getStore()
  const c = s.communications.find(x => x.id === id)
  if (!c) return null
  return enrichCommunication(c, s)
}

export function getCommunicationsByThread(threadId: string) {
  const s = getStore()
  return s.communications
    .filter(c => c.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(c => enrichCommunication(c, s))
}

export function createCommunication(data: Partial<Communication>): Communication {
  const s = getStore()
  const c: Communication = {
    id: uid(), channel: data.channel!, direction: data.direction || 'inbound',
    status: data.status || 'new', fromNumber: data.fromNumber || null,
    fromName: data.fromName || null, toNumber: data.toNumber || null,
    body: data.body!, mediaUrl: data.mediaUrl || null,
    aiCategory: data.aiCategory || null, aiUrgency: data.aiUrgency || null,
    aiSummary: data.aiSummary || null, aiDraftReply: data.aiDraftReply || null,
    relatedTenantId: data.relatedTenantId || null, relatedContactId: data.relatedContactId || null,
    relatedTicketId: data.relatedTicketId || null,
    whatsappMessageId: data.whatsappMessageId || null, threadId: data.threadId || null,
    createdAt: nowIso(), updatedAt: nowIso(),
  }
  s.communications.unshift(c)
  return c
}

export function updateCommunication(id: string, data: Partial<Communication>): Communication | null {
  const s = getStore()
  const idx = s.communications.findIndex(x => x.id === id)
  if (idx < 0) return null
  s.communications[idx] = { ...s.communications[idx], ...data, id, updatedAt: nowIso() }
  return s.communications[idx]
}

// ─── Call Logs ─────────────────────────────────────────────────────────────

function enrichCallLog(c: CallLog, s: Store) {
  const tenant = c.relatedTenantId ? s.tenants.find(t => t.id === c.relatedTenantId) : null
  const contact = c.relatedContactId ? s.contacts.find(ct => ct.id === c.relatedContactId) : null
  return {
    ...c,
    relatedTenant: tenant ? { id: tenant.id, firstName: tenant.firstName, lastName: tenant.lastName } : null,
    relatedContact: contact ? { id: contact.id, firstName: contact.firstName, lastName: contact.lastName, contactType: contact.contactType } : null,
  }
}

export function getCallLogs(filters?: { status?: string; direction?: string; tenantId?: string }) {
  const s = getStore()
  return s.callLogs
    .filter(c => {
      if (filters?.status && c.status !== filters.status) return false
      if (filters?.direction && c.direction !== filters.direction) return false
      if (filters?.tenantId && c.relatedTenantId !== filters.tenantId) return false
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(c => enrichCallLog(c, s))
}

export function getCallLogById(id: string) {
  const s = getStore()
  const c = s.callLogs.find(x => x.id === id)
  if (!c) return null
  return enrichCallLog(c, s)
}

export function createCallLog(data: Partial<CallLog>): CallLog {
  const s = getStore()
  const c: CallLog = {
    id: uid(), status: data.status || 'completed', direction: data.direction || 'inbound',
    fromNumber: data.fromNumber!, toNumber: data.toNumber!,
    callerName: data.callerName || null, durationSeconds: data.durationSeconds || null,
    recordingUrl: data.recordingUrl || null, transcription: data.transcription || null,
    aiSummary: data.aiSummary || null, aiActionItems: data.aiActionItems || null,
    relatedTenantId: data.relatedTenantId || null, relatedContactId: data.relatedContactId || null,
    twilioCallSid: data.twilioCallSid || null,
    startedAt: data.startedAt || nowIso(), endedAt: data.endedAt || null, createdAt: nowIso(),
  }
  s.callLogs.unshift(c)
  return c
}

export function updateCallLog(id: string, data: Partial<CallLog>): CallLog | null {
  const s = getStore()
  const idx = s.callLogs.findIndex(x => x.id === id)
  if (idx < 0) return null
  s.callLogs[idx] = { ...s.callLogs[idx], ...data, id }
  return s.callLogs[idx]
}

// ─── Contacts ──────────────────────────────────────────────────────────────

export function getContacts(filters?: { contactType?: string; leadStatus?: string }) {
  const s = getStore()
  return s.contacts
    .filter(c => {
      if (filters?.contactType && c.contactType !== filters.contactType) return false
      if (filters?.leadStatus && c.leadStatus !== filters.leadStatus) return false
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(c => enrichContact(c, s))
}

function enrichContact(c: Contact, s: Store) {
  const recentComms = s.communications
    .filter(m => m.relatedContactId === c.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
  const recentCalls = s.callLogs
    .filter(cl => cl.relatedContactId === c.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
  return { ...c, recentComms, recentCalls }
}

export function getContactById(id: string) {
  const s = getStore()
  const c = s.contacts.find(x => x.id === id)
  if (!c) return null
  return enrichContact(c, s)
}

export function createContact(data: Partial<Contact>): Contact {
  const s = getStore()
  const c: Contact = {
    id: uid(), firstName: data.firstName!, lastName: data.lastName!,
    email: data.email || null, phone: data.phone || null,
    whatsappNumber: data.whatsappNumber || null,
    contactType: data.contactType || 'other', leadStatus: data.leadStatus || 'new',
    propertyInterest: data.propertyInterest || null, budgetAed: data.budgetAed || null,
    notes: data.notes || null, createdAt: nowIso(), updatedAt: nowIso(),
  }
  s.contacts.unshift(c)
  return c
}

export function updateContact(id: string, data: Partial<Contact>): Contact | null {
  const s = getStore()
  const idx = s.contacts.findIndex(x => x.id === id)
  if (idx < 0) return null
  s.contacts[idx] = { ...s.contacts[idx], ...data, id, updatedAt: nowIso() }
  return s.contacts[idx]
}

export function deleteContact(id: string): boolean {
  const s = getStore()
  const idx = s.contacts.findIndex(x => x.id === id)
  if (idx < 0) return false
  s.contacts.splice(idx, 1)
  return true
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export function getDashboardStats() {
  const s = getStore()
  const recentTickets = [...s.tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(t => ticketWithIncludes(t, s))
  const recentRequests = [...s.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(r => {
    const prop = r.relatedPropertyId ? s.properties.find(p => p.id === r.relatedPropertyId) : null
    const tenant = r.relatedTenantId ? s.tenants.find(t => t.id === r.relatedTenantId) : null
    return { ...r, relatedProperty: prop ? { name: prop.name } : null, relatedTenant: tenant ? { firstName: tenant.firstName, lastName: tenant.lastName } : null }
  })
  const recentComms = [...s.communications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(c => enrichCommunication(c, s))
  return {
    stats: {
      properties: s.properties.length,
      units: s.units.length,
      activeTenants: s.tenants.filter(t => t.status === 'Active').length,
      activeLeases: s.leases.filter(l => ['Active', 'ExpiringSoon'].includes(l.status)).length,
      openTickets: s.tickets.filter(t => !['Completed', 'Cancelled'].includes(t.status)).length,
      urgentTickets: s.tickets.filter(t => ['High', 'Emergency'].includes(t.urgency) && !['Completed', 'Cancelled'].includes(t.status)).length,
      unreadMessages: s.communications.filter(c => c.status === 'new' && c.direction === 'inbound').length,
      totalContacts: s.contacts.length,
      missedCalls: s.callLogs.filter(c => c.status === 'missed').length,
    },
    recentTickets,
    recentRequests,
    recentComms,
  }
}

// ─── Context lookups (for AI triage) ─────────────────────────────────────

export function getPropertyName(id: string): string | undefined {
  return getStore().properties.find(p => p.id === id)?.name
}

export function getUnitNumber(id: string): string | undefined {
  return getStore().units.find(u => u.id === id)?.unitNumber
}

export function getTenantContext(tenantId: string): { name: string; leaseStatus?: string; leaseEndDate?: string } | undefined {
  const s = getStore()
  const t = s.tenants.find(x => x.id === tenantId)
  if (!t) return undefined
  const lease = s.leases.filter(l => l.tenantId === tenantId && ['Active', 'ExpiringSoon'].includes(l.status)).sort((a, b) => a.endDate.localeCompare(b.endDate))[0]
  return { name: `${t.firstName} ${t.lastName}`, leaseStatus: lease?.status, leaseEndDate: lease?.endDate }
}
