'use client'
import { Suspense, useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatCurrency, formatDate, statusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'tenant' | 'agent'
  content: string
}

interface AgentAction {
  type: 'create_ticket' | 'flag_renewal'
  label: string
  data: Record<string, string>
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  status: string
  unit: {
    id: string
    unitNumber: string
    status: string
    rentAmount: number
    currency: string
    property: { id: string; name: string } | null
  } | null
  leases: Array<{
    id: string
    status: string
    startDate: string
    endDate: string
    rentAmount: number
    currency: string
  }>
}

// ─── Quick-start prompts ────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: 'Report AC issue', icon: '❄️', text: 'The AC in my apartment stopped working and it\'s very hot.' },
  { label: 'Report water leak', icon: '💧', text: 'There\'s a water leak under my kitchen sink.' },
  { label: 'Renew my lease', icon: '📄', text: 'I\'d like to renew my lease on the same terms.' },
  { label: 'Access card issue', icon: '🔑', text: 'My door access card stopped working.' },
]

// ─── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isAgent = msg.role === 'agent'
  // Convert **bold** markdown to spans
  const formatted = msg.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  return (
    <div className={cn('flex gap-3', isAgent ? 'justify-start' : 'justify-end')}>
      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">PC</div>
      )}
      <div
        className={cn(
          'max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isAgent
            ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
            : 'bg-blue-600 text-white rounded-tr-sm'
        )}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
      {!isAgent && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0 mt-0.5">You</div>
      )}
    </div>
  )
}

// ─── Action card ─────────────────────────────────────────────────────────────

function ActionCard({
  action,
  onConfirm,
  confirmed,
  ticketId,
}: {
  action: AgentAction
  onConfirm: () => void
  confirmed: boolean
  ticketId?: string
}) {
  const isTicket = action.type === 'create_ticket'
  const isRenewal = action.type === 'flag_renewal'

  if (confirmed) {
    return (
      <div className="flex justify-start">
        <div className="ml-11 bg-green-50 border border-green-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
            <span>✓</span>
            {isTicket ? 'Maintenance ticket created' : 'Renewal request submitted'}
          </div>
          {ticketId && (
            <a href="/dashboard/tickets" className="text-blue-600 hover:underline text-xs">View in Maintenance Tickets →</a>
          )}
          {isRenewal && (
            <p className="text-green-600 text-xs">The property manager will review and contact you within 2–3 business days.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="ml-11 bg-blue-50 border border-blue-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
        <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-2">
          {isTicket ? '🔧 Pending Maintenance Ticket' : '📄 Pending Renewal Request'}
        </p>
        {isTicket && (
          <div className="space-y-1 mb-3 text-sm text-gray-700">
            <p><strong>Title:</strong> {action.data.title}</p>
            <p><strong>Category:</strong> {action.data.category}</p>
            <p><strong>Urgency:</strong> <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', action.data.urgency === 'Emergency' ? 'bg-red-100 text-red-700' : action.data.urgency === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700')}>{action.data.urgency}</span></p>
          </div>
        )}
        {isRenewal && (
          <div className="space-y-1 mb-3 text-sm text-gray-700">
            <p><strong>Request type:</strong> {action.data.requestType === 'same_terms' ? 'Renew on same terms' : 'Discuss new terms'}</p>
          </div>
        )}
        <button
          onClick={onConfirm}
          className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isTicket ? 'Confirm — Create Ticket' : 'Confirm — Submit Request'}
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">Human review required before any action is taken</p>
      </div>
    </div>
  )
}

// ─── Main inner component ───────────────────────────────────────────────────

function AgentInner() {
  const searchParams = useSearchParams()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedId, setSelectedId] = useState<string>(searchParams.get('tenantId') ?? '')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<AgentAction | null>(null)
  const [actionConfirmed, setActionConfirmed] = useState(false)
  const [createdTicketId, setCreatedTicketId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  const selectedTenant = tenants.find(t => t.id === selectedId)
  const activeLease = selectedTenant?.leases?.[0]

  useEffect(() => {
    fetch('/api/tenants').then(r => r.json()).then(data => {
      const active = (data as Tenant[]).filter(t => t.status === 'Active' && t.unit)
      setTenants(active)
      if (!selectedId && active.length) setSelectedId(active[0].id)
    })
  }, [])

  // Greet when tenant changes
  useEffect(() => {
    if (!selectedId) return
    setPendingAction(null)
    setActionConfirmed(false)
    setCreatedTicketId(undefined)
    setMessages([{
      role: 'agent',
      content: `Hi there! I'm your property assistant. I can help you with:\n\n• **Maintenance issues** — log a repair request\n• **Lease renewal** — check your lease and request renewal\n• **General questions** about your unit or tenancy\n\nWhat can I help you with today?`,
    }])
  }, [selectedId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingAction])

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || !selectedId || loading) return

    const newMessages: ChatMessage[] = [...messages, { role: 'tenant', content }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setPendingAction(null)

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selectedId, messages: newMessages }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'agent', content: data.reply }])
      }
      if (data.action) {
        setPendingAction(data.action)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  async function confirmAction() {
    if (!pendingAction || !selectedId) return
    setLoading(true)

    if (pendingAction.type === 'create_ticket') {
      const currentMessages = messages
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedId,
          messages: [...currentMessages, { role: 'tenant', content: 'Yes, please create the ticket.' }],
          confirmAction: pendingAction,
        }),
      })
      const data = await res.json()
      if (data.created) setCreatedTicketId(data.ticketId)
    }

    // For renewal, it's just flagging — no ticket creation
    setActionConfirmed(true)
    setLoading(false)
  }

  return (
    <div className="flex h-full">
      {/* Left panel — tenant selector */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Select Tenant</h2>
          <p className="text-xs text-gray-500 mt-0.5">Chat as this tenant with the AI agent</p>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-1">
          {tenants.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelectedId(t.id); setActionConfirmed(false); setPendingAction(null) }}
              className={cn(
                'w-full text-left px-3 py-3 rounded-xl transition-colors',
                selectedId === t.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                  {t.firstName[0]}{t.lastName[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{t.firstName} {t.lastName}</p>
                  <p className="text-xs text-gray-500">{t.unit?.unitNumber} · {t.unit?.property?.name ?? ''}</p>
                </div>
              </div>
              {t.leases?.[0] && (
                <div className="flex items-center gap-1.5 ml-9">
                  <span className={cn('text-xs px-1.5 py-0.5 rounded-full', statusColor(t.leases[0].status))}>
                    {t.leases[0].status}
                  </span>
                  <span className="text-xs text-gray-400">expires {formatDate(t.leases[0].endDate)}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selected tenant info card */}
        {selectedTenant && (
          <div className="p-3 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5">
              <p className="font-medium text-gray-700 mb-1">Current Lease</p>
              {activeLease ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rent</span>
                    <span className="font-medium">{formatCurrency(activeLease.rentAmount, activeLease.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">End date</span>
                    <span className="font-medium">{formatDate(activeLease.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={cn('px-1.5 py-0.5 rounded-full', statusColor(activeLease.status))}>{activeLease.status}</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">No active lease</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right panel — chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">PC</div>
          <div>
            <h1 className="font-semibold text-gray-900">Tenant Agent</h1>
            <p className="text-xs text-gray-500">
              {selectedTenant
                ? `Chatting as ${selectedTenant.firstName} ${selectedTenant.lastName} · ${selectedTenant.unit?.unitNumber}`
                : 'Select a tenant to begin'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">AI Agent</span>
            <span className="text-xs text-gray-400">Demo Mode</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!selectedId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500 font-medium">Select a tenant to start chatting</p>
                <p className="text-sm text-gray-400 mt-1">The agent will greet them and handle maintenance & renewal requests</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}

              {pendingAction && (
                <ActionCard
                  action={pendingAction}
                  onConfirm={confirmAction}
                  confirmed={actionConfirmed}
                  ticketId={createdTicketId}
                />
              )}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">PC</div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick prompts — show only at the start */}
              {messages.length === 1 && !loading && (
                <div className="ml-11 flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => sendMessage(p.text)}
                      className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <span>{p.icon}</span> {p.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={selectedId ? 'Type your message…' : 'Select a tenant first'}
              disabled={!selectedId || loading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !selectedId || loading}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI suggestions only · Tickets and renewals require your confirmation · Human review always required
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Page wrapper with Suspense ─────────────────────────────────────────────

export default function AgentPage() {
  return (
    <div className="h-full flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading agent…</div>}>
        <AgentInner />
      </Suspense>
    </div>
  )
}
