'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { urgencyColor, statusColor, formatDate } from '@/lib/utils'

interface Ticket {
  id: string; title: string; description: string; category: string; urgency: string
  status: string; sourceMessage: string; aiSummary: string; aiSuggestedResponse: string
  assignedVendor: string; vendorType: string; dueDate: string; createdAt: string; updatedAt: string
  property?: { id: string; name: string; address: string }
  unit?: { id: string; unitNumber: string }
  tenant?: { id: string; firstName: string; lastName: string; email: string; phone: string }
  activityLogs: { id: string; action: string; notes: string; createdAt: string }[]
}

const STATUSES = ['New', 'InReview', 'Assigned', 'WaitingOnTenant', 'WaitingOnVendor', 'Completed', 'Cancelled']

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Ticket>>({})
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/tickets/${id}`).then(r => r.json()).then(t => { setTicket(t); setForm(t) })
  }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { const t = await res.json(); setTicket({ ...ticket!, ...t }); setEditing(false) }
    } finally { setSaving(false) }
  }

  async function handleStatusChange(status: string) {
    const res = await fetch(`/api/tickets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...ticket, status }) })
    if (res.ok) {
      const t = await res.json()
      setTicket({ ...ticket!, status: t.status })
      // Re-fetch to get new activity log
      fetch(`/api/tickets/${id}`).then(r => r.json()).then(t => setTicket(t))
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this ticket?')) return
    await fetch(`/api/tickets/${id}`, { method: 'DELETE' })
    router.push('/dashboard/tickets')
  }

  function copyResponse() {
    if (ticket?.aiSuggestedResponse) {
      navigator.clipboard.writeText(ticket.aiSuggestedResponse)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!ticket) return <div className="p-8 text-gray-400 text-sm">Loading...</div>

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <TopBar
        title={ticket.title}
        subtitle={`${ticket.category} · Created ${formatDate(ticket.createdAt)}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Link href="/dashboard/tickets"><Button size="sm" variant="secondary">← Back</Button></Link>
            <Button size="sm" variant="secondary" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {ticket.urgency === 'Emergency' && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3">
            <span className="text-red-500 text-xl">🚨</span>
            <div>
              <p className="text-sm font-bold text-red-800">EMERGENCY — Immediate response required</p>
              <p className="text-xs text-red-600 mt-0.5">This ticket must not be closed without human confirmation. Contact UAE emergency services (999) if safety is at risk.</p>
            </div>
          </div>
        )}

        {/* Status Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={urgencyColor(ticket.urgency)} variant="outline">{ticket.urgency}</Badge>
                <Badge className={statusColor(ticket.status)}>{ticket.status}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ticket.status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Details */}
          <Card>
            <CardHeader><CardTitle>Ticket Details</CardTitle></CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-3">
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Title" />
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="Description" />
                  <div className="grid grid-cols-2 gap-3">
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.urgency || 'Medium'} onChange={e => set('urgency', e.target.value)}>
                      {['Low', 'Medium', 'High', 'Emergency'].map(u => <option key={u}>{u}</option>)}
                    </select>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.category || 'Maintenance'} onChange={e => set('category', e.target.value)}>
                      {['Maintenance', 'Plumbing', 'Electrical', 'HVAC', 'Access Control', 'Emergency', 'General', 'Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.assignedVendor || ''} onChange={e => set('assignedVendor', e.target.value)} placeholder="Assigned vendor" />
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.vendorType || ''} onChange={e => set('vendorType', e.target.value)} placeholder="Vendor type" />
                  <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {ticket.description && <p className="text-gray-700">{ticket.description}</p>}
                  <div className="grid grid-cols-2 gap-3">
                    {ticket.property && <div><span className="text-gray-400 block text-xs">Property</span><Link href={`/dashboard/properties/${ticket.property.id}`} className="text-blue-600 hover:underline">{ticket.property.name}</Link></div>}
                    {ticket.unit && <div><span className="text-gray-400 block text-xs">Unit</span><span>Unit {ticket.unit.unitNumber}</span></div>}
                    {ticket.tenant && <div><span className="text-gray-400 block text-xs">Tenant</span><Link href={`/dashboard/tenants/${ticket.tenant.id}`} className="text-blue-600 hover:underline">{ticket.tenant.firstName} {ticket.tenant.lastName}</Link></div>}
                    {ticket.assignedVendor && <div><span className="text-gray-400 block text-xs">Vendor</span><span>{ticket.assignedVendor}</span></div>}
                    {ticket.vendorType && <div><span className="text-gray-400 block text-xs">Vendor Type</span><span>{ticket.vendorType}</span></div>}
                    {ticket.dueDate && <div><span className="text-gray-400 block text-xs">Due Date</span><span>{formatDate(ticket.dueDate)}</span></div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
            <CardContent className="p-0">
              {ticket.activityLogs.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-400">No activity logged.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {ticket.activityLogs.map(log => (
                    <div key={log.id} className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      {log.notes && <p className="text-xs text-gray-500 mt-0.5">{log.notes}</p>}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(log.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Source Message */}
        {ticket.sourceMessage && (
          <Card>
            <CardHeader><CardTitle>Original Message</CardTitle></CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 text-sm">{ticket.sourceMessage}</blockquote>
            </CardContent>
          </Card>
        )}

        {/* AI Summary */}
        {ticket.aiSummary && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>AI Analysis</CardTitle>
                <Badge className="bg-blue-100 text-blue-700">AI Generated</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Summary</p>
                <p className="text-sm text-gray-700">{ticket.aiSummary}</p>
              </div>
              {ticket.aiSuggestedResponse && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400">Draft Response (requires human approval before sending)</p>
                    <button onClick={copyResponse} className="text-xs text-blue-600 hover:underline">
                      {copied ? '✓ Copied!' : 'Copy to clipboard'}
                    </button>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">{ticket.aiSuggestedResponse}</div>
                  <p className="text-xs text-amber-600 mt-2">⚠ This is an AI-generated draft. Review carefully before sending. Do not send automatically.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
