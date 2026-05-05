'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { urgencyColor } from '@/lib/utils'

interface TriageOutput {
  category: string
  urgency: string
  summary: string
  extractedDetails: Record<string, string>
  suggestedActions: string[]
  draftResponse: string
  suggestedTicket: {
    title: string
    description: string
    category: string
    urgency: string
    vendorType?: string
  } | null
  complianceNotes: string | null
  requiresEscalation: boolean
  provider: string
  mode: string
}

interface Property { id: string; name: string }
interface Unit { id: string; unitNumber: string; property: { name: string } }
interface Tenant { id: string; firstName: string; lastName: string }

const SENDER_TYPES = ['Tenant', 'LandlordOwner', 'Vendor', 'PropertyManager', 'Buyer', 'Seller', 'Other']
const CHANNELS = [
  { value: 'WebDashboard', label: 'Web Dashboard' },
  { value: 'WhatsApp', label: 'WhatsApp (Future)' },
  { value: 'ChatGPT', label: 'ChatGPT (Future)' },
  { value: 'Manual', label: 'Manual Entry' },
]

const EXAMPLE_MESSAGES = [
  { label: 'AC Failure (High)', msg: "Hi, the AC in unit 1204 stopped working last night and it's getting really hot. Can someone come today?" },
  { label: 'Plumbing Leak (Medium)', msg: "The bathroom sink in A-302 has been leaking for three days. I tried tightening it but it's worse now." },
  { label: 'Lease Renewal (Low)', msg: "Can you confirm when my lease renewal is due? I may want to stay another year." },
  { label: 'Water Heater Emergency', msg: "The water heater is leaking and water is spreading in the kitchen." },
  { label: 'Rent Increase Legal', msg: "The landlord is asking for a rent increase. Can you tell me if this is legal?" },
  { label: 'Access Card Issue (Medium)', msg: "The front door access card is not working again. Please update me." },
  { label: 'Buyer Inquiry (Future Module)', msg: "I am looking to buy a 2-bedroom apartment in Dubai Marina. Can you help?" },
  { label: 'Seller Inquiry (Future Module)', msg: "I'm interested in selling one of my rental properties later this year. Can your team help?" },
]

export default function CopilotPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Loading...</div>}>
      <CopilotInner />
    </Suspense>
  )
}

function CopilotInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [message, setMessage] = useState('')
  const [senderType, setSenderType] = useState('Tenant')
  const [channel, setChannel] = useState('WebDashboard')
  const [relatedPropertyId, setRelatedPropertyId] = useState('')
  const [relatedUnitId, setRelatedUnitId] = useState('')
  const [relatedTenantId, setRelatedTenantId] = useState(searchParams.get('tenantId') || '')

  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TriageOutput | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [creatingTicket, setCreatingTicket] = useState(false)
  const [ticketCreated, setTicketCreated] = useState<{ id: string; title: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/properties').then(r => r.json()),
      fetch('/api/units').then(r => r.json()),
      fetch('/api/tenants').then(r => r.json()),
    ]).then(([p, u, t]) => { setProperties(p); setUnits(u); setTenants(t) })
  }, [])

  async function handleTriage() {
    if (!message.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setTicketCreated(null)

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          senderType,
          channel,
          relatedPropertyId: relatedPropertyId || undefined,
          relatedUnitId: relatedUnitId || undefined,
          relatedTenantId: relatedTenantId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Triage failed. Please try again.')
        return
      }

      setResult(data.output)
      setRequestId(data.request?.id || null)
    } catch (e) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTicket() {
    if (!result?.suggestedTicket) return
    setCreatingTicket(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.suggestedTicket.title,
          description: result.suggestedTicket.description,
          category: result.suggestedTicket.category,
          urgency: result.suggestedTicket.urgency,
          vendorType: result.suggestedTicket.vendorType,
          sourceMessage: message,
          aiSummary: result.summary,
          aiSuggestedResponse: result.draftResponse,
          propertyId: relatedPropertyId || undefined,
          unitId: relatedUnitId || undefined,
          tenantId: relatedTenantId || undefined,
          status: 'New',
        }),
      })
      if (res.ok) {
        const ticket = await res.json()
        setTicketCreated({ id: ticket.id, title: ticket.title })
      }
    } finally {
      setCreatingTicket(false)
    }
  }

  function copyDraft() {
    if (result?.draftResponse) {
      navigator.clipboard.writeText(result.draftResponse)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <TopBar
        title="AI Copilot"
        subtitle="Triage incoming messages with AI assistance"
      />

      <div className="p-8 space-y-6 max-w-5xl">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Human-in-the-loop notice:</strong> All AI outputs are suggestions only.
            No messages are sent automatically. Review and approve everything before taking action.
            Do not rely on AI for legal, regulatory, or compliance advice — consult a qualified professional.
          </p>
        </div>

        {/* Input */}
        <Card>
          <CardHeader><CardTitle>Paste Incoming Message</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Example Messages */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_MESSAGES.map(ex => (
                  <button
                    key={ex.label}
                    onClick={() => setMessage(ex.msg)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
              placeholder='Paste any message here — e.g. "The AC stopped working last night and it is getting very hot. Can someone come today?"'
              value={message}
              onChange={e => setMessage(e.target.value)}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sender Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={senderType} onChange={e => setSenderType(e.target.value)}>
                  {SENDER_TYPES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Channel</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={channel} onChange={e => setChannel(e.target.value)}>
                  {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Related Property (optional)</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={relatedPropertyId} onChange={e => setRelatedPropertyId(e.target.value)}>
                  <option value="">None</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Related Unit (optional)</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={relatedUnitId} onChange={e => setRelatedUnitId(e.target.value)}>
                  <option value="">None</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.property.name} — Unit {u.unitNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Related Tenant (optional)</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={relatedTenantId} onChange={e => setRelatedTenantId(e.target.value)}>
                  <option value="">None</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
            </div>

            <Button onClick={handleTriage} loading={loading} disabled={!message.trim()}>
              <span>✦</span> {loading ? 'Analysing...' : 'Run AI Triage'}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={handleTriage} className="text-xs text-red-600 hover:underline mt-2">Retry</button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Mode banner */}
            <div className={`rounded-xl border p-3 flex items-center gap-2 ${result.mode === 'demo' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
              <span className={`text-sm font-medium ${result.mode === 'demo' ? 'text-blue-800' : 'text-green-800'}`}>
                {result.mode === 'demo'
                  ? '📋 Demo Mode — Add an AI API key for real analysis. Results are template-based.'
                  : `✓ Real AI — Powered by ${result.provider}`}
              </span>
            </div>

            {/* Emergency alert */}
            {result.urgency === 'Emergency' && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                <p className="text-sm font-bold text-red-800">🚨 EMERGENCY — Immediate human response required</p>
                <p className="text-xs text-red-600 mt-1">If occupant safety is at risk, advise contacting UAE emergency services (999). Do not rely on AI response alone.</p>
              </div>
            )}

            {/* Compliance Notes */}
            {result.complianceNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-medium text-amber-800 mb-1">⚠ Compliance / Legal Notice</p>
                <p className="text-xs text-amber-700">{result.complianceNotes}</p>
              </div>
            )}

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Triage Result</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">{result.category}</Badge>
                    <Badge className={urgencyColor(result.urgency)} variant="outline">{result.urgency}</Badge>
                    {result.requiresEscalation && <Badge className="bg-red-100 text-red-700">Escalation Required</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Summary</p>
                  <p className="text-sm text-gray-800">{result.summary}</p>
                </div>

                {Object.keys(result.extractedDetails).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Extracted Details</p>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      {Object.entries(result.extractedDetails).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs">
                          <span className="text-gray-400 capitalize min-w-24">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestedActions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Suggested Next Actions</p>
                    <ol className="space-y-1">
                      {result.suggestedActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="text-blue-500 font-medium shrink-0">{i + 1}.</span>
                          {action}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Draft Response */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Draft Response</CardTitle>
                  <button onClick={copyDraft} className="text-xs text-blue-600 hover:underline">
                    {copied ? '✓ Copied!' : 'Copy to clipboard'}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">{result.draftResponse}</div>
                <p className="text-xs text-amber-700 mt-3 flex items-center gap-1">
                  <span>⚠</span> This is an AI-generated draft. Review and edit before sending. Do not send automatically.
                </p>
              </CardContent>
            </Card>

            {/* Suggested Ticket */}
            {result.suggestedTicket && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Suggested Maintenance Ticket</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">AI Suggested</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ticketCreated ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800">✓ Ticket created successfully</p>
                      <p className="text-xs text-green-600 mt-1">{ticketCreated.title}</p>
                      <button
                        onClick={() => router.push(`/dashboard/tickets/${ticketCreated.id}`)}
                        className="text-xs text-green-700 hover:underline mt-2 block"
                      >
                        View ticket →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div><span className="text-gray-400 text-xs">Title:</span> <span className="font-medium">{result.suggestedTicket.title}</span></div>
                        <div><span className="text-gray-400 text-xs">Description:</span> <span>{result.suggestedTicket.description}</span></div>
                        <div className="flex gap-4">
                          <div><span className="text-gray-400 text-xs">Category:</span> <span>{result.suggestedTicket.category}</span></div>
                          <div><span className="text-gray-400 text-xs">Urgency:</span> <Badge className={urgencyColor(result.suggestedTicket.urgency)}>{result.suggestedTicket.urgency}</Badge></div>
                          {result.suggestedTicket.vendorType && <div><span className="text-gray-400 text-xs">Vendor needed:</span> <span>{result.suggestedTicket.vendorType}</span></div>}
                        </div>
                      </div>
                      <Button onClick={handleCreateTicket} loading={creatingTicket} size="sm">
                        Create Ticket from Suggestion
                      </Button>
                      <p className="text-xs text-gray-400">You will be able to edit all fields after creation.</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* No ticket suggestion */}
            {!result.suggestedTicket && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                No maintenance ticket suggested for this message. If action is needed, create a ticket manually.
                <Link href="/dashboard/tickets/new" className="text-blue-600 hover:underline ml-2 text-xs">Create manually →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
