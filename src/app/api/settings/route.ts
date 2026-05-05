import { NextResponse } from 'next/server'
import { getActiveProvider } from '@/lib/ai'

export async function GET() {
  const { provider, mode } = getActiveProvider()

  return NextResponse.json({
    aiMode: mode,
    activeProvider: provider,
    providers: {
      openai: { configured: !!process.env.OPENAI_API_KEY, label: 'OpenAI (GPT-4o-mini)' },
      anthropic: { configured: !!process.env.ANTHROPIC_API_KEY, label: 'Anthropic (Claude Haiku)' },
      gemini: { configured: !!process.env.GEMINI_API_KEY, label: 'Google Gemini 1.5 Flash' },
    },
    channels: {
      webDashboard: { status: 'active', label: 'Web Dashboard' },
      chatgpt: { status: 'planned', label: 'ChatGPT Custom GPT' },
      whatsapp: { status: 'planned', label: 'WhatsApp Assistant' },
      email: { status: 'planned', label: 'Email (Future)' },
      sms: { status: 'planned', label: 'SMS (Future)' },
    },
    disclaimer:
      'Property Copilot does not provide legal, tax, financial, regulatory, or real-estate compliance advice. All AI outputs require human review and approval before any action is taken. For UAE tenancy and regulatory matters, consult a qualified professional.',
  })
}
