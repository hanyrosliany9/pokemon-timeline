import { useState } from 'react'
import { useStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'
import { batchService } from '@/services/batch.service'
import { formatIDR } from '@/services/batchCalculator'
import {
  RenderingBatch,
  BatchStatus,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_COLORS,
} from '@pokemon-timeline/shared'
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
  const { expenses, updateBatch, deleteBatch } = useStore()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [status, setStatus] = useState<BatchStatus | null>(null)
  const [notes, setNotes] = useState('')

  // Initialize form when batch changes
  useState(() => {
    if (batch) {
      setStatus(batch.status)
      setNotes(batch.notes || '')
    }
  })

  if (!batch) return null

  // Calculate actual costs from linked expenses
  const linkedExpenses = expenses.filter((e) => e.batchId === batch.id)
  const actualCostIDR = linkedExpenses.reduce(
    (sum, e) => sum + parseFloat(String(e.amountIDR || '0')),
    0
  )

  const projectedCost = parseFloat(batch.projectedTotalCostIDR || '0')
  const variance = projectedCost - actualCostIDR
  const variancePercent = projectedCost > 0 ? (variance / projectedCost) * 100 : 0

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
                <p className="font-medium">{parseFloat(batch.cloudHoursPlanned || '0')} hrs</p>
              </div>
              <div>
                <p className="text-text-secondary">Exchange Rate</p>
                <p className="font-medium text-xs">
                  Rp {parseFloat(batch.exchangeRateUsed || '0').toLocaleString('id-ID')}
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
                  Cloud: {formatIDR(parseFloat(batch.projectedCloudCostIDR || '0'))}
                </p>
                <p className="text-xs text-text-secondary">
                  Electricity: {formatIDR(parseFloat(batch.projectedElectricityCostIDR || '0'))}
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

          {/* Profitability */}
          <div className="p-4 bg-bg-secondary rounded-lg border border-border">
            <h4 className="font-medium mb-3">Projected Profitability</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-text-secondary">Revenue</p>
                <p className="font-medium text-income">
                  {formatIDR(parseFloat(batch.projectedRevenueIDR || '0'))}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Profit</p>
                <p className={`font-medium ${parseFloat(batch.projectedProfitIDR || '0') >= 0 ? 'text-income' : 'text-expense'}`}>
                  {formatIDR(parseFloat(batch.projectedProfitIDR || '0'))}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Margin</p>
                <p className="font-bold text-lg">
                  {parseFloat(batch.projectedMarginPercent || '0').toFixed(1)}%
                </p>
              </div>
            </div>
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
    </Dialog>
  )
}
