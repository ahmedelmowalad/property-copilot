'use client'
import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatDate, cn } from '@/lib/utils'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  whatsappNumber: string | null
  contactType: string
  leadStatus: string
  propertyInterest: string | null
  budgetAed: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const typeColor: Record<string, string> = {
  buyer: 'bg-emerald-100 text-emerald-700',
  seller: 'bg-orange-100 text-orange-700',
  landlord: 'bg-blue-100 text-blue-700',
  prospect_tenant: 'bg-purple-100 text-purple-700',
  vendor: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-600',
}

const typeLabel: Record<string, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  landlord: 'Landlord',
  prospect_tenant: 'Prospect Tenant',
  vendor: 'Vendor',
  other: 'Other',
}

const leadColor: Record<string, string> = {
  new: 'bg-gray-100 text-gray-600',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-emerald-100 text-emerald-700',
  negotiating: 'bg-orange-100 text-orange-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-700',
}

const leadLabel: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  negotiating: 'Negotiating',
  closed_won: 'Won',
  closed_lost: 'Lost',
}

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', whatsappNumber: '',
  contactType: 'buyer', leadStatus: 'new', propertyInterest: '', budgetAed: '', notes: '',
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [editStatus, setEditStatus] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('contactType', filter)
      const res = await fetch(`/api/contacts?${params}`)
      if (res.ok) setContacts(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  async function createContact() {
    if (!form.firstName || !form.lastName) return
    setSaving(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budgetAed: form.budgetAed ? parseFloat(form.budgetAed) : null,
          email: form.email || null,
          phone: form.phone || null,
          whatsappNumber: form.whatsappNumber || null,
          propertyInterest: form.propertyInterest || null,
          notes: form.notes || null,
        }),
      })
      if (res.ok) {
        setShowNew(false)
        setForm(emptyForm)
        load()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function updateLeadStatus(id: string, status: string) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadStatus: status }),
      })
      if (res.ok) {
        setEditStatus(null)
        load()
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, leadStatus: status } : null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(false)
    }
  }

  const filterTypes = ['all', 'buyer', 'seller', 'landlord', 'prospect_tenant', 'vendor']

  return (
    <div>
      <TopBar
        title="Contacts"
        subtitle="Buyers, sellers, landlords, and prospect tenants"
        actions={
          <Button size="sm" onClick={() => setShowNew(true)}>
            + New Contact
          </Button>
        }
      />

      <div className="p-8">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {filterTypes.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {f === 'all' ? 'All' : typeLabel[f] || f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No contacts yet</p>
            <p className="text-gray-400 text-sm mb-4">Add buyers, sellers, landlords, or prospect tenants to track your pipeline.</p>
            <Button onClick={() => setShowNew(true)}>+ Add Contact</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Contact list */}
            <div className="lg:col-span-2 space-y-2">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => setSelected(contact)}
                  className={cn(
                    'bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm',
                    selected?.id === contact.id ? 'border-blue-500 shadow-sm' : 'border-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={typeColor[contact.contactType] || 'bg-gray-100 text-gray-600'}>
                        {typeLabel[contact.contactType] || contact.contactType}
                      </Badge>
                    </div>
                  </div>
                  {contact.propertyInterest && (
                    <p className="text-xs text-gray-500 truncate">{contact.propertyInterest}</p>
                  )}
                  {contact.budgetAed && (
                    <p className="text-xs text-gray-500">Budget: AED {contact.budgetAed.toLocaleString()}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">{formatDate(contact.createdAt)}</p>
                    <Badge className={leadColor[contact.leadStatus] || 'bg-gray-100 text-gray-600'}>
                      {leadLabel[contact.leadStatus] || contact.leadStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact detail */}
            <div className="lg:col-span-3">
              {!selected ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center h-64 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Select a contact to view details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{selected.firstName} {selected.lastName}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={typeColor[selected.contactType] || 'bg-gray-100 text-gray-600'}>
                              {typeLabel[selected.contactType] || selected.contactType}
                            </Badge>
                            <Badge className={leadColor[selected.leadStatus] || 'bg-gray-100 text-gray-600'}>
                              {leadLabel[selected.leadStatus] || selected.leadStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selected.phone && (
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                            <p className="text-gray-800">{selected.phone}</p>
                          </div>
                        )}
                        {selected.whatsappNumber && (
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">WhatsApp</p>
                            <p className="text-gray-800">{selected.whatsappNumber}</p>
                          </div>
                        )}
                        {selected.email && (
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Email</p>
                            <p className="text-gray-800">{selected.email}</p>
                          </div>
                        )}
                        {selected.budgetAed && (
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                            <p className="text-gray-800">AED {selected.budgetAed.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      {selected.propertyInterest && (
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Property Interest</p>
                          <p className="text-sm text-gray-800">{selected.propertyInterest}</p>
                        </div>
                      )}
                      {selected.notes && (
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Update lead status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Update Lead Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        {Object.entries(leadLabel).map(([status, label]) => (
                          <button
                            key={status}
                            onClick={() => updateLeadStatus(selected.id, status)}
                            disabled={updating || selected.leadStatus === status}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                              selected.leadStatus === status
                                ? (leadColor[status] || 'bg-gray-100 text-gray-600') + ' ring-2 ring-offset-1 ring-blue-400'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Contact Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Contact">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Type</label>
              <select
                value={form.contactType}
                onChange={e => setForm(f => ({ ...f, contactType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(typeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lead Status</label>
              <select
                value={form.leadStatus}
                onChange={e => setForm(f => ({ ...f, leadStatus: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(leadLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+971 50 xxx xxxx"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                placeholder="+971 50 xxx xxxx"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Property Interest</label>
            <input
              type="text"
              value={form.propertyInterest}
              onChange={e => setForm(f => ({ ...f, propertyInterest: e.target.value }))}
              placeholder="e.g. 2BR Dubai Marina, AED 100K/yr"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Budget (AED)</label>
            <input
              type="number"
              value={form.budgetAed}
              onChange={e => setForm(f => ({ ...f, budgetAed: e.target.value }))}
              placeholder="e.g. 1500000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createContact} loading={saving} disabled={!form.firstName || !form.lastName}>
              Create Contact
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
