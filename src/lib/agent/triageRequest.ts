import { getPropertyName, getUnitNumber, getTenantContext, createRequest } from '@/lib/db/store'
import { runTriage, getActiveProvider } from '@/lib/ai'
import type { TriageInput, TriageOutput } from '@/types'

export interface TriageRequestParams {
  message: string
  senderType: string
  senderName?: string
  senderEmail?: string
  senderPhone?: string
  channel: string
  relatedPropertyId?: string
  relatedUnitId?: string
  relatedTenantId?: string
}

export async function triageRequest(params: TriageRequestParams): Promise<{
  request: { id: string }
  output: TriageOutput
}> {
  let context: TriageInput['context'] = {}

  if (params.relatedPropertyId) {
    const name = getPropertyName(params.relatedPropertyId)
    if (name) context.propertyName = name
  }

  if (params.relatedUnitId) {
    const num = getUnitNumber(params.relatedUnitId)
    if (num) context.unitNumber = num
  }

  if (params.relatedTenantId) {
    const tc = getTenantContext(params.relatedTenantId)
    if (tc) {
      context.tenantName = tc.name
      if (tc.leaseStatus) context.leaseStatus = tc.leaseStatus
      if (tc.leaseEndDate) context.leaseEndDate = tc.leaseEndDate
    }
  }

  const input: TriageInput = {
    message: params.message,
    senderType: params.senderType as TriageInput['senderType'],
    channel: params.channel as TriageInput['channel'],
    relatedPropertyId: params.relatedPropertyId,
    relatedUnitId: params.relatedUnitId,
    relatedTenantId: params.relatedTenantId,
    context: Object.keys(context).length > 0 ? context : undefined,
  }

  const { provider, mode } = getActiveProvider()

  try {
    const output = await runTriage(input)

    const request = createRequest({
      senderType: params.senderType,
      senderName: params.senderName,
      senderEmail: params.senderEmail,
      senderPhone: params.senderPhone,
      channel: params.channel,
      rawMessage: params.message,
      category: output.category,
      urgency: output.urgency,
      extractedSummary: output.summary,
      extractedDetailsJson: JSON.stringify(output.extractedDetails),
      suggestedActionsJson: JSON.stringify(output.suggestedActions),
      draftResponse: output.draftResponse,
      complianceNotes: output.complianceNotes,
      relatedPropertyId: params.relatedPropertyId,
      relatedUnitId: params.relatedUnitId,
      relatedTenantId: params.relatedTenantId,
    })

    return { request, output }
  } catch (error) {
    throw error
  }
}
