import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">PC</div>
            <span className="font-semibold text-gray-900">Property Copilot</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">UAE Residential Operations</span>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-blue-100">
          <span className="text-blue-500">✦</span>
          AI-Powered Operations Agent — UAE Property Management
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Triage tenant requests.
          <br />
          <span className="text-blue-600">Draft professional replies.</span>
          <br />
          Never miss a maintenance issue.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Property Copilot is an AI operations assistant for UAE residential real-estate managers and landlords.
          Paste any message — tenant complaint, owner update, vendor request — and get instant AI triage, draft responses, and maintenance ticket suggestions.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg shadow-md shadow-blue-200"
          >
            Launch Demo Dashboard →
          </Link>
          <a
            href="#features"
            className="text-gray-600 font-medium px-6 py-4 rounded-xl hover:text-gray-900 transition-colors text-lg"
          >
            Learn more
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">No login required · Demo data pre-loaded · UAE residential focus</p>
      </section>

      {/* Demo Message Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
          <p className="text-sm text-gray-500 mb-4 font-medium">EXAMPLE: Paste any messy message →</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Incoming message</p>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-700 italic">
                &quot;Hi, the AC in unit 1204 stopped working last night and it&apos;s getting really hot. Can someone come today?&quot;
              </div>
            </div>
            <div>
              <p className="text-xs text-blue-500 mb-2 uppercase tracking-wide font-medium">AI Copilot Output</p>
              <div className="bg-white rounded-lg border border-blue-100 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">High Priority</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Maintenance</span>
                </div>
                <p className="text-xs text-gray-600">AC failure in unit 1204. HVAC technician required same day.</p>
                <p className="text-xs text-gray-500">Suggested: Create HVAC ticket · Assign vendor · Draft tenant reply</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Everything a UAE property manager needs</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">One platform to manage properties, tenants, leases, maintenance — and AI-assist every incoming request.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '✦',
                title: 'AI Request Triage',
                desc: 'Paste any message. Get instant category, urgency, summary, draft response, and maintenance ticket suggestion. All outputs require your approval before any action.',
              },
              {
                icon: '🏢',
                title: 'Portfolio Management',
                desc: 'Manage properties, units, tenants, and leases in one place. UAE-ready with AED currency, emirate fields, and RERA-aware prompts.',
              },
              {
                icon: '🔧',
                title: 'Maintenance Tracking',
                desc: 'Create tickets from AI suggestions or manually. Track status from New → Assigned → Completed. Activity timeline per ticket.',
              },
              {
                icon: '📄',
                title: 'Lease Overview',
                desc: 'Track active, expiring, and past leases. Never miss a renewal. Get flagged when leases approach expiry.',
              },
              {
                icon: '🔒',
                title: 'Human-in-the-Loop',
                desc: 'AI never sends messages automatically. Every draft response and suggested action requires explicit human approval. Always.',
              },
              {
                icon: '🌐',
                title: 'Multi-Channel Ready',
                desc: 'Built for web dashboard now. Architecture ready for WhatsApp, ChatGPT Custom GPT, and SMS — without changing your AI or data layer.',
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

      {/* AI Providers */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider-agnostic AI — your keys, your choice</h2>
        <p className="text-gray-500 mb-8">Connect OpenAI, Anthropic Claude, or Google Gemini. No key? Demo mode works out of the box.</p>
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
          {['OpenAI GPT-4o-mini', 'Anthropic Claude Haiku', 'Google Gemini Flash', 'Demo Mode (no key)'].map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span className="text-green-500">✓</span> {p}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to see it in action?</h2>
        <p className="text-blue-100 mb-8 max-w-lg mx-auto">Demo data is pre-loaded with UAE residential properties, tenants, and maintenance tickets. No setup needed.</p>
        <Link
          href="/dashboard"
          className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg inline-block"
        >
          Launch Demo Dashboard →
        </Link>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>Disclaimer:</strong> Property Copilot is a PoC/MVP demonstration tool and does not provide legal, tax, financial, regulatory, or real-estate compliance advice.
            AI outputs are suggestions only and require human review and approval before any action is taken.
            For UAE tenancy law, RERA regulations, and compliance matters, consult a qualified professional.
          </p>
          <p className="text-xs text-gray-400 mt-2">© 2025 Property Copilot · MVP/PoC · UAE Residential Real Estate</p>
        </div>
      </footer>
    </div>
  )
}
