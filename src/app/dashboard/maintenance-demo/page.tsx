'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type Step =
  | { kind: 'msg'; role: 'tenant' | 'agent'; content: string; time: string }
  | { kind: 'triage-card'; time: string }
  | { kind: 'hoa-rules'; time: string }
  | { kind: 'availability-check'; time: string }
  | { kind: 'provider-search'; time: string }
  | { kind: 'quote-comparison'; time: string }
  | { kind: 'security-approval'; time: string }
  | { kind: 'technician-assigned'; time: string }
  | { kind: 'status-en-route'; time: string }
  | { kind: 'status-arrived'; time: string }
  | { kind: 'status-diagnosing'; time: string }
  | { kind: 'status-in-progress'; time: string }
  | { kind: 'completion-photos'; time: string }
  | { kind: 'invoice-card'; time: string }
  | { kind: 'payment-processed'; time: string }
  | { kind: 'feedback-card'; time: string }
  | { kind: 'final-summary'; time: string }

// Full autonomous maintenance workflow for Emily Carter (Unit A-301, JVC)
// Issue: Water leak under kitchen sink (HIGH urgency, plumbing)
const SCRIPT: Step[] = [
  { kind: 'msg', role: 'tenant', time: '10:02', content: 'Hi, there\'s a water leak under my kitchen sink. Water is pooling on the floor and it\'s getting worse. I\'m at work now but can be home by 5 PM if needed.' },
  { kind: 'msg', role: 'agent', time: '10:02', content: 'Got it. I\'m immediately triaging this as a **HIGH-urgency plumbing issue**. Analyzing your unit\'s status and community access requirements…' },
  { kind: 'triage-card', time: '10:02' },
  { kind: 'msg', role: 'agent', time: '10:03', content: 'Verified: JVC Garden community rules allow emergency repairs with **24-hour advance notice to security**. Your building (A-Block) requires **tenant present or spare key on file**. Checking your availability…' },
  { kind: 'hoa-rules', time: '10:03' },
  { kind: 'msg', role: 'agent', time: '10:04', content: 'I see you\'re at work until 5 PM. **Immediately reaching out to 3 vetted plumbers** in the JVC area. Requesting urgent availability for same-day visit between 5–7 PM.' },
  { kind: 'availability-check', time: '10:04' },
  { kind: 'msg', role: 'agent', time: '10:05', content: 'Received quotes from all 3 providers. Analyzing cost, rating, and availability. Best match is **"Pro Plumbing Solutions"** — AED 250 callout + parts. 4.8 ⭐ rating, available 5:15 PM.' },
  { kind: 'provider-search', time: '10:05' },
  { kind: 'quote-comparison', time: '10:06' },
  { kind: 'msg', role: 'agent', time: '10:07', content: 'Submitting access request to **JVC Security Office**. Requesting approval for technician entry 5:15–6:30 PM with your mobile verification.' },
  { kind: 'msg', role: 'agent', time: '10:08', content: '✅ **Security approved**. Technician clearance granted for 5:15 PM. They will verify your ID via WhatsApp when arriving at the building.' },
  { kind: 'security-approval', time: '10:08' },
  { kind: 'msg', role: 'agent', time: '10:09', content: 'Confirmed with **Pro Plumbing Solutions**. Technician **Rashid Al-Mansoori** assigned. License verified: **PM-5847-2024**. ETA: **5:15 PM today**.' },
  { kind: 'technician-assigned', time: '10:09' },
  { kind: 'msg', role: 'agent', time: '10:10', content: 'You\'ve been added to a **live tracking group** with Rashid. Real-time updates will come here. Waiting for his departure…' },
  { kind: 'msg', role: 'agent', time: '10:28', content: 'Rashid is **on his way** to JVC. Current location: Al Wasl Road, ETA **5:10 PM**.' },
  { kind: 'status-en-route', time: '10:28' },
  { kind: 'msg', role: 'agent', time: '10:35', content: '🚗 Rashid has **arrived at JVC Gate A**. Security confirmed check-in. He\'s heading to A-Block now.' },
  { kind: 'status-arrived', time: '10:35' },
  { kind: 'msg', role: 'agent', time: '10:37', content: 'Rashid is **in your unit**. Assessing the leak…' },
  { kind: 'status-diagnosing', time: '10:37' },
  { kind: 'msg', role: 'agent', time: '10:42', content: '**Diagnosis confirmed**: Corroded P-trap under the sink. Rashid is **replacing the entire assembly** with a new brass trap + shutoff valve. Work in progress…' },
  { kind: 'status-in-progress', time: '10:42' },
  { kind: 'msg', role: 'agent', time: '10:58', content: '✅ **Repair complete**. New P-trap installed. Water pressure tested — **no leaks**. Rashid is taking photos for your records…' },
  { kind: 'completion-photos', time: '10:59' },
  { kind: 'msg', role: 'agent', time: '11:01', content: 'Here\'s your **repair invoice**. Materials (brass trap + shutoff + fittings): AED 180. Labour (1 hour): AED 150. **Total: AED 330**.' },
  { kind: 'invoice-card', time: '11:01' },
  { kind: 'msg', role: 'agent', time: '11:02', content: 'Processing payment from your registered method (**Emirates NBD debit ending 4521**)… Transaction authorized.' },
  { kind: 'payment-processed', time: '11:02' },
  { kind: 'msg', role: 'agent', time: '11:03', content: 'Rashid has left your unit. Before he departs the building, how would you rate this service?' },
  { kind: 'feedback-card', time: '11:03' },
  { kind: 'msg', role: 'tenant', time: '11:05', content: 'Service was great! He was professional, on time, and fixed it properly. 5 stars.' },
  { kind: 'msg', role: 'agent', time: '11:05', content: 'Thank you! 5⭐ feedback recorded. Rashid has been rated and compensated. Here\'s your complete service summary:' },
  { kind: 'final-summary', time: '11:05' },
]

// ─── Inline cards ───────────────────────────────────────────────────────────

function TriageCard() {
  return (
    <div className="ml-11 max-w-[500px]">
      <div className="rounded-2xl rounded-tl-sm border border-red-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-orange-600 px-4 py-3 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">🔍 Automated Triage</span>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase text-gray-400 tracking-wide">Issue</div>
              <div className="font-medium text-gray-900">Water Leak</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-400 tracking-wide">Urgency</div>
              <div className="font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded inline-block">HIGH</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-400 tracking-wide">Category</div>
              <div className="font-medium text-gray-900">Plumbing</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-400 tracking-wide">Unit</div>
              <div className="font-medium text-gray-900">A-301 · JVC</div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs space-y-1">
            <div className="text-red-900 font-medium">Action Triggered</div>
            <div className="text-red-800">Emergency workflow activated. Searching providers → Checking community rules → Requesting access → Scheduling technician.</div>
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
        <div className="bg-blue-700 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">📋 JVC Community Rules — Verified</span>
        </div>
        <div className="p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Community</span><span className="font-medium text-gray-900">JVC Garden Apartments</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Emergency access</span><span className="font-medium text-gray-900">Allowed 24/7 with notice</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Required notice</span><span className="font-medium text-gray-900">24 hours to security</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tenant present req.</span><span className="font-medium text-gray-900">Yes (or authorized spare key)</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Allowed contractors</span><span className="font-medium text-gray-900">Approved list + verified license</span></div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 mt-2 text-[10px] text-emerald-800">✓ Pro Plumbing Solutions is on approved list</div>
        </div>
      </div>
    </div>
  )
}

function AvailabilityCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-amber-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-amber-600 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">📅 Tenant Availability Check</span>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-2.5 space-y-1 text-xs">
            <div className="font-medium text-gray-700">Emily Carter</div>
            <div className="text-gray-500">Calendar: <strong>At work 9 AM – 5 PM</strong></div>
            <div className="text-gray-500">Available: <strong>5 PM onwards</strong></div>
            <div className="text-gray-500">Preferences: SMS + WhatsApp updates</div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
            <span>✓</span> <span>Confirmed available 5:00–7:00 PM today for technician visit</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProviderSearchCard() {
  return (
    <div className="ml-11 max-w-[520px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">🔍 Searching Plumbing Providers — JVC Area</span>
        </div>
        <div className="p-4 space-y-2 text-xs">
          <div className="space-y-2">
            {[
              ['Pro Plumbing Solutions', '4.8⭐', '12 reviews', '5 km away', '5:15 PM', 'AED 250+parts'],
              ['Emirates Fix Services', '4.5⭐', '28 reviews', '8 km away', '5:45 PM', 'AED 300+parts'],
              ['Quick Repair UAE', '4.3⭐', '9 reviews', '3 km away', '6:30 PM', 'AED 280+parts'],
            ].map(([name, rating, reviews, dist, eta, price]) => (
              <div key={name} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{name}</div>
                  <div className="text-[10px] text-gray-500">{rating} · {reviews} · {dist}</div>
                </div>
                <div className="text-right text-[10px]">
                  <div className="font-medium text-gray-900">{eta}</div>
                  <div className="text-gray-500">{price}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 flex items-center gap-2 text-[10px] text-emerald-800">
            <span>✓</span> <strong>Pro Plumbing Solutions</strong> selected — best ETA + rating + price
          </div>
        </div>
      </div>
    </div>
  )
}

function QuoteComparisonCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">💰 Quote Analysis — Pro Plumbing Solutions</span>
        </div>
        <div className="p-4 space-y-2 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-500">Service type</span><span className="font-medium text-gray-900">Emergency plumbing visit</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Callout fee</span><span className="font-medium text-gray-900">AED 250</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Est. labour (1 hr)</span><span className="font-medium text-gray-900">AED 150</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Est. materials</span><span className="font-medium text-gray-900">AED 80–150 (depends on diagnosis)</span></div>
            <div className="border-t border-gray-100 pt-1.5 flex justify-between"><span className="font-medium text-gray-900">Est. Total</span><span className="font-semibold text-lg text-gray-900">AED 480–550</span></div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[10px] text-blue-800">
            Licensed & insured. 24-hour warranty on parts. Same-day availability. Approved by JVC HOA.
          </div>
        </div>
      </div>
    </div>
  )
}

function SecurityApprovalCard() {
  return (
    <div className="ml-11 max-w-[500px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">🔐 JVC Security Access — APPROVED</span>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-gray-500">Technician</div>
              <div className="font-medium text-gray-900">Rashid Al-Mansoori</div>
            </div>
            <div>
              <div className="text-gray-500">Company</div>
              <div className="font-medium text-gray-900">Pro Plumbing</div>
            </div>
            <div>
              <div className="text-gray-500">License</div>
              <div className="font-medium text-gray-900">PM-5847-2024 ✓</div>
            </div>
            <div>
              <div className="text-gray-500">Access time</div>
              <div className="font-medium text-gray-900">5:15–6:30 PM</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
            <span>✓</span> <span>Security verified license. Technician added to access database. Gate codes updated. Tenant notified.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TechnicianAssignedCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-blue-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">👨‍🔧 Technician Assigned & En Route</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">RA</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900">Rashid Al-Mansoori</div>
              <div className="text-xs text-gray-500">10+ years experience · 4.8⭐ · 240+ jobs</div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">License</span><span className="font-mono font-medium text-gray-900">PM-5847-2024</span></div>
            <div className="flex justify-between"><span className="text-gray-500">ETA</span><span className="font-medium text-gray-900">5:15 PM (on schedule)</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-medium text-gray-900">White van · Plate UAE 4829</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Real-time tracking</span><span className="text-blue-600">Active</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ stage }: { stage: 'en-route' | 'arrived' | 'diagnosing' | 'in-progress' }) {
  const stages = {
    'en-route': { icon: '🚗', title: 'En Route', desc: 'Rashid is driving to JVC', color: 'bg-blue-50 border-blue-200' },
    'arrived': { icon: '👋', title: 'Arrived', desc: 'At your building — heading to unit', color: 'bg-amber-50 border-amber-200' },
    'diagnosing': { icon: '🔍', title: 'Diagnosing', desc: 'Assessing the issue', color: 'bg-amber-50 border-amber-200' },
    'in-progress': { icon: '🔧', title: 'Work In Progress', desc: 'Replacing P-trap + testing', color: 'bg-yellow-50 border-yellow-200' },
  }
  const s = stages[stage]
  return (
    <div className="ml-11 max-w-[400px]">
      <div className={cn('rounded-2xl rounded-tl-sm border px-4 py-3 shadow-sm', s.color)}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{s.icon}</span>
          <div>
            <div className="font-medium text-gray-900 text-sm">{s.title}</div>
            <div className="text-xs text-gray-600">{s.desc}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompletionPhotosCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">📸 Work Completion — Before & After</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-gray-500 mb-1">Before (10:40)</div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-600">
                [Water pooling under sink]
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 mb-1">After (10:58)</div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-600">
                [New P-trap installed]
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-xs">
            <div className="font-medium text-emerald-900 mb-0.5">✓ Pressure tested · Zero leaks detected</div>
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
        <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">💳 Service Invoice — #INV-2025-4821</span>
        </div>
        <div className="p-4 space-y-2 text-xs">
          <div className="border-b border-gray-100 pb-2 space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Brass P-trap + fittings</span><span className="font-medium text-gray-900">AED 180</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Labour (1 hour)</span><span className="font-medium text-gray-900">AED 150</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pressure test + safety check</span><span className="font-medium text-gray-900">Included</span></div>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-1">
            <span>Total</span>
            <span className="text-gray-900">AED 330</span>
          </div>
          <div className="text-[10px] text-gray-500 italic">VAT (5%) already included</div>
        </div>
      </div>
    </div>
  )
}

function PaymentCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">✅ Payment Processed</span>
        </div>
        <div className="p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium text-gray-900">AED 330.00</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium text-gray-900">Emirates NBD Debit (••4521)</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-mono font-medium text-gray-900">TXN-2025-847392</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Timestamp</span><span className="font-medium text-gray-900">11:02 GST</span></div>
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10px] text-emerald-800 mt-2">
            ✓ Payment confirmed. Invoice emailed to emily.carter@email.com · Technician compensated AED 280 (84.8%)
          </div>
        </div>
      </div>
    </div>
  )
}

function FeedbackCard() {
  const [rating, setRating] = useState(0)
  return (
    <div className="flex justify-end">
      <div className="max-w-[400px]">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 space-y-2">
          <div className="text-sm font-medium">How was your experience?</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={cn('text-2xl cursor-pointer transition-transform', rating >= n ? 'scale-110' : 'opacity-40')}
              >
                ⭐
              </button>
            ))}
          </div>
          {rating > 0 && <div className="text-xs opacity-90">({rating === 5 ? 'Excellent!' : rating >= 3 ? 'Good!' : 'Could improve'})</div>}
        </div>
      </div>
    </div>
  )
}

function FinalSummaryCard() {
  const items = [
    ['Issue reported', 'Water leak under kitchen sink'],
    ['Automatically triaged', 'HIGH urgency · Plumbing category'],
    ['Community rules verified', 'JVC access allowed · 24h notice + tenant present'],
    ['Tenant availability confirmed', 'Available 5 PM onwards'],
    ['Providers searched', '3 local plumbers queried simultaneously'],
    ['Best quote selected', 'Pro Plumbing Solutions — AED 330 all-in'],
    ['Security access approved', 'License verified · Gate access granted'],
    ['Technician dispatched', 'Rashid Al-Mansoori · 4.8⭐ · On time'],
    ['Real-time status tracking', 'En route → Arrived → Diagnosing → Complete'],
    ['Diagnosis & repair', 'Corroded P-trap replaced · Tested · Warranty included'],
    ['Payment processed', 'Emirates NBD debit · AED 330 · Instant'],
    ['Feedback collected', 'Emily rated 5⭐'],
    ['Records updated', 'Maintenance history · Warranty card · Receipt filed'],
  ]
  return (
    <div className="ml-11 max-w-[580px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">🎉</div>
          <div>
            <div className="text-white font-semibold text-sm">Maintenance Closed — Zero Human Intervention</div>
            <div className="text-emerald-100 text-[11px]">Water leak · JVC Garden · Unit A-301</div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {items.map(([title, sub]) => (
            <div key={title} className="flex items-start gap-2.5 text-xs">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">✓</span>
              <div>
                <div className="font-medium text-gray-900">{title}</div>
                <div className="text-gray-500">{sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-emerald-200 bg-emerald-50/60 px-4 py-3 flex items-center justify-between text-xs">
          <span className="text-emerald-800">Total time: <strong>1h 3m</strong> · Human decisions needed: <strong>0</strong></span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-medium">Fully Autonomous</span>
        </div>
      </div>
    </div>
  )
}

// ─── Message bubble ─────────────────────────────────────────────────────────

function Bubble({ role, content, time }: { role: 'tenant' | 'agent'; content: string; time: string }) {
  const isAgent = role === 'agent'
  const html = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  return (
    <div className={cn('flex gap-3', isAgent ? 'justify-start' : 'justify-end')}>
      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">PC</div>
      )}
      <div className="max-w-[78%]">
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isAgent
              ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
              : 'bg-blue-600 text-white rounded-tr-sm'
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className={cn('text-[10px] mt-1 px-1', isAgent ? 'text-gray-400' : 'text-right text-gray-400')}>{time} GST</div>
      </div>
      {!isAgent && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0 mt-0.5">EC</div>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MaintenanceDemoPage() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [autoplay, setAutoplay] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount])

  useEffect(() => {
    if (!autoplay || visibleCount >= SCRIPT.length) return
    const t = setTimeout(() => setVisibleCount(c => c + 1), 1100)
    return () => clearTimeout(t)
  }, [autoplay, visibleCount])

  const visible = SCRIPT.slice(0, visibleCount)

  function reset() {
    setVisibleCount(0)
    setAutoplay(false)
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Left context panel */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Autonomous Workflow</div>
          <h2 className="font-semibold text-gray-900 text-base">Emergency Maintenance</h2>
          <p className="text-xs text-gray-500 mt-0.5">Zero human intervention · AI handles everything</p>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">EC</div>
              <div>
                <div className="font-semibold text-sm text-gray-900">Emily Carter</div>
                <div className="text-xs text-gray-600">Tenant · Works 9–5</div>
              </div>
            </div>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-500">Unit</span><span className="font-medium text-gray-900">A-301 · JVC</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Issue</span><span className="font-medium text-red-700">Water leak (HIGH)</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900">Plumbing</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Report time</span><span className="font-medium text-gray-900">10:02 AM</span></div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2 px-1">Automation Steps</div>
            <ol className="space-y-1.5 text-xs">
              {[
                'Tenant reports issue',
                'AI auto-triages urgency',
                'Community rules verified',
                'Tenant availability checked',
                'Provider search (3 quotes)',
                'Best option selected',
                'Security access approved',
                'Technician assigned',
                'Real-time tracking',
                'Work completion + photos',
                'Invoice generated',
                'Payment processed',
                'Feedback collected',
                'Records updated',
              ].map((s, i) => {
                const reached = visibleCount > i * 2.5
                return (
                  <li key={s} className="flex items-start gap-2">
                    <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 mt-0.5', reached ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200')}>
                      {reached ? '✓' : i + 1}
                    </span>
                    <span className={reached ? 'text-gray-900' : 'text-gray-500'}>{s}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-2">
          {visibleCount === 0 && (
            <button
              onClick={() => { setAutoplay(true); setVisibleCount(1) }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              ▶ Start Demo
            </button>
          )}
          {visibleCount > 0 && visibleCount < SCRIPT.length && (
            <button
              onClick={() => setAutoplay(a => !a)}
              className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-2.5 rounded-xl"
            >
              {autoplay ? '⏸ Pause' : '▶ Resume'}
            </button>
          )}
          {visibleCount > 0 && (
            <button
              onClick={reset}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium py-2 rounded-xl"
            >
              ↻ Reset Demo
            </button>
          )}
          <p className="text-[10px] text-gray-400 text-center pt-1">All names, IDs, and references are simulated</p>
        </div>
      </div>

      {/* Right — conversation */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">PC</div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">Property Copilot · Maintenance AI</h1>
            <p className="text-xs text-gray-500">Connected to Providers · Security · Real Estate CRM</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Autonomous
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {visibleCount === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-5xl mb-4">🔧</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Autonomous Maintenance Workflow</h2>
                <p className="text-sm text-gray-600 mb-1">Full end-to-end emergency repair — from tenant intake → provider selection → security access → real-time tracking → completion → payment.</p>
                <p className="text-xs text-gray-400 mt-3">Zero human decisions required. AI handles everything.</p>
              </div>
            </div>
          )}

          {visible.map((step, i) => {
            const key = `${i}-${step.kind}`
            switch (step.kind) {
              case 'msg':
                return <Bubble key={key} role={step.role} content={step.content} time={step.time} />
              case 'triage-card':
                return <TriageCard key={key} />
              case 'hoa-rules':
                return <HOARulesCard key={key} />
              case 'availability-check':
                return <AvailabilityCard key={key} />
              case 'provider-search':
                return <ProviderSearchCard key={key} />
              case 'quote-comparison':
                return <QuoteComparisonCard key={key} />
              case 'security-approval':
                return <SecurityApprovalCard key={key} />
              case 'technician-assigned':
                return <TechnicianAssignedCard key={key} />
              case 'status-en-route':
                return <StatusCard key={key} stage="en-route" />
              case 'status-arrived':
                return <StatusCard key={key} stage="arrived" />
              case 'status-diagnosing':
                return <StatusCard key={key} stage="diagnosing" />
              case 'status-in-progress':
                return <StatusCard key={key} stage="in-progress" />
              case 'completion-photos':
                return <CompletionPhotosCard key={key} />
              case 'invoice-card':
                return <InvoiceCard key={key} />
              case 'payment-processed':
                return <PaymentCard key={key} />
              case 'feedback-card':
                return <FeedbackCard key={key} />
              case 'final-summary':
                return <FinalSummaryCard key={key} />
            }
          })}

          {autoplay && visibleCount < SCRIPT.length && visibleCount > 0 && (
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

          <div ref={bottomRef} />
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-3 flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">
            Demo run — {visibleCount} / {SCRIPT.length} steps · Fully autonomous · No human touchpoints
          </p>
        </div>
      </div>
    </div>
  )
}
