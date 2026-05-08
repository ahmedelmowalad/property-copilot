'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/dashboard/copilot', label: 'AI Copilot', icon: '✦', highlight: true },
  { href: '/dashboard/agent', label: 'Tenant Agent', icon: '💬', highlight: true },
  { href: '/dashboard/homeflow-demo', label: 'HomeFlow Agent', icon: '🏠', highlight: true },
  { href: '/dashboard/airbnb-demo', label: 'Airbnb Ops AI', icon: '🏡', highlight: true },
  { href: '/dashboard/renewal-demo', label: 'Renewal Demo', icon: '📜', highlight: true },
  { href: '/dashboard/maintenance-demo', label: 'Maintenance AI', icon: '🔧', highlight: true },
  { href: '/dashboard/whatsapp', label: 'WhatsApp Channel', icon: '📱', highlight: true, badge: 'NEW' },
  { href: '/dashboard/properties', label: 'Properties', icon: '🏢' },
  { href: '/dashboard/units', label: 'Units', icon: '🚪' },
  { href: '/dashboard/tenants', label: 'Tenants', icon: '👥' },
  { href: '/dashboard/leases', label: 'Leases', icon: '📄' },
  { href: '/dashboard/tickets', label: 'Maintenance', icon: '🔧' },
]

const futureModules = [
  { label: 'Landlord Support', status: 'Planned' },
  { label: 'Buyer Support', status: 'Future' },
  { label: 'Seller Support', status: 'Future' },
  { label: 'Leasing', status: 'Planned' },
  { label: 'ChatGPT Agent', status: 'Planned' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">PC</div>
          <div>
            <div className="font-semibold text-sm text-white">Property Copilot</div>
            <div className="text-xs text-gray-400">UAE Operations</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800',
              item.highlight && pathname !== item.href ? 'border border-blue-500/30' : ''
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge ? (
              <span className="ml-auto text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-medium">{item.badge}</span>
            ) : item.highlight && (
              <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-medium">AI</span>
            )}
          </Link>
        ))}

        {/* Future Modules */}
        <div className="pt-4">
          <p className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Future Modules</p>
          {futureModules.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 cursor-default"
            >
              <span className="text-base">○</span>
              <span>{m.label}</span>
              <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{m.status}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          )}
        >
          <span>⚙</span>
          <span>Settings & API</span>
        </Link>
        <div className="px-3 py-2">
          <div className="text-xs text-gray-500">Demo Mode • No auth required</div>
        </div>
      </div>
    </aside>
  )
}
