'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { urgencyColor, statusColor, formatCurrency, formatDate } from '@/lib/utils'

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Studio', 'ResidentialBuilding', 'Other']
const EMIRATES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']

interface Property {
  id: string; name: string; address: string; emirate: string; area: string
  propertyType: string; status: string; notes: string
  units: {
    id: string; unitNumber: string; bedrooms: number; bathrooms: number
    rentAmount: number; currency: string; status: string
    tenants: { id: string; firstName: string; lastName: string }[]
    leases: { id: string; status: string; endDate: string; rentAmount: number }[]
  }[]
  tickets: { id: string; title: string; urgency: string; status: string; createdAt: string }[]
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Property>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/properties/${id}`).then(r => r.json()).then(p => { setProperty(p); setForm(p) })
  }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { const p = await res.json(); setProperty(p); setEditing(false) }
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this property and all its data?')) return
    await fetch(`/api/properties/${id}`, { method: 'DELETE' })
    router.push('/dashboard/properties')
  }

  if (!property) return <div className="p-8 text-gray-400 text-sm">Loading...</div>

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <TopBar
        title={property.name}
        subtitle={`${property.area}, ${property.emirate}`}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/properties"><Button size="sm" variant="secondary">← Back</Button></Link>
            <Button size="sm" variant="secondary" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Details */}
        <Card>
          <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Name" />
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Address" />
                <div className="grid grid-cols-2 gap-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.emirate || 'Dubai'} onChange={e => set('emirate', e.target.value)}>
                    {EMIRATES.map(e => <option key={e}>{e}</option>)}
                  </select>
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.area || ''} onChange={e => set('area', e.target.value)} placeholder="Area" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.propertyType || ''} onChange={e => set('propertyType', e.target.value)}>
                    {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.status || 'Active'} onChange={e => set('status', e.target.value)}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Notes" />
                <Button size="sm" onClick={handleSave} loading={saving}>Save Changes</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-400 block">Address</span><span>{property.address}</span></div>
                <div><span className="text-gray-400 block">Emirate</span><span>{property.emirate}</span></div>
                <div><span className="text-gray-400 block">Area</span><span>{property.area}</span></div>
                <div><span className="text-gray-400 block">Type</span><span>{property.propertyType}</span></div>
                <div><span className="text-gray-400 block">Status</span><Badge className={statusColor(property.status)}>{property.status}</Badge></div>
                {property.notes && <div className="col-span-2"><span className="text-gray-400 block">Notes</span><span>{property.notes}</span></div>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Units */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Units ({property.units.length})</CardTitle>
              <Link href={`/dashboard/units/new?propertyId=${id}`}><Button size="sm">+ Add Unit</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {property.units.length === 0 ? <p className="px-6 py-4 text-sm text-gray-400">No units yet.</p> : (
              <div className="divide-y divide-gray-50">
                {property.units.map(u => (
                  <div key={u.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm text-gray-900">Unit {u.unitNumber}</span>
                      <span className="text-xs text-gray-400 ml-2">{u.bedrooms}BR · {u.bathrooms}BA · {formatCurrency(u.rentAmount, u.currency)}/yr</span>
                      {u.tenants.length > 0 && <span className="text-xs text-gray-500 ml-2">— {u.tenants[0].firstName} {u.tenants[0].lastName}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor(u.status)}>{u.status}</Badge>
                      {u.leases[0] && <Badge className={statusColor(u.leases[0].status)}>{u.leases[0].status}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        {property.tickets.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Tickets</CardTitle>
                <Link href={`/dashboard/tickets?propertyId=${id}`} className="text-xs text-blue-600 hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {property.tickets.map(t => (
                  <Link key={t.id} href={`/dashboard/tickets/${t.id}`} className="block px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{t.title}</span>
                      <div className="flex gap-1.5">
                        <Badge className={urgencyColor(t.urgency)}>{t.urgency}</Badge>
                        <Badge className={statusColor(t.status)}>{t.status}</Badge>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(t.createdAt)}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
