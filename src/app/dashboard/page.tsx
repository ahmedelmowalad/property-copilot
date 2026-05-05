'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { urgencyColor, statusColor, formatDate } from '@/lib/utils'

interface DashboardData {
  stats: {
    properties: number
    units: number
    activeTenants: number
    activeLeases: number
    openTickets: number
    urgentTickets: number
  }
  recentTickets: {
    id: string
    title: string
    urgency: string
    status: string
    category: string
    createdAt: string
    property?: { name: string }
    unit?: { unitNumber: string }
    tenant?: { firstName: string; lastName: string }
  }[]
  recentRequests: {
    id: string
    rawMessage: string
    category: string
    urgency: string
    senderType: string
    createdAt: string
    relatedProperty?: { name: string }
    relatedTenant?: { firstName: string; lastName: string }
  }[]
}

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
      else if (body.seeded) { alert('Demo data seeded successfully!'); fetchDashboard() }
      else alert('Seed error: ' + body.error)
    } catch (e) {
      alert('Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">Loading dashboard...</div>
      </div>
    )
  }

  const stats = data?.stats

  return (
    <div>
      <TopBar
        title="Operations Dashboard"
        subtitle="UAE Residential Property Management"
        actions={
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={handleSeed} loading={seeding}>
              Load Demo Data
            </Button>
            <Link href="/dashboard/copilot">
              <Button size="sm">
                <span>✦</span> AI Copilot
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Properties', value: stats?.properties ?? 0, href: '/dashboard/properties', color: 'blue' },
            { label: 'Units', value: stats?.units ?? 0, href: '/dashboard/units', color: 'indigo' },
            { label: 'Active Tenants', value: stats?.activeTenants ?? 0, href: '/dashboard/tenants', color: 'violet' },
            { label: 'Active Leases', value: stats?.activeLeases ?? 0, href: '/dashboard/leases', color: 'purple' },
            { label: 'Open Tickets', value: stats?.openTickets ?? 0, href: '/dashboard/tickets', color: 'amber' },
            { label: 'Urgent/Emergency', value: stats?.urgentTickets ?? 0, href: '/dashboard/tickets?urgency=High', color: 'red' },
          ].map((s) => (
            <Link key={s.label} href={s.href}>
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Emergency Alert */}
        {(stats?.urgentTickets ?? 0) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-red-500 text-lg">⚠</span>
            <div>
              <p className="text-sm font-medium text-red-800">
                {stats?.urgentTickets} urgent/emergency ticket{stats?.urgentTickets !== 1 ? 's' : ''} require immediate attention
              </p>
              <Link href="/dashboard/tickets" className="text-xs text-red-600 hover:underline mt-1 inline-block">
                View all open tickets →
              </Link>
            </div>
          </div>
        )}

        {!data || (stats?.properties === 0) ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <p className="text-blue-800 font-medium mb-2">No data yet</p>
            <p className="text-blue-600 text-sm mb-4">Load the demo data to see UAE residential property management in action.</p>
            <Button onClick={handleSeed} loading={seeding}>Load Demo Data</Button>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Maintenance Tickets</CardTitle>
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
                            {ticket.tenant ? ` · ${ticket.tenant.firstName} ${ticket.tenant.lastName}` : ''}
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

          {/* Recent AI Triage Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent AI Triage Requests</CardTitle>
                <Link href="/dashboard/copilot" className="text-xs text-blue-600 hover:underline">New triage</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data?.recentRequests?.length === 0 ? (
                <div className="px-6 py-6 text-center">
                  <p className="text-sm text-gray-400 mb-3">No triage requests yet.</p>
                  <Link href="/dashboard/copilot">
                    <Button size="sm">
                      <span>✦</span> Try AI Copilot
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data?.recentRequests?.map((req) => (
                    <div key={req.id} className="px-6 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-600 line-clamp-2 italic">&quot;{req.rawMessage}&quot;</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {req.category && <Badge className="bg-blue-100 text-blue-700">{req.category}</Badge>}
                          {req.urgency && <Badge className={urgencyColor(req.urgency)}>{req.urgency}</Badge>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {req.senderType} · {formatDate(req.createdAt)}
                        {req.relatedProperty ? ` · ${req.relatedProperty.name}` : ''}
                      </p>
                    </div>
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
                { href: '/dashboard/copilot', label: '✦ New AI Triage', desc: 'Triage an incoming message', primary: true },
                { href: '/dashboard/tickets/new', label: '+ New Ticket', desc: 'Create maintenance ticket' },
                { href: '/dashboard/properties/new', label: '+ New Property', desc: 'Add a property' },
                { href: '/dashboard/tenants/new', label: '+ New Tenant', desc: 'Add a tenant' },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <div className={`rounded-lg border p-4 hover:shadow-sm transition-all cursor-pointer ${a.primary ? 'border-blue-200 bg-blue-50 hover:border-blue-300' : 'border-gray-200 hover:border-gray-300'}`}>
                    <p className={`text-sm font-medium ${a.primary ? 'text-blue-700' : 'text-gray-700'}`}>{a.label}</p>
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
            <strong>Disclaimer:</strong> Property Copilot does not provide legal, tax, financial, regulatory, or real-estate compliance advice.
            AI outputs require human review and approval. For UAE tenancy and regulatory matters, consult a qualified professional.
          </p>
        </div>
      </div>
    </div>
  )
}
