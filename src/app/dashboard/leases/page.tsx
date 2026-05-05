'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { statusColor, formatCurrency, formatDate } from '@/lib/utils'

interface Lease {
  id: string; rentAmount: number; currency: string; paymentFrequency: string
  startDate: string; endDate: string; status: string; securityDeposit: number
  tenant: { id: string; firstName: string; lastName: string; email: string }
  unit: { id: string; unitNumber: string; property: { id: string; name: string } }
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leases').then(r => r.json()).then(setLeases).finally(() => setLoading(false))
  }, [])

  const expiring = leases.filter(l => l.status === 'ExpiringSoon')

  return (
    <div>
      <TopBar
        title="Leases"
        subtitle={`${leases.length} total · ${expiring.length} expiring soon`}
        actions={<Link href="/dashboard/leases/new"><Button size="sm">+ New Lease</Button></Link>}
      />
      <div className="p-8 space-y-4">
        {expiring.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-medium text-yellow-800">⚠ {expiring.length} lease{expiring.length > 1 ? 's' : ''} expiring soon — review renewal status</p>
          </div>
        )}
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Property / Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rent (AED/yr)</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">End Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leases.map(l => (
                  <tr key={l.id} className={`hover:bg-gray-50 ${l.status === 'ExpiringSoon' ? 'bg-yellow-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/tenants/${l.tenant.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {l.tenant.firstName} {l.tenant.lastName}
                      </Link>
                      <div className="text-xs text-gray-400">{l.tenant.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/properties/${l.unit.property.id}`} className="text-blue-600 hover:underline text-xs">{l.unit.property.name}</Link>
                      <div className="text-xs text-gray-500">Unit {l.unit.unitNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(l.rentAmount, l.currency)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(l.startDate)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(l.endDate)}</td>
                    <td className="px-4 py-3"><Badge className={statusColor(l.status)}>{l.status}</Badge></td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/copilot?tenantId=${l.tenant.id}`} className="text-xs text-blue-600 hover:underline">Triage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leases.length === 0 && <p className="px-4 py-8 text-center text-gray-400">No leases yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
