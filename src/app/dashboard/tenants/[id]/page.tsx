'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { statusColor, urgencyColor, formatCurrency, formatDate } from '@/lib/utils'

interface Tenant {
  id: string; firstName: string; lastName: string; email: string; phone: string
  status: string; preferredChannel: string; notes: string
  unit?: { id: string; unitNumber: string; property: { id: string; name: string } }
  leases: { id: string; status: string; startDate: string; endDate: string; rentAmount: number; currency: string; paymentFrequency: string }[]
  tickets: { id: string; title: string; urgency: string; status: string; createdAt: string }[]
}

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Tenant>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/tenants/${id}`).then(r => r.json()).then(t => { setTenant(t); setForm(t) })
  }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tenants/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { const t = await res.json(); setTenant(t); setEditing(false) }
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this tenant?')) return
    await fetch(`/api/tenants/${id}`, { method: 'DELETE' })
    router.push('/dashboard/tenants')
  }

  if (!tenant) return <div className="p-8 text-gray-400 text-sm">Loading...</div>

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <TopBar
        title={`${tenant.firstName} ${tenant.lastName}`}
        subtitle={tenant.unit ? `${tenant.unit.property.name} — Unit ${tenant.unit.unitNumber}` : 'No unit assigned'}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/tenants"><Button size="sm" variant="secondary">← Back</Button></Link>
            <Link href={`/dashboard/copilot?tenantId=${id}`}><Button size="sm"><span>✦</span> AI Triage</Button></Link>
            <Button size="sm" variant="secondary" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        }
      />
      <div className="p-8 space-y-6">
        <Card>
          <CardHeader><CardTitle>Tenant Details</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.firstName || ''} onChange={e => set('firstName', e.target.value)} placeholder="First Name" />
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.lastName || ''} onChange={e => set('lastName', e.target.value)} placeholder="Last Name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="Email" />
                  <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="Phone" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.status || 'Active'} onChange={e => set('status', e.target.value)}>
                    {['Active', 'Prospect', 'MovingOut', 'Past'].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.preferredChannel || 'WebDashboard'} onChange={e => set('preferredChannel', e.target.value)}>
                    <option value="WebDashboard">Web Dashboard</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Notes" />
                <Button size="sm" onClick={handleSave} loading={saving}>Save Changes</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-400 block">Email</span><span>{tenant.email || '—'}</span></div>
                <div><span className="text-gray-400 block">Phone</span><span>{tenant.phone || '—'}</span></div>
                <div><span className="text-gray-400 block">Status</span><Badge className={statusColor(tenant.status)}>{tenant.status}</Badge></div>
                <div><span className="text-gray-400 block">Preferred Channel</span><span>{tenant.preferredChannel}</span></div>
                {tenant.unit && <div><span className="text-gray-400 block">Unit</span><Link href={`/dashboard/properties/${tenant.unit.property.id}`} className="text-blue-600 hover:underline">{tenant.unit.property.name} — {tenant.unit.unitNumber}</Link></div>}
                {tenant.notes && <div className="col-span-2"><span className="text-gray-400 block">Notes</span><span>{tenant.notes}</span></div>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leases</CardTitle>
              <Link href="/dashboard/leases/new"><Button size="sm">+ New Lease</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {tenant.leases.length === 0 ? <p className="px-6 py-4 text-sm text-gray-400">No leases.</p> : (
              <div className="divide-y divide-gray-50">
                {tenant.leases.map(l => (
                  <div key={l.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">{formatDate(l.startDate)} → {formatDate(l.endDate)}</span>
                      <span className="text-gray-400 ml-2">{formatCurrency(l.rentAmount, l.currency)}/yr · {l.paymentFrequency}</span>
                    </div>
                    <Badge className={statusColor(l.status)}>{l.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets */}
        {tenant.tickets.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Maintenance Tickets</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {tenant.tickets.map(t => (
                  <Link key={t.id} href={`/dashboard/tickets/${t.id}`} className="block px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{t.title}</span>
                      <div className="flex gap-1.5">
                        <Badge className={urgencyColor(t.urgency)}>{t.urgency}</Badge>
                        <Badge className={statusColor(t.status)}>{t.status}</Badge>
                      </div>
                    </div>
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
