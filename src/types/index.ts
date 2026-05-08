// HomeFlow — Shared Types

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

// ─── HomeFlow Channel Types ────────────────────────────────────────────────

export type CommunicationChannel = 'whatsapp' | 'voice_call' | 'web' | 'manual'
export type CommunicationDirection = 'inbound' | 'outbound'
export type CommunicationStatus = 'new' | 'read' | 'replied' | 'archived'
export type CallStatus = 'ringing' | 'in_progress' | 'completed' | 'missed' | 'voicemail' | 'failed'
export type ContactType = 'buyer' | 'seller' | 'landlord' | 'prospect_tenant' | 'vendor' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiating' | 'closed_won' | 'closed_lost'

export interface Communication {
  id: string
  channel: CommunicationChannel
  direction: CommunicationDirection
  status: CommunicationStatus
  fromNumber: string | null
  fromName: string | null
  toNumber: string | null
  body: string
  mediaUrl: string | null
  aiCategory: string | null
  aiUrgency: string | null
  aiSummary: string | null
  aiDraftReply: string | null
  relatedTenantId: string | null
  relatedContactId: string | null
  relatedTicketId: string | null
  whatsappMessageId: string | null
  threadId: string | null
  createdAt: string
  updatedAt: string
}

export interface CallLog {
  id: string
  status: CallStatus
  direction: CommunicationDirection
  fromNumber: string
  toNumber: string
  callerName: string | null
  durationSeconds: number | null
  recordingUrl: string | null
  transcription: string | null
  aiSummary: string | null
  aiActionItems: string[] | null
  relatedTenantId: string | null
  relatedContactId: string | null
  twilioCallSid: string | null
  startedAt: string
  endedAt: string | null
  createdAt: string
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  whatsappNumber: string | null
  contactType: ContactType
  leadStatus: LeadStatus
  propertyInterest: string | null
  budgetAed: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

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
