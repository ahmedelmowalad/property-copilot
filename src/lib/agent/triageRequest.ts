import { prisma } from '@/lib/db/prisma'
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
  // Build context from related entities
  let context: TriageInput['context'] = {}

  if (params.relatedPropertyId) {
    const property = await prisma.property.findUnique({ where: { id: params.relatedPropertyId } })
    if (property) context.propertyName = property.name
  }

  if (params.relatedUnitId) {
    const unit = await prisma.unit.findUnique({ where: { id: params.relatedUnitId } })
    if (unit) context.unitNumber = unit.unitNumber
  }

  if (params.relatedTenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: params.relatedTenantId } })
    if (tenant) {
      context.tenantName = `${tenant.firstName} ${tenant.lastName}`
      // Find active lease
      const lease = await prisma.lease.findFirst({
        where: { tenantId: tenant.id, status: { in: ['Active', 'ExpiringSoon'] } },
        orderBy: { endDate: 'asc' },
      })
      if (lease) {
        context.leaseStatus = lease.status
        context.leaseEndDate = lease.endDate.toISOString().split('T')[0]
      }
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

  // Save agent run record
  let agentRunId: string | undefined

  try {
    const output = await runTriage(input)

    // Save request to DB
    const request = await prisma.request.create({
      data: {
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
      },
    })

    // Save agent run
    await prisma.agentRun.create({
      data: {
        requestId: request.id,
        provider,
        mode,
        promptVersion: 'v1',
        inputJson: JSON.stringify(input),
        outputJson: JSON.stringify(output),
        status: 'success',
      },
    })

    return { request, output }
  } catch (error) {
    // Save failed agent run for debugging
    await prisma.agentRun.create({
      data: {
        provider,
        mode,
        promptVersion: 'v1',
        inputJson: JSON.stringify(input),
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    }).catch(() => {}) // don't throw on logging failure

    throw error
  }
}
