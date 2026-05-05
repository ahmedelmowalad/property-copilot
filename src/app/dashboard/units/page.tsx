'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { statusColor, formatCurrency } from '@/lib/utils'

interface Unit {
  id: string; unitNumber: string; bedrooms: number; bathrooms: number
  rentAmount: number; currency: string; status: string
  property: { id: string; name: string }
  tenants: { id: string; firstName: string; lastName: string }[]
  leases: { id: string; status: string; endDate: string }[]
  _count: { tickets: number }
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/units').then(r => r.json()).then(setUnits).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <TopBar
        title="Units"
        subtitle={`${units.length} units across portfolio`}
        actions={<Link href="/dashboard/units/new"><Button size="sm">+ New Unit</Button></Link>}
      />
      <div className="p-8">
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Beds/Baths</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rent</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lease</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {units.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.unitNumber}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/properties/${u.property.id}`} className="text-blue-600 hover:underline">{u.property.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.bedrooms}BR · {u.bathrooms}BA</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(u.rentAmount, u.currency)}</td>
                    <td className="px-4 py-3">
                      {u.tenants[0] ? (
                        <Link href={`/dashboard/tenants/${u.tenants[0].id}`} className="text-blue-600 hover:underline">
                          {u.tenants[0].firstName} {u.tenants[0].lastName}
                        </Link>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.leases[0] ? <Badge className={statusColor(u.leases[0].status)}>{u.leases[0].status}</Badge> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3"><Badge className={statusColor(u.status)}>{u.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{u._count.tickets > 0 ? `${u._count.tickets} 🔧` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {units.length === 0 && <p className="px-4 py-8 text-center text-gray-400">No units yet.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
