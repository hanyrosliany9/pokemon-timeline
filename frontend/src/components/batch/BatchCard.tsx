import { RenderingBatch, BatchStatus, BATCH_STATUS_LABELS, BATCH_STATUS_COLORS } from '@pokemon-timeline/shared'
import { formatIDR } from '@/services/batchCalculator'
import { Calendar, Hash, Cloud, CheckCircle2, Clock, XCircle } from 'lucide-react'

interface BatchCardProps {
  batch: RenderingBatch
  actualCostIDR?: number
  onClick?: () => void
}

/**
 * BatchCard Component
 * Compact batch summary showing projected vs actual costs
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │ #1 │ 2,300 cards │ Jan 4 │ ✓ Completed                 │
 * │    │ Projected: Rp 600k │ Actual: Rp 574k │ Saved: 26k │
 * └─────────────────────────────────────────────────────────┘
 */
export default function BatchCard({ batch, actualCostIDR = 0, onClick }: BatchCardProps) {
  const projectedCost = parseFloat(batch.projectedTotalCostIDR || '0')
  const variance = projectedCost - actualCostIDR
  const variancePercent = projectedCost > 0 ? (variance / projectedCost) * 100 : 0

  const deadlineDate = new Date(batch.deadlineAt)
  const isOverdue = batch.status !== BatchStatus.COMPLETED &&
    batch.status !== BatchStatus.CANCELLED &&
    deadlineDate < new Date()

  const StatusIcon = {
    [BatchStatus.PENDING]: Clock,
    [BatchStatus.IN_PROGRESS]: Clock,
    [BatchStatus.COMPLETED]: CheckCircle2,
    [BatchStatus.CANCELLED]: XCircle,
  }[batch.status]

  return (
    <div
      onClick={onClick}
      className={`
        p-4 bg-bg-secondary rounded-lg border border-border
        hover:border-interactive/50 transition-colors cursor-pointer
        ${isOverdue ? 'border-red-500/50' : ''}
      `}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Batch Number */}
          <div className="flex items-center gap-1 text-text-secondary">
            <Hash className="h-4 w-4" />
            <span className="font-medium">{batch.batchNumber}</span>
          </div>

          {/* Cards Count */}
          <span className="text-sm font-medium">
            {batch.cardsCount.toLocaleString()} cards
          </span>

          {/* Deadline */}
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-text-secondary'}`}>
            <Calendar className="h-3 w-3" />
            {deadlineDate.toLocaleDateString('id-ID', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${BATCH_STATUS_COLORS[batch.status]}`}>
          <StatusIcon className="h-3 w-3" />
          {BATCH_STATUS_LABELS[batch.status]}
        </div>
      </div>

      {/* GPU Info */}
      {batch.cloudGpusPlanned > 0 && (
        <div className="flex items-center gap-1 text-xs text-text-secondary mb-2">
          <Cloud className="h-3 w-3" />
          <span>{batch.cloudGpusPlanned} cloud GPU{batch.cloudGpusPlanned > 1 ? 's' : ''}</span>
          {batch.useLocalGpu && <span>+ local</span>}
        </div>
      )}

      {/* Cost Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="space-y-1">
          <div className="text-text-secondary text-xs">Projected</div>
          <div className="font-medium">{formatIDR(projectedCost)}</div>
        </div>

        {actualCostIDR > 0 && (
          <>
            <div className="space-y-1">
              <div className="text-text-secondary text-xs">Actual</div>
              <div className="font-medium">{formatIDR(actualCostIDR)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-text-secondary text-xs">
                {variance >= 0 ? 'Saved' : 'Over'}
              </div>
              <div className={`font-medium ${variance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatIDR(Math.abs(variance))}
                <span className="text-xs ml-1">
                  ({variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </>
        )}

        {actualCostIDR === 0 && batch.status !== BatchStatus.PENDING && (
          <div className="text-xs text-text-secondary italic">
            No expenses linked
          </div>
        )}
      </div>

      {/* Profit Preview */}
      <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
        <span className="text-text-secondary">Projected profit</span>
        <span className={`font-medium ${parseFloat(batch.projectedProfitIDR || '0') >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatIDR(parseFloat(batch.projectedProfitIDR || '0'))}
          <span className="ml-1 text-text-secondary">
            ({parseFloat(batch.projectedMarginPercent || '0').toFixed(1)}%)
          </span>
        </span>
      </div>
    </div>
  )
}
