'use client'

export interface ApprovalRequestCardProps {
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6
  levelLabel: string
  action: string
  recipient: string
  dataShared: string[]
  estimatedCost: string
  consequence: string
  humanReview: boolean
  onApprove: () => void
  onReject?: () => void
  approveLabel?: string
  rejectLabel?: string
}

const LEVEL_META: Record<number, { color: string; bg: string; border: string; badge: string }> = {
  0: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
  1: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
  2: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  3: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  4: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  5: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  6: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
}

export function ApprovalRequestCard({
  level,
  levelLabel,
  action,
  recipient,
  dataShared,
  estimatedCost,
  consequence,
  humanReview,
  onApprove,
  onReject,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
}: ApprovalRequestCardProps) {
  const meta = LEVEL_META[level]

  return (
    <div className={`rounded-xl border-2 ${meta.border} ${meta.bg} overflow-hidden my-2`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${meta.border} flex items-center gap-2`}>
        <span className="text-base">🔐</span>
        <span className={`font-semibold text-sm ${meta.color}`}>Permission Request</span>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${meta.badge}`}>
          Level {level} · {levelLabel}
        </span>
      </div>

      {/* Fields */}
      <div className="px-4 py-3 space-y-2 text-sm">
        <Row label="Action" value={action} />
        <Row label="Recipient" value={recipient} />
        <Row label="Data Shared" value={
          <div className="flex flex-wrap gap-1">
            {dataShared.map((d, i) => (
              <span key={i} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                {d}
              </span>
            ))}
          </div>
        } />
        <Row label="Est. Cost" value={estimatedCost} />
        <Row label="Outcome" value={consequence} />
        <Row label="Human Review" value={
          <span className={humanReview ? 'text-orange-600 font-medium' : 'text-gray-500'}>
            {humanReview ? '⚠ Required' : 'Not required'}
          </span>
        } />
      </div>

      {/* Actions */}
      <div className={`px-4 py-3 border-t ${meta.border} flex gap-2`}>
        <button
          onClick={onApprove}
          className={`flex-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90
            ${level >= 5 ? 'bg-red-600' : level >= 4 ? 'bg-orange-500' : 'bg-blue-600'}`}
        >
          ✓ {approveLabel}
        </button>
        {onReject && (
          <button
            onClick={onReject}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ✗ {rejectLabel}
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-800 flex-1">{value}</span>
    </div>
  )
}
