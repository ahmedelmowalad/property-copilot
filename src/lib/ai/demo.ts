import type { TriageInput, TriageOutput } from '@/types'

// Deterministic demo mode — no API key required
export async function runDemoTriage(input: TriageInput): Promise<TriageOutput> {
  const msg = input.message.toLowerCase()

  // Detect emergency/safety scenarios first
  const isEmergency =
    msg.includes('fire') ||
    msg.includes('gas leak') ||
    msg.includes('flood') ||
    msg.includes('emergency') ||
    (msg.includes('water') && msg.includes('spread')) ||
    msg.includes('electric shock')

  const isAC = msg.includes('ac') || msg.includes('air condition') || msg.includes('cooling')
  const isPlumbing =
    msg.includes('leak') || msg.includes('pipe') || msg.includes('water heater') || msg.includes('sink') || msg.includes('toilet')
  const isAccess = msg.includes('access card') || msg.includes('key') || msg.includes('door') || msg.includes('lock')
  const isRenewal = msg.includes('renewal') || msg.includes('renew') || msg.includes('stay another')
  const isRentLegal =
    msg.includes('rent increase') ||
    msg.includes('legal') ||
    msg.includes('ejari') ||
    msg.includes('rera') ||
    msg.includes('increase')
  const isBuyer = msg.includes('buy') || msg.includes('purchase') || msg.includes('2-bedroom') || msg.includes('looking to buy')
  const isSeller = msg.includes('sell') || msg.includes('selling')

  if (isBuyer) {
    return {
      category: 'BuyerSupportFutureModule',
      urgency: 'Low',
      summary: 'Buyer inquiry received. This is outside the current property management scope.',
      extractedDetails: {
        inquiryType: 'Property purchase inquiry',
        note: 'Buyer support is a future module — not part of current residential management operations.',
      },
      suggestedActions: [
        'Forward to sales/leasing team',
        'Log as future module inquiry',
        'Do not process as a maintenance or tenancy request',
      ],
      draftResponse:
        'Thank you for reaching out. For property purchase inquiries, please contact our sales team directly. We will ensure the right team member follows up with you shortly.',
      suggestedTicket: null,
      complianceNotes:
        'FUTURE MODULE: Buyer support workflows are not yet active. This message has been classified but requires a qualified sales team to respond. No automated response has been sent.',
      requiresEscalation: true,
      provider: 'demo',
      mode: 'demo',
    }
  }

  if (isSeller) {
    return {
      category: 'SellerSupportFutureModule',
      urgency: 'Low',
      summary: 'Seller inquiry received. This is outside the current property management scope.',
      extractedDetails: {
        inquiryType: 'Property sale inquiry',
        note: 'Seller support is a future module — not part of current residential management operations.',
      },
      suggestedActions: ['Forward to sales team', 'Log as future module inquiry'],
      draftResponse:
        'Thank you for your interest. For property sale inquiries, please contact our dedicated sales team. We will have the appropriate team member reach out to you.',
      suggestedTicket: null,
      complianceNotes:
        'FUTURE MODULE: Seller support workflows are not yet active. This message requires a qualified real-estate professional to respond. No automated response has been sent.',
      requiresEscalation: true,
      provider: 'demo',
      mode: 'demo',
    }
  }

  if (isRentLegal) {
    return {
      category: 'Rent',
      urgency: 'Medium',
      summary: 'Tenant is asking about the legality of a rent increase.',
      extractedDetails: {
        topic: 'Rent increase legality',
        regulation: 'RERA Rent Calculator / Dubai Tenancy Law',
        note: 'Tenant is seeking legal clarification on rent increase.',
      },
      suggestedActions: [
        'Do NOT provide legal advice',
        'Refer tenant to qualified legal professional or RERA',
        'Review current RERA rent calculator for applicable rates',
        'Escalate to property manager or legal team',
      ],
      draftResponse:
        'Thank you for raising this concern. Rent increase regulations in Dubai are governed by RERA guidelines and the Dubai Tenancy Law. We strongly recommend consulting the official RERA Rent Calculator or seeking advice from a qualified legal professional for an accurate assessment of your specific situation. Our team will follow up with you accordingly.',
      suggestedTicket: {
        title: 'Rent Increase Legal Query',
        description: 'Tenant inquiring about legality of proposed rent increase. Requires human review and possible legal escalation.',
        category: 'Lease',
        urgency: 'Medium',
      },
      complianceNotes:
        'COMPLIANCE NOTICE: Do not provide legal, tax, or regulatory advice. Rent increase disputes in the UAE are governed by RERA and emirate-specific tenancy laws. Refer the tenant to a qualified legal professional or the RERA dispute resolution center. No automated response has been sent.',
      requiresEscalation: true,
      provider: 'demo',
      mode: 'demo',
    }
  }

  if (isEmergency) {
    return {
      category: 'Emergency',
      urgency: 'Emergency',
      summary: 'Emergency maintenance issue reported. Immediate human follow-up required.',
      extractedDetails: {
        issueType: 'Emergency / Safety concern',
        reportedBy: input.senderType,
        immediateRisk: 'Potential property damage or safety hazard',
      },
      suggestedActions: [
        'Contact tenant IMMEDIATELY',
        'Dispatch emergency maintenance team now',
        'Notify property owner',
        'Document incident for insurance/compliance',
        'Follow UAE safety regulations',
      ],
      draftResponse:
        'We have received your emergency report and are treating this as a priority. Our maintenance team is being notified immediately. Please ensure your safety first — if there is any immediate danger, please contact UAE emergency services (999). We will contact you very shortly.',
      suggestedTicket: {
        title: 'EMERGENCY: Urgent maintenance issue reported',
        description: input.message,
        category: 'Emergency',
        urgency: 'Emergency',
        vendorType: 'Emergency Contractor',
      },
      complianceNotes:
        'EMERGENCY: Immediate human response required. Do not delay. If occupant safety is at risk, advise them to contact UAE emergency services (999). This ticket must not be closed automatically.',
      requiresEscalation: true,
      provider: 'demo',
      mode: 'demo',
    }
  }

  if (isAC) {
    return {
      category: 'Maintenance',
      urgency: 'High',
      summary: 'Tenant reports air conditioning unit has stopped working.',
      extractedDetails: {
        issueType: 'AC / HVAC failure',
        reportedBy: input.senderType,
        unitContext: input.context?.unitNumber || 'Unit not specified',
        urgencyReason: 'AC failure in UAE climate is a high-urgency comfort and habitability issue',
      },
      suggestedActions: [
        'Acknowledge receipt to tenant promptly',
        'Assign HVAC technician — same day if possible',
        'Confirm unit access time with tenant',
        'Check warranty or service contract for HVAC unit',
        'Log ticket and update tenant on ETA',
      ],
      draftResponse: `Dear ${input.context?.tenantName || 'Resident'},\n\nThank you for reporting the air conditioning issue in your unit. We understand how important this is, especially given the current weather. We have logged this as a high-priority maintenance request and will have a qualified HVAC technician contact you to arrange access at your earliest convenience.\n\nPlease let us know if you have a preferred time for the visit.\n\nBest regards,\nProperty Management Team`,
      suggestedTicket: {
        title: 'AC Unit Not Working',
        description: `Tenant reported AC stopped working. Requires HVAC technician inspection and repair. Original message: "${input.message}"`,
        category: 'HVAC',
        urgency: 'High',
        vendorType: 'HVAC Technician',
      },
      complianceNotes: null,
      requiresEscalation: false,
      provider: 'demo',
      mode: 'demo',
    }
  }

  if (isPlumbing) {
    const isWaterHeater = msg.includes('water heater')
    return {
      category: 'Maintenance',
      urgency: isWaterHeater ? 'High' : 'Medium',
      summary: `Tenant reports a plumbing issue — ${isWaterHeater ? 'water heater leak' : 'water leak/plumbing problem'}.`,
      extractedDetails: {
        issueType: isWaterHeater ? 'Water heater leak' : 'Plumbing / water leak',
        reportedBy: input.senderType,
        unitContext: input.context?.unitNumber || 'Unit not specified',
        damageRisk: isWaterHeater ? 'Water spreading in kitchen — potential damage' : 'Possible water damage if unaddressed',
      },
      suggestedActions: [
        'Acknowledge receipt to tenant',
        'Assign licensed plumber as soon as possible',
        isWaterHeater ? 'Advise tenant to isolate water supply if safe to do so' : 'Confirm if leak is worsening',
        'Check for water damage to floor/walls',
        'Log ticket and follow up after visit',
      ],
      draftResponse: `Dear ${input.context?.tenantName || 'Resident'},\n\nThank you for reporting the plumbing issue. We have logged this as a ${isWaterHeater ? 'high' : 'medium'}-priority maintenance request and will arrange for a licensed plumber to visit your unit as soon as possible. We will contact you to confirm the appointment time.\n\nIn the meantime, if the situation worsens, please do not hesitate to contact us immediately.\n\nBest regards,\nProperty Management Team`,
      suggestedTicket: {
        title: isWaterHeater ? 'Water Heater Leak — Kitchen' : 'Plumbing Leak Reported',
        description: `Tenant reported: "${input.message}". Plumber inspection required.`,
        category: 'Plumbing',
        urgency: isWaterHeater ? 'High' : 'Medium',
        vendorType: 'Licensed Plumber',
      },
      complianceNotes: isWaterHeater
        ? 'Water heater leaks can cause significant property damage. Prioritise prompt response and check for structural damage after repair.'
        : null,
      requiresEscalation: false,
      provider: 'demo',
      mode: 'demo',
    }
  }

  if (isAccess) {
    return {
      category: 'Maintenance',
      urgency: 'Medium',
      summary: 'Access card or entry system reported as not working.',
      extractedDetails: {
        issueType: 'Access card / entry system failure',
        reportedBy: input.senderType,
      },
      suggestedActions: [
        'Verify with building security team',
        'Check if issue is isolated or building-wide',
        'Arrange replacement card or system reset',
        'Update tenant on resolution timeline',
      ],
      draftResponse: `Dear ${input.context?.tenantName || 'Resident'},\n\nThank you for notifying us. We have logged the access card issue and will coordinate with our building security and facilities team to resolve it promptly. You will be contacted with an update shortly.\n\nBest regards,\nProperty Management Team`,
      suggestedTicket: {
        title: 'Access Card / Entry System Not Working',
        description: `Reported access issue: "${input.message}". Building security team to investigate.`,
        category: 'Access Control',
        urgency: 'Medium',
        vendorType: 'Building Security / Facilities',
      },
      complianceNotes: null,
      requiresEscalation: false,
      provider: 'demo',
      mode: 'demo',
    }
  }

  if (isRenewal) {
    return {
      category: 'Renewal',
      urgency: 'Low',
      summary: 'Tenant is inquiring about lease renewal terms and timeline.',
      extractedDetails: {
        topic: 'Lease renewal inquiry',
        tenantIntent: 'Interested in staying — wants renewal information',
        leaseStatus: input.context?.leaseStatus || 'Unknown',
        leaseEnd: input.context?.leaseEndDate || 'Not specified',
      },
      suggestedActions: [
        'Review current lease end date',
        'Prepare renewal offer with updated terms',
        'Check RERA guidelines for any rent adjustments',
        'Respond within 90 days of lease expiry as per UAE law',
        'Confirm tenant intention in writing',
      ],
      draftResponse: `Dear ${input.context?.tenantName || 'Resident'},\n\nThank you for your interest in renewing your tenancy. We are pleased to hear you are considering staying. Our team will review your current lease details and prepare a renewal proposal for your consideration. We will be in touch shortly with the relevant information.\n\nBest regards,\nProperty Management Team`,
      suggestedTicket: {
        title: 'Lease Renewal Inquiry',
        description: `Tenant has expressed interest in lease renewal. Action required to prepare renewal terms. Message: "${input.message}"`,
        category: 'Lease',
        urgency: 'Low',
      },
      complianceNotes:
        'Reminder: UAE tenancy law requires landlords to provide notice of rent changes or non-renewal at least 90 days before lease expiry. Consult current RERA guidelines. Do not provide legal advice to tenant.',
      requiresEscalation: false,
      provider: 'demo',
      mode: 'demo',
    }
  }

  // Generic fallback
  return {
    category: 'GeneralInquiry',
    urgency: 'Low',
    summary: 'General inquiry received from ' + input.senderType + '.',
    extractedDetails: {
      senderType: input.senderType,
      channel: input.channel,
      note: 'Message did not match a specific maintenance or tenancy category. Manual review recommended.',
    },
    suggestedActions: [
      'Review message manually',
      'Determine correct category and urgency',
      'Respond to sender with acknowledgement',
      'Assign to appropriate team member',
    ],
    draftResponse: `Dear ${input.context?.tenantName || 'Resident'},\n\nThank you for your message. We have received your inquiry and a member of our team will review it and follow up with you shortly.\n\nBest regards,\nProperty Management Team`,
    suggestedTicket: null,
    complianceNotes: null,
    requiresEscalation: false,
    provider: 'demo',
    mode: 'demo',
  }
}
