// WhatsApp Business API client (Meta Cloud API)
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

function getConfig() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'homeflow-verify-2026',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  }
}

export interface WhatsAppTextMessage {
  to: string
  body: string
}

export interface WhatsAppIncomingMessage {
  messageId: string
  from: string
  timestamp: string
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location'
  text?: string
  mediaId?: string
  caption?: string
  profileName?: string
  phoneNumberId: string
}

export interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: { display_phone_number: string; phone_number_id: string }
        contacts?: Array<{ profile: { name: string }; wa_id: string }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: { body: string }
          image?: { id: string; caption?: string; mime_type: string }
          document?: { id: string; caption?: string; filename: string }
          audio?: { id: string; mime_type: string }
        }>
        statuses?: Array<{
          id: string
          recipient_id: string
          status: string
          timestamp: string
        }>
      }
      field: string
    }>
  }>
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  // In production: verify using HMAC-SHA256 with the app secret
  // For now we just check the token is present
  return signature.length > 0
}

export function parseIncomingMessages(payload: WhatsAppWebhookPayload): WhatsAppIncomingMessage[] {
  const messages: WhatsAppIncomingMessage[] = []

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'messages') continue
      const value = change.value
      const phoneNumberId = value.metadata?.phone_number_id || ''

      for (const msg of value.messages || []) {
        const contact = value.contacts?.find(c => c.wa_id === msg.from)
        const parsed: WhatsAppIncomingMessage = {
          messageId: msg.id,
          from: msg.from,
          timestamp: msg.timestamp,
          type: msg.type as WhatsAppIncomingMessage['type'],
          profileName: contact?.profile?.name,
          phoneNumberId,
        }

        if (msg.type === 'text' && msg.text) {
          parsed.text = msg.text.body
        } else if (msg.image) {
          parsed.mediaId = msg.image.id
          parsed.caption = msg.image.caption
        } else if (msg.document) {
          parsed.mediaId = msg.document.id
          parsed.caption = msg.document.caption || msg.document.filename
        } else if (msg.audio) {
          parsed.mediaId = msg.audio.id
        }

        messages.push(parsed)
      }
    }
  }

  return messages
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getConfig()

  if (!config.phoneNumberId || !config.accessToken) {
    // Demo mode: log and return success
    console.log(`[WhatsApp Demo] Would send to ${to}: ${body}`)
    return { success: true, messageId: `demo-${Date.now()}` }
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'WhatsApp API error' }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return { success: false, error: msg }
  }
}

export function normalizePhoneNumber(phone: string): string {
  // Strip all non-digits, ensure no leading +
  return phone.replace(/\D/g, '')
}

export function formatPhoneDisplay(phone: string): string {
  if (!phone) return 'Unknown'
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('971') && digits.length === 12) {
    return `+971 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  return `+${digits}`
}
