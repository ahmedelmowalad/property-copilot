// Property Copilot — Shared Types

export type PropertyType = 'Apartment' | 'Villa' | 'Townhouse' | 'Studio' | 'ResidentialBuilding' | 'Other'
export type UnitStatus = 'Vacant' | 'Occupied' | 'Maintenance' | 'Reserved'
export type TenantStatus = 'Active' | 'MovingOut' | 'Past' | 'Prospect'
export type LeaseStatus = 'Active' | 'ExpiringSoon' | 'Expired' | 'Draft' | 'Terminated'
export type TicketStatus = 'New' | 'InReview' | 'Assigned' | 'WaitingOnTenant' | 'WaitingOnVendor' | 'Completed' | 'Cancelled'
export type Urgency = 'Low' | 'Medium' | 'High' | 'Emergency'
export type Channel = 'WebDashboard' | 'ChatGPT' | 'WhatsApp' | 'EmailFuture' | 'SMSFuture' | 'Manual'
export type SenderType = 'Tenant' | 'LandlordOwner' | 'Vendor' | 'PropertyManager' | 'Buyer' | 'Seller' | 'Other'
export type RequestCategory =
  | 'Maintenance'
  | 'Rent'
  | 'Lease'
  | 'Renewal'
  | 'Complaint'
  | 'OwnerUpdate'
  | 'VendorCoordination'
  | 'TenantSupport'
  | 'LandlordSupport'
  | 'BuyerSupportFutureModule'
  | 'SellerSupportFutureModule'
  | 'GeneralInquiry'
  | 'Emergency'
  | 'Unknown'

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'demo'

export interface TriageInput {
  message: string
  senderType: SenderType
  channel: Channel
  relatedPropertyId?: string
  relatedUnitId?: string
  relatedTenantId?: string
  context?: {
    propertyName?: string
    unitNumber?: string
    tenantName?: string
    leaseStatus?: string
    leaseEndDate?: string
  }
}

export interface TriageOutput {
  category: RequestCategory
  urgency: Urgency
  summary: string
  extractedDetails: Record<string, string>
  suggestedActions: string[]
  draftResponse: string
  suggestedTicket: {
    title: string
    description: string
    category: string
    urgency: Urgency
    vendorType?: string
  } | null
  complianceNotes: string | null
  requiresEscalation: boolean
  provider: AIProvider
  mode: 'real' | 'demo'
}
