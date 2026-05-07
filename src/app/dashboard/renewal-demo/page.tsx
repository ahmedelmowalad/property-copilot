'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// ─── Step types for the conversation timeline ──────────────────────────────

type Step =
  | { kind: 'msg'; role: 'tenant' | 'agent'; content: string; time: string }
  | { kind: 'dld-card'; time: string }
  | { kind: 'contract-prep'; time: string }
  | { kind: 'contract-ready'; time: string }
  | { kind: 'uaepass-card'; time: string }
  | { kind: 'landlord-approval'; time: string }
  | { kind: 'dld-submission'; time: string }
  | { kind: 'ejari-pending'; time: string }
  | { kind: 'cheque-photos'; time: string }
  | { kind: 'pm-confirmation'; time: string }
  | { kind: 'ejari-complete'; time: string }
  | { kind: 'document-upload'; time: string }
  | { kind: 'completion'; time: string }

// The full pre-scripted hyper-realistic E2E renewal flow for Sarah Johnson
// Tenant: Sarah Johnson · Unit 1204 · Marina Heights · current AED 95,000
const SCRIPT: Step[] = [
  { kind: 'msg', role: 'tenant', time: '10:02', content: 'Hi, my lease is expiring on December 31st. I\'d like to discuss renewing it.' },
  { kind: 'msg', role: 'agent', time: '10:02', content: 'Hi Sarah! 👋 I can see your lease for **Unit 1204, Marina Heights** is set to expire on **31 Dec 2024**. I\'m happy to help walk you through the renewal.\n\nFirst, can you confirm your intent — would you like to renew on the **same terms**, or would you like to discuss **new terms** (e.g. different rent, payment schedule, or duration)?' },
  { kind: 'msg', role: 'tenant', time: '10:03', content: 'I\'d like to renew on the same terms ideally — same rent of AED 95,000.' },
  { kind: 'msg', role: 'agent', time: '10:03', content: 'Understood. Before I confirm anything, the law requires me to check the **RERA Rental Index** published by the **Dubai Land Department**. This determines whether a rent increase is legally allowed and, if so, the maximum permitted percentage.\n\nLet me pull that up now…' },
  { kind: 'dld-card', time: '10:04' },
  { kind: 'msg', role: 'agent', time: '10:04', content: 'Here\'s what the DLD data shows:\n\n• Your current rent: **AED 95,000**\n• RERA market range for 2BR in Dubai Marina: **AED 115,000 – 125,000**\n• Your rent is **~21% below** the market median (AED 120,000)\n\nUnder **Decree No. 43 of 2013**, when current rent is between **21–30% below** market value, a landlord may increase rent by a maximum of **15%**. However, your landlord (Marina Heights Holdings) has indicated a willingness to keep the increase modest given your 3-year tenure and consistent payment history.\n\nThe **proposed renewal rent is AED 99,750** (a **5% increase**, well below the legal maximum).\n\nWould you like to accept this, or counter-propose?' },
  { kind: 'msg', role: 'tenant', time: '10:06', content: 'That\'s a meaningful jump. Could we meet in the middle? I\'d propose AED 97,000.' },
  { kind: 'msg', role: 'agent', time: '10:06', content: 'That\'s a reasonable counter — let me check.\n\n**AED 97,000** = a **2.1% increase** from your current rent. That\'s well within the RERA-permitted maximum and reflects your tenure with us. I\'ll forward this counter-offer to the landlord representative for quick approval…' },
  { kind: 'msg', role: 'agent', time: '10:07', content: '✅ The landlord representative has accepted **AED 97,000**. Let\'s lock in the rest of the terms:\n\n• **Annual rent:** AED 97,000\n• **Payment:** 4 post-dated cheques (quarterly)\n• **Security deposit:** AED 9,500 (carried over from current lease)\n• **Term:** 1 January 2025 – 31 December 2025\n• **Unit:** 1204, Marina Heights Residence\n\nDo you confirm these terms?' },
  { kind: 'msg', role: 'tenant', time: '10:08', content: 'Yes, I confirm. Please proceed.' },
  { kind: 'msg', role: 'agent', time: '10:08', content: 'Excellent! I\'ll now generate the tenancy contract using the **DLD-approved Unified Contract Form (Form F)**.' },
  { kind: 'contract-prep', time: '10:08' },
  { kind: 'contract-ready', time: '10:09' },
  { kind: 'msg', role: 'agent', time: '10:09', content: 'Your tenancy contract is ready for signature. I\'ve also pushed it to **UAE Pass** so you can sign digitally — no printing or scanning needed.' },
  { kind: 'uaepass-card', time: '10:09' },
  { kind: 'msg', role: 'tenant', time: '10:11', content: 'Done — I\'ve signed it through UAE Pass.' },
  { kind: 'msg', role: 'agent', time: '10:11', content: 'Great, signature received and verified ✅. The contract now needs final counter-signature from the **landlord\'s authorised representative**. I\'ve sent it to **Mr. Ahmed Al-Mansouri** (Marina Heights Holdings).' },
  { kind: 'landlord-approval', time: '10:12' },
  { kind: 'msg', role: 'agent', time: '10:14', content: 'Both signatures are now on file 🎉. I\'ll proceed with the official registration steps:\n\n1. Upload the signed contract to **Dubai Land Department**\n2. Initiate **Ejari** registration\n3. Collect rental cheques\n4. Update your tenant record\n\nStarting with the DLD submission now…' },
  { kind: 'dld-submission', time: '10:15' },
  { kind: 'ejari-pending', time: '10:16' },
  { kind: 'msg', role: 'agent', time: '10:17', content: 'While Ejari is processing, please send me **photos of your 4 post-dated cheques**. Make them payable to **"Marina Heights Holdings LLC"** with these dates:\n\n• Cheque 1 — dated **01 Jan 2025** — AED 24,250\n• Cheque 2 — dated **01 Apr 2025** — AED 24,250\n• Cheque 3 — dated **01 Jul 2025** — AED 24,250\n• Cheque 4 — dated **01 Oct 2025** — AED 24,250' },
  { kind: 'cheque-photos', time: '10:18' },
  { kind: 'msg', role: 'agent', time: '10:20', content: 'All 4 cheque photos received and validated against the agreed amounts and dates ✅.\n\nNow please drop the **physical cheques** at our office:\n📍 **Marina Heights Holdings — Reception**\nLevel 1, Marina Walk Tower A, Dubai Marina\nMon–Fri, 9:00 AM – 6:00 PM\n\nOr if you\'d prefer, our courier can collect them from your unit (free of charge).' },
  { kind: 'msg', role: 'tenant', time: '10:21', content: 'I\'ll drop them off at the office tomorrow morning.' },
  { kind: 'msg', role: 'agent', time: '10:21', content: 'Perfect. I\'ll mark this as awaiting physical receipt. Once the property manager confirms the cheques are in hand, I\'ll finalise Ejari and update your records.' },
  { kind: 'pm-confirmation', time: '10:22' },
  { kind: 'msg', role: 'agent', time: '11:45', content: 'Cheques received and logged in the safe ✅. Continuing with Ejari finalisation…' },
  { kind: 'ejari-complete', time: '11:46' },
  { kind: 'msg', role: 'agent', time: '11:47', content: 'One last thing — for our records, can you upload an updated copy of your **Emirates ID** (front and back) and **passport bio-page**? This keeps your tenant profile current and is required for Ejari record-keeping.' },
  { kind: 'document-upload', time: '11:48' },
  { kind: 'msg', role: 'agent', time: '11:50', content: 'Documents received and securely stored 🔒. Your tenant profile has been updated. Let me show you a summary of everything we\'ve completed today:' },
  { kind: 'completion', time: '11:50' },
]

// ─── Inline cards ───────────────────────────────────────────────────────────

function DLDCard() {
  return (
    <div className="ml-11 max-w-[560px]">
      <div className="rounded-2xl rounded-tl-sm overflow-hidden border border-gray-200 shadow-sm bg-white">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white text-base font-bold">DLD</div>
          <div>
            <div className="text-white font-semibold text-sm">Dubai Land Department</div>
            <div className="text-emerald-100 text-xs">RERA Rental Index — Live Lookup</div>
          </div>
          <div className="ml-auto text-emerald-100 text-[10px] uppercase tracking-wider">Verified</div>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase text-gray-400 tracking-wide">Area</div>
              <div className="font-medium text-gray-900">Dubai Marina</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-400 tracking-wide">Configuration</div>
              <div className="font-medium text-gray-900">2 BR Apartment</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-400 tracking-wide">Building Tier</div>
              <div className="font-medium text-gray-900">Premium / Sea View</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-gray-400 tracking-wide">Index Quarter</div>
              <div className="font-medium text-gray-900">Q4 2024</div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <div className="text-[11px] uppercase text-gray-400 tracking-wide mb-1.5">RERA Market Range (Annual)</div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">AED 115,000 – 125,000</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Median 120,000</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
            <div className="font-medium text-amber-900 mb-0.5">Your current rent: AED 95,000 ({"~21% below market"})</div>
            <div className="text-amber-800">Per <strong>Decree No. 43 of 2013</strong>: rent within 21–30% below market permits a max increase of <strong>15%</strong>.</div>
          </div>
          <a className="block text-[11px] text-emerald-700 hover:underline" href="#">↗ View source: dubailand.gov.ae/rental-index</a>
        </div>
      </div>
    </div>
  )
}

function ContractPrepCard({ done }: { done: boolean }) {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📝</span>
          <span className="font-medium text-sm text-gray-900">Generating Tenancy Contract</span>
        </div>
        <div className="space-y-2 text-xs">
          {[
            ['Filling Form F (DLD Unified Contract)', true],
            ['Inserting tenant & landlord details', true],
            ['Adding new terms (AED 97,000 / annual)', true],
            ['Generating contract reference', true],
            ['Final PDF rendering', done],
          ].map(([label, isDone], i) => (
            <div key={i} className="flex items-center gap-2">
              {isDone ? (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              )}
              <span className={isDone ? 'text-gray-700' : 'text-gray-500'}>{label}</span>
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
          <div className="flex-1 min-w-0">
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
          <div>
            <div className="text-white font-semibold text-sm">UAE PASS</div>
            <div className="text-white/80 text-[11px]">Digital Identity & Signature</div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-700">A digital signature request has been sent to your registered UAE Pass account ending **••345**.</p>
          {!signed ? (
            <button
              onClick={onSign}
              className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              <span>📱</span> Open in UAE Pass App & Sign
            </button>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
              <div>
                <div className="font-medium text-emerald-900">Signed via UAE Pass</div>
                <div className="text-[11px] text-emerald-700">Sarah Johnson · 10:11 GST · Hash 0x8a3f…b21e</div>
              </div>
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
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="text-base">🏢</span>
          <span className="font-medium text-sm text-gray-900">Landlord Counter-Signature Required</span>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Sent to</span><span className="font-medium text-gray-900">Mr. Ahmed Al-Mansouri</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium text-gray-900">Authorised Representative</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Entity</span><span className="font-medium text-gray-900">Marina Heights Holdings LLC</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Channel</span><span className="font-medium text-gray-900">Email + WhatsApp</span></div>
          </div>
          {!approved ? (
            <>
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                Awaiting human approval — typically 5–30 minutes during business hours
              </div>
              <button
                onClick={onApprove}
                className="w-full bg-gray-900 hover:bg-black text-white text-xs font-medium py-2 rounded-lg"
              >
                ▶ Simulate Landlord Approval (demo)
              </button>
            </>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                <span className="font-medium text-emerald-900">Approved & counter-signed</span>
              </div>
              <div className="text-[11px] text-emerald-700">A. Al-Mansouri · UAE Pass verified · 10:14 GST</div>
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
        <div className="bg-emerald-700 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">📤 DLD Submission Confirmed</span>
        </div>
        <div className="p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-mono font-medium text-gray-900">DLD-2025-MH-1204-78432</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Submitted at</span><span className="font-medium text-gray-900">10:15 GST</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Documents uploaded</span><span className="font-medium text-gray-900">Contract, IDs, Title Deed</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Accepted</span></div>
        </div>
      </div>
    </div>
  )
}

function EjariPendingCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">🪪 Ejari Registration — In Progress</span>
        </div>
        <div className="p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Ejari portal</span><span className="font-medium text-gray-900">ejari.dubailand.gov.ae</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Trustee</span><span className="font-medium text-gray-900">Marina Real Estate Services</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Provisional cert</span><span className="font-mono font-medium text-gray-900">EJ-2025-748293</span></div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-gray-500">Progress</span>
            <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[60%]" />
            </div>
            <span className="font-medium text-gray-900">60%</span>
          </div>
          <div className="text-[11px] text-gray-500 italic pt-1">Awaiting cheque receipt confirmation to finalise…</div>
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
          <button
            onClick={onUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm flex items-center gap-2"
          >
            <span>📎</span> Upload 4 cheque photos
          </button>
        ) : (
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3">
            <div className="text-xs mb-2 opacity-90">📎 4 photos attached</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white rounded-md border border-white/40 aspect-[1.7/1] p-1.5 flex flex-col justify-between">
                  <div className="flex justify-between text-[8px] text-gray-500">
                    <span>EMIRATES NBD</span>
                    <span className="font-mono">{n === 1 ? '01·01·25' : n === 2 ? '01·04·25' : n === 3 ? '01·07·25' : '01·10·25'}</span>
                  </div>
                  <div className="text-[9px] text-gray-700 italic">Pay: Marina Heights Holdings LLC</div>
                  <div className="flex justify-between items-end text-[8px]">
                    <span className="font-mono text-gray-700">AED 24,250</span>
                    <span className="text-gray-400 italic">S. Johnson</span>
                  </div>
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
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="text-base">📋</span>
          <span className="font-medium text-sm text-gray-900">Property Manager — Cheque Receipt</span>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Assigned PM</span><span className="font-medium text-gray-900">Layla Khan</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Office</span><span className="font-medium text-gray-900">Marina Walk Tower A — Reception</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Expected</span><span className="font-medium text-gray-900">4 cheques · AED 97,000 total</span></div>
          </div>
          {!confirmed ? (
            <>
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                Waiting for PM to confirm physical receipt…
              </div>
              <button
                onClick={onConfirm}
                className="w-full bg-gray-900 hover:bg-black text-white text-xs font-medium py-2 rounded-lg"
              >
                ▶ Simulate PM Confirmation (demo)
              </button>
            </>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                <span className="font-medium text-emerald-900">All 4 cheques received & logged</span>
              </div>
              <div className="text-[11px] text-emerald-700">Confirmed by Layla Khan · 11:45 GST · Safe Slot 12-A</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EjariCompleteCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">🪪 Ejari Registered ✅</span>
        </div>
        <div className="p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Ejari Number</span><span className="font-mono font-medium text-gray-900">2748293-2025</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Issued</span><span className="font-medium text-gray-900">07 May 2026 · 11:46 GST</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Valid until</span><span className="font-medium text-gray-900">31 Dec 2025</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Certificate</span><span className="text-blue-600 hover:underline cursor-pointer">↗ Download PDF</span></div>
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
          <button
            onClick={onUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm flex items-center gap-2"
          >
            <span>📎</span> Upload Emirates ID + Passport
          </button>
        ) : (
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-3 space-y-1.5">
            <div className="text-xs opacity-90 mb-1">📎 3 documents attached</div>
            {['Emirates_ID_Front.jpg', 'Emirates_ID_Back.jpg', 'Passport_Bio.pdf'].map(name => (
              <div key={name} className="bg-white/15 rounded px-2 py-1.5 text-xs flex items-center gap-2">
                <span>📄</span>
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CompletionCard() {
  const items = [
    ['Renewal intent verified', 'Sarah confirmed renewal'],
    ['DLD RERA index check', 'Q4 2024 index pulled · increase legally permitted'],
    ['Price negotiated', 'AED 95,000 → AED 97,000 (2.1% increase)'],
    ['Terms agreed', '4 quarterly cheques · 1 Jan 2025 → 31 Dec 2025'],
    ['Contract generated', 'Form F — Ref TC-MH-1204-2025-0117'],
    ['Tenant signed', 'UAE Pass · digital signature verified'],
    ['Landlord counter-signed', 'A. Al-Mansouri — Marina Heights Holdings'],
    ['DLD submission', 'Ref DLD-2025-MH-1204-78432 · Accepted'],
    ['Cheques collected', '4 × AED 24,250 · received by PM'],
    ['Ejari registered', 'Ejari No. 2748293-2025'],
    ['Tenant docs updated', 'Emirates ID + passport on file'],
    ['Internal records updated', 'Lease record · rent · expiry refreshed'],
  ]
  return (
    <div className="ml-11 max-w-[560px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">🎉</div>
          <div>
            <div className="text-white font-semibold text-sm">Lease Renewal Complete</div>
            <div className="text-emerald-100 text-[11px]">Sarah Johnson · Unit 1204 · Marina Heights</div>
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
          <span className="text-emerald-800">Total time: <strong>1h 48m</strong> · Human touchpoints: <strong>2</strong></span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-medium">All systems updated</span>
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
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0 mt-0.5">SJ</div>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RenewalDemoPage() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [autoplay, setAutoplay] = useState(false)
  const [signed, setSigned] = useState(false)
  const [landlordApproved, setLandlordApproved] = useState(false)
  const [chequesUploaded, setChequesUploaded] = useState(false)
  const [pmConfirmed, setPmConfirmed] = useState(false)
  const [docsUploaded, setDocsUploaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount, signed, landlordApproved, chequesUploaded, pmConfirmed, docsUploaded])

  useEffect(() => {
    if (!autoplay || visibleCount >= SCRIPT.length) return
    const t = setTimeout(() => setVisibleCount(c => c + 1), 1100)
    return () => clearTimeout(t)
  }, [autoplay, visibleCount])

  const visible = SCRIPT.slice(0, visibleCount)

  function reset() {
    setVisibleCount(0)
    setSigned(false)
    setLandlordApproved(false)
    setChequesUploaded(false)
    setPmConfirmed(false)
    setDocsUploaded(false)
    setAutoplay(false)
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Left context panel */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-1">Live E2E Demo</div>
          <h2 className="font-semibold text-gray-900 text-base">Lease Renewal — Full Flow</h2>
          <p className="text-xs text-gray-500 mt-0.5">From renewal intent → Ejari registration</p>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">SJ</div>
              <div>
                <div className="font-semibold text-sm text-gray-900">Sarah Johnson</div>
                <div className="text-xs text-gray-600">Tenant · 3 years</div>
              </div>
            </div>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-500">Unit</span><span className="font-medium text-gray-900">1204 · Marina Heights</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium text-gray-900">2BR · Sea view</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Current rent</span><span className="font-medium text-gray-900">AED 95,000</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Lease ends</span><span className="font-medium text-gray-900">31 Dec 2024</span></div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2 px-1">Demo Steps</div>
            <ol className="space-y-1.5 text-xs">
              {[
                'Verify renewal intent',
                'DLD RERA index check',
                'Price negotiation',
                'Terms agreement',
                'Generate contract (Form F)',
                'Tenant signs via UAE Pass',
                'Landlord counter-signs',
                'DLD upload',
                'Ejari registration',
                'Cheque photo collection',
                'Physical cheque handover',
                'PM confirms receipt',
                'Ejari finalised',
                'Tenant docs (Emirates ID, passport)',
                'Internal records updated',
              ].map((s, i) => {
                const reached = visibleCount > i * 2
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
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
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">PC</div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">Property Copilot · Renewal Agent</h1>
            <p className="text-xs text-gray-500">Connected to UAE Pass · DLD · Ejari · Internal CRM</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {visibleCount === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-5xl mb-4">📜</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">End-to-End Lease Renewal</h2>
                <p className="text-sm text-gray-600 mb-1">Hyper-realistic walk-through of an AI agent renewing a Dubai Marina tenancy — including DLD checks, UAE Pass signing, Ejari registration, cheque collection, and human approvals.</p>
                <p className="text-xs text-gray-400 mt-3">Click <strong>▶ Start Demo</strong> on the left to begin.</p>
              </div>
            </div>
          )}

          {visible.map((step, i) => {
            const key = `${i}-${step.kind}`
            switch (step.kind) {
              case 'msg':
                return <Bubble key={key} role={step.role} content={step.content} time={step.time} />
              case 'dld-card':
                return <DLDCard key={key} />
              case 'contract-prep':
                return <ContractPrepCard key={key} done={visibleCount > i + 1} />
              case 'contract-ready':
                return <ContractReadyCard key={key} />
              case 'uaepass-card':
                return <UAEPassCard key={key} signed={signed} onSign={() => setSigned(true)} />
              case 'landlord-approval':
                return <LandlordApprovalCard key={key} approved={landlordApproved} onApprove={() => setLandlordApproved(true)} />
              case 'dld-submission':
                return <DLDSubmissionCard key={key} />
              case 'ejari-pending':
                return <EjariPendingCard key={key} />
              case 'cheque-photos':
                return <ChequePhotosCard key={key} uploaded={chequesUploaded} onUpload={() => setChequesUploaded(true)} />
              case 'pm-confirmation':
                return <PMConfirmationCard key={key} confirmed={pmConfirmed} onConfirm={() => setPmConfirmed(true)} />
              case 'ejari-complete':
                return <EjariCompleteCard key={key} />
              case 'document-upload':
                return <DocumentUploadCard key={key} uploaded={docsUploaded} onUpload={() => setDocsUploaded(true)} />
              case 'completion':
                return <CompletionCard key={key} />
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
            Demo run — {visibleCount} / {SCRIPT.length} steps · All actions simulated · Human touchpoints clearly marked
          </p>
        </div>
      </div>
    </div>
  )
}
