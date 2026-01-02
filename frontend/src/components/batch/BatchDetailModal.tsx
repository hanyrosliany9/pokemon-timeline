import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'
import { batchService } from '@/services/batch.service'
import entryService from '@/services/entry.service'
import { formatIDR } from '@/services/batchCalculator'
import {
  RenderingBatch,
  BatchStatus,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_COLORS,
  CardEntry,
} from '@pokemon-timeline/shared'
import { Decimal } from 'decimal.js'
import LogCardsModal from './LogCardsModal'

// Safe number parsing helper - returns 0 for null/undefined/NaN
function safeParseFloat(value: string | number | null | undefined): number {
  if (value == null) return 0
  const parsed = typeof value === 'number' ? value : parseFloat(String(value))
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Hash,
  Calendar,
  Cloud,
  Cpu,
  TrendingUp,
  Clock,
  Trash2,
  Loader2,
  Plus,
  BarChart3,
} from 'lucide-react'

interface BatchDetailModalProps {
  isOpen: boolean
  onClose: () => void
  batch: RenderingBatch | null
}

/**
 * BatchDetailModal Component
 * Full batch details with expense list and variance tracking
 */
export default function BatchDetailModal({ isOpen, onClose, batch }: BatchDetailModalProps) {
  const { toast } = useToast()
  const { expenses, updateBatch, deleteBatch, projects, getBatchPL, exchangeRate } = useStore()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [status, setStatus] = useState<BatchStatus | null>(null)
  const [notes, setNotes] = useState('')
  const [showLogCards, setShowLogCards] = useState(false)
  const [entries, setEntries] = useState<CardEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)

  // Initialize form when batch changes
  useEffect(() => {
    if (batch) {
      setStatus(batch.status)
      setNotes(batch.notes || '')
    }
  }, [batch])

  // Fetch entries for this batch
  useEffect(() => {
    if (batch && isOpen) {
      setLoadingEntries(true)
      entryService.getByBatch(batch.id)
        .then(setEntries)
        .catch(console.error)
        .finally(() => setLoadingEntries(false))
    }
  }, [batch, isOpen])

  // Refresh entries after logging
  const handleLogSuccess = () => {
    if (batch) {
      entryService.getByBatch(batch.id)
        .then(setEntries)
        .catch(console.error)
    }
  }

  if (!batch) return null

  // Get project for price per card
  const project = projects.find((p) => p.id === batch.projectId)

  // Calculate price per card in IDR
  const pricePerCardIDR = useMemo(() => {
    if (!project?.pricePerCardUSDT) return 0
    const priceUSDT = typeof project.pricePerCardUSDT === 'object'
      ? new Decimal(0).plus(project.pricePerCardUSDT as any).toNumber()
      : parseFloat(String(project.pricePerCardUSDT))
    if (isNaN(priceUSDT) || priceUSDT <= 0) return 0
    const rate = parseFloat(exchangeRate) || 16000
    return priceUSDT * rate
  }, [project?.pricePerCardUSDT, exchangeRate])

  // Calculate batch progress from entries
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const latestEntry = sortedEntries[0]
  const cardsRendered = latestEntry?.cumulativeTotal || 0
  const progressPercent = Math.round((cardsRendered / batch.cardsCount) * 100)

  // Calculate actual costs from linked expenses
  const linkedExpenses = expenses.filter((e) => e.batchId === batch.id)
  const actualCostIDR = linkedExpenses.reduce(
    (sum, e) => sum + parseFloat(String(e.amountIDR || '0')),
    0
  )

  const projectedCost = safeParseFloat(batch.projectedTotalCostIDR)
  const variance = projectedCost - actualCostIDR
  const variancePercent = projectedCost > 0 ? (variance / projectedCost) * 100 : 0

  // Compute actual P&L using the store method
  const batchPL = useMemo(() => {
    return getBatchPL(batch.id, expenses, cardsRendered, pricePerCardIDR)
  }, [batch.id, expenses, cardsRendered, pricePerCardIDR, getBatchPL])

  const handleUpdateStatus = async () => {
    if (!status || status === batch.status) return

    try {
      setLoading(true)
      const updatedBatch = await batchService.update(batch.id, {
        status,
        startedAt: status === BatchStatus.IN_PROGRESS ? new Date().toISOString() : undefined,
        completedAt: status === BatchStatus.COMPLETED ? new Date().toISOString() : undefined,
        notes: notes !== batch.notes ? notes : undefined,
      })
      updateBatch(updatedBatch)
      toast({ title: 'Batch updated!' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update batch',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await batchService.delete(batch.id)
      deleteBatch(batch.id, batch.projectId)
      toast({ title: 'Batch deleted' })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete batch',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const deadlineDate = new Date(batch.deadlineAt)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Batch #{batch.batchNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-bg-secondary rounded-lg border border-border">
            <div>
              <p className="text-xs text-text-secondary">Cards</p>
              <p className="font-medium text-lg">{batch.cardsCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Deadline
              </p>
              <p className="font-medium">
                {deadlineDate.toLocaleDateString('id-ID', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Status</p>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${BATCH_STATUS_COLORS[batch.status]}`}>
                {BATCH_STATUS_LABELS[batch.status]}
              </div>
            </div>
          </div>

          {/* Batch Progress - THE KEY FEATURE */}
          <div className="p-4 bg-bg-secondary rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Rendering Progress
              </h4>
              <Button size="sm" onClick={() => setShowLogCards(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Log Cards
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Cards Rendered</span>
                <span className="font-medium">
                  {cardsRendered.toLocaleString()} / {batch.cardsCount.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-bg-primary rounded-full h-3">
                <div
                  className={`rounded-full h-3 transition-all duration-500 ${
                    progressPercent >= 100 ? 'bg-green-500' : 'bg-interactive'
                  }`}
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className={`font-bold ${progressPercent >= 100 ? 'text-green-500' : 'text-text-primary'}`}>
                  {progressPercent}%
                </span>
                <span className="text-text-secondary">
                  {batch.cardsCount - cardsRendered > 0
                    ? `${(batch.cardsCount - cardsRendered).toLocaleString()} remaining`
                    : 'Complete!'
                  }
                </span>
              </div>
              {loadingEntries && (
                <div className="text-xs text-text-secondary flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading entries...
                </div>
              )}
              {entries.length > 0 && (
                <div className="text-xs text-text-secondary">
                  {entries.length} log{entries.length !== 1 ? 's' : ''} •
                  Last: {new Date(sortedEntries[0].date).toLocaleDateString('id-ID')}
                </div>
              )}
            </div>
          </div>

          {/* GPU Planning */}
          <div className="p-4 bg-bg-secondary rounded-lg border border-border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              GPU Configuration
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-secondary">Cloud GPUs</p>
                <p className="font-medium flex items-center gap-1">
                  <Cloud className="h-4 w-4 text-purple-500" />
                  {batch.cloudGpusPlanned}x
                </p>
              </div>
              <div>
                <p className="text-text-secondary">Local GPU</p>
                <p className="font-medium">{batch.useLocalGpu ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-text-secondary">Cloud Hours</p>
                <p className="font-medium">{safeParseFloat(batch.cloudHoursPlanned)} hrs</p>
              </div>
              <div>
                <p className="text-text-secondary">Exchange Rate</p>
                <p className="font-medium text-xs">
                  Rp {safeParseFloat(batch.exchangeRateUsed).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Comparison */}
          <div className="p-4 bg-bg-secondary rounded-lg border border-border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cost Analysis
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-text-secondary">Projected</p>
                <p className="font-medium">{formatIDR(projectedCost)}</p>
                <p className="text-xs text-text-secondary mt-1">
                  Cloud: {formatIDR(safeParseFloat(batch.projectedCloudCostIDR))}
                </p>
                <p className="text-xs text-text-secondary">
                  Electricity: {formatIDR(safeParseFloat(batch.projectedElectricityCostIDR))}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Actual</p>
                <p className="font-medium">
                  {actualCostIDR > 0 ? formatIDR(actualCostIDR) : '-'}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {linkedExpenses.length} expense{linkedExpenses.length !== 1 ? 's' : ''} linked
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Variance</p>
                {actualCostIDR > 0 ? (
                  <>
                    <p className={`font-medium ${variance >= 0 ? 'text-income' : 'text-expense'}`}>
                      {variance >= 0 ? '+' : ''}{formatIDR(variance)}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {variancePercent >= 0 ? 'Under' : 'Over'} by {Math.abs(variancePercent).toFixed(1)}%
                    </p>
                  </>
                ) : (
                  <p className="text-text-secondary">-</p>
                )}
              </div>
            </div>
          </div>

          {/* Profitability - Projected vs Actual */}
          <div className="p-4 bg-bg-secondary rounded-lg border border-border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Profitability
            </h4>

            {/* Header row */}
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-text-secondary">
              <div></div>
              <div className="text-center">Revenue</div>
              <div className="text-center">Profit</div>
              <div className="text-center">Margin</div>
            </div>

            {/* Projected row */}
            <div className="grid grid-cols-4 gap-2 items-center py-2 border-b border-border">
              <div className="text-xs font-medium text-text-secondary">Projected</div>
              <div className="text-center font-medium text-income">
                {formatIDR(safeParseFloat(batch.projectedRevenueIDR))}
              </div>
              <div className={`text-center font-medium ${safeParseFloat(batch.projectedProfitIDR) >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatIDR(safeParseFloat(batch.projectedProfitIDR))}
              </div>
              <div className="text-center font-bold">
                {safeParseFloat(batch.projectedMarginPercent).toFixed(1)}%
              </div>
            </div>

            {/* Actual row */}
            <div className="grid grid-cols-4 gap-2 items-center py-2 border-b border-border">
              <div className="text-xs font-medium text-text-secondary">Actual</div>
              <div className="text-center font-medium">
                {batchPL && batchPL.actualRevenueIDR > 0
                  ? <span className="text-income">{formatIDR(batchPL.actualRevenueIDR)}</span>
                  : <span className="text-text-tertiary">-</span>
                }
              </div>
              <div className="text-center font-medium">
                {batchPL && (batchPL.actualCostIDR > 0 || batchPL.actualRevenueIDR > 0)
                  ? <span className={batchPL.actualProfitIDR >= 0 ? 'text-income' : 'text-expense'}>
                      {formatIDR(batchPL.actualProfitIDR)}
                    </span>
                  : <span className="text-text-tertiary">-</span>
                }
              </div>
              <div className="text-center font-bold">
                {batchPL && batchPL.actualRevenueIDR > 0
                  ? `${batchPL.actualMarginPercent.toFixed(1)}%`
                  : '-'
                }
              </div>
            </div>

            {/* Variance row */}
            {batchPL && (batchPL.actualCostIDR > 0 || batchPL.actualRevenueIDR > 0) && (
              <div className="grid grid-cols-4 gap-2 items-center py-2">
                <div className="text-xs font-medium text-text-secondary">Variance</div>
                <div className="text-center text-xs text-text-secondary">
                  {cardsRendered} / {batch.cardsCount} cards
                </div>
                <div className={`text-center font-medium ${batchPL.profitVarianceIDR >= 0 ? 'text-income' : 'text-expense'}`}>
                  {batchPL.profitVarianceIDR >= 0 ? '+' : ''}{formatIDR(batchPL.profitVarianceIDR)}
                </div>
                <div className={`text-center text-sm ${batchPL.profitVariancePercent >= 0 ? 'text-income' : 'text-expense'}`}>
                  {batchPL.profitVariancePercent >= 0 ? '+' : ''}{batchPL.profitVariancePercent.toFixed(1)}%
                </div>
              </div>
            )}

            {/* Per-card metrics */}
            {batchPL && cardsRendered > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-text-secondary mb-2">Per Card Metrics</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Cost/Card: </span>
                    <span className="font-medium">
                      {formatIDR(batchPL.actualCostPerCard)}
                      <span className="text-xs text-text-tertiary ml-1">
                        (proj: {formatIDR(batchPL.projectedCostPerCard)})
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Profit/Card: </span>
                    <span className={`font-medium ${batchPL.actualProfitPerCard >= 0 ? 'text-income' : 'text-expense'}`}>
                      {formatIDR(batchPL.actualProfitPerCard)}
                      <span className="text-xs text-text-tertiary ml-1">
                        (proj: {formatIDR(batchPL.projectedProfitPerCard)})
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* No price warning */}
            {pricePerCardIDR === 0 && (
              <p className="text-xs text-amber-500 mt-2">
                ⚠️ Set price per card in project settings to see actual revenue
              </p>
            )}
          </div>

          {/* Status Update */}
          <div className="space-y-4 p-4 bg-bg-secondary rounded-lg border border-border">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Update Status
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status || batch.status}
                  onValueChange={(v) => setStatus(v as BatchStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BatchStatus).map((s) => (
                      <SelectItem key={s} value={s}>
                        {BATCH_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  rows={2}
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateStatus}
              disabled={loading || (status === batch.status && notes === (batch.notes || ''))}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Batch
            </Button>
          </div>

          {/* Linked Expenses */}
          {linkedExpenses.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Linked Expenses ({linkedExpenses.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {linkedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-2 bg-bg-secondary rounded border border-border text-sm"
                  >
                    <span>{expense.description}</span>
                    <span className="font-medium">{formatIDR(parseFloat(String(expense.amountIDR || '0')))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {showDeleteConfirm ? (
            <>
              <span className="text-sm text-text-secondary mr-auto">
                Delete this batch?
              </span>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="mr-auto text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Log Cards Modal */}
      <LogCardsModal
        isOpen={showLogCards}
        onClose={() => setShowLogCards(false)}
        batch={batch}
        entries={entries}
        onSuccess={handleLogSuccess}
      />
    </Dialog>
  )
}
