'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const commsSection = [
  { href: '/dashboard/inbox', label: 'Inbox', icon: '📱', badge: null },
  { href: '/dashboard/calls', label: 'Call Log', icon: '📞', badge: null },
  { href: '/dashboard/contacts', label: 'Contacts', icon: '👤', badge: null },
]

const aiSection = [
  { href: '/dashboard/copilot', label: 'AI Copilot', icon: '✦' },
  { href: '/dashboard/agent', label: 'Tenant Agent', icon: '💬' },
]

const opsSection = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞', exact: true },
  { href: '/dashboard/properties', label: 'Properties', icon: '🏢' },
  { href: '/dashboard/units', label: 'Units', icon: '🚪' },
  { href: '/dashboard/tenants', label: 'Tenants', icon: '👥' },
  { href: '/dashboard/leases', label: 'Leases', icon: '📄' },
  { href: '/dashboard/tickets', label: 'Maintenance', icon: '🔧' },
]

function NavLink({ href, label, icon, exact, badge }: { href: string; label: string; icon: string; exact?: boolean; badge?: string | null }) {
  const pathname = usePathname()
  const active = exact ? pathname === href : (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        active ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
      )}
    >
      <span className="text-base w-4 text-center">{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">{badge}</span>
      )}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">HF</div>
          <div>
            <div className="font-semibold text-sm text-white">HomeFlow</div>
            <div className="text-xs text-gray-400">UAE Real Estate</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Communications */}
        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Communications</p>
          <div className="space-y-0.5">
            {commsSection.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* AI */}
        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AI Tools</p>
          <div className="space-y-0.5">
            {aiSection.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* Operations */}
        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Operations</p>
          <div className="space-y-0.5">
            {opsSection.map(item => (
              <NavLink key={item.href} {...item} exact={item.exact} />
            ))}
          </div>
        </div>

        {/* Integrations info */}
        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Integrations</p>
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400">
              <span className="text-base w-4 text-center">📱</span>
              <span>WhatsApp API</span>
              <span className="ml-auto text-xs text-emerald-400 font-medium">Active</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400">
              <span className="text-base w-4 text-center">📞</span>
              <span>Twilio Voice</span>
              <span className="ml-auto text-xs text-emerald-400 font-medium">Active</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400">
              <span className="text-base w-4 text-center">✦</span>
              <span>AI Triage</span>
              <span className="ml-auto text-xs text-emerald-400 font-medium">Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-0.5">
        <NavLink href="/dashboard/settings" label="Settings & API" icon="⚙" />
        <div className="px-3 py-2">
          <div className="text-xs text-gray-500">HomeFlow · Demo Mode</div>
        </div>
      </div>
    </aside>
  )
}
