'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Msg { role: 'tenant' | 'agent'; content: string }

type ConvItem =
  | { kind: 'message'; role: 'tenant' | 'agent'; content: string; time: string }
  | { kind: 'card'; cardType: string; time: string }

// Stages that auto-advance without user input (phone_in_pending excluded — needs user to answer call)
const AUTO_ADVANCE = new Set([
  'triaged','hoa_checked','providers_found',
  'quote_selected','provider_call_done','security_cleared',
  'tenant_call_done','tech_dispatched','en_route',
  'arrived','diagnosing','repairing','work_done','invoiced','paid',
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

// SVG diagram: leaking corroded P-trap under sink
const BEFORE_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f8f8f8" rx="8"/>
  <rect x="85" y="10" width="30" height="10" fill="#999" rx="2"/>
  <rect x="82" y="18" width="36" height="55" fill="#7a5c3a" rx="3"/>
  <rect x="86" y="18" width="7" height="55" fill="#9b7a52" rx="2" opacity="0.5"/>
  <circle cx="93" cy="32" r="5" fill="#5c3d1f" opacity="0.7"/>
  <circle cx="107" cy="45" r="4" fill="#7a5a22" opacity="0.8"/>
  <circle cx="97" cy="58" r="3" fill="#5c3d1f" opacity="0.6"/>
  <path d="M82 73 Q55 95 82 120 L118 120 Q145 95 118 73" fill="none" stroke="#7a5c3a" stroke-width="13" stroke-linecap="round"/>
  <path d="M84 73 Q58 95 84 120 L86 118 Q61 95 86 73" fill="none" stroke="#9b7a52" stroke-width="3" opacity="0.4"/>
  <ellipse cx="90" cy="100" rx="4" ry="6" fill="#3b82f6" opacity="0.85"/>
  <ellipse cx="100" cy="113" rx="3" ry="5" fill="#3b82f6" opacity="0.85"/>
  <ellipse cx="111" cy="103" rx="4" ry="6" fill="#3b82f6" opacity="0.75"/>
  <ellipse cx="95" cy="90" rx="2" ry="4" fill="#60a5fa" opacity="0.6"/>
  <ellipse cx="106" cy="118" rx="2" ry="3" fill="#3b82f6" opacity="0.5"/>
  <ellipse cx="100" cy="158" rx="55" ry="14" fill="#bfdbfe" opacity="0.7"/>
  <ellipse cx="100" cy="160" rx="42" ry="8" fill="#93c5fd" opacity="0.5"/>
  <text x="100" y="185" text-anchor="middle" fill="#dc2626" font-size="9.5" font-family="Arial" font-weight="bold">⚠ Corroded P-trap — Active leak</text>
</svg>`

// SVG diagram: new brass P-trap installed, clean and dry
const AFTER_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f0fdf4" rx="8"/>
  <rect x="85" y="10" width="30" height="10" fill="#aaa" rx="2"/>
  <rect x="82" y="18" width="36" height="55" fill="#c0c0c0" rx="3"/>
  <rect x="86" y="18" width="7" height="55" fill="white" rx="2" opacity="0.35"/>
  <path d="M82 73 Q55 95 82 120 L118 120 Q145 95 118 73" fill="none" stroke="#b8860b" stroke-width="13" stroke-linecap="round"/>
  <path d="M84 73 Q58 95 84 120 L86 118 Q61 95 86 73" fill="none" stroke="#fde68a" stroke-width="3" opacity="0.45"/>
  <circle cx="152" cy="48" r="20" fill="#16a34a"/>
  <path d="M143 48 L150 55 L161 40" stroke="white" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="82" y="120" width="36" height="8" fill="#b8860b" rx="2"/>
  <text x="100" y="155" text-anchor="middle" fill="#166534" font-size="9.5" font-family="Arial" font-weight="bold">New brass P-trap installed</text>
  <text x="100" y="170" text-anchor="middle" fill="#15803d" font-size="8.5" font-family="Arial">Zero leaks · Pressure tested ✓</text>
  <text x="100" y="185" text-anchor="middle" fill="#16a34a" font-size="8" font-family="Arial">24-month parts warranty</text>
</svg>`

function CompletionPhotosCard() {
  return (
    <div className="ml-11 max-w-[500px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">📸 Work Completion — Before & After</span>
          <span className="text-[10px] text-gray-300 bg-gray-700 px-2 py-0.5 rounded">Uploaded by technician</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-medium text-gray-600">BEFORE · 10:40 AM</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-red-100"
                dangerouslySetInnerHTML={{ __html: BEFORE_SVG }} />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-gray-600">AFTER · 10:58 AM</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-emerald-100"
                dangerouslySetInnerHTML={{ __html: AFTER_SVG }} />
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs space-y-1">
            <div className="font-medium text-emerald-900 flex items-center gap-1.5"><span>✓</span> Pressure test passed — 0 psi drop over 10 minutes</div>
            <div className="text-emerald-700">Warranty: 24-month parts + 12-month labour · Certificate emailed</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneCallOutCard() {
  const [expanded, setExpanded] = useState(false)
  const lines: [string, string, string][] = [
    ['agent', 'AI', 'Hello, this is Property Copilot AI calling on behalf of JVC Garden Apartments. I\'d like to book an emergency plumbing visit for unit A-301 today.'],
    ['provider', 'R', 'Yes, hello. We have Rashid available from 5:15 PM, confirmed for a P-trap issue?'],
    ['agent', 'AI', 'Correct — corroded P-trap, water actively leaking. Can you confirm the all-in rate of AED 330 including parts, labour, and VAT?'],
    ['provider', 'R', 'Confirmed, AED 330 total. I\'ll also bring a spare shutoff valve in case it\'s needed. Rashid will call 10 minutes before arrival.'],
    ['agent', 'AI', 'Perfect. Booking confirmed for today 5:15–6:30 PM. I\'ll send a WhatsApp confirmation to your registered number now.'],
    ['provider', 'R', 'Great, thank you. We\'ll be there on time.'],
  ]
  return (
    <div className="ml-11 max-w-[520px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">Outbound Call — Pro Plumbing Solutions</div>
            <div className="text-gray-300 text-[11px]">AI Agent → Rashid Al-Mansoori · +971 4 321 7890 · 1:47</div>
          </div>
          <div className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Completed</div>
        </div>
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              {[12,18,10,22,16,8,25,14,19,11,20,15,9,23,17,13,21,10,16,18].map((h, i) => (
                <div key={i} className="inline-block w-[4%] bg-emerald-400 rounded-sm mr-[1%]" style={{ height: `${h * 4}%` }} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">1:47 / 1:47</span>
          </div>
        </div>
        <div className="px-4 pb-3 space-y-2">
          {(expanded ? lines : lines.slice(0, 2)).map(([role, label, text], i) => (
            <div key={i} className={cn('flex gap-2 text-xs', role === 'agent' ? 'justify-start' : 'justify-end flex-row-reverse')}>
              <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5', role === 'agent' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white')}>{label}</div>
              <div className={cn('max-w-[80%] px-3 py-2 rounded-xl', role === 'agent' ? 'bg-blue-50 text-gray-800 rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tr-none')}>{text}</div>
            </div>
          ))}
          <button onClick={() => setExpanded(e => !e)} className="w-full text-[11px] text-blue-600 hover:text-blue-700 pt-1 text-center">
            {expanded ? '▲ Show less' : `▼ View full transcript (${lines.length} exchanges)`}
          </button>
        </div>
      </div>
    </div>
  )
}

function PhoneCallInCard({ answered, onAnswer }: { answered: boolean; onAnswer: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const transcript: [string, string, string][] = [
    ['agent', 'AI', 'Hi Emily! This is your Property Copilot assistant calling. I wanted to confirm that Rashid from Pro Plumbing Solutions will arrive at your unit today between 5:15 and 5:30 PM.'],
    ['tenant', 'EC', 'Great, thank you! I should be home by 5.'],
    ['agent', 'AI', 'Perfect. He has already been cleared through JVC security, so he can go straight to your building. His van has plate UAE 4829 and he\'ll call you 10 minutes before.'],
    ['tenant', 'EC', 'Should I leave a spare key or wait for him?'],
    ['agent', 'AI', 'Since this is a water leak, I recommend you\'re present to show him the exact location and confirm the issue. The visit should take about 45–60 minutes. Anything else you need?'],
    ['tenant', 'EC', 'No that\'s fine, thanks!'],
    ['agent', 'AI', 'Great. I\'ll send you live updates in this chat as Rashid travels. See you soon!'],
  ]
  return (
    <div className="ml-11 max-w-[520px]">
      <div className="rounded-2xl rounded-tl-sm border border-blue-200 bg-white shadow-sm overflow-hidden">
        <div className={cn('px-4 py-3 flex items-center gap-3', answered ? 'bg-gradient-to-r from-gray-900 to-gray-700' : 'bg-gradient-to-r from-blue-700 to-blue-600')}>
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center animate-pulse', answered ? 'bg-green-500 animate-none' : 'bg-white/30')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">{answered ? 'Call Completed' : '📲 Incoming Call'}</div>
            <div className="text-white/80 text-[11px]">Property Copilot AI · +971 4 800 2626 · {answered ? '1:23' : 'Calling…'}</div>
          </div>
          {!answered && <div className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full animate-pulse">Ringing</div>}
          {answered && <div className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Completed</div>}
        </div>
        <div className="p-4">
          {!answered ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">The AI is calling to confirm technician details before arrival.</p>
              <button onClick={onAnswer} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
                Answer Call
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  {[14,20,11,17,22,9,19,15,23,12,18,16,10,21,13,17,20,14,11,19].map((h, i) => (
                    <div key={i} className="inline-block w-[4%] bg-blue-400 rounded-sm mr-[1%]" style={{ height: `${h * 4}%` }} />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">1:23 / 1:23</span>
              </div>
              {(expanded ? transcript : transcript.slice(0, 2)).map(([role, label, text], i) => (
                <div key={i} className={cn('flex gap-2 text-xs', role === 'agent' ? 'justify-start' : 'justify-end flex-row-reverse')}>
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5', role === 'agent' ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white')}>{label}</div>
                  <div className={cn('max-w-[80%] px-3 py-2 rounded-xl', role === 'agent' ? 'bg-blue-50 text-gray-800 rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tr-none')}>{text}</div>
                </div>
              ))}
              <button onClick={() => setExpanded(e => !e)} className="w-full text-[11px] text-blue-600 hover:text-blue-700 pt-1 text-center">
                {expanded ? '▲ Show less' : `▼ View full transcript (${transcript.length} exchanges)`}
              </button>
            </div>
          )}
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
  const [callAnswered, setCallAnswered] = useState(false)
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
    const DELAYS: Record<string, number> = {
      triaged: 3000, hoa_checked: 4000, providers_found: 4500,
      quote_selected: 2500, provider_call_done: 3500, security_cleared: 2500,
      tenant_call_done: 1500, tech_dispatched: 5000, en_route: 4500,
      arrived: 3500, diagnosing: 5500, repairing: 4500,
      work_done: 3000, invoiced: 3500, paid: 2500,
    }
    const delay = DELAYS[stage] ?? 3000
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

  async function answerCall() {
    setCallAnswered(true)
    setLoading(true)
    const res = await fetch('/api/maintenance-demo/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: getMsgs(itemsRef.current), stage: stageRef.current, trigger: 'call_answered' }),
    }).then(r => r.json())
    const t = getTime()
    setItems(prev => [...prev, { kind: 'message', role: 'agent', content: res.reply, time: t }])
    setStage(res.nextStage)
    setLoading(false)
  }

  async function processResponse(snapshot: ConvItem[], currentStage: string, trigger?: string) {
    try {
      const res = await fetch('/api/maintenance-demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: getMsgs(snapshot), stage: currentStage, trigger }),
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
    await processResponse(newItems, stageRef.current, undefined)
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
            if (ct === 'phone-call-out') return <PhoneCallOutCard key={i} />
            if (ct === 'phone-call-in') return <PhoneCallInCard key={i} answered={callAnswered} onAnswer={answerCall} />
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
