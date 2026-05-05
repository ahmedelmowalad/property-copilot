'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Tenant { id: string; firstName: string; lastName: string }
interface Unit { id: string; unitNumber: string; property: { name: string } }

export default function NewLeasePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [form, setForm] = useState({
    tenantId: '', unitId: '', startDate: '', endDate: '',
    rentAmount: '', currency: 'AED', securityDeposit: '',
    paymentFrequency: 'Annual', status: 'Active', notes: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/tenants').then(r => r.json()),
      fetch('/api/units').then(r => r.json()),
    ]).then(([t, u]) => { setTenants(t); setUnits(u) })
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/leases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) router.push('/dashboard/leases')
      else { const err = await res.json(); alert(err.error) }
    } finally { setSaving(false) }
  }

  return (
    <div>
      <TopBar title="New Lease" subtitle="Create a tenancy agreement record" />
      <div className="p-8 max-w-2xl">
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenant *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.tenantId} onChange={e => set('tenantId', e.target.value)} required>
                    <option value="">Select tenant...</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.unitId} onChange={e => set('unitId', e.target.value)} required>
                    <option value="">Select unit...</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.property.name} — Unit {u.unitNumber}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Rent (AED) *</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.rentAmount} onChange={e => set('rentAmount', e.target.value)} required placeholder="e.g. 65000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (AED)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} placeholder="e.g. 6500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.paymentFrequency} onChange={e => set('paymentFrequency', e.target.value)}>
                    {['Annual', 'Quarterly', 'Monthly'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.status} onChange={e => set('status', e.target.value)}>
                    {['Active', 'Draft', 'ExpiringSoon', 'Expired', 'Terminated'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                Reminder: This record is for operational tracking only. All lease agreements must comply with UAE tenancy law and RERA regulations. Consult a qualified professional.
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving}>Create Lease</Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
