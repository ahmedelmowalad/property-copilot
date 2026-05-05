'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Unit { id: string; unitNumber: string; property: { name: string } }

export default function NewTenantPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    preferredChannel: 'WebDashboard', unitId: '', status: 'Active', notes: '',
  })

  useEffect(() => {
    fetch('/api/units').then(r => r.json()).then(setUnits)
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/tenants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, unitId: form.unitId || undefined }) })
      if (res.ok) router.push('/dashboard/tenants')
      else { const err = await res.json(); alert(err.error) }
    } finally { setSaving(false) }
  }

  return (
    <div>
      <TopBar title="New Tenant" subtitle="Add a tenant to the portfolio" />
      <div className="p-8 max-w-2xl">
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+971 5x xxx xxxx" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Unit</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.unitId} onChange={e => set('unitId', e.target.value)}>
                    <option value="">No unit assigned</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.property.name} — Unit {u.unitNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.status} onChange={e => set('status', e.target.value)}>
                    {['Active', 'Prospect', 'MovingOut', 'Past'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Channel</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.preferredChannel} onChange={e => set('preferredChannel', e.target.value)}>
                  <option value="WebDashboard">Web Dashboard</option>
                  <option value="WhatsApp">WhatsApp (Future)</option>
                  <option value="Email">Email (Future)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving}>Create Tenant</Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
