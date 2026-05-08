'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { urgencyColor, statusColor, formatDate, cn } from '@/lib/utils'

interface DashboardData {
  stats: {
    properties: number
    units: number
    activeTenants: number
    activeLeases: number
    openTickets: number
    urgentTickets: number
    unreadMessages: number
    totalContacts: number
    missedCalls: number
  }
  recentTickets: {
    id: string; title: string; urgency: string; status: string; category: string; createdAt: string
    property?: { name: string }; unit?: { unitNumber: string }; tenant?: { firstName: string; lastName: string }
  }[]
  recentRequests: {
    id: string; rawMessage: string; category: string; urgency: string; senderType: string; createdAt: string
    relatedProperty?: { name: string }; relatedTenant?: { firstName: string; lastName: string }
  }[]
  recentComms: {
    id: string; channel: string; direction: string; status: string; fromName: string | null; fromNumber: string | null
    body: string; aiCategory: string | null; aiUrgency: string | null; createdAt: string
    relatedTenant: { firstName: string; lastName: string } | null
  }[]
}

const channelIcon: Record<string, string> = { whatsapp: '📱', voice_call: '📞', web: '🌐', manual: '✏️' }
const channelLabel: Record<string, string> = { whatsapp: 'WhatsApp', voice_call: 'Phone', web: 'Web', manual: 'Manual' }

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) setData(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const body = await res.json()
      if (body.alreadySeeded) alert('Demo data is already loaded.')
      else if (body.seeded) { alert('Demo data loaded!'); fetchDashboard() }
      else alert('Seed error: ' + body.error)
    } catch {
      alert('Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">Loading HomeFlow...</div>
      </div>
    )
  }

  const stats = data?.stats

  return (
    <div>
      <TopBar
        title="HomeFlow Dashboard"
        subtitle="UAE Real Estate Operations Platform"
        actions={
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={handleSeed} loading={seeding}>
              Load Demo Data
            </Button>
            <Link href="/dashboard/inbox">
              <Button size="sm" variant={stats?.unreadMessages ? 'primary' : 'secondary'}>
                {stats?.unreadMessages ? `📱 ${stats.unreadMessages} New` : '📱 Inbox'}
              </Button>
            </Link>
            <Link href="/dashboard/copilot">
              <Button size="sm">✦ AI Copilot</Button>
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Alert row */}
        <div className="flex flex-col gap-3">
          {(stats?.urgentTickets ?? 0) > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-red-500 text-lg">⚠</span>
              <div>
                <p className="text-sm font-medium text-red-800">
                  {stats?.urgentTickets} urgent/emergency ticket{stats?.urgentTickets !== 1 ? 's' : ''} require immediate attention
                </p>
                <Link href="/dashboard/tickets" className="text-xs text-red-600 hover:underline mt-0.5 inline-block">
                  View all open tickets →
                </Link>
              </div>
            </div>
          )}
          {(stats?.unreadMessages ?? 0) > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-blue-500 text-lg">📱</span>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {stats?.unreadMessages} unread message{stats?.unreadMessages !== 1 ? 's' : ''} in inbox
                </p>
                <Link href="/dashboard/inbox" className="text-xs text-blue-600 hover:underline mt-0.5 inline-block">
                  Open inbox →
                </Link>
              </div>
            </div>
          )}
          {(stats?.missedCalls ?? 0) > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-orange-500 text-lg">📞</span>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  {stats?.missedCalls} missed call{stats?.missedCalls !== 1 ? 's' : ''}
                </p>
                <Link href="/dashboard/calls" className="text-xs text-orange-600 hover:underline mt-0.5 inline-block">
                  View call log →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Properties', value: stats?.properties ?? 0, href: '/dashboard/properties', color: 'blue' },
            { label: 'Active Tenants', value: stats?.activeTenants ?? 0, href: '/dashboard/tenants', color: 'violet' },
            { label: 'Open Tickets', value: stats?.openTickets ?? 0, href: '/dashboard/tickets', color: 'amber' },
            { label: 'Unread Messages', value: stats?.unreadMessages ?? 0, href: '/dashboard/inbox', color: 'emerald', highlight: (stats?.unreadMessages ?? 0) > 0 },
            { label: 'Missed Calls', value: stats?.missedCalls ?? 0, href: '/dashboard/calls', color: 'orange', highlight: (stats?.missedCalls ?? 0) > 0 },
            { label: 'Contacts', value: stats?.totalContacts ?? 0, href: '/dashboard/contacts', color: 'purple' },
          ].map((s) => (
            <Link key={s.label} href={s.href}>
              <div className={cn(
                'bg-white rounded-xl border p-4 hover:shadow-sm transition-all cursor-pointer',
                s.highlight ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
              )}>
                <div className={cn('text-2xl font-bold', s.highlight ? 'text-blue-700' : 'text-gray-900')}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {!data || (stats?.properties === 0 && (stats?.unreadMessages ?? 0) === 0) ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <p className="text-emerald-800 font-medium mb-2">Welcome to HomeFlow</p>
            <p className="text-emerald-700 text-sm mb-4">Load demo data to see UAE properties, tenants, WhatsApp messages, and call logs in action.</p>
            <Button onClick={handleSeed} loading={seeding}>Load Demo Data</Button>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent WhatsApp Messages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Messages</CardTitle>
                <Link href="/dashboard/inbox" className="text-xs text-blue-600 hover:underline">View inbox</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!data?.recentComms?.length ? (
                <div className="px-6 py-6 text-center">
                  <p className="text-sm text-gray-400 mb-1">No messages yet</p>
                  <p className="text-xs text-gray-400">Connect WhatsApp to see messages here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.recentComms.map(comm => (
                    <Link key={comm.id} href="/dashboard/inbox" className="block px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex items-start gap-2">
                          <span className="text-base mt-0.5">{channelIcon[comm.channel] || '💬'}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {comm.relatedTenant
                                ? `${comm.relatedTenant.firstName} ${comm.relatedTenant.lastName}`
                                : comm.fromName || comm.fromNumber || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">{comm.body}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {comm.aiUrgency && <Badge className={urgencyColor(comm.aiUrgency)}>{comm.aiUrgency}</Badge>}
                          {comm.status === 'new' && comm.direction === 'inbound' && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-7">{formatDate(comm.createdAt)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Maintenance Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Maintenance Tickets</CardTitle>
                <Link href="/dashboard/tickets" className="text-xs text-blue-600 hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data?.recentTickets?.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-400">No tickets yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data?.recentTickets?.map((ticket) => (
                    <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {ticket.property?.name}{ticket.unit ? ` · Unit ${ticket.unit.unitNumber}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={urgencyColor(ticket.urgency)}>{ticket.urgency}</Badge>
                          <Badge className={statusColor(ticket.status)}>{ticket.status}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(ticket.createdAt)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: '/dashboard/inbox', label: '📱 Inbox', desc: 'View all messages', primary: true },
                { href: '/dashboard/calls', label: '📞 Call Log', desc: 'Phone call records', primary: false },
                { href: '/dashboard/contacts', label: '👤 Contacts', desc: 'Buyers, sellers, leads', primary: false },
                { href: '/dashboard/copilot', label: '✦ AI Copilot', desc: 'Triage any message', primary: true },
                { href: '/dashboard/tickets/new', label: '+ New Ticket', desc: 'Maintenance ticket', primary: false },
                { href: '/dashboard/properties', label: '🏢 Properties', desc: 'Manage portfolio', primary: false },
                { href: '/dashboard/tenants', label: '👥 Tenants', desc: 'Active tenants', primary: false },
                { href: '/dashboard/leases', label: '📄 Leases', desc: 'Lease overview', primary: false },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <div className={cn(
                    'rounded-lg border p-4 hover:shadow-sm transition-all cursor-pointer',
                    a.primary ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300' : 'border-gray-200 hover:border-gray-300'
                  )}>
                    <p className={cn('text-sm font-medium', a.primary ? 'text-emerald-700' : 'text-gray-700')}>{a.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> HomeFlow does not provide legal, tax, financial, or real-estate compliance advice.
            AI outputs require human review and approval. For UAE tenancy and regulatory matters, consult a qualified professional.
          </p>
        </div>
      </div>
    </div>
  )
}
