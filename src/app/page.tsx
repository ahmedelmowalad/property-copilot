import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">HF</div>
            <span className="font-semibold text-gray-900">HomeFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">UAE Real Estate Platform</span>
            <Link
              href="/dashboard"
              className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Open Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-emerald-100">
          <span>📱</span>
          WhatsApp + Phone Calls + AI — UAE Real Estate Operations
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Your entire real estate operation
          <br />
          <span className="text-emerald-600">connected in one platform.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          HomeFlow connects WhatsApp messages and phone calls directly into your operations dashboard.
          Every tenant message, lead inquiry, and call — triaged by AI, managed by you.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors text-lg shadow-md shadow-emerald-200"
          >
            Open Platform →
          </Link>
          <Link
            href="/dashboard/inbox"
            className="text-gray-700 border border-gray-300 font-medium px-6 py-4 rounded-xl hover:border-gray-400 transition-colors text-lg"
          >
            View Inbox
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No login required · Demo data pre-loaded · UAE residential focus</p>
      </section>

      {/* Channel preview */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
          <p className="text-sm text-gray-500 mb-6 font-medium text-center">ALL CHANNELS FLOW INTO ONE INBOX</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">📱</div>
                <span className="font-medium text-sm text-gray-800">WhatsApp</span>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Live</span>
              </div>
              <p className="text-xs text-gray-500 italic">&quot;Hi, AC in unit 1204 not working&quot;</p>
              <p className="text-xs text-emerald-600 mt-2 font-medium">→ AI triaged: High · Maintenance</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">📞</div>
                <span className="font-medium text-sm text-gray-800">Phone Call</span>
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Live</span>
              </div>
              <p className="text-xs text-gray-500 italic">Inbound call from +971 50 xxx xxxx</p>
              <p className="text-xs text-emerald-600 mt-2 font-medium">→ Recorded + AI transcribed</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">✦</div>
                <span className="font-medium text-sm text-gray-800">AI Copilot</span>
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-gray-500 italic">Draft reply + ticket suggestion ready</p>
              <p className="text-xs text-emerald-600 mt-2 font-medium">→ Awaiting your approval</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Everything a UAE property manager needs</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">One platform to manage properties, tenants, leases, maintenance — and every incoming communication from any channel.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📱',
                title: 'WhatsApp Integration',
                desc: 'Connect your WhatsApp Business number. Every tenant message, lead inquiry, and contractor update arrives in your inbox — auto-triaged by AI within seconds.',
              },
              {
                icon: '📞',
                title: 'Phone Call Management',
                desc: 'Inbound calls are recorded, transcribed, and summarized automatically. Full call log with AI-generated action items. Never lose track of a verbal commitment.',
              },
              {
                icon: '✦',
                title: 'AI Request Triage',
                desc: 'Every message — WhatsApp, call transcript, or manual entry — gets AI triage: category, urgency, draft response, and maintenance ticket suggestion. Human approval always required.',
              },
              {
                icon: '🏢',
                title: 'Portfolio Management',
                desc: 'Manage properties, units, tenants, and leases in one place. UAE-ready with AED currency, emirate fields, and RERA-aware AI prompts.',
              },
              {
                icon: '👥',
                title: 'Contacts & Leads',
                desc: 'Manage buyers, sellers, and prospects alongside your tenants. Track every conversation and know who is hot, warm, or cold.',
              },
              {
                icon: '🔒',
                title: 'Human-in-the-Loop',
                desc: 'AI never sends messages or takes actions automatically. Every reply and ticket requires your explicit approval. You stay in control — always.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration setup */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Connect your channels in minutes</h2>
        <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">HomeFlow integrates with WhatsApp Business API and Twilio for phone calls. Add your credentials once and everything flows in.</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg">📱</div>
              <div>
                <p className="font-semibold text-gray-900">WhatsApp Business API</p>
                <p className="text-xs text-gray-500">Meta Business Platform</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Receive messages via webhook</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Send replies with human approval</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Media, documents, voice notes</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Thread all tenant conversations</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg">📞</div>
              <div>
                <p className="font-semibold text-gray-900">Twilio Voice</p>
                <p className="text-xs text-gray-500">Inbound + outbound calls</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Inbound call routing & recording</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> AI-powered transcription</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Auto-summary + action items</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Call log tied to contacts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* AI Providers */}
      <section className="bg-gray-50 border-t border-gray-100 py-12 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Provider-agnostic AI — your keys, your choice</h2>
          <p className="text-gray-500 mb-6 text-sm">Connect OpenAI, Anthropic Claude, or Google Gemini. No key? Demo mode works out of the box.</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            {['OpenAI GPT-4o-mini', 'Anthropic Claude Haiku', 'Google Gemini Flash', 'Demo Mode (no key)'].map((p) => (
              <div key={p} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to see HomeFlow in action?</h2>
        <p className="text-emerald-100 mb-8 max-w-lg mx-auto">Demo data pre-loaded with UAE properties, tenants, WhatsApp conversations, and call logs. No setup needed.</p>
        <Link
          href="/dashboard"
          className="bg-white text-emerald-600 font-semibold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors text-lg inline-block"
        >
          Open Platform →
        </Link>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>Disclaimer:</strong> HomeFlow is a demonstration platform and does not provide legal, tax, financial, regulatory, or real-estate compliance advice.
            AI outputs are suggestions only and require human review and approval before any action is taken.
            For UAE tenancy law, RERA regulations, and compliance matters, consult a qualified professional.
          </p>
          <p className="text-xs text-gray-400 mt-2">© 2026 HomeFlow · UAE Residential Real Estate Platform</p>
        </div>
      </footer>
    </div>
  )
}
