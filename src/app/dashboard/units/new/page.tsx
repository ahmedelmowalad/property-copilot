'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Property { id: string; name: string }

export default function NewUnitPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Loading...</div>}>
      <NewUnitInner />
    </Suspense>
  )
}

function NewUnitInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prePropertyId = searchParams.get('propertyId') || ''

  const [saving, setSaving] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [form, setForm] = useState({
    propertyId: prePropertyId, unitNumber: '', bedrooms: 1, bathrooms: 1,
    rentAmount: '', currency: 'AED', status: 'Vacant', notes: '',
  })

  useEffect(() => {
    fetch('/api/properties').then(r => r.json()).then(setProperties)
  }, [])

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) router.push('/dashboard/units')
      else { const err = await res.json(); alert(err.error) }
    } finally { setSaving(false) }
  }

  return (
    <div>
      <TopBar title="New Unit" subtitle="Add a unit to a property" />
      <div className="p-8 max-w-2xl">
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.propertyId} onChange={e => set('propertyId', e.target.value)} required>
                  <option value="">Select a property...</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number *</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.unitNumber} onChange={e => set('unitNumber', e.target.value)} required placeholder="e.g. 1204 or A-301" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input type="number" min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.bedrooms} onChange={e => set('bedrooms', parseInt(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input type="number" min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.bathrooms} onChange={e => set('bathrooms', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Rent (AED)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.rentAmount} onChange={e => set('rentAmount', e.target.value)} placeholder="e.g. 65000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.status} onChange={e => set('status', e.target.value)}>
                    {['Vacant', 'Occupied', 'Maintenance', 'Reserved'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving}>Create Unit</Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
