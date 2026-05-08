'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ApprovalRequestCard } from '@/components/ui/ApprovalRequestCard'

interface Msg { role: 'host' | 'agent'; content: string }

type ConvItem =
  | { kind: 'message'; role: 'host' | 'agent'; content: string; time: string }
  | { kind: 'card'; cardType: string; time: string }

const AUTO_ADVANCE = new Set([
  'booking_received', 'guest_screened', 'team_notified', 'key_generated',
  'guide_sent', 'cleaner_confirmed', 'arrival_prepped', 'checkin_msg_sent',
  'guest_checked_in', 'message_handled', 'maintenance_raised', 'maintenance_done',
  // pricing_review NOT here — L3 approval gate
  'pricing_updated', 'checkout_reminder', 'guest_checked_out', 'cleaner_dispatched',
  'inspection_done', 'deposit_cleared', 'review_received',
  // review_response NOT here — L2 approval gate
])

const DELAYS: Record<string, number> = {
  booking_received: 2500, guest_screened: 3000, team_notified: 2000,
  key_generated: 2500, guide_sent: 3500, cleaner_confirmed: 3000,
  arrival_prepped: 2000, checkin_msg_sent: 2500, guest_checked_in: 3000,
  message_handled: 3500, maintenance_raised: 4000, maintenance_done: 3000,
  pricing_updated: 2000, checkout_reminder: 3500, guest_checked_out: 2500,
  cleaner_dispatched: 2000, inspection_done: 4500, deposit_cleared: 2500,
  review_received: 3000,
}

// ─── SVGs ──────────────────────────────────────────────────────────────────────

const BEFORE_CLEAN_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f8f5f0" rx="8"/>
  <rect x="20" y="60" width="160" height="100" fill="#c4a882" rx="4"/>
  <rect x="20" y="45" width="160" height="18" fill="#8b6c42" rx="4"/>
  <path d="M30 68 Q60 62 95 72 Q130 78 155 66 Q172 70 175 82 L175 132 Q148 128 118 136 Q88 130 58 140 Q34 133 25 128 Z" fill="#c8b89a"/>
  <path d="M50 78 Q68 84 82 96" stroke="#a89070" stroke-width="2" fill="none" opacity="0.7"/>
  <path d="M110 73 Q118 86 112 98" stroke="#a89070" stroke-width="1.5" fill="none" opacity="0.6"/>
  <ellipse cx="78" cy="76" rx="32" ry="11" fill="#e0d4c4" opacity="0.9"/>
  <path d="M52 74 Q74 70 102 78" stroke="#c0b0a0" stroke-width="1.5" fill="none"/>
  <path d="M142 155 Q156 148 166 158 Q162 166 148 168 Q138 162 142 155 Z" fill="#b0b8c0" opacity="0.8"/>
  <rect x="167" y="138" width="8" height="18" fill="#d4e8f0" rx="2"/>
  <rect x="169" y="135" width="4" height="5" fill="#a8c8dc" rx="1"/>
  <rect x="24" y="128" width="10" height="14" fill="white" rx="2" opacity="0.7" stroke="#ccc" stroke-width="1"/>
  <text x="100" y="186" text-anchor="middle" fill="#dc2626" font-size="9" font-family="Arial" font-weight="bold">⚠ Pre-turnover · Needs cleaning</text>
</svg>`

const AFTER_CLEAN_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f0f8f4" rx="8"/>
  <rect x="20" y="60" width="160" height="100" fill="#c4a882" rx="4"/>
  <rect x="20" y="45" width="160" height="18" fill="#8b6c42" rx="4"/>
  <rect x="25" y="67" width="150" height="63" fill="white" rx="3"/>
  <rect x="25" y="67" width="150" height="10" fill="#f4f4f4" rx="3"/>
  <rect x="30" y="69" width="58" height="22" fill="white" rx="8" stroke="#e0e0e0" stroke-width="1"/>
  <rect x="112" y="69" width="58" height="22" fill="white" rx="8" stroke="#e0e0e0" stroke-width="1"/>
  <rect x="62" y="122" width="76" height="12" fill="#e8f0f8" rx="3"/>
  <rect x="70" y="122" width="4" height="12" fill="#c8ddf0" rx="2"/>
  <rect x="167" y="138" width="8" height="18" fill="#d4e8f0" rx="2"/>
  <rect x="169" y="135" width="4" height="5" fill="#a8c8dc" rx="1"/>
  <circle cx="154" cy="48" r="18" fill="#16a34a"/>
  <path d="M145 48 L152 55 L163 40" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="100" y="175" text-anchor="middle" fill="#166534" font-size="8.5" font-family="Arial" font-weight="bold">Maria Gonzalez · Verified Clean ✓</text>
  <text x="100" y="188" text-anchor="middle" fill="#15803d" font-size="8" font-family="Arial">Hotel-standard · All items restocked</text>
</svg>`

// ─── Cards ────────────────────────────────────────────────────────────────────

function BookingWebhookCard() {
  return (
    <div className="ml-11 max-w-[520px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">Airbnb Webhook — booking.created</div>
            <div className="text-white/80 text-[11px]">Event received · Nov 22, 2024 · 09:14:32 GST</div>
          </div>
          <div className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">LIVE</div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[['Booking ID','HM-2024-112958847'],['Guest','James Wilson'],['Dates','Nov 25–28, 2024'],['Nights','3 nights'],['Rate','AED 650/night'],['Status','Confirmed']].map(([k,v]) => (
              <div key={k}><div className="text-[10px] text-gray-400 uppercase tracking-wide">{k}</div><div className="font-medium text-gray-900">{v}</div></div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-2.5 space-y-1 text-xs">
            {[['Gross revenue','AED 1,950.00'],['Airbnb service fee','− AED 58.50'],['Cleaning fee','+ AED 150.00']].map(([k,v]) => (
              <div key={k} className="flex justify-between text-gray-600"><span>{k}</span><span className="font-medium">{v}</span></div>
            ))}
            <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100"><span>Est. net payout</span><span>AED 2,041.50</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GuestProfileCard() {
  return (
    <div className="ml-11 max-w-[460px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5"><span className="text-white text-sm font-semibold">👤 Guest Profile — Verified</span></div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-bold">JW</div>
            <div>
              <div className="font-semibold text-gray-900">James Wilson</div>
              <div className="text-xs text-gray-500">London, United Kingdom · Member since 2018</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-medium text-amber-600">4.9★</span>
                <span className="text-xs text-gray-500">47 completed stays</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[['ID Verified','✓ Passport'],['Payment','✓ Verified'],['Phone','✓ Confirmed'],['Reviews','47 as guest']].map(([k,v]) => (
              <div key={k} className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 text-xs">
                <div className="text-gray-500">{k}</div>
                <div className="font-medium text-emerald-800">{v}</div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs">
            <div className="font-medium text-emerald-900 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center">✓</span>
              Risk Assessment: <span className="ml-1 text-emerald-700 font-semibold">Low</span>
            </div>
            <div className="text-emerald-700 mt-0.5">No prior damage claims · No disputes · Superhost favourite</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamNotificationCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-blue-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">📲 Staff Notified — Simultaneously</span></div>
        <div className="p-4 space-y-2.5">
          {[
            { initials: 'MG', name: 'Maria Gonzalez', role: 'Cleaner', task: 'Pre-arrival clean · Nov 25, 10:00–11:30 AM', color: 'bg-purple-500' },
            { initials: 'SA', name: 'Saif Al-Mansoori', role: 'Ops Manager', task: 'Property oversight · Full stay coverage', color: 'bg-blue-600' },
          ].map(({ initials, name, role, task, color }) => (
            <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm', color)}>{initials}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">{name}</div>
                <div className="text-[10px] text-gray-500">{role} · {task}</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                09:14 AM
              </div>
            </div>
          ))}
          <div className="text-[10px] text-gray-400 text-center">Both received: booking details, guest profile, access codes, task list</div>
        </div>
      </div>
    </div>
  )
}

function SmartLockCard() {
  return (
    <div className="ml-11 max-w-[420px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">🔐 Smart Lock — Code Generated</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Active</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Access Code</div>
            <div className="flex justify-center gap-2">
              {'742816'.split('').map((d, i) => (
                <div key={i} className="w-9 h-11 bg-gray-700 rounded-lg flex items-center justify-center text-white font-mono text-xl font-bold border border-gray-600">{d}</div>
              ))}
            </div>
            <div className="text-[10px] text-gray-400 mt-2">Unit 1205 · Marina Heights</div>
          </div>
          <div className="space-y-1.5 text-xs">
            {[['Access from','Nov 25, 2:00 PM'],['Access until','Nov 28, 12:00 PM'],['Auto-expiry','On checkout · cannot be reused'],['Sent to','James via Airbnb + WhatsApp']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function WelcomeGuideCard() {
  return (
    <div className="ml-11 max-w-[460px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5"><span className="text-white text-sm font-semibold">📋 Welcome Guide Sent</span></div>
        <div className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {[['Airbnb message','✓ Sent 09:14 AM'],['WhatsApp','✓ Sent 09:14 AM'],['PDF guide','✓ Attached (2.1 MB)'],['Language','English']].map(([k,v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-2"><div className="text-gray-500">{k}</div><div className="font-medium text-gray-900">{v}</div></div>
            ))}
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5 font-medium">Guide Highlights</div>
            <div className="space-y-1">
              {['🔐 Smart lock code + building access pin','🚗 Parking bay B-47 (Level 1)','📶 WiFi: Marina1205 / Pass: WelcomeJames24','🏊 Pool hours: 7 AM–11 PM · Gym: 24/7','🍽 Zuma, Pier 7, The Cheesecake Factory nearby'].map(h => (
                <div key={h} className="text-gray-700">{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CleanerConfirmCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">✅ Cleaner Confirmed — Maria Gonzalez</span></div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">MG</div>
            <div><div className="font-medium text-gray-900">Maria Gonzalez</div><div className="text-xs text-gray-500">4.9⭐ · 312 cleans · 3 years with Khalid</div></div>
          </div>
          <div className="space-y-1.5 text-xs">
            {[['Date','Nov 25, 2024'],['Slot','10:00 AM – 11:30 AM'],['Duration','90 minutes'],['Status','Confirmed ✓']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
            ))}
          </div>
          <div className="text-[10px] text-gray-400">
            Checklist: Fresh linens & towels · Replenish amenities · Kitchen & bathrooms · Floor & surfaces · Final photo report
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrivalPrepCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-blue-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-blue-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">✅ Arrival Prep — All Systems Go</span></div>
        <div className="p-4 space-y-2.5">
          <div className="space-y-1.5">
            {[['Linens & towels','100%','bg-emerald-500'],['Toiletries & amenities','100%','bg-emerald-500'],['Kitchen supplies','100%','bg-emerald-500'],['Consumables (coffee, tea)','100%','bg-emerald-500'],].map(([item, pct, color]) => (
              <div key={item as string} className="flex items-center gap-2 text-xs">
                <div className={cn('w-2 h-2 rounded-full', color as string)} />
                <span className="flex-1 text-gray-700">{item}</span>
                <span className="font-medium text-emerald-700">{pct}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-800">
            <div className="font-medium">Concierge welcome message queued</div>
            <div className="opacity-80 mt-0.5">Will auto-send at 2:00 PM when guest arrives</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckInCard() {
  return (
    <div className="ml-11 max-w-[460px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5"><span className="text-white text-sm font-semibold">📱 Check-in Instructions Sent</span></div>
        <div className="p-4 space-y-3">
          <div className="bg-[#DCF8C6] rounded-2xl rounded-br-sm p-3 space-y-2 text-xs text-gray-900 ml-8">
            <div className="font-medium text-gray-600 text-[10px]">From: Khalid (via AI) · Airbnb · 09:14 AM</div>
            <div>Hi James! 👋 Welcome to Marina Heights!</div>
            <div>📍 <strong>Building:</strong> Marina Heights, JBR · Enter via main lobby (Gate A)</div>
            <div>🔐 <strong>Lock code:</strong> 742816 (valid Nov 25 2PM → Nov 28 12PM)</div>
            <div>🚗 <strong>Parking:</strong> Bay B-47, Level 1 (guest permit attached)</div>
            <div>🛗 <strong>Unit:</strong> Lift to floor 12, turn right → Unit 1205</div>
            <div>📶 <strong>WiFi:</strong> Marina1205 / WelcomeJames24</div>
            <div className="pt-1 text-gray-500">Let me know if you need anything at all!</div>
          </div>
          <div className="text-[10px] text-gray-400 text-right">Delivered via Airbnb ✓ · Read ✓</div>
        </div>
      </div>
    </div>
  )
}

function ActiveStayCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">🏠 Active Stay — James Wilson</span>
          <span className="text-[10px] text-emerald-200 bg-emerald-600/50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Night 1 of 3
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Check-in: Nov 25, 2:47 PM</span><span>Checkout: Nov 28, 12:00 PM</span></div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '33%' }} />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1.5">12 Automations Running</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {['Guest messaging','Smart lock mgmt','Cleaning scheduler','Dynamic pricing watcher','Review monitoring','Maintenance watchdog','Utility monitoring','Concierge auto-replies','Check-in notifications','Check-out reminders','Incident detection','Revenue tracking'].map(a => (
                <div key={a} className="flex items-center gap-1.5 text-gray-700">
                  <span className="text-emerald-500 text-[10px]">✓</span>
                  <span className="text-[11px]">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GuestMessageCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">💬 Guest Message — Auto-Handled</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">8 sec response</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">JW</div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-900 max-w-[80%]">Hey, what&apos;s the WiFi password? 🙏</div>
          </div>
          <div className="flex gap-2 justify-end">
            <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-gray-900 max-w-[80%]">
              <div>Hi James! 👋</div>
              <div className="mt-1">📶 Network: <strong>Marina1205</strong></div>
              <div>🔑 Password: <strong>WelcomeJames24</strong></div>
              <div className="mt-1 text-xs text-gray-500">Auto-replied in 8 seconds · No host action needed</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">AI</div>
          </div>
          <div className="text-[10px] text-gray-400 text-center">Airbnb message thread · Nov 25, 3:22 PM</div>
        </div>
      </div>
    </div>
  )
}

function MaintenanceRaisedCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-orange-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2.5 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">⚠ Maintenance Issue — HVAC</span>
          <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">Medium urgency</span>
        </div>
        <div className="p-4 space-y-3 text-xs">
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
            <div className="font-medium text-gray-900 mb-1">Guest report (Nov 26, 11:35 AM):</div>
            <div className="text-gray-700 italic">&ldquo;Hi, the AC in the bedroom isn&apos;t cooling at all — it&apos;s blowing warm air. Can you help?&rdquo;</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[['Category','HVAC'],['Triage','Auto (E4 error)'],['Urgency','Medium'],['Vendor','Ali Hassan']].map(([k,v]) => (
              <div key={k}><div className="text-gray-400">{k}</div><div className="font-medium text-gray-900">{v}</div></div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <div className="font-medium text-blue-900">Ali Hassan dispatched</div>
            <div className="text-blue-700 mt-0.5">HVAC Tech #AH-7291 · Certified · ETA 45 min · Guest notified</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MaintenanceDoneCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">✅ AC Issue Resolved</span></div>
        <div className="p-4 space-y-2.5 text-xs">
          <div className="space-y-1.5">
            {[['Fault','Capacitor failure (Error E4)'],['Repair','New capacitor installed'],['Duration','52 minutes on-site'],['Temperature','Unit back to 22°C'],['Charge to guest','AED 0 (owner expense)']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
            ))}
          </div>
          <div className="bg-gray-100 rounded-lg p-2.5">
            <div className="font-medium text-gray-700 text-[10px] mb-0.5">Guest response (auto-notified):</div>
            <div className="text-gray-800 italic">&ldquo;Thank you so much, it&apos;s working perfectly now! Great service 👍&rdquo;</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PricingConfirmedCard({ approved }: { approved?: boolean }) {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className={cn('px-4 py-2.5', approved ? 'bg-emerald-700' : 'bg-gray-700')}>
          <span className="text-white text-sm font-semibold">{approved ? '✅ Rate Updated — AED 720/night' : '→ Rate Kept — AED 650/night'}</span>
        </div>
        <div className="p-4 space-y-1.5 text-xs">
          {approved ? (
            <>
              {[['New rate','AED 720/night'],['Applied to','Dec 6, 7, 8 (3 dates)'],['Change','+AED 70/night (+10.8%)'],['Est. extra revenue','+AED 210 if booked'],['Updated on','Airbnb listing #48291847']].map(([k,v]) => (
                <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
              ))}
            </>
          ) : (
            <>
              {[['Rate','AED 650/night (unchanged)'],['Open dates','Dec 6, 7, 8 (3 dates)'],['Note','Marathon demand noted for next year']].map(([k,v]) => (
                <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckoutReminderCard() {
  return (
    <div className="ml-11 max-w-[460px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5"><span className="text-white text-sm font-semibold">⏰ Checkout Reminder Sent — 9:00 AM</span></div>
        <div className="p-4 space-y-2.5">
          <div className="bg-[#DCF8C6] rounded-2xl rounded-br-sm p-3 text-xs text-gray-900 ml-8">
            <div className="font-medium text-gray-600 text-[10px] mb-1">From: Khalid (via AI) · Nov 28, 9:00 AM</div>
            <div>Good morning James! ☀️ Hope you had an amazing stay.</div>
            <div className="mt-1">📅 <strong>Checkout:</strong> Today by 12:00 PM</div>
            <div>🔐 Lock code will auto-expire at checkout</div>
            <div>🧳 Need to store bags? Front desk can hold until 6 PM</div>
            <div className="mt-1">It was a pleasure hosting you — enjoy the rest of your Dubai trip! 🏙️</div>
          </div>
          <div className="text-[10px] text-gray-400 text-right">Delivered · Read ✓ · James replied: &ldquo;Thanks! Great stay 😊&rdquo;</div>
        </div>
      </div>
    </div>
  )
}

function InspectionReportCard() {
  return (
    <div className="ml-11 max-w-[520px]">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">📸 Turnover Inspection — Before & After</span>
          <span className="text-[10px] text-gray-300 bg-gray-700 px-2 py-0.5 rounded">Maria Gonzalez · 1:28 PM</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-medium text-gray-600">BEFORE · 12:05 PM</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-red-100"
                dangerouslySetInnerHTML={{ __html: BEFORE_CLEAN_SVG }} />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-gray-600">AFTER · 1:28 PM</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-emerald-100"
                dangerouslySetInnerHTML={{ __html: AFTER_CLEAN_SVG }} />
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs space-y-1.5">
            <div className="font-medium text-emerald-900 flex items-center gap-1.5">✓ No damage detected — full deposit release approved</div>
            <div className="grid grid-cols-2 gap-1 text-emerald-700">
              {['Bedroom: ✓ Clean','Bathroom: ✓ Clean','Kitchen: ✓ Clean','Amenities: ✓ Restocked'].map(i => <div key={i}>{i}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DepositClearanceCard() {
  return (
    <div className="ml-11 max-w-[440px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-emerald-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">💳 Security Deposit Cleared</span></div>
        <div className="p-4 space-y-2 text-xs">
          {[['Damage detected','AED 0.00'],['Deposit held','AED 500.00'],['Refunded to James','AED 500.00 (full)'],['Payout to Khalid','AED 2,041.50'],['Payout date','Nov 29, 2024'],['Account','Emirates NBD ••7834']].map(([k,v]) => (
            <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
          ))}
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10px] text-emerald-800 mt-1">✓ Maria inspection verified · No disputes · Auto-processed</div>
        </div>
      </div>
    </div>
  )
}

function GuestReviewCard() {
  return (
    <div className="ml-11 max-w-[480px]">
      <div className="rounded-2xl rounded-tl-sm border border-amber-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2.5 flex items-center gap-2">
          <span className="text-white text-sm font-semibold">⭐⭐⭐⭐⭐ 5-Star Review — James Wilson</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-bold text-sm">JW</div>
            <div>
              <div className="font-medium text-gray-900 text-sm">James Wilson</div>
              <div className="text-[10px] text-gray-500">Nov 28, 2024 · Airbnb review</div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-gray-800 italic leading-relaxed">
            &ldquo;Absolutely fantastic stay! The apartment has stunning Marina views and is beautifully furnished. Khalid is the most attentive host — I got the WiFi code instantly, check-in was seamless, and when there was a small AC hiccup, it was fixed within the hour. Dubai Marathon completed ✅ — will definitely book again!&rdquo;
          </div>
          <div className="flex gap-3 text-xs">
            {[['Cleanliness','5.0★'],['Communication','5.0★'],['Check-in','5.0★'],['Location','5.0★']].map(([k,v]) => (
              <div key={k} className="text-center"><div className="font-semibold text-gray-900">{v}</div><div className="text-gray-500">{k}</div></div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-800">
            <div className="font-medium">AI has drafted a host response</div>
            <div className="mt-0.5 opacity-80">Scroll down to review and approve before it posts publicly.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RevenueSummaryCard() {
  return (
    <div className="ml-11 max-w-[540px]">
      <div className="rounded-2xl rounded-tl-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">🎉</div>
          <div>
            <div className="text-white font-semibold text-sm">Booking Complete — Hive Brain Summary</div>
            <div className="text-emerald-100 text-[11px]">Unit 1205 · Marina Heights · James Wilson · Nov 25–28</div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-2">Revenue Breakdown</div>
            <div className="space-y-1 text-xs">
              {[['Gross revenue (3 nights × AED 650)','AED 1,950.00'],['Airbnb service fee (3%)','− AED 58.50'],['Cleaning fee (net)','+ AED 150.00']].map(([k,v]) => (
                <div key={k} className="flex justify-between text-gray-600"><span>{k}</span><span className="font-medium">{v}</span></div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200 text-sm"><span>Net payout</span><span>AED 2,041.50</span></div>
              <div className="flex justify-between text-gray-500 text-[11px]"><span>Payout date</span><span>Nov 29, 2024 · Emirates NBD</span></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[['4.9★','Guest rating'],['78%','Oct occupancy'],['12','Automations ran']].map(([v,l]) => (
              <div key={l} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5"><div className="font-bold text-gray-900 text-base">{v}</div><div className="text-gray-500">{l}</div></div>
            ))}
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1.5">Workflow Steps (22 total)</div>
            <div className="space-y-1">
              {[['Booking received & guest verified','✓'],['Staff notified (Maria + Saif)','✓'],['Smart lock code generated','✓'],['Welcome guide sent','✓'],['Pre-arrival clean confirmed','✓'],['Check-in message + guest arrived','✓'],['WiFi question auto-replied','✓'],['AC issue triaged + repaired','✓'],['Dynamic pricing reviewed','✓'],['Checkout reminder sent','✓'],['Turnover clean + inspection','✓'],['Deposit cleared + payout initiated','✓'],['5★ review received + response posted','✓']].map(([step,status]) => (
                <div key={step} className="flex items-center gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] flex-shrink-0">{status}</span>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-emerald-200 bg-emerald-50/60 px-4 py-3 -mx-4 -mb-4 flex items-center justify-between text-xs rounded-b-2xl">
            <span className="text-emerald-800">Host decisions: <strong>2</strong> · Autonomous steps: <strong>20</strong></span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-medium">Hive Brain ✓</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Bubble ───────────────────────────────────────────────────────────────────

function Bubble({ role, content, time }: { role: 'host' | 'agent'; content: string; time: string }) {
  const isAgent = role === 'agent'
  const html = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  return (
    <div className={cn('flex gap-3', isAgent ? 'justify-start' : 'justify-end')}>
      {isAgent && <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">AI</div>}
      <div className="max-w-[78%]">
        <div className={cn('px-4 py-3 rounded-2xl text-sm leading-relaxed', isAgent ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm' : 'bg-blue-600 text-white rounded-tr-sm')} dangerouslySetInnerHTML={{ __html: html }} />
        <div className={cn('text-[10px] mt-1 px-1', isAgent ? 'text-gray-400' : 'text-right text-gray-400')}>{time} GST</div>
      </div>
      {!isAgent && <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">KH</div>}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getMsgs(conv: ConvItem[]): Msg[] {
  return conv
    .filter((c): c is Extract<ConvItem, { kind: 'message' }> => c.kind === 'message')
    .map(c => ({ role: c.role!, content: c.content! }))
}

// ─── Helpers for left panel ───────────────────────────────────────────────────

function getStaffStatus(stage: string) {
  const stages = ['initial','booking_received','guest_screened','team_notified','key_generated','guide_sent','cleaner_confirmed','arrival_prepped','checkin_msg_sent','guest_checked_in','message_handled','maintenance_raised','maintenance_done','pricing_review','pricing_updated','checkout_reminder','guest_checked_out','cleaner_dispatched','inspection_done','deposit_cleared','review_received','review_response','complete']
  const idx = stages.indexOf(stage)
  const maria = (idx >= stages.indexOf('cleaner_dispatched') && idx <= stages.indexOf('inspection_done'))
    ? { dot: '🔴', label: 'On-site · Cleaning' }
    : (idx >= stages.indexOf('team_notified') && idx < stages.indexOf('arrival_prepped'))
    ? { dot: '🟡', label: 'Pre-arrival prep' }
    : { dot: '🟢', label: 'Available' }
  const ali = idx === stages.indexOf('maintenance_raised')
    ? { dot: '🟡', label: 'En route · HVAC' }
    : { dot: '🟢', label: 'Available' }
  return { maria, saif: { dot: '🟢', label: 'Available' }, ali }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const WELCOME: ConvItem = {
  kind: 'message', role: 'agent', time: '09:00',
  content: 'Welcome, Khalid! 👋 I\'m your **Airbnb Ops AI** — the Hive Brain for Unit 1205, Marina Heights.\n\nI handle everything autonomously: pre-arrival prep, guest communications, maintenance, dynamic pricing, turnover, and reviews. You only need to approve 2 key decisions per stay.\n\nTry **"New booking simulation"** to see the full lifecycle run.',
}

const QUICK_PROMPTS = [
  { label: 'New booking simulation', icon: '🔔' },
  { label: 'Show me a booking', icon: '📋' },
  { label: 'Check property status', icon: '🏠' },
]

export default function AirbnbDemoPage() {
  const [items, setItems] = useState<ConvItem[]>([WELCOME])
  const [stage, setStage] = useState('initial')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pricingApprovalShown, setPricingApprovalShown] = useState(false)
  const [reviewApprovalShown, setReviewApprovalShown] = useState(false)
  const [pricingApproved, setPricingApproved] = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef(stage)
  const itemsRef = useRef(items)
  useEffect(() => { stageRef.current = stage }, [stage])
  useEffect(() => { itemsRef.current = items }, [items])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items, loading])

  // Pricing approval gate
  useEffect(() => {
    if (stage === 'pricing_review' && !pricingApprovalShown) {
      const t = setTimeout(() => {
        setPricingApprovalShown(true)
        setItems(prev => [...prev, { kind: 'card', cardType: 'pricing-approval-request', time: getTime() }])
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [stage, pricingApprovalShown])

  // Review response approval gate
  useEffect(() => {
    if (stage === 'review_response' && !reviewApprovalShown) {
      const t = setTimeout(() => {
        setReviewApprovalShown(true)
        setItems(prev => [...prev, { kind: 'card', cardType: 'review-response-draft', time: getTime() }])
        setTimeout(() => {
          setItems(prev => [...prev, { kind: 'card', cardType: 'review-approval-request', time: getTime() }])
        }, 800)
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [stage, reviewApprovalShown])

  // Auto-advance
  useEffect(() => {
    if (!AUTO_ADVANCE.has(stage)) return
    const delay = DELAYS[stage] ?? 3000
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/airbnb-demo/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: getMsgs(itemsRef.current), stage: stageRef.current, trigger: 'auto_next' }),
        }).then(r => r.json())
        const time = getTime()
        setItems(prev => [...prev, { kind: 'message', role: 'agent', content: res.reply, time }])
        setStage(res.nextStage)
        if (res.card) {
          setTimeout(() => setItems(prev => [...prev, { kind: 'card', cardType: res.card, time }]), 500)
        }
      } finally {
        setLoading(false)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  async function processResponse(snapshot: ConvItem[], currentStage: string, trigger?: string) {
    try {
      const res = await fetch('/api/airbnb-demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: getMsgs(snapshot), stage: currentStage, trigger }),
      }).then(r => r.json())
      const time = getTime()
      setItems(prev => [...prev, { kind: 'message', role: 'agent', content: res.reply, time }])
      setStage(res.nextStage)
      if (res.card) {
        setTimeout(() => setItems(prev => [...prev, { kind: 'card', cardType: res.card, time }]), 500)
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
    const time = getTime()
    const newItems: ConvItem[] = [...itemsRef.current, { kind: 'message', role: 'host', content, time }]
    setItems(newItems)
    await processResponse(newItems, stageRef.current, undefined)
  }

  const staff = getStaffStatus(stage)

  return (
    <div className="flex h-full">
      {/* Left panel — Operations Center */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-[10px] uppercase tracking-wider text-[#FF385C] font-bold mb-1">Hive Brain</div>
          <h2 className="font-semibold text-gray-900 text-base">Airbnb Ops AI</h2>
          <p className="text-xs text-gray-500 mt-0.5">Operations Center · Unit 1205</p>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-4">

          {/* Active booking */}
          <div className="bg-gradient-to-br from-[#FFF1F2] to-white border border-[#FFD5D8] rounded-xl p-3.5">
            <div className="text-[10px] uppercase tracking-wide text-[#FF385C] font-bold mb-2">Active Booking</div>
            {stage !== 'initial' ? (
              <>
                <div className="font-semibold text-gray-900 text-sm">James Wilson</div>
                <div className="text-xs text-gray-500 mb-2">Nov 25–28 · Night 1 of 3</div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF385C] rounded-full transition-all" style={{ width: stage === 'complete' ? '100%' : stage.includes('guest_checked_in') || stage.includes('message') || stage.includes('maintenance') || stage.includes('pricing') ? '45%' : stage.includes('checkout') || stage.includes('guest_checked_out') || stage.includes('cleaner') || stage.includes('inspection') || stage.includes('deposit') ? '70%' : stage.includes('review') || stage === 'complete' ? '90%' : '25%' }} />
                </div>
                <div className="text-[10px] text-gray-400 mt-1">AED 650/night · 3 nights</div>
              </>
            ) : (
              <div className="text-xs text-gray-400">No active booking — start simulation</div>
            )}
          </div>

          {/* Staff status */}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-2">Staff Status</div>
            <div className="space-y-1.5">
              {[
                { initials: 'MG', name: 'Maria Gonzalez', role: 'Cleaner', ...staff.maria },
                { initials: 'SA', name: 'Saif Al-Mansoori', role: 'Ops Manager', ...staff.saif },
                { initials: 'AH', name: 'Ali Hassan', role: 'HVAC Tech', ...staff.ali },
              ].map(({ initials, name, role, dot, label }) => (
                <div key={name} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-[9px] font-bold">{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{name}</div>
                    <div className="text-[10px] text-gray-500">{role}</div>
                  </div>
                  <div className="text-[9px] text-gray-500 text-right">{dot} {label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-2">Platforms</div>
            <div className="space-y-1 text-xs">
              {[['● Airbnb','text-[#FF385C]','Connected'],['● Booking.com','text-blue-500','Connected'],['○ VRBO','text-gray-300','Coming soon']].map(([p,c,s]) => (
                <div key={p} className="flex justify-between">
                  <span className={c as string}>{p}</span>
                  <span className="text-gray-400">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs space-y-1">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-1.5">Property</div>
            {[['Unit','1205 · Marina Heights'],['Type','1BR · Airbnb Plus'],['Rate','AED 650/night'],['Oct occ.','78% (23/30 nights)']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
            ))}
          </div>

          {/* Active automations */}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-2">Active Automations (12)</div>
            <div className="space-y-0.5 text-[11px]">
              {['Guest messaging','Smart lock management','Cleaning scheduler','Dynamic pricing watcher','Review monitoring'].map(a => (
                <div key={a} className="flex items-center gap-1.5 text-gray-600">
                  <span className={cn('text-[9px]', stage !== 'initial' ? 'text-emerald-500' : 'text-gray-300')}>✓</span>
                  {a}
                </div>
              ))}
              <div className="text-[10px] text-gray-400 pt-0.5">+ 7 more running…</div>
            </div>
          </div>

          {/* Stage */}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-1.5">Workflow Stage</div>
            <div className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-2 font-mono">{stage}</div>
            {AUTO_ADVANCE.has(stage) && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#FF385C]">
                <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse" />
                Hive Brain processing…
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-2">Quick Actions</div>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map(q => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.label)}
                  disabled={loading || stage !== 'initial'}
                  className="w-full text-left text-xs bg-gray-50 hover:bg-[#FFF1F2] hover:border-[#FFD5D8] border border-gray-200 text-gray-700 hover:text-[#FF385C] px-3 py-2 rounded-lg flex items-center gap-2 disabled:opacity-40 transition-colors"
                >
                  <span>{q.icon}</span>{q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">Names, IDs & references are simulated</p>
        </div>
      </div>

      {/* Right — chat */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-bold text-sm">AI</div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">Airbnb Ops AI · Khalid Al-Hamdan</h1>
            <p className="text-xs text-gray-500">Unit 1205 · Marina Heights · Coordinating Maria, Saif & Ali</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-[#FFF1F2] text-[#FF385C] px-2.5 py-1 rounded-full font-medium">Host · Airbnb STR</span>
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
            if (ct === 'booking-webhook') return <BookingWebhookCard key={i} />
            if (ct === 'guest-profile') return <GuestProfileCard key={i} />
            if (ct === 'team-notified') return <TeamNotificationCard key={i} />
            if (ct === 'smart-lock') return <SmartLockCard key={i} />
            if (ct === 'welcome-guide') return <WelcomeGuideCard key={i} />
            if (ct === 'cleaner-confirmed') return <CleanerConfirmCard key={i} />
            if (ct === 'arrival-prep') return <ArrivalPrepCard key={i} />
            if (ct === 'checkin-message') return <CheckInCard key={i} />
            if (ct === 'active-stay') return <ActiveStayCard key={i} />
            if (ct === 'guest-message') return <GuestMessageCard key={i} />
            if (ct === 'maintenance-raised') return <MaintenanceRaisedCard key={i} />
            if (ct === 'maintenance-done') return <MaintenanceDoneCard key={i} />
            if (ct === 'pricing-confirmed') return <PricingConfirmedCard key={i} approved={pricingApproved === true} />
            if (ct === 'checkout-reminder') return <CheckoutReminderCard key={i} />
            if (ct === 'inspection-report') return <InspectionReportCard key={i} />
            if (ct === 'deposit-cleared') return <DepositClearanceCard key={i} />
            if (ct === 'guest-review') return <GuestReviewCard key={i} />
            if (ct === 'revenue-summary') return <RevenueSummaryCard key={i} />
            if (ct === 'pricing-approval-request') return (
              <div key={i} className="ml-11 max-w-[520px]">
                <ApprovalRequestCard
                  level={3}
                  levelLabel="Modify Listing Data"
                  action="Update nightly rate for Dec 6–8 (3 open dates) to AED 720"
                  recipient="Airbnb listing #48291847 (Marina Heights Unit 1205)"
                  dataShared={['New rate: AED 720/night (was AED 650)','Dates: Dec 6, 7, 8 (Dubai Marathon weekend)','Event: Dubai Marathon Dec 6–8 · Demand +32%']}
                  estimatedCost="AED 0"
                  consequence="Open dates re-priced to AED 720. Est. +AED 210 revenue if all 3 book."
                  humanReview={false}
                  approveLabel="Approve Rate Change → AED 720"
                  rejectLabel="Keep AED 650"
                  onApprove={() => {
                    setLoading(true)
                    setPricingApproved(true)
                    setTimeout(() => processResponse(itemsRef.current, stageRef.current, 'pricing_approved'), 400)
                  }}
                  onReject={() => {
                    setLoading(true)
                    setPricingApproved(false)
                    setTimeout(() => processResponse(itemsRef.current, stageRef.current, 'pricing_rejected'), 400)
                  }}
                />
              </div>
            )
            if (ct === 'review-response-draft') return (
              <div key={i} className="ml-11 max-w-[480px]">
                <div className="rounded-2xl rounded-tl-sm border border-blue-200 bg-blue-50 shadow-sm overflow-hidden">
                  <div className="bg-blue-700 px-4 py-2.5"><span className="text-white text-sm font-semibold">✍ AI-Drafted Host Response</span></div>
                  <div className="p-4 text-sm text-gray-800 italic leading-relaxed">
                    &ldquo;Thank you so much, James! 🙏 It was a pleasure hosting you for the Dubai Marathon — huge congratulations on completing it! So glad the team could sort the AC quickly. Marina Heights will be ready for you whenever you&apos;re back in Dubai. Best of luck in your next race! 🏃‍♂️&rdquo;
                  </div>
                  <div className="px-4 pb-3 text-[10px] text-blue-600">Tone: Warm & personal · 78 characters · Airbnb-optimised</div>
                </div>
              </div>
            )
            if (ct === 'review-approval-request') return (
              <div key={i} className="ml-11 max-w-[520px]">
                <ApprovalRequestCard
                  level={2}
                  levelLabel="External Public Message"
                  action="Post host response to James Wilson's review"
                  recipient="James Wilson (public — visible on Airbnb listing)"
                  dataShared={['Review response text (shown above)','Host identity: Khalid Al-Hamdan','Listing: Marina Heights Unit 1205']}
                  estimatedCost="AED 0"
                  consequence="Response published publicly on your Airbnb listing. Improves search ranking."
                  humanReview={false}
                  approveLabel="Approve & Post Response"
                  rejectLabel="Edit Response"
                  onApprove={() => {
                    setLoading(true)
                    setTimeout(() => processResponse(itemsRef.current, stageRef.current, 'review_approved'), 400)
                  }}
                  onReject={() => {}}
                />
              </div>
            )
            return null
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AI</div>
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
              placeholder={stage === 'initial' ? 'Type "New booking simulation" or use the quick actions →' : 'Ask a question or add context…'}
              disabled={loading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-[#FF385C] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#E31C5F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Hive Brain handles 20 steps autonomously — you approve only 2 key decisions</p>
        </div>
      </div>
    </div>
  )
}
