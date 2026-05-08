'use client'
import { useState, useRef, useEffect } from 'react'
import { ApprovalRequestCard } from '@/components/ui/ApprovalRequestCard'

// ─── Types ─────────────────────────────────────────────────────────────────

interface ConvItem {
  kind: 'message' | 'card'
  role?: 'user' | 'agent'
  time: string
  content?: string
  cardType?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function nowTime() {
  return new Date().toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function parseMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

// ─── Sub-agent badge ─────────────────────────────────────────────────────────

const STAGE_AGENT: Record<string, { name: string; color: string; icon: string }> = {
  initial: { name: 'Intake Router', color: 'bg-purple-100 text-purple-700', icon: '🔀' },
  workflow_input: { name: 'Intake Router', color: 'bg-purple-100 text-purple-700', icon: '🔀' },
  searching: { name: 'Workflow Orchestrator', color: 'bg-blue-100 text-blue-700', icon: '⚙' },
  search_done: { name: 'Permission Gatekeeper', color: 'bg-orange-100 text-orange-700', icon: '🔐' },
  pending_approval: { name: 'Permission Gatekeeper', color: 'bg-orange-100 text-orange-700', icon: '🔐' },
  viewings_scheduled: { name: 'Workflow Orchestrator', color: 'bg-blue-100 text-blue-700', icon: '⚙' },
  escalation_pending: { name: 'Escalation Manager', color: 'bg-red-100 text-red-700', icon: '🚨' },
  complete: { name: 'Workflow Orchestrator', color: 'bg-green-100 text-green-700', icon: '✅' },
}

// ─── Plan tracker ─────────────────────────────────────────────────────────────

const PLAN_STEPS = [
  { key: 'search', label: 'Search & verify listings' },
  { key: 'approval', label: 'Contact approval gate' },
  { key: 'viewings', label: 'Schedule viewings' },
  { key: 'checklist', label: 'Pre-viewing checklist' },
  { key: 'application', label: 'Application & move-in' },
]

function planStepsDone(stage: string): number {
  if (['initial', 'workflow_input', 'searching'].includes(stage)) return 0
  if (stage === 'search_done') return 1
  if (stage === 'pending_approval') return 1
  if (stage === 'viewings_scheduled') return 3
  if (stage === 'complete') return 4
  return 0
}

// ─── Cards ──────────────────────────────────────────────────────────────────

function RoleSelectionCard({ onRole }: { onRole: (role: string) => void }) {
  const roles = [
    { id: 'role_prospective', label: 'Prospective Tenant', icon: '🔍', desc: 'Find & rent a home' },
    { id: 'role_tenant', label: 'Existing Tenant', icon: '🏠', desc: 'Maintenance & renewal' },
    { id: 'role_landlord', label: 'Landlord', icon: '🔑', desc: 'Manage properties' },
    { id: 'role_buyer', label: 'Buyer', icon: '💼', desc: 'Purchase property' },
    { id: 'role_seller', label: 'Seller', icon: '📋', desc: 'List & sell' },
    { id: 'role_pm', label: 'Property Manager', icon: '⚙', desc: 'Manage portfolio' },
    { id: 'role_broker', label: 'Broker / Agent', icon: '🤝', desc: 'Facilitation' },
  ]
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm my-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select your role</p>
      <div className="grid grid-cols-2 gap-2">
        {roles.map(r => (
          <button
            key={r.id}
            onClick={() => onRole(r.id)}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
          >
            <span className="text-xl">{r.icon}</span>
            <div>
              <div className="text-sm font-medium text-gray-800 group-hover:text-blue-700">{r.label}</div>
              <div className="text-xs text-gray-500">{r.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function IntakeRouterCard({ role }: { role: string }) {
  const lines = [
    { label: 'Role', value: role },
    { label: 'Intent', value: 'Home Search' },
    { label: 'Urgency', value: 'Low' },
    { label: 'Workflow', value: 'Tenant Home Search' },
    { label: 'Sub-agents', value: 'Orchestrator → Gatekeeper' },
  ]
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔀</span>
        <span className="text-sm font-semibold text-purple-700">Intake Router — Classification</span>
      </div>
      <div className="space-y-1.5">
        {lines.map(l => (
          <div key={l.label} className="flex gap-3 text-sm">
            <span className="text-purple-500 w-24 flex-shrink-0">{l.label}</span>
            <span className="text-purple-900 font-medium">{l.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrchestratorPlanCard() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">⚙</span>
        <span className="text-sm font-semibold text-blue-700">Workflow Orchestrator — Plan</span>
      </div>
      <div className="space-y-2">
        {PLAN_STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
            <span className="text-blue-900">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PropertyMatchCard() {
  const listings = [
    { unit: 'Unit 1205', property: 'Marina Heights Residence', beds: '2BR', rent: 'AED 95,000', status: 'Vacant', dld: 'Verified ✓' },
    { unit: 'Unit 12B', property: 'Dubai Marina Walk Tower', beds: '2BR', rent: 'AED 98,000', status: 'Vacant', dld: 'Verified ✓' },
    { unit: 'Unit 804', property: 'The Residences Tower B', beds: '2BR', rent: 'AED 102,000', status: 'Available 1 Feb', dld: 'Verified ✓' },
  ]
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden my-2 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span>🏢</span>
        <span className="text-sm font-semibold text-gray-700">3 Verified Listings — Dubai Marina · 2BR · ≤ AED 105k</span>
      </div>
      <div className="divide-y divide-gray-100">
        {listings.map((l, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-800">{l.unit} · {l.property}</div>
              <div className="text-xs text-gray-500 mt-0.5">{l.beds} · {l.status}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-gray-900">{l.rent}/yr</div>
              <div className="text-xs text-green-600 font-medium">{l.dld}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ViewingsScheduledCard() {
  const slots = [
    { unit: 'Marina Heights 1205', date: 'Tomorrow', time: '11:00 AM', agent: 'Sana Al-Ali' },
    { unit: 'Marina Walk 12B', date: 'Tomorrow', time: '3:00 PM', agent: 'Omar Farouk' },
    { unit: 'Residences 804', date: 'Saturday', time: '10:00 AM', agent: 'Priya Sharma' },
  ]
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl overflow-hidden my-2">
      <div className="px-4 py-3 border-b border-green-200">
        <span className="text-sm font-semibold text-green-700">📅 Viewings Confirmed</span>
      </div>
      <div className="divide-y divide-green-100">
        {slots.map((s, i) => (
          <div key={i} className="px-4 py-2.5 flex justify-between items-center text-sm">
            <div>
              <div className="font-medium text-green-900">{s.unit}</div>
              <div className="text-xs text-green-600">Agent: {s.agent}</div>
            </div>
            <div className="text-right text-green-700 font-medium">
              <div>{s.date}</div>
              <div className="text-xs">{s.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ViewingChecklistCard() {
  const items = [
    'Check water pressure (taps, shower)',
    'Test AC units in all rooms',
    'Inspect walls and ceilings for damp',
    'Verify DEWA meter is in your name',
    'Confirm parking space and number',
    'Ask about community fees (Mollak)',
    'Request copy of Title Deed',
  ]
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 my-2 shadow-sm">
      <p className="text-sm font-semibold text-gray-700 mb-3">📋 Pre-Viewing Checklist</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-500 mt-0.5">□</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function EscalationCard({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl overflow-hidden my-2">
      <div className="px-4 py-3 border-b border-red-200 flex items-center gap-2">
        <span>🚨</span>
        <span className="text-sm font-semibold text-red-700">Escalation Manager — Specialist Required</span>
      </div>
      <div className="px-4 py-3 space-y-2 text-sm">
        <div className="flex gap-3"><span className="text-red-500 w-24">Reason</span><span className="text-red-900">Legal / Regulated question</span></div>
        <div className="flex gap-3"><span className="text-red-500 w-24">Specialist</span><span className="text-red-900">RERA-licensed property consultant</span></div>
        <div className="flex gap-3"><span className="text-red-500 w-24">Response</span><span className="text-red-900">Within 2 business hours</span></div>
        <div className="flex gap-3"><span className="text-red-500 w-24">Data shared</span><span className="text-red-900">Your question only — no personal data without consent</span></div>
      </div>
      <div className="px-4 py-3 border-t border-red-200 flex gap-2">
        <button onClick={onAccept} className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
          Connect to Specialist
        </button>
        <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-white border border-red-300 text-red-700 hover:bg-red-50 transition-colors">
          Skip for Now
        </button>
      </div>
    </div>
  )
}

function EscalationCompleteCard() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 my-2">
      <div className="flex items-center gap-2 mb-2">
        <span>✅</span>
        <span className="text-sm font-semibold text-green-700">Escalation Submitted</span>
      </div>
      <p className="text-sm text-green-800">A RERA-licensed consultant has been notified. You will receive a response at your registered contact within 2 business hours.</p>
    </div>
  )
}

// ─── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({ item }: { item: ConvItem }) {
  const isAgent = item.role === 'agent'
  return (
    <div className={`flex gap-2 ${isAgent ? 'justify-start' : 'justify-end'}`}>
      {isAgent && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">HF</div>
      )}
      <div
        className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isAgent
            ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
            : 'bg-blue-600 text-white rounded-tr-sm'
        }`}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(item.content ?? '') }}
      />
      {!isAgent && (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0 mt-0.5">A</div>
      )}
    </div>
  )
}

// ─── Welcome message ─────────────────────────────────────────────────────────

const WELCOME: ConvItem = {
  kind: 'message', role: 'agent', time: nowTime(),
  content: '**Welcome to HomeFlow Agent** 🏠\n\nI\'m an AI assistant that handles the full property lifecycle — search, viewings, lease renewal, maintenance, move-in, and more.\n\nI work for *you*, not any agency. I\'ll always ask your permission before sharing your data or taking external actions, and I\'ll route legal or financial questions to licensed specialists.\n\n**To get started, select your role below.**',
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function HomeFlowDemoPage() {
  const [items, setItems] = useState<ConvItem[]>([WELCOME, { kind: 'card', cardType: 'role-selection', time: nowTime() }])
  const [stage, setStage] = useState('initial')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef(items)
  const stageRef = useRef(stage)
  itemsRef.current = items
  stageRef.current = stage

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items])

  // Auto-advance stages
  const AUTO_ADVANCE: Record<string, number> = {
    searching: 3000,
    search_done: 2000,
  }

  useEffect(() => {
    if (!AUTO_ADVANCE[stage]) return
    const timer = setTimeout(() => {
      processResponse(itemsRef.current, stageRef.current, 'auto_next')
    }, AUTO_ADVANCE[stage])
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  async function processResponse(currentItems: ConvItem[], currentStage: string, trigger?: string) {
    setLoading(true)
    try {
      const messages = currentItems
        .filter(i => i.kind === 'message')
        .map(i => ({ role: i.role!, content: i.content! }))

      const res = await fetch('/api/homeflow-demo/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages, stage: currentStage, trigger }),
      })
      const data = await res.json()

      const newItems: ConvItem[] = [...currentItems]
      if (data.reply) {
        newItems.push({ kind: 'message', role: 'agent', time: nowTime(), content: data.reply })
      }
      if (data.card) {
        newItems.push({ kind: 'card', cardType: data.card, time: nowTime() })
      }
      setItems(newItems)
      setStage(data.nextStage)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleSelect(roleId: string) {
    const ROLE_LABELS: Record<string, string> = {
      role_tenant: 'Existing Tenant', role_prospective: 'Prospective Tenant',
      role_landlord: 'Landlord', role_buyer: 'Buyer',
      role_seller: 'Seller', role_pm: 'Property Manager', role_broker: 'Broker / Agent',
    }
    setSelectedRole(ROLE_LABELS[roleId] ?? roleId)
    await processResponse(itemsRef.current, stageRef.current, roleId)
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newItems: ConvItem[] = [
      ...itemsRef.current,
      { kind: 'message', role: 'user', time: nowTime(), content: text },
    ]
    setItems(newItems)
    await processResponse(newItems, stageRef.current)
  }

  async function triggerAction(trigger: string) {
    await processResponse(itemsRef.current, stageRef.current, trigger)
  }

  const currentAgent = STAGE_AGENT[stage] ?? STAGE_AGENT['initial']
  const stepsCompleted = planStepsDone(stage)

  return (
    <div className="flex h-screen bg-gray-100">

      {/* ── Left panel ── */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">

        {/* Brand */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">HF</div>
            <div>
              <div className="font-semibold text-sm text-gray-900">HomeFlow Agent</div>
              <div className="text-xs text-gray-400">UAE Property Lifecycle AI</div>
            </div>
          </div>
        </div>

        {/* Role context */}
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Session</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-sm text-gray-700 font-medium">{selectedRole ?? 'No role selected'}</span>
          </div>
          {selectedRole && (
            <div className="mt-1 text-xs text-gray-400">Ahmed Al-Rashid · Demo session</div>
          )}
        </div>

        {/* Active sub-agent */}
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Active Sub-agent</p>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${currentAgent.color}`}>
            <span>{currentAgent.icon}</span>
            <span>{currentAgent.name}</span>
          </div>
        </div>

        {/* Workflow plan */}
        {selectedRole && (
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">Workflow Progress</p>
            <div className="space-y-2">
              {PLAN_STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2.5 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs
                    ${i < stepsCompleted ? 'bg-green-500 text-white' : i === stepsCompleted ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < stepsCompleted ? '✓' : i + 1}
                  </div>
                  <span className={i < stepsCompleted ? 'text-green-600 line-through' : i === stepsCompleted ? 'text-blue-700 font-medium' : 'text-gray-400'}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permission matrix legend */}
        <div className="px-5 py-3 flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Permission Levels</p>
          <div className="space-y-1 text-xs">
            {[
              { level: '0–1', label: 'Internal / Read-only', color: 'bg-gray-400' },
              { level: '2–3', label: 'External message', color: 'bg-blue-500' },
              { level: '4', label: 'Gov. submission', color: 'bg-orange-500' },
              { level: '5–6', label: 'Financial / Sign', color: 'bg-red-500' },
            ].map(p => (
              <div key={p.level} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.color}`}></div>
                <span className="text-gray-500">L{p.level} · {p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conflict notice */}
        <div className="px-5 py-3 border-t border-gray-100 bg-amber-50">
          <p className="text-xs text-amber-700">
            <strong>Conflict transparency:</strong> HomeFlow does not receive listing commissions. Mortgage referrals may include a regulated fee (disclosed at point of referral).
          </p>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900">HomeFlow Agent Demo</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Prospective tenant · Home search scenario · Dubai Marina
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">4 Sub-agents</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Live Demo</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.map((item, idx) => {
            if (item.kind === 'message') {
              return <MessageBubble key={idx} item={item} />
            }

            // Cards
            switch (item.cardType) {
              case 'role-selection':
                return <RoleSelectionCard key={idx} onRole={handleRoleSelect} />

              case 'intake-router':
                return <IntakeRouterCard key={idx} role={selectedRole ?? 'Prospective Tenant'} />

              case 'orchestrator-plan':
                return <OrchestratorPlanCard key={idx} />

              case 'property-matches':
                return <PropertyMatchCard key={idx} />

              case 'vendor-approval-request':
                return (
                  <ApprovalRequestCard
                    key={idx}
                    level={2}
                    levelLabel="External Data Share"
                    action="Forward your contact details to property managers"
                    recipient="3 Dubai Marina property managers"
                    dataShared={['Full name (Ahmed Al-Rashid)', 'Phone number', 'Preferred viewing dates', 'Budget range']}
                    estimatedCost="AED 0 — no fees at this stage"
                    consequence="Property managers will contact you to confirm viewings. They receive your phone number."
                    humanReview={false}
                    approveLabel="Approve & Book Viewings"
                    rejectLabel="Don't Share"
                    onApprove={() => triggerAction('vendor_approved')}
                    onReject={() => triggerAction('vendor_rejected')}
                  />
                )

              case 'viewings-scheduled':
                return <ViewingsScheduledCard key={idx} />

              case 'viewing-checklist':
                return <ViewingChecklistCard key={idx} />

              case 'escalation-card':
                return <EscalationCard key={idx} onAccept={() => triggerAction('escalation_accepted')} />

              case 'escalation-complete':
                return <EscalationCompleteCard key={idx} />

              default:
                return null
            }
          })}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">HF</div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400 transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={stage === 'initial' ? 'Select your role above to begin…' : 'Type your message…'}
                disabled={stage === 'initial' || loading}
                rows={1}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || stage === 'initial'}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Demo scenario: Ahmed Al-Rashid · Prospective tenant · 2BR Dubai Marina · AED 100k budget
          </p>
        </div>
      </div>
    </div>
  )
}
