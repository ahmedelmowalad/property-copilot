'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Msg { role: 'tenant' | 'agent'; content: string }

type ConvItem =
  | { kind: 'message'; role: 'tenant' | 'agent'; content: string; time: string }
  | { kind: 'card'; cardType: string; time: string }

// Stages that auto-advance without user input
const AUTO_ADVANCE = new Set([
  'triaged','hoa_checked','availability_set','providers_found',
  'quote_selected','security_cleared','tech_dispatched','en_route',
  'arrived','diagnosing','repairing','work_done','invoiced',
  'paid','feedback_collected',
])

// ─── Card components ──────────────────────────────────────────────────────────

function TriageCard() {
  return (
    <div className="ml-11 max-w-[500px]">
      <div className="rounded-2xl rounded-tl-sm border border-red-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-orange-600 px-4 py-3"><span className="text-white text-sm font-semibold">🔍 Automated Triage — Result</span></div>
        <div className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            {[['Issue','Water Leak'],['Urgency','HIGH'],['Category','Plumbing'],['Unit','A-301 · JVC']].map(([k,v]) => (
              <div key={k}><div className="text-[11px] uppercase text-gray-400 tracking-wide">{k}</div>
                {k==='Urgency' ? <div className="font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded inline-block text-sm">{v}</div> : <div className="font-medium text-gray-900">{v}</div>}
              </div>
            ))}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs">
            <div className="font-medium text-red-900 mb-0.5">Autonomous workflow activated</div>
            <div className="text-red-800">AI is now handling: provider search → community access → scheduling → tracking → payment. No action needed from you.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HOARulesCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-blue-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">📋 JVC Community Rules — Verified</span></div>
        <div className="p-4 space-y-2 text-xs">
          {[['Community','JVC Garden Apartments'],['Emergency access','Allowed 24/7 with notice'],['Notice required','24 hours to security'],['Contractor','Approved list + verified licence'],].map(([k,v]) => (
            <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
          ))}
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 mt-1 text-[10px] text-emerald-800">✓ Pro Plumbing Solutions is on the JVC approved contractor list</div>
        </div>
      </div>
    </div>
  )
}

function AvailabilityCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-amber-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-amber-600 px-4 py-2.5"><span className="text-white text-sm font-semibold">📅 Tenant Availability — Confirmed</span></div>
        <div className="p-4 space-y-2 text-xs">
          <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
            <div className="font-medium text-gray-700">Emily Carter</div>
            <div className="flex justify-between"><span className="text-gray-500">Work schedule</span><span className="font-medium">9 AM – 5 PM</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Available from</span><span className="font-medium">5:00 PM today</span></div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10px] text-emerald-800">✓ Booking technician visit for 5:15–6:30 PM today</div>
        </div>
      </div>
    </div>
  )
}

function ProviderSearchCard() {
  return (
    <div className="ml-11 max-w-[520px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5"><span className="text-white text-sm font-semibold">🔍 Provider Search — JVC Area</span></div>
        <div className="p-4 space-y-2 text-xs">
          {[
            ['Pro Plumbing Solutions','4.8⭐ · 12 reviews','5 km','5:15 PM','AED 250+parts',true],
            ['Emirates Fix Services','4.5⭐ · 28 reviews','8 km','5:45 PM','AED 300+parts',false],
            ['Quick Repair UAE','4.3⭐ · 9 reviews','3 km','6:30 PM','AED 280+parts',false],
          ].map(([name,rating,dist,eta,price,selected]) => (
            <div key={name as string} className={cn('flex items-center justify-between p-2 border rounded-lg', selected ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200')}>
              <div><div className="font-medium text-gray-900">{name}</div><div className="text-[10px] text-gray-500">{rating} · {dist}</div></div>
              <div className="text-right text-[10px]"><div className="font-medium text-gray-900">{eta}</div><div className="text-gray-500">{price}</div></div>
              {selected && <span className="ml-2 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Selected</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuoteComparisonCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5"><span className="text-white text-sm font-semibold">💰 Quote — Pro Plumbing Solutions</span></div>
        <div className="p-4 space-y-2 text-xs">
          {[['Callout fee','AED 250'],['Est. labour (1 hr)','AED 150'],['Est. materials','AED 80–150'],].map(([k,v]) => (
            <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
          ))}
          <div className="border-t pt-1.5 flex justify-between font-semibold"><span>Est. Total</span><span>AED 330–400</span></div>
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[10px] text-blue-800">Licensed & insured · 24-month parts warranty · JVC HOA approved</div>
        </div>
      </div>
    </div>
  )
}

function SecurityApprovalCard() {
  return (
    <div className="ml-11 max-w-[500px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">🔐 JVC Security Access — APPROVED</span></div>
        <div className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[['Technician','Rashid Al-Mansoori'],['Licence','PM-5847-2024 ✓'],['Access window','5:15–6:30 PM'],['Gate','JVC Gate A'],].map(([k,v]) => (
              <div key={k}><div className="text-gray-500">{k}</div><div className="font-medium text-gray-900">{v}</div></div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10px] text-emerald-800">✓ Licence verified · Added to access database · Gate pre-cleared</div>
        </div>
      </div>
    </div>
  )
}

function TechnicianAssignedCard() {
  return (
    <div className="ml-11 max-w-[460px]">
      <div className="rounded-2xl rounded-tl-sm border border-blue-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">👨‍🔧 Technician Dispatched</span></div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">RA</div>
            <div><div className="font-medium text-sm text-gray-900">Rashid Al-Mansoori</div><div className="text-xs text-gray-500">10+ years · 4.8⭐ · 240 jobs</div></div>
          </div>
          <div className="space-y-1.5 text-xs">
            {[['ETA','5:15 PM (on schedule)'],['Licence','PM-5847-2024'],['Vehicle','White van · UAE 4829'],['Tracking','Live GPS active'],].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ stage }: { stage: string }) {
  const map: Record<string, [string, string, string]> = {
    'status-en-route': ['🚗','En Route','Rashid is driving to JVC — ETA 5:10 PM'],
    'status-arrived': ['👋','Arrived','At JVC Gate A — heading to Block A'],
    'status-diagnosing': ['🔍','Diagnosing','Inspecting the kitchen sink'],
    'status-in-progress': ['🔧','Repair In Progress','Replacing P-trap + pressure testing'],
  }
  const [icon, title, desc] = map[stage] ?? ['⚙️','Working','In progress…']
  const color = stage === 'status-en-route' ? 'bg-blue-50 border-blue-200' : stage === 'status-in-progress' ? 'bg-yellow-50 border-yellow-200' : 'bg-amber-50 border-amber-200'
  return (
    <div className="ml-11 max-w-[400px]">
      <div className={cn('rounded-2xl rounded-tl-sm border px-4 py-3 shadow-sm', color)}>
        <div className="flex items-center gap-2"><span className="text-lg">{icon}</span><div><div className="font-medium text-gray-900 text-sm">{title}</div><div className="text-xs text-gray-600">{desc}</div></div></div>
      </div>
    </div>
  )
}

function CompletionPhotosCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5"><span className="text-white text-sm font-semibold">📸 Work Completion — Before & After</span></div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[['Before (10:40)','Water pooling under sink'],['After (10:58)','New P-trap installed']].map(([label, desc]) => (
              <div key={label}><div className="text-[10px] text-gray-500 mb-1">{label}</div><div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 text-center p-2">[{desc}]</div></div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-xs">
            <div className="font-medium text-emerald-900">✓ Pressure tested · Zero leaks</div>
            <div className="text-emerald-700 text-[10px]">Warranty: 24-month parts + 12-month labour</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoiceCard() {
  return (
    <div className="ml-11 max-w-[420px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5"><span className="text-white text-sm font-semibold">💳 Invoice — #INV-2025-4821</span></div>
        <div className="p-4 space-y-2 text-xs">
          <div className="space-y-1 border-b border-gray-100 pb-2">
            {[['Brass P-trap + fittings','AED 180'],['Labour (1 hour)','AED 150'],['Pressure test + safety check','Included']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-semibold pt-1"><span>Total (incl. 5% VAT)</span><span>AED 330</span></div>
        </div>
      </div>
    </div>
  )
}

function PaymentCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">✅ Payment Processed</span></div>
        <div className="p-4 space-y-2 text-xs">
          {[['Amount','AED 330.00'],['Method','Emirates NBD Debit ••4521'],['Transaction','TXN-2025-847392'],['Status','Confirmed']].map(([k,v]) => (
            <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
          ))}
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10px] text-emerald-800 mt-1">✓ Receipt emailed · Technician compensated AED 280</div>
        </div>
      </div>
    </div>
  )
}

function FeedbackCard() {
  const [rating, setRating] = useState(0)
  return (
    <div className="flex justify-end">
      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 space-y-2 max-w-[320px]">
        <div className="text-sm font-medium">How was your experience?</div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} className={cn('text-2xl transition-transform', rating >= n ? 'scale-110' : 'opacity-40')}>⭐</button>)}
        </div>
        {rating > 0 && <div className="text-xs opacity-90">{rating === 5 ? 'Excellent! Thanks 🙏' : rating >= 3 ? 'Thanks for your feedback!' : 'We\'ll work to improve'}</div>}
      </div>
    </div>
  )
}

function FinalSummaryCard() {
  const items = [
    ['Issue reported','Water leak under kitchen sink'],
    ['Auto-triaged','HIGH urgency · Plumbing'],
    ['Community rules verified','JVC access rules checked'],
    ['Tenant availability confirmed','Available after 5 PM'],
    ['3 providers queried','Best: Pro Plumbing Solutions'],
    ['Security access granted','Licence PM-5847-2024 verified'],
    ['Technician dispatched','Rashid Al-Mansoori · on time'],
    ['Work completed','P-trap replaced · tested · warranty'],
    ['Payment processed','AED 330 · Emirates NBD ••4521'],
    ['Feedback collected','5⭐ from tenant'],
    ['Records updated','Maintenance log · warranty · receipt'],
  ]
  return (
    <div className="ml-11 max-w-[560px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">🎉</div>
          <div><div className="text-white font-semibold text-sm">Maintenance Complete — Zero Human Intervention</div><div className="text-emerald-100 text-[11px]">Water leak · JVC Garden · Unit A-301</div></div>
        </div>
        <div className="p-4 space-y-2">
          {items.map(([t,s]) => (
            <div key={t} className="flex items-start gap-2.5 text-xs">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">✓</span>
              <div><div className="font-medium text-gray-900">{t}</div><div className="text-gray-500">{s}</div></div>
            </div>
          ))}
        </div>
        <div className="border-t border-emerald-200 bg-emerald-50/60 px-4 py-3 flex items-center justify-between text-xs">
          <span className="text-emerald-800">Total time: <strong>1h 3m</strong> · Human decisions: <strong>0</strong></span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-medium">Fully Autonomous</span>
        </div>
      </div>
    </div>
  )
}

// ─── Bubble ───────────────────────────────────────────────────────────────────

function Bubble({ role, content, time }: { role: 'tenant' | 'agent'; content: string; time: string }) {
  const isAgent = role === 'agent'
  const html = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  return (
    <div className={cn('flex gap-3', isAgent ? 'justify-start' : 'justify-end')}>
      {isAgent && <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">PC</div>}
      <div className="max-w-[78%]">
        <div className={cn('px-4 py-3 rounded-2xl text-sm leading-relaxed', isAgent ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm' : 'bg-blue-600 text-white rounded-tr-sm')} dangerouslySetInnerHTML={{ __html: html }} />
        <div className={cn('text-[10px] mt-1 px-1', isAgent ? 'text-gray-400' : 'text-right text-gray-400')}>{time} GST</div>
      </div>
      {!isAgent && <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0 mt-0.5">EC</div>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const WELCOME: ConvItem = {
  kind: 'message', role: 'agent', time: '10:00',
  content: 'Hi Emily! 👋 I\'m your Property Copilot maintenance AI.\n\nI handle everything **fully automatically** — from finding the right technician to coordinating security access and processing payment. You just describe the issue.\n\nWhat\'s the problem in your unit?',
}

const QUICK_ISSUES = [
  { label: "Water leak under my kitchen sink", icon: '💧' },
  { label: "AC not cooling, very hot", icon: '❄️' },
  { label: "Power socket sparking in bedroom", icon: '⚡' },
  { label: "Door lock is broken", icon: '🔑' },
]

function getTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getMsgs(conv: ConvItem[]): Msg[] {
  return conv.filter((c): c is Extract<ConvItem, { kind: 'message' }> => c.kind === 'message').map(c => ({ role: c.role!, content: c.content! }))
}

export default function MaintenanceDemoPage() {
  const [items, setItems] = useState<ConvItem[]>([WELCOME])
  const [stage, setStage] = useState('initial')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef(stage)
  const itemsRef = useRef(items)
  useEffect(() => { stageRef.current = stage }, [stage])
  useEffect(() => { itemsRef.current = items }, [items])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items, loading])

  // Auto-advance autonomous stages with realistic delays
  useEffect(() => {
    if (!AUTO_ADVANCE.has(stage)) return
    const delay = stage === 'tech_dispatched' ? 4000 : stage === 'en_route' ? 5000 : stage === 'arrived' ? 3000 : stage === 'diagnosing' ? 4000 : stage === 'repairing' ? 6000 : 2500
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/maintenance-demo/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: getMsgs(itemsRef.current), stage: stageRef.current, trigger: 'auto_next' }),
        }).then(r => r.json())
        const t = getTime()
        setItems(prev => [...prev, { kind: 'message', role: 'agent', content: res.reply, time: t }])
        setStage(res.nextStage)
        if (res.card) {
          setTimeout(() => setItems(prev => [...prev, { kind: 'card', cardType: res.card, time: t }]), 500)
        }
      } finally {
        setLoading(false)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  async function processResponse(snapshot: ConvItem[], currentStage: string) {
    try {
      const res = await fetch('/api/maintenance-demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: getMsgs(snapshot), stage: currentStage }),
      }).then(r => r.json())
      const t = getTime()
      setItems(prev => [...prev, { kind: 'message', role: 'agent', content: res.reply, time: t }])
      setStage(res.nextStage)
      if (res.card) {
        setTimeout(() => setItems(prev => [...prev, { kind: 'card', cardType: res.card, time: t }]), 500)
      }
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    setLoading(true)
    const t = getTime()
    const newItems: ConvItem[] = [...itemsRef.current, { kind: 'message', role: 'tenant', content, time: t }]
    setItems(newItems)
    await processResponse(newItems, stageRef.current)
  }

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Autonomous AI</div>
          <h2 className="font-semibold text-gray-900 text-base">Maintenance Agent</h2>
          <p className="text-xs text-gray-500 mt-0.5">Describe the issue — AI handles everything</p>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">EC</div>
              <div><div className="font-semibold text-sm text-gray-900">Emily Carter</div><div className="text-xs text-gray-500">Unit A-301 · JVC</div></div>
            </div>
            <div className="space-y-1.5 text-xs">
              {[['Unit','A-301 · JVC Garden'],['Lease','Active · Mar 2025'],['Preferred','Weekday evenings']].map(([k,v]) => (
                <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2">Report an Issue</div>
            <div className="space-y-1.5">
              {QUICK_ISSUES.map(q => (
                <button key={q.label} onClick={() => sendMessage(q.label)} disabled={loading || stage !== 'initial'} className="w-full text-left text-xs bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 border border-gray-200 text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-lg flex items-center gap-2 disabled:opacity-40">
                  <span>{q.icon}</span>{q.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">Workflow Stage</div>
            <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2 font-mono">{stage}</div>
            {AUTO_ADVANCE.has(stage) && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI processing autonomously…
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">Names, IDs & references are simulated</p>
        </div>
      </div>

      {/* Right — chat */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">PC</div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">Maintenance AI · Emily Carter</h1>
            <p className="text-xs text-gray-500">Connected to Providers · Security · JVC Community Portal</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {AUTO_ADVANCE.has(stage) ? 'Autonomous' : 'Listening'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {items.map((item, i) => {
            if (item.kind === 'message') return <Bubble key={i} role={item.role!} content={item.content!} time={item.time} />
            const ct = item.cardType
            if (ct === 'triage-card') return <TriageCard key={i} />
            if (ct === 'hoa-rules') return <HOARulesCard key={i} />
            if (ct === 'availability-check') return <AvailabilityCard key={i} />
            if (ct === 'provider-search') return <ProviderSearchCard key={i} />
            if (ct === 'quote-comparison') return <QuoteComparisonCard key={i} />
            if (ct === 'security-approval') return <SecurityApprovalCard key={i} />
            if (ct === 'technician-assigned') return <TechnicianAssignedCard key={i} />
            if (['status-en-route','status-arrived','status-diagnosing','status-in-progress'].includes(ct)) return <StatusCard key={i} stage={ct} />
            if (ct === 'completion-photos') return <CompletionPhotosCard key={i} />
            if (ct === 'invoice-card') return <InvoiceCard key={i} />
            if (ct === 'payment-processed') return <PaymentCard key={i} />
            if (ct === 'feedback-card') return <FeedbackCard key={i} />
            if (ct === 'final-summary') return <FinalSummaryCard key={i} />
            return null
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">PC</div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0,150,300].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={stage === 'initial' ? "Describe your issue — e.g. 'water leak under kitchen sink'" : "Ask a question or add details…"}
              disabled={loading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">AI handles everything after you describe the issue — zero human decisions required</p>
        </div>
      </div>
    </div>
  )
}
