// In-memory data store — no external database required
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

  return { properties, units, tenants, leases, tickets, activityLogs, requests: [] }
}

function getStore(): Store {
  if (!g.__pcStore) g.__pcStore = buildSeedData()
  return g.__pcStore
}

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

// ─── Dashboard ─────────────────────────────────────────────────────────────

export function getDashboardStats() {
  const s = getStore()
  const recentTickets = [...s.tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(t => ticketWithIncludes(t, s))
  const recentRequests = [...s.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map(r => {
    const prop = r.relatedPropertyId ? s.properties.find(p => p.id === r.relatedPropertyId) : null
    const tenant = r.relatedTenantId ? s.tenants.find(t => t.id === r.relatedTenantId) : null
    return { ...r, relatedProperty: prop ? { name: prop.name } : null, relatedTenant: tenant ? { firstName: tenant.firstName, lastName: tenant.lastName } : null }
  })
  return {
    stats: {
      properties: s.properties.length,
      units: s.units.length,
      activeTenants: s.tenants.filter(t => t.status === 'Active').length,
      activeLeases: s.leases.filter(l => ['Active', 'ExpiringSoon'].includes(l.status)).length,
      openTickets: s.tickets.filter(t => !['Completed', 'Cancelled'].includes(t.status)).length,
      urgentTickets: s.tickets.filter(t => ['High', 'Emergency'].includes(t.urgency) && !['Completed', 'Cancelled'].includes(t.status)).length,
    },
    recentTickets,
    recentRequests,
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
