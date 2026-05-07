'use client'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

interface WaMessage {
  role: 'tenant' | 'agent'
  content: string
  time: string
  status: 'sent' | 'delivered' | 'read'
}

interface WaContact {
  id: string
  name: string
  phone: string
  unitNumber: string
  propertyName: string
  leaseStatus: string
  leaseEndDate: string
  rentAmount: number
  tenantId: string
  unread: number
}

// ─── Pre-seeded WhatsApp conversations ─────────────────────────────────────

function nowTime(offsetMinutes = 0): string {
  const d = new Date(Date.now() - offsetMinutes * 60000)
  return d.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const SEEDED: Record<string, WaMessage[]> = {
  'wa-omar': [
    { role: 'tenant', content: 'Hi, the front door access card is not working again 😤', time: nowTime(47), status: 'read' },
    { role: 'agent', content: "Hi Omar! 👋 I'm your Property Copilot assistant. I see this issue has come up before with your unit at Marina Heights.\n\nCan you confirm — is the main lobby door or the car park barrier not responding?", time: nowTime(46), status: 'read' },
    { role: 'tenant', content: 'Main lobby, the card beeps but the door doesn\'t open', time: nowTime(44), status: 'read' },
    { role: 'agent', content: 'Got it — sounds like the card may need to be re-programmed or the reader has a fault. I\'ve flagged this with building management as *Medium* priority. 🔑\n\nTicket reference: #TKT-003\n\nSomeone will follow up with you today. Is there anything else I can help with?', time: nowTime(43), status: 'read' },
    { role: 'tenant', content: 'This keeps happening every few weeks, can you escalate it?', time: nowTime(12), status: 'read' },
  ],
  'wa-sarah': [
    { role: 'tenant', content: "Hi! The AC in my flat stopped working last night and it's getting really hot 🥵 can someone come today?", time: nowTime(95), status: 'read' },
    { role: 'agent', content: "Hi Sarah! 👋 So sorry to hear that — especially in this heat!\n\nI've categorised this as *High priority* HVAC issue for Unit 1204.\n\nCould you confirm:\n• When did it completely stop?\n• Is it one unit or the whole flat?", time: nowTime(94), status: 'read' },
    { role: 'tenant', content: "Stopped around midnight, it's the whole flat, not a single unit", time: nowTime(92), status: 'read' },
    { role: 'agent', content: "Understood. I've created a maintenance ticket:\n\n🔧 *AC Failure — Unit 1204*\nPriority: *HIGH*\nVendor: CoolTech HVAC Services\nETA: Within 4 hours\n\nYou'll receive a call from the vendor shortly. In the meantime, please keep windows open if safe to do so.\n\nIs there anything else you need? 🙏", time: nowTime(91), status: 'read' },
    { role: 'tenant', content: 'Thank you so much! Also my lease is expiring in December, what do I need to do?', time: nowTime(18), status: 'read' },
  ],
  'wa-daniel': [
    { role: 'tenant', content: 'The bathroom sink in A-302 has been leaking for 3 days. I tried tightening it but it\'s worse now 😩', time: nowTime(200), status: 'read' },
    { role: 'agent', content: "Hi Daniel! 👋 Thanks for letting us know. Please don't attempt any further DIY fixes — a licensed plumber needs to take a look.\n\nI've raised this as *Medium priority* plumbing ticket.\n\nPlumber: ProPlumb Dubai\nExpected: Within 24 hours", time: nowTime(199), status: 'read' },
    { role: 'tenant', content: 'OK thanks. Is there any update on timing?', time: nowTime(30), status: 'delivered' },
  ],
  'wa-emily': [
    { role: 'tenant', content: 'Hi, quick question — am I allowed to have a small pet in the apartment? 🐱', time: nowTime(310), status: 'read' },
    { role: 'agent', content: "Hi Emily! 👋 Great question. Pet policies are set by the landlord and may vary by property.\n\nI can flag this as a query to the property manager, who will confirm the current policy for JVC Garden Apartments.\n\nWould you like me to send that inquiry on your behalf?", time: nowTime(309), status: 'read' },
    { role: 'tenant', content: 'Yes please!', time: nowTime(308), status: 'read' },
    { role: 'agent', content: "Done ✅ I've sent a pet policy inquiry to the property manager. You should hear back within 1–2 business days.\n\nIs there anything else I can help you with today?", time: nowTime(307), status: 'read' },
    { role: 'tenant', content: 'That\'s great, thanks!', time: nowTime(305), status: 'read' },
  ],
  'wa-fatima': [
    { role: 'tenant', content: '🚨 EMERGENCY — the water heater is leaking and water is spreading in the kitchen!!!', time: nowTime(8), status: 'read' },
    { role: 'agent', content: "🚨 *EMERGENCY ALERT RECEIVED*\n\nFatima, please:\n1. *Turn off the water main* if you can locate it safely\n2. *Do NOT touch electrical outlets* near the water\n3. Move to a dry area\n\nI've escalated this as an *EMERGENCY* ticket. The on-call plumber has been notified and building management has been alerted.\n\n*Estimated response: 30–60 minutes*\n\nAre you safe? Reply to confirm. 🙏", time: nowTime(7), status: 'read' },
    { role: 'tenant', content: "I'm safe, found the water main and turned it off", time: nowTime(6), status: 'read' },
    { role: 'agent', content: "Great — you did the right thing. 👍\n\nTicket #TKT-004 is open and escalated.\n\nThe plumber will call you within the next 15 minutes. Please stay away from the kitchen until the issue is resolved.\n\nI'll monitor this and keep you updated. 🙏", time: nowTime(5), status: 'read' },
  ],
}

const CONTACTS: WaContact[] = [
  { id: 'wa-fatima', tenantId: 'tenant-fatima-ali', name: 'Fatima Ali', phone: '+971 50 444 5555', unitNumber: '905', propertyName: 'Al Reem Island Tower', leaseStatus: 'Active', leaseEndDate: '31 Jan 2025', rentAmount: 85000, unread: 0 },
  { id: 'wa-sarah', tenantId: 'tenant-sarah-johnson', name: 'Sarah Johnson', phone: '+971 50 123 4567', unitNumber: '1204', propertyName: 'Marina Heights', leaseStatus: 'ExpiringSoon', leaseEndDate: '31 Dec 2024', rentAmount: 95000, unread: 1 },
  { id: 'wa-omar', tenantId: 'tenant-omar-hassan', name: 'Omar Hassan', phone: '+971 55 987 6543', unitNumber: '1802', propertyName: 'Marina Heights', leaseStatus: 'Active', leaseEndDate: '28 Feb 2025', rentAmount: 100000, unread: 1 },
  { id: 'wa-daniel', tenantId: 'tenant-daniel-lee', name: 'Daniel Lee', phone: '+971 56 789 0123', unitNumber: 'A-302', propertyName: 'JVC Garden', leaseStatus: 'ExpiringSoon', leaseEndDate: '30 Nov 2024', rentAmount: 55000, unread: 1 },
  { id: 'wa-emily', tenantId: 'tenant-emily-carter', name: 'Emily Carter', phone: '+971 52 345 6789', unitNumber: 'A-301', propertyName: 'JVC Garden', leaseStatus: 'Active', leaseEndDate: '31 Mar 2025', rentAmount: 55000, unread: 0 },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function avatarColor(name: string) {
  const colors = ['bg-teal-500', 'bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-rose-500', 'bg-green-600']
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function ReadReceipt({ status }: { status: WaMessage['status'] }) {
  if (status === 'sent') return <span className="text-gray-400">✓</span>
  if (status === 'delivered') return <span className="text-gray-400">✓✓</span>
  return <span className="text-blue-400">✓✓</span>
}

function formatContent(text: string) {
  return text
    .replace(/\*(.+?)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

// ─── WhatsApp background pattern (CSS) ────────────────────────────────────

const WA_BG_STYLE = {
  backgroundColor: '#efeae2',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c9b8' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function WhatsAppPage() {
  const [selectedId, setSelectedId] = useState<string>('wa-fatima')
  const [conversations, setConversations] = useState<Record<string, WaMessage[]>>(() =>
    Object.fromEntries(Object.entries(SEEDED).map(([k, v]) => [k, [...v]]))
  )
  const [unread, setUnread] = useState<Record<string, number>>(() =>
    Object.fromEntries(CONTACTS.map(c => [c.id, c.unread]))
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const contact = CONTACTS.find(c => c.id === selectedId)!
  const messages = conversations[selectedId] ?? []
  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.propertyName.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function selectContact(id: string) {
    setSelectedId(id)
    setUnread(prev => ({ ...prev, [id]: 0 }))
    inputRef.current?.focus()
  }

  function getTime() {
    return new Date().toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading || !contact) return

    const tenantMsg: WaMessage = { role: 'tenant', content: text, time: getTime(), status: 'read' }
    const newMessages = [...messages, tenantMsg]
    setConversations(prev => ({ ...prev, [selectedId]: newMessages }))
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: contact.tenantId,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      if (data.reply) {
        const agentMsg: WaMessage = { role: 'agent', content: data.reply, time: getTime(), status: 'delivered' }
        setConversations(prev => ({ ...prev, [selectedId]: [...newMessages, agentMsg] }))
      }
    } catch {
      const errMsg: WaMessage = { role: 'agent', content: "Sorry, I'm having trouble connecting. Please try again.", time: getTime(), status: 'delivered' }
      setConversations(prev => ({ ...prev, [selectedId]: [...newMessages, errMsg] }))
    } finally {
      setLoading(false)
    }
  }

  const lastMsg = (id: string) => {
    const msgs = conversations[id]
    if (!msgs?.length) return ''
    const last = msgs[msgs.length - 1]
    return (last.role === 'agent' ? '🤖 ' : '') + last.content.replace(/\*(.+?)\*/g, '$1').replace(/\n/g, ' ').slice(0, 38) + (last.content.length > 38 ? '…' : '')
  }

  const lastTime = (id: string) => {
    const msgs = conversations[id]
    if (!msgs?.length) return ''
    return msgs[msgs.length - 1].time
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>

      {/* ── WhatsApp inbox sidebar ── */}
      <div className="w-80 flex flex-col border-r border-gray-200" style={{ backgroundColor: '#111b21' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#202c33' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">PC</div>
            <div>
              <p className="text-sm font-medium text-white">Property Copilot</p>
              <p className="text-xs text-gray-400">WhatsApp Business Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <button className="hover:text-white transition-colors" title="New chat">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"/></svg>
            </button>
            <button className="hover:text-white transition-colors" title="Menu">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/></svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2" style={{ backgroundColor: '#111b21' }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ backgroundColor: '#202c33' }}>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              placeholder="Search tenants"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none flex-1"
            />
          </div>
        </div>

        {/* Demo banner */}
        <div className="mx-3 mb-1 px-3 py-1.5 rounded-lg text-xs text-center" style={{ backgroundColor: '#182229', color: '#8696a0' }}>
          Demo — 5 UAE tenant conversations
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(c => {
            const isSelected = c.id === selectedId
            const u = unread[c.id] ?? 0
            return (
              <button
                key={c.id}
                onClick={() => selectContact(c.id)}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                style={{ backgroundColor: isSelected ? '#2a3942' : 'transparent' }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = '#202c33' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0', avatarColor(c.name))}>
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">{c.name}</p>
                    <span className={cn('text-xs flex-shrink-0', u > 0 ? 'text-green-400' : 'text-gray-500')}>{lastTime(c.id)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-gray-400 truncate">{lastMsg(c.id)}</p>
                    {u > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">{u}</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#8696a0' }}>
                    {c.unitNumber} · {c.propertyName}
                    {c.leaseStatus === 'ExpiringSoon' && <span className="ml-1 text-yellow-400">⚠ expiring</span>}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Chat window ── */}
      <div className="flex-1 flex flex-col">

        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700" style={{ backgroundColor: '#202c33' }}>
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm', avatarColor(contact.name))}>
              {initials(contact.name)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{contact.name}</p>
              <p className="text-xs" style={{ color: '#8696a0' }}>{contact.phone} · Unit {contact.unitNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <button className="hover:text-white transition-colors" title="Video call">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </button>
            <button className="hover:text-white transition-colors" title="Voice call">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
            </button>
            <button className="hover:text-white transition-colors" title="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
            <button className="hover:text-white transition-colors" title="Menu">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-16 py-4 space-y-1" style={WA_BG_STYLE}>

          {/* Date marker */}
          <div className="flex justify-center mb-4">
            <span className="text-xs px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: '#d1f2d8', color: '#667781' }}>
              Today
            </span>
          </div>

          {messages.map((msg, i) => {
            const isOutgoing = msg.role === 'tenant'
            return (
              <div key={i} className={cn('flex', isOutgoing ? 'justify-end' : 'justify-start')}>
                <div
                  className="max-w-[65%] px-3 py-2 rounded-lg shadow-sm relative"
                  style={{
                    backgroundColor: isOutgoing ? '#d9fdd3' : '#ffffff',
                    borderRadius: isOutgoing ? '8px 0 8px 8px' : '0 8px 8px 8px',
                  }}
                >
                  <p
                    className="text-sm text-gray-800 leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                  <div className={cn('flex items-center gap-1 mt-1', isOutgoing ? 'justify-end' : 'justify-start')}>
                    <span className="text-xs" style={{ color: '#667781' }}>{msg.time}</span>
                    {isOutgoing && <ReadReceipt status={msg.status} />}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg shadow-sm" style={{ backgroundColor: '#ffffff', borderRadius: '0 8px 8px 8px' }}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 150, 300].map(delay => (
                    <div
                      key={delay}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: '#8696a0', animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: '#202c33' }}>
          <button className="text-gray-400 hover:text-white transition-colors" title="Emoji">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5c-.83 0-1.5-.67-1.5-1.5S9.17 13.5 10 13.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 10c-2.33 0-4.31 1.46-5.11 3.5h10.22C16.31 11.46 14.33 10 12 10z"/></svg>
          </button>
          <button className="text-gray-400 hover:text-white transition-colors" title="Attach">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message"
            className="flex-1 rounded-lg px-4 py-2 text-sm outline-none text-gray-100 placeholder-gray-500"
            style={{ backgroundColor: '#2a3942' }}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
            style={{ backgroundColor: input.trim() ? '#00a884' : '#8696a0' }}
            title="Send"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
