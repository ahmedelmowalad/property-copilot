'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { urgencyColor, statusColor, formatDate } from '@/lib/utils'

interface Ticket {
  id: string; title: string; category: string; urgency: string; status: string
  createdAt: string; assignedVendor: string; vendorType: string
  property?: { name: string }; unit?: { unitNumber: string }
  tenant?: { firstName: string; lastName: string }
}

const TICKET_STATUSES = ['New', 'InReview', 'Assigned', 'WaitingOnTenant', 'WaitingOnVendor', 'Completed', 'Cancelled']
const URGENCIES = ['Emergency', 'High', 'Medium', 'Low']

export default function TicketsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Loading...</div>}>
      <TicketsInner />
    </Suspense>
  )
}

function TicketsInner() {
  const searchParams = useSearchParams()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filterUrgency, setFilterUrgency] = useState(searchParams.get('urgency') || '')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '')

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterUrgency) params.set('urgency', filterUrgency)
    if (filterStatus) params.set('status', filterStatus)
    setLoading(true)
    fetch(`/api/tickets?${params}`).then(r => r.json()).then(setTickets).finally(() => setLoading(false))
  }, [filterUrgency, filterStatus])

  const emergencyCount = tickets.filter(t => t.urgency === 'Emergency' && !['Completed', 'Cancelled'].includes(t.status)).length

  return (
    <div>
      <TopBar
        title="Maintenance Tickets"
        subtitle={`${tickets.length} tickets`}
        actions={<Link href="/dashboard/tickets/new"><Button size="sm">+ New Ticket</Button></Link>}
      />
      <div className="p-8 space-y-4">
        {emergencyCount > 0 && !filterUrgency && !filterStatus && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-red-500 text-lg">🚨</span>
            <p className="text-sm font-medium text-red-800">{emergencyCount} emergency ticket{emergencyCount > 1 ? 's' : ''} require immediate attention</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}
          >
            <option value="">All Urgency</option>
            {URGENCIES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(filterUrgency || filterStatus) && (
            <button onClick={() => { setFilterUrgency(''); setFilterStatus('') }} className="text-sm text-gray-400 hover:text-gray-700">
              Clear filters
            </button>
          )}
        </div>

        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <div className="space-y-2">
            {tickets.map(t => (
              <Link key={t.id} href={`/dashboard/tickets/${t.id}`} className="block">
                <div className={`bg-white rounded-xl border hover:border-blue-200 hover:shadow-sm transition-all p-4 ${t.urgency === 'Emergency' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={urgencyColor(t.urgency)} variant="outline">{t.urgency}</Badge>
                        <Badge className={statusColor(t.status)}>{t.status}</Badge>
                        <span className="text-xs text-gray-400">{t.category}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">{t.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {t.property?.name}{t.unit ? ` · Unit ${t.unit.unitNumber}` : ''}
                        {t.tenant ? ` · ${t.tenant.firstName} ${t.tenant.lastName}` : ''}
                        {t.assignedVendor ? ` · Vendor: ${t.assignedVendor}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(t.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
            {tickets.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">No tickets{filterUrgency || filterStatus ? ' matching filters' : ' yet'}.</p>
                <Link href="/dashboard/tickets/new"><Button>+ Create Ticket</Button></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
