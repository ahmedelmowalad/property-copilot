'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Msg { role: 'tenant' | 'agent'; content: string }

type ConvItem =
  | { kind: 'message'; role: 'tenant' | 'agent'; content: string; time: string }
  | { kind: 'card'; cardType: string; time: string }

// ─── Card components ──────────────────────────────────────────────────────────

function DLDCard() {
  return (
    <div className="ml-11 max-w-[560px]">
      <div className="rounded-2xl rounded-tl-sm overflow-hidden border border-gray-200 shadow-sm bg-white">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">DLD</div>
          <div>
            <div className="text-white font-semibold text-sm">Dubai Land Department</div>
            <div className="text-emerald-100 text-xs">RERA Rental Index — Live Lookup · Q4 2024</div>
          </div>
          <div className="ml-auto text-[10px] text-emerald-100 uppercase tracking-wider">Verified</div>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            {[['Area','Dubai Marina'],['Configuration','2BR Apartment'],['Building Tier','Premium / Sea View'],['Index Quarter','Q4 2024']].map(([k,v]) => (
              <div key={k}><div className="text-[11px] uppercase text-gray-400 tracking-wide">{k}</div><div className="font-medium text-gray-900">{v}</div></div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3">
            <div className="text-[11px] uppercase text-gray-400 tracking-wide mb-1.5">RERA Market Range (Annual)</div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">AED 115,000 – 125,000</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Median 120,000</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
            <div className="font-medium text-amber-900 mb-0.5">Your current rent: AED 95,000 (~21% below market)</div>
            <div className="text-amber-800">Per <strong>Decree No. 43 of 2013</strong>: rent 21–30% below market permits max <strong>15%</strong> increase.</div>
          </div>
          <a className="block text-[11px] text-emerald-700 hover:underline" href="#">↗ Source: dubailand.gov.ae/rental-index</a>
        </div>
      </div>
    </div>
  )
}

function ContractPrepCard() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers = [500, 1000, 1600, 2200, 2900].map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms)
    )
    return () => timers.forEach(clearTimeout)
  }, [])
  const steps = ['Filling Form F (DLD Unified Contract)', 'Inserting tenant & landlord details', 'Adding new terms', 'Generating contract reference', 'Final PDF rendering']
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2"><span className="text-base">📝</span><span className="font-medium text-sm text-gray-900">Generating Tenancy Contract (Form F)</span></div>
        <div className="space-y-2 text-xs">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              {step > i ? (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
              ) : step === i ? (
                <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" />
              )}
              <span className={step > i ? 'text-gray-700' : step === i ? 'text-blue-600' : 'text-gray-400'}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContractReadyCard() {
  return (
    <div className="ml-11 max-w-[420px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-12 bg-white border border-emerald-300 rounded flex items-center justify-center text-emerald-700 text-[10px] font-bold">PDF</div>
          <div>
            <div className="font-medium text-sm text-emerald-900">Tenancy_Contract_Marina_1204_2025.pdf</div>
            <div className="text-xs text-emerald-700 mt-0.5">Ref: TC-MH-1204-2025-0117</div>
            <div className="text-[11px] text-emerald-600 mt-1">DLD-approved Form F · 4 pages · 248 KB</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UAEPassCard({ signed, onSign }: { signed: boolean; onSign: () => void }) {
  return (
    <div className="ml-11 max-w-[420px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-emerald-700 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-red-700 font-bold text-sm">UAE</div>
          <div><div className="text-white font-semibold text-sm">UAE PASS</div><div className="text-white/80 text-[11px]">Digital Identity & Signature</div></div>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-700">Signature request sent to your UAE Pass account <strong>••345</strong>.</p>
          {!signed ? (
            <button onClick={onSign} className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
              <span>📱</span> Open UAE Pass App & Sign
            </button>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
              <div><div className="font-medium text-emerald-900">Signed via UAE Pass</div><div className="text-[11px] text-emerald-700">Sarah Johnson · Hash 0x8a3f…b21e</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LandlordApprovalCard({ approved, onApprove }: { approved: boolean; onApprove: () => void }) {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2"><span>🏢</span><span className="font-medium text-sm text-gray-900">Landlord Counter-Signature Required</span></div>
        <div className="p-4 space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
            {[['Sent to','Mr. Ahmed Al-Mansouri'],['Role','Authorised Representative'],['Entity','Marina Heights Holdings LLC'],['Channel','Email + WhatsApp']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
            ))}
          </div>
          {!approved ? (
            <>
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                Awaiting human approval — typically 5–30 minutes
              </div>
              <button onClick={onApprove} className="w-full bg-gray-900 hover:bg-black text-white text-xs font-medium py-2 rounded-lg">▶ Simulate Landlord Approval (demo)</button>
            </>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-1"><span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span><span className="font-medium text-emerald-900">Approved & counter-signed</span></div>
              <div className="text-[11px] text-emerald-700">A. Al-Mansouri · UAE Pass verified</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DLDSubmissionCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">📤 DLD Submission Confirmed</span></div>
        <div className="p-4 space-y-2 text-xs">
          {[['Reference','DLD-2025-MH-1204-78432'],['Status','Accepted'],['Documents','Contract, IDs, Title Deed']].map(([k,v]) => (
            <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span>
              {k === 'Status' ? <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{v}</span> : <span className="font-medium text-gray-900">{v}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChequePhotosCard({ uploaded, onUpload }: { uploaded: boolean; onUpload: () => void }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[420px]">
        {!uploaded ? (
          <button onClick={onUpload} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm flex items-center gap-2"><span>📎</span> Upload 4 cheque photos</button>
        ) : (
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3">
            <div className="text-xs mb-2 opacity-90">📎 4 photos attached</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[1,2,3,4].map(n => (
                <div key={n} className="bg-white rounded-md p-1.5 flex flex-col justify-between aspect-[1.7/1]">
                  <div className="flex justify-between text-[8px] text-gray-500"><span>EMIRATES NBD</span><span className="font-mono">{n===1?'01·01·25':n===2?'01·04·25':n===3?'01·07·25':'01·10·25'}</span></div>
                  <div className="text-[9px] text-gray-700 italic">Marina Heights Holdings</div>
                  <div className="text-[8px] font-mono text-gray-700">AED 24,250</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PMConfirmationCard({ confirmed, onConfirm }: { confirmed: boolean; onConfirm: () => void }) {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2"><span>📋</span><span className="font-medium text-sm text-gray-900">Property Manager — Cheque Receipt</span></div>
        <div className="p-4 space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
            {[['Assigned PM','Layla Khan'],['Office','Marina Walk Tower A'],['Expected','4 cheques · AED 97,000']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
            ))}
          </div>
          {!confirmed ? (
            <>
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                Waiting for PM to confirm physical receipt…
              </div>
              <button onClick={onConfirm} className="w-full bg-gray-900 hover:bg-black text-white text-xs font-medium py-2 rounded-lg">▶ Simulate PM Confirmation (demo)</button>
            </>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span><span className="font-medium text-emerald-900">All 4 cheques received by PM</span></div>
              <div className="text-[11px] text-emerald-700 mt-1">Layla Khan · Safe Slot 12-A</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EjariCompleteCard({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 800); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">🪪 Ejari Registered ✅</span></div>
        <div className="p-4 space-y-2 text-xs">
          {[['Ejari Number','2748293-2025'],['Valid until','31 Dec 2025'],['Certificate','↗ Download PDF']].map(([k,v]) => (
            <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className={v.startsWith('↗') ? 'text-blue-600 cursor-pointer hover:underline' : 'font-medium text-gray-900'}>{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DocumentUploadCard({ uploaded, onUpload }: { uploaded: boolean; onUpload: () => void }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[400px]">
        {!uploaded ? (
          <button onClick={onUpload} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm flex items-center gap-2"><span>📎</span> Upload Emirates ID + Passport</button>
        ) : (
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3 space-y-1.5">
            <div className="text-xs opacity-90 mb-1">📎 3 documents attached</div>
            {['Emirates_ID_Front.jpg','Emirates_ID_Back.jpg','Passport_Bio.pdf'].map(name => (
              <div key={name} className="bg-white/15 rounded px-2 py-1.5 text-xs flex items-center gap-2"><span>📄</span><span>{name}</span></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CompletionCard() {
  const items = [
    ['Renewal intent verified','Sarah confirmed renewal'],
    ['DLD RERA index check','Q4 2024 data · increase legally permitted'],
    ['Price negotiated','AED 95,000 → AED 97,000 (2.1% increase)'],
    ['Terms agreed','4 quarterly cheques · 1 Jan 2025 – 31 Dec 2025'],
    ['Contract generated','Form F — TC-MH-1204-2025-0117'],
    ['Tenant signed','UAE Pass · digitally verified'],
    ['Landlord counter-signed','A. Al-Mansouri · Marina Heights Holdings'],
    ['DLD submission','DLD-2025-MH-1204-78432 · Accepted'],
    ['Cheques collected','4 × AED 24,250 · received by PM'],
    ['Ejari registered','No. 2748293-2025'],
    ['Tenant docs updated','Emirates ID + passport on file'],
    ['Internal records updated','Lease, rent, expiry all refreshed'],
  ]
  return (
    <div className="ml-11 max-w-[560px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">🎉</div>
          <div><div className="text-white font-semibold text-sm">Lease Renewal Complete</div><div className="text-emerald-100 text-[11px]">Sarah Johnson · Unit 1204 · Marina Heights</div></div>
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
          <span className="text-emerald-800">Human touchpoints: <strong>2</strong></span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-medium">All systems updated</span>
        </div>
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ role, content, time }: { role: 'tenant' | 'agent'; content: string; time: string }) {
  const isAgent = role === 'agent'
  const html = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  return (
    <div className={cn('flex gap-3', isAgent ? 'justify-start' : 'justify-end')}>
      {isAgent && <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">PC</div>}
      <div className="max-w-[78%]">
        <div className={cn('px-4 py-3 rounded-2xl text-sm leading-relaxed', isAgent ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm' : 'bg-blue-600 text-white rounded-tr-sm')} dangerouslySetInnerHTML={{ __html: html }} />
        <div className={cn('text-[10px] mt-1 px-1', isAgent ? 'text-gray-400' : 'text-right text-gray-400')}>{time} GST</div>
      </div>
      {!isAgent && <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0 mt-0.5">SJ</div>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const WELCOME: ConvItem = {
  kind: 'message', role: 'agent', time: '10:00',
  content: 'Hi Sarah! 👋 I\'m your Property Copilot renewal assistant.\n\nYour lease for **Unit 1204, Marina Heights** expires on **31 Dec 2024**. I can guide you through the full renewal process — from checking market rates to Ejari registration.\n\nJust tell me you\'d like to renew and I\'ll get started.',
}

function getTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getMsgs(conv: ConvItem[]): Msg[] {
  return conv.filter((c): c is Extract<ConvItem, { kind: 'message' }> => c.kind === 'message').map(c => ({ role: c.role!, content: c.content! }))
}

export default function RenewalDemoPage() {
  const [items, setItems] = useState<ConvItem[]>([WELCOME])
  const [stage, setStage] = useState('initial')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uaePassSigned, setUAEPassSigned] = useState(false)
  const [landlordApproved, setLandlordApproved] = useState(false)
  const [chequesUploaded, setChequesUploaded] = useState(false)
  const [pmConfirmed, setPmConfirmed] = useState(false)
  const [docsUploaded, setDocsUploaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef(stage)
  const itemsRef = useRef(items)
  useEffect(() => { stageRef.current = stage }, [stage])
  useEffect(() => { itemsRef.current = items }, [items])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items, loading])

  async function processResponse(snapshot: ConvItem[], currentStage: string, trigger?: string) {
    try {
      const res = await fetch('/api/renewal-demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: getMsgs(snapshot), stage: currentStage, trigger }),
      }).then(r => r.json())

      const t = getTime()
      setItems(prev => [...prev, { kind: 'message', role: 'agent', content: res.reply, time: t }])
      setStage(res.nextStage)

      if (res.card) {
        // Show contract-ready card shortly after contract-prep card
        const delay = res.card === 'uaepass-card' ? 3200 : 500
        setTimeout(() => {
          setItems(prev => [...prev, { kind: 'card', cardType: res.card, time: t }])
          // contract-prep followed by contract-ready
          if (res.card === 'contract-prep') {
            setTimeout(() => {
              setItems(prev => [...prev, { kind: 'card', cardType: 'contract-ready', time: getTime() }])
            }, 3000)
          }
        }, delay)
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

  async function triggerAction(trigger: string) {
    setLoading(true)
    // Simulate realistic processing delays for automated backend steps
    const DELAYS: Record<string, number> = {
      tenant_signed: 3000, // Processing with landlord
      landlord_approved: 4500, // DLD submission
      dld_submitted: 5000, // Waiting for payment selection
      payment_confirmed: 4000, // Processing documents
    }
    const delay = DELAYS[trigger] ?? 2000
    setTimeout(async () => {
      await processResponse(itemsRef.current, stageRef.current, trigger)
    }, delay)
  }

  const QUICK = [
    { label: "I'd like to renew my lease", icon: '📄' },
    { label: 'Can we keep the same rent?', icon: '💬' },
    { label: 'I agree to AED 97,000', icon: '✅' },
    { label: 'Yes, generate the contract', icon: '📝' },
  ]

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-1">Interactive Demo</div>
          <h2 className="font-semibold text-gray-900 text-base">Lease Renewal Agent</h2>
          <p className="text-xs text-gray-500 mt-0.5">Type as Sarah Johnson · AI responds in real time</p>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">SJ</div>
              <div><div className="font-semibold text-sm text-gray-900">Sarah Johnson</div><div className="text-xs text-gray-500">Tenant · 3 years</div></div>
            </div>
            <div className="space-y-1.5 text-xs">
              {[['Unit','1204 · Marina Heights'],['Type','2BR · Sea view'],['Current rent','AED 95,000'],['Lease ends','31 Dec 2024']].map(([k,v]) => (
                <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2">Quick Messages</div>
            <div className="space-y-1.5">
              {QUICK.map(q => (
                <button key={q.label} onClick={() => sendMessage(q.label)} disabled={loading} className="w-full text-left text-xs bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-lg flex items-center gap-2 disabled:opacity-40">
                  <span>{q.icon}</span>{q.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1.5">Current Stage</div>
            <div className="text-xs bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-3 py-2 font-mono">{stage}</div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">Names, references & IDs are simulated</p>
        </div>
      </div>

      {/* Right — chat */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">PC</div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">Renewal Agent · Sarah Johnson</h1>
            <p className="text-xs text-gray-500">Connected to DLD · UAE Pass · Ejari · Internal CRM</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />Live AI
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {items.map((item, i) => {
            if (item.kind === 'message') return <Bubble key={i} role={item.role!} content={item.content!} time={item.time} />
            const ct = item.cardType
            if (ct === 'dld-card') return <DLDCard key={i} />
            if (ct === 'contract-prep') return <ContractPrepCard key={i} />
            if (ct === 'contract-ready') return <ContractReadyCard key={i} />
            if (ct === 'uaepass-card') return <UAEPassCard key={i} signed={uaePassSigned} onSign={() => { setUAEPassSigned(true); triggerAction('tenant_signed') }} />
            if (ct === 'landlord-approval') return <LandlordApprovalCard key={i} approved={landlordApproved} onApprove={() => { setLandlordApproved(true); triggerAction('landlord_approved') }} />
            if (ct === 'dld-submission') return <DLDSubmissionCard key={i} />
            if (ct === 'cheque-photos') return <ChequePhotosCard key={i} uploaded={chequesUploaded} onUpload={() => { setChequesUploaded(true); triggerAction('cheques_uploaded') }} />
            if (ct === 'pm-confirmation') return <PMConfirmationCard key={i} confirmed={pmConfirmed} onConfirm={() => { setPmConfirmed(true); triggerAction('pm_confirmed') }} />
            if (ct === 'ejari-complete') return <EjariCompleteCard key={i} onDone={() => triggerAction('ejari_done')} />
            if (ct === 'document-upload') return <DocumentUploadCard key={i} uploaded={docsUploaded} onUpload={() => { setDocsUploaded(true); triggerAction('docs_uploaded') }} />
            if (ct === 'completion') return <CompletionCard key={i} />
            return null
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">PC</div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
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
              placeholder="Type as Sarah — e.g. 'I'd like to renew my lease'"
              disabled={loading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">You are Sarah Johnson · Cards appear automatically as the workflow progresses</p>
        </div>
      </div>
    </div>
  )
}
