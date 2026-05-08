'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { urgencyColor, formatDate, cn } from '@/lib/utils'

interface Communication {
  id: string
  channel: string
  direction: string
  status: string
  fromNumber: string | null
  fromName: string | null
  body: string
  aiCategory: string | null
  aiUrgency: string | null
  aiSummary: string | null
  aiDraftReply: string | null
  threadId: string | null
  createdAt: string
  relatedTenant: { id: string; firstName: string; lastName: string } | null
  relatedContact: { id: string; firstName: string; lastName: string; contactType: string } | null
  relatedTicket: { id: string; title: string; status: string } | null
}

const channelIcon: Record<string, string> = {
  whatsapp: '📱',
  voice_call: '📞',
  web: '🌐',
  manual: '✏️',
}

const channelLabel: Record<string, string> = {
  whatsapp: 'WhatsApp',
  voice_call: 'Phone',
  web: 'Web',
  manual: 'Manual',
}

const channelColor: Record<string, string> = {
  whatsapp: 'bg-green-100 text-green-700',
  voice_call: 'bg-blue-100 text-blue-700',
  web: 'bg-purple-100 text-purple-700',
  manual: 'bg-gray-100 text-gray-600',
}

export default function InboxPage() {
  const [comms, setComms] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'whatsapp' | 'voice_call'>('all')
  const [selected, setSelected] = useState<Communication | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [replying, setReplying] = useState(false)
  const [replySuccess, setReplySuccess] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === 'new') params.set('status', 'new')
      else if (filter === 'whatsapp') params.set('channel', 'whatsapp')
      else if (filter === 'voice_call') params.set('channel', 'voice_call')
      const res = await fetch(`/api/communications?${params}`)
      if (res.ok) setComms(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  async function markRead(id: string) {
    await fetch(`/api/communications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' }),
    })
    setComms(prev => prev.map(c => c.id === id ? { ...c, status: 'read' } : c))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'read' } : null)
  }

  async function sendReply() {
    if (!selected || !replyBody.trim()) return
    setReplying(true)
    setReplySuccess(false)
    try {
      const res = await fetch(`/api/communications/${selected.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyBody: replyBody.trim() }),
      })
      if (res.ok) {
        setReplySuccess(true)
        setReplyBody('')
        load()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setReplying(false)
    }
  }

  function openMessage(comm: Communication) {
    setSelected(comm)
    setReplyBody(comm.aiDraftReply || '')
    setReplySuccess(false)
    if (comm.status === 'new') markRead(comm.id)
  }

  const newCount = comms.filter(c => c.status === 'new' && c.direction === 'inbound').length

  return (
    <div>
      <TopBar
        title="Inbox"
        subtitle="All incoming WhatsApp messages and communications"
        actions={
          <div className="flex items-center gap-3">
            {newCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {newCount} new
              </span>
            )}
            <Button size="sm" variant="secondary" onClick={load}>Refresh</Button>
          </div>
        }
      />

      <div className="p-8">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'new', 'whatsapp', 'voice_call'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {f === 'all' ? 'All' : f === 'new' ? 'Unread' : channelLabel[f]}
              {f === 'whatsapp' && ' 📱'}
              {f === 'voice_call' && ' 📞'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading messages...</div>
        ) : comms.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No messages</p>
            <p className="text-gray-400 text-sm">
              {filter === 'new' ? 'No unread messages.' : 'Connect WhatsApp or Twilio to start receiving messages.'}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Message list */}
            <div className="lg:col-span-2 space-y-2">
              {comms.map(comm => (
                <div
                  key={comm.id}
                  onClick={() => openMessage(comm)}
                  className={cn(
                    'bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm',
                    selected?.id === comm.id ? 'border-blue-500 shadow-sm' : 'border-gray-200',
                    comm.status === 'new' && comm.direction === 'inbound' ? 'border-l-4 border-l-blue-500' : ''
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{channelIcon[comm.channel] || '💬'}</span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {comm.relatedTenant
                          ? `${comm.relatedTenant.firstName} ${comm.relatedTenant.lastName}`
                          : comm.relatedContact
                          ? `${comm.relatedContact.firstName} ${comm.relatedContact.lastName}`
                          : comm.fromName || comm.fromNumber || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', channelColor[comm.channel] || 'bg-gray-100 text-gray-600')}>
                        {channelLabel[comm.channel] || comm.channel}
                      </span>
                      {comm.direction === 'outbound' && (
                        <span className="text-xs text-gray-400 italic">Sent</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{comm.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">{formatDate(comm.createdAt)}</p>
                    <div className="flex items-center gap-1.5">
                      {comm.aiUrgency && (
                        <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', urgencyColor(comm.aiUrgency))}>
                          {comm.aiUrgency}
                        </span>
                      )}
                      {comm.aiCategory && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{comm.aiCategory}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message detail */}
            <div className="lg:col-span-3">
              {!selected ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center h-64 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Select a message to view and reply</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>
                            {selected.relatedTenant
                              ? `${selected.relatedTenant.firstName} ${selected.relatedTenant.lastName}`
                              : selected.relatedContact
                              ? `${selected.relatedContact.firstName} ${selected.relatedContact.lastName}`
                              : selected.fromName || selected.fromNumber || 'Unknown Sender'}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {channelIcon[selected.channel]} {channelLabel[selected.channel]}
                            {selected.fromNumber && ` · ${selected.fromNumber}`}
                            {' · '}{formatDate(selected.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selected.relatedTenant && (
                            <Link href={`/dashboard/tenants/${selected.relatedTenant.id}`}>
                              <Button size="sm" variant="secondary">View Tenant</Button>
                            </Link>
                          )}
                          {selected.relatedTicket && (
                            <Link href={`/dashboard/tickets/${selected.relatedTicket.id}`}>
                              <Button size="sm" variant="secondary">View Ticket</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selected.body}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Analysis */}
                  {(selected.aiSummary || selected.aiCategory || selected.aiUrgency) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          <span className="flex items-center gap-2 text-sm">
                            <span className="text-purple-500">✦</span> AI Analysis
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {selected.aiCategory && (
                            <Badge className="bg-blue-100 text-blue-700">{selected.aiCategory}</Badge>
                          )}
                          {selected.aiUrgency && (
                            <Badge className={urgencyColor(selected.aiUrgency)}>{selected.aiUrgency} Priority</Badge>
                          )}
                        </div>
                        {selected.aiSummary && (
                          <p className="text-sm text-gray-700">{selected.aiSummary}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Reply */}
                  {selected.direction === 'inbound' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Reply via {channelLabel[selected.channel]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selected.aiDraftReply && replyBody === selected.aiDraftReply && (
                          <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-2">
                            <span>✦</span>
                            <span>AI-drafted reply loaded. Review before sending.</span>
                          </div>
                        )}
                        <textarea
                          value={replyBody}
                          onChange={e => setReplyBody(e.target.value)}
                          rows={4}
                          placeholder="Type your reply..."
                          className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-amber-600">
                            Human approval required — review before sending
                          </p>
                          <div className="flex items-center gap-2">
                            {replySuccess && (
                              <span className="text-xs text-green-600">Reply sent!</span>
                            )}
                            <Button
                              size="sm"
                              onClick={sendReply}
                              loading={replying}
                              disabled={!replyBody.trim()}
                            >
                              Send Reply
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
