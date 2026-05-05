'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { statusColor, formatDate } from '@/lib/utils'

interface Tenant {
  id: string; firstName: string; lastName: string; email: string; phone: string
  status: string; preferredChannel: string
  unit?: { id: string; unitNumber: string; property: { id: string; name: string } }
  leases: { id: string; status: string; endDate: string; rentAmount: number; currency: string }[]
  _count: { tickets: number }
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tenants').then(r => r.json()).then(setTenants).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <TopBar
        title="Tenants"
        subtitle={`${tenants.filter(t => t.status === 'Active').length} active`}
        actions={<Link href="/dashboard/tenants/new"><Button size="sm">+ New Tenant</Button></Link>}
      />
      <div className="p-8">
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lease</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lease End</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/tenants/${t.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {t.firstName} {t.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <div>{t.email || '—'}</div>
                      <div className="text-xs">{t.phone || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      {t.unit ? (
                        <div>
                          <Link href={`/dashboard/properties/${t.unit.property.id}`} className="text-blue-600 hover:underline text-xs">{t.unit.property.name}</Link>
                          <div className="text-xs text-gray-500">Unit {t.unit.unitNumber}</div>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {t.leases[0] ? <Badge className={statusColor(t.leases[0].status)}>{t.leases[0].status}</Badge> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {t.leases[0] ? formatDate(t.leases[0].endDate) : '—'}
                    </td>
                    <td className="px-4 py-3"><Badge className={statusColor(t.status)}>{t.status}</Badge></td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/copilot?tenantId=${t.id}`} className="text-xs text-blue-600 hover:underline">Triage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tenants.length === 0 && <p className="px-4 py-8 text-center text-gray-400">No tenants yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
