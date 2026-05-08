'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, cn } from '@/lib/utils'

interface CallLog {
  id: string
  status: string
  direction: string
  fromNumber: string
  toNumber: string
  callerName: string | null
  durationSeconds: number | null
  transcription: string | null
  aiSummary: string | null
  aiActionItems: string[] | null
  startedAt: string
  endedAt: string | null
  createdAt: string
  relatedTenant: { id: string; firstName: string; lastName: string } | null
  relatedContact: { id: string; firstName: string; lastName: string; contactType: string } | null
}

const statusColor: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  missed: 'bg-red-100 text-red-700',
  voicemail: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  ringing: 'bg-blue-100 text-blue-700',
  failed: 'bg-gray-100 text-gray-600',
}

function formatDuration(secs: number | null): string {
  if (!secs) return '—'
  if (secs < 60) return `${secs}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CallLog | null>(null)
  const [filter, setFilter] = useState<'all' | 'missed' | 'inbound' | 'outbound'>('all')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === 'missed') params.set('status', 'missed')
      else if (filter === 'inbound') params.set('direction', 'inbound')
      else if (filter === 'outbound') params.set('direction', 'outbound')
      const res = await fetch(`/api/calls?${params}`)
      if (res.ok) setCalls(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const missedCount = calls.filter(c => c.status === 'missed').length

  return (
    <div>
      <TopBar
        title="Call Log"
        subtitle="Inbound and outbound phone calls via Twilio"
        actions={
          <div className="flex items-center gap-3">
            {missedCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {missedCount} missed
              </span>
            )}
            <Button size="sm" variant="secondary" onClick={load}>Refresh</Button>
          </div>
        }
      />

      <div className="p-8">
        {/* Twilio setup notice if no calls */}
        {!loading && calls.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">📞</span>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Connect Twilio to receive phone calls</p>
                <p className="text-sm text-blue-700">
                  Set <code className="bg-blue-100 px-1 rounded text-xs">TWILIO_ACCOUNT_SID</code>, <code className="bg-blue-100 px-1 rounded text-xs">TWILIO_AUTH_TOKEN</code>,
                  and point your Twilio number&apos;s Voice webhook to <code className="bg-blue-100 px-1 rounded text-xs">/api/webhooks/voice</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'missed', 'inbound', 'outbound'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {f}
              {f === 'missed' && missedCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{missedCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading calls...</div>
        ) : calls.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No call records found.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Call list */}
            <div className="lg:col-span-2 space-y-2">
              {calls.map(call => (
                <div
                  key={call.id}
                  onClick={() => setSelected(call)}
                  className={cn(
                    'bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm',
                    selected?.id === call.id ? 'border-blue-500 shadow-sm' : 'border-gray-200',
                    call.status === 'missed' ? 'border-l-4 border-l-red-400' : ''
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{call.direction === 'inbound' ? '📲' : '📤'}</span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {call.relatedTenant
                          ? `${call.relatedTenant.firstName} ${call.relatedTenant.lastName}`
                          : call.relatedContact
                          ? `${call.relatedContact.firstName} ${call.relatedContact.lastName}`
                          : call.callerName || call.fromNumber}
                      </span>
                    </div>
                    <Badge className={statusColor[call.status] || 'bg-gray-100 text-gray-600'}>
                      {call.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {call.direction === 'inbound' ? '← ' : '→ '}{call.fromNumber}
                    {' · '}{formatDuration(call.durationSeconds)}
                  </p>
                  {call.aiSummary && (
                    <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{call.aiSummary}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">{formatDate(call.startedAt)}</p>
                </div>
              ))}
            </div>

            {/* Call detail */}
            <div className="lg:col-span-3">
              {!selected ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center h-64 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Select a call to view details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>
                            {selected.relatedTenant
                              ? `${selected.relatedTenant.firstName} ${selected.relatedTenant.lastName}`
                              : selected.relatedContact
                              ? `${selected.relatedContact.firstName} ${selected.relatedContact.lastName}`
                              : selected.callerName || selected.fromNumber}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {selected.direction === 'inbound' ? 'Inbound' : 'Outbound'} call
                            {' · '}{selected.fromNumber}
                            {' · '}{formatDuration(selected.durationSeconds)}
                            {' · '}{formatDate(selected.startedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColor[selected.status] || 'bg-gray-100 text-gray-600'}>
                            {selected.status.replace('_', ' ')}
                          </Badge>
                          {selected.relatedTenant && (
                            <Link href={`/dashboard/tenants/${selected.relatedTenant.id}`}>
                              <Button size="sm" variant="secondary">Tenant</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {selected.aiSummary && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="text-purple-500">✦</span> AI Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-700">{selected.aiSummary}</p>
                        {selected.aiActionItems && selected.aiActionItems.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Action Items</p>
                            <ul className="space-y-1.5">
                              {selected.aiActionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-blue-500 mt-0.5">→</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {selected.transcription && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Call Transcription</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                          {selected.transcription}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selected.status === 'missed' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-800">
                        <strong>Missed call</strong> from {selected.fromNumber}.
                        Consider calling back or following up via WhatsApp.
                      </p>
                    </div>
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
