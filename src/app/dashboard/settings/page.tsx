'use client'
import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Settings {
  aiMode: string
  activeProvider: string
  providers: Record<string, { configured: boolean; label: string }>
  channels: Record<string, { status: string; label: string }>
  disclaimer: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings)
  }, [])

  if (!settings) return <div className="p-8 text-gray-400 text-sm">Loading...</div>

  return (
    <div>
      <TopBar title="Settings & API Status" subtitle="Configuration and integration status" />
      <div className="p-8 space-y-6 max-w-3xl">

        {/* AI Mode */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Mode</CardTitle>
              <Badge className={settings.aiMode === 'real' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {settings.aiMode === 'real' ? `Real AI — ${settings.activeProvider}` : 'Demo Mode'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {settings.aiMode === 'demo' ? (
              <p className="text-sm text-gray-600">
                No AI API key is configured. The system is running in <strong>Demo Mode</strong> with deterministic template responses.
                To enable real AI, add one of the API keys listed below to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Real AI mode is active using <strong>{settings.activeProvider}</strong>. All triage requests are processed by the AI provider.
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Providers */}
        <Card>
          <CardHeader><CardTitle>AI Providers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-400 mb-3">Priority order: Anthropic → OpenAI → Gemini → Demo. Set one key to enable real AI.</p>
            {Object.entries(settings.providers).map(([key, provider]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{provider.label}</p>
                  <p className="text-xs text-gray-400">
                    {key === 'openai' && 'Set OPENAI_API_KEY in .env.local'}
                    {key === 'anthropic' && 'Set ANTHROPIC_API_KEY in .env.local'}
                    {key === 'gemini' && 'Set GEMINI_API_KEY in .env.local'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={provider.configured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
                    {provider.configured ? '✓ Configured' : 'Not configured'}
                  </Badge>
                  {provider.configured && key === settings.activeProvider && (
                    <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader><CardTitle>Channel Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(settings.channels).map(([key, channel]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-900">{channel.label}</p>
                <Badge className={
                  channel.status === 'active' ? 'bg-green-100 text-green-800' :
                  channel.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-500'
                }>
                  {channel.status === 'active' ? '✓ Active' : channel.status === 'planned' ? 'Planned' : channel.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Environment Setup */}
        <Card>
          <CardHeader><CardTitle>Environment Setup</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in the project root with the following variables:</p>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">
{`# Database
DATABASE_URL="file:./prisma/dev.db"

# AI Providers — add one to enable real AI mode
# ANTHROPIC_API_KEY="sk-ant-..."
# OPENAI_API_KEY="sk-..."
# GEMINI_API_KEY="AI..."

# Optional: allow seed in production
# ALLOW_SEED="true"`}
            </pre>
          </CardContent>
        </Card>

        {/* Future Modules */}
        <Card>
          <CardHeader><CardTitle>Future Modules Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Tenant Support', status: 'Planned', note: 'Dedicated tenant communication workflows' },
              { label: 'Landlord / Owner Support', status: 'Planned', note: 'Owner update generation and communication' },
              { label: 'Buyer Support', status: 'Future', note: 'Currently classified as future module during triage' },
              { label: 'Seller Support', status: 'Future', note: 'Currently classified as future module during triage' },
              { label: 'Leasing Support', status: 'Planned', note: 'Full leasing pipeline management' },
              { label: 'WhatsApp Assistant', status: 'Planned', note: 'See docs/WHATSAPP_INTEGRATION_PLAN.md' },
              { label: 'ChatGPT Custom GPT', status: 'Planned', note: 'See docs/CHATGPT_ACTIONS_PLAN.md' },
              { label: 'Live Email Sending', status: 'Future', note: 'Requires email provider integration' },
              { label: 'SMS Sending', status: 'Future', note: 'Requires SMS provider integration' },
            ].map(m => (
              <div key={m.label} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.note}</p>
                </div>
                <Badge className={m.status === 'Planned' ? 'bg-yellow-100 text-yellow-700 shrink-0' : 'bg-gray-100 text-gray-500 shrink-0'}>
                  {m.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card>
          <CardHeader><CardTitle>Disclaimer</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 leading-relaxed">{settings.disclaimer}</p>
          </CardContent>
        </Card>

        {/* Architecture Links */}
        <Card>
          <CardHeader><CardTitle>Documentation</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'MVP Plan', path: 'MVP_PLAN.md' },
              { label: 'Next Steps & Roadmap', path: 'NEXT_STEPS.md' },
              { label: 'Architecture Overview', path: 'docs/ARCHITECTURE.md' },
              { label: 'ChatGPT Actions Plan', path: 'docs/CHATGPT_ACTIONS_PLAN.md' },
              { label: 'WhatsApp Integration Plan', path: 'docs/WHATSAPP_INTEGRATION_PLAN.md' },
              { label: 'README', path: 'README.md' },
            ].map(doc => (
              <p key={doc.path} className="text-sm text-gray-600">
                <span className="font-medium">{doc.label}</span>
                <code className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs ml-2">{doc.path}</code>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
