'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Property { id: string; name: string }
interface Unit { id: string; unitNumber: string; property: { name: string } }
interface Tenant { id: string; firstName: string; lastName: string }

export default function NewTicketPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [form, setForm] = useState({
    title: '', description: '', category: 'Maintenance', urgency: 'Medium', status: 'New',
    propertyId: '', unitId: '', tenantId: '', assignedVendor: '', vendorType: '', dueDate: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/properties').then(r => r.json()),
      fetch('/api/units').then(r => r.json()),
      fetch('/api/tenants').then(r => r.json()),
    ]).then(([p, u, t]) => { setProperties(p); setUnits(u); setTenants(t) })
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        ...form,
        propertyId: form.propertyId || undefined,
        unitId: form.unitId || undefined,
        tenantId: form.tenantId || undefined,
        dueDate: form.dueDate || undefined,
      }
      const res = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { const t = await res.json(); router.push(`/dashboard/tickets/${t.id}`) }
      else { const err = await res.json(); alert(err.error) }
    } finally { setSaving(false) }
  }

  return (
    <div>
      <TopBar title="New Maintenance Ticket" subtitle="Create a manual ticket" />
      <div className="p-8 max-w-2xl">
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. AC Unit Not Working — Unit 1204" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.category} onChange={e => set('category', e.target.value)}>
                    {['Maintenance', 'Plumbing', 'Electrical', 'HVAC', 'Access Control', 'Emergency', 'General', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.urgency} onChange={e => set('urgency', e.target.value)}>
                    {['Low', 'Medium', 'High', 'Emergency'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.propertyId} onChange={e => set('propertyId', e.target.value)}>
                    <option value="">None</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.unitId} onChange={e => set('unitId', e.target.value)}>
                    <option value="">None</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.property.name} — {u.unitNumber}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.tenantId} onChange={e => set('tenantId', e.target.value)}>
                    <option value="">None</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Vendor</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.assignedVendor} onChange={e => set('assignedVendor', e.target.value)} placeholder="Vendor name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Type</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.vendorType} onChange={e => set('vendorType', e.target.value)} placeholder="e.g. HVAC Technician" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving}>Create Ticket</Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
