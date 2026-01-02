import { useState, useMemo } from 'react'
import { useStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'
import { calculateBatchEstimate, formatIDR, formatPercent } from '@/services/batchCalculator'
import { batchService } from '@/services/batch.service'
import { CardProject } from '@pokemon-timeline/shared'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Cpu,
  Cloud,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Hash,
} from 'lucide-react'

interface NewBatchModalProps {
  isOpen: boolean
  onClose: () => void
  project: CardProject
}

/**
 * New Batch Modal - The Critical Batch Estimator
 *
 * This is the core feature that solves the batch decision-making problem:
 * "2,300 cards, 2-day deadline → How many GPUs? What cost? Is it profitable?"
 *
 * Real-time calculation updates as user inputs change.
 */
export default function NewBatchModal({ isOpen, onClose, project }: NewBatchModalProps) {
  const { toast } = useToast()
  const { gpuConfig, exchangeRate, addBatch } = useStore()

  // Form state
  const [cardsCount, setCardsCount] = useState('')
  const [deadlineDays, setDeadlineDays] = useState('')
  const [useLocalGpu, setUseLocalGpu] = useState(gpuConfig.local.enabled)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Get price per card from project
  const pricePerCardUSDT = project.pricePerCardUSDT
    ? parseFloat(String(project.pricePerCardUSDT))
    : 0

  // Calculate exchange rate
  const currentRate = parseFloat(exchangeRate || '16691')

  // Calculate estimate on input change
  const estimate = useMemo(() => {
    const cards = parseInt(cardsCount)
    const days = parseInt(deadlineDays)

    if (!cards || cards <= 0 || !days || days <= 0 || pricePerCardUSDT <= 0) {
      return null
    }

    return calculateBatchEstimate({
      cardsCount: cards,
      deadlineDays: days,
      pricePerCardUSDT,
      useLocalGpu,
      gpuConfig,
      exchangeRateUSDTtoIDR: currentRate,
    })
  }, [cardsCount, deadlineDays, useLocalGpu, gpuConfig, currentRate, pricePerCardUSDT])

  // Calculate deadline date
  const deadlineDate = useMemo(() => {
    const days = parseInt(deadlineDays)
    if (!days || days <= 0) return null
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
  }, [deadlineDays])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!estimate) {
      toast({
        title: 'Please fill in all fields',
        description: 'Enter cards count and deadline days',
        variant: 'destructive',
      })
      return
    }

    if (pricePerCardUSDT <= 0) {
      toast({
        title: 'No price set',
        description: 'Please set a price per card in the project settings first',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      const batch = await batchService.create({
        projectId: project.id,
        cardsCount: parseInt(cardsCount),
        deadlineAt: deadlineDate!.toISOString(),
        useLocalGpu,
        cloudGpusPlanned: estimate.cloudGpusRequired,
        cloudHoursPlanned: estimate.totalCloudHours,
        exchangeRateUsed: currentRate,
        projectedCloudCostIDR: estimate.cloudCostIDR,
        projectedElectricityCostIDR: estimate.electricityCostIDR,
        projectedTotalCostIDR: estimate.totalCostIDR,
        projectedRevenueIDR: estimate.revenueIDR,
        projectedProfitIDR: estimate.profitIDR,
        projectedMarginPercent: estimate.marginPercent,
        projectedCostPerCardIDR: estimate.costPerCardIDR,
        projectedProfitPerCardIDR: estimate.profitPerCardIDR,
        notes: notes || undefined,
      })

      addBatch(batch)

      toast({
        title: 'Batch Created!',
        description: `Batch #${batch.batchNumber} for ${cardsCount} cards created`,
      })

      // Reset form
      setCardsCount('')
      setDeadlineDays('')
      setNotes('')
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create batch',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            New Batch Estimation
          </DialogTitle>
          <DialogDescription>
            Estimate GPU requirements, costs, and profitability for a new batch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-bg-secondary rounded-lg border border-border">
            <div className="space-y-2">
              <Label htmlFor="cards" className="text-xs font-medium">
                Cards Count *
              </Label>
              <Input
                id="cards"
                type="number"
                value={cardsCount}
                onChange={(e) => setCardsCount(e.target.value)}
                placeholder="2300"
                min="1"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-xs font-medium">
                Deadline (days) *
              </Label>
              <Input
                id="deadline"
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                placeholder="2"
                min="1"
              />
              {deadlineDate && (
                <p className="text-xs text-text-secondary flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {deadlineDate.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Use Local GPU</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={useLocalGpu}
                  onCheckedChange={setUseLocalGpu}
                  disabled={!gpuConfig.local.enabled}
                />
                <span className="text-sm text-text-secondary">
                  {gpuConfig.local.name}
                </span>
              </div>
            </div>
          </div>

          {/* No Price Warning */}
          {pricePerCardUSDT <= 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">No price set for this project</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Edit the project to set a price per card (USDT) for profit calculations.
              </p>
            </div>
          )}

          {/* Estimation Results */}
          {estimate && (
            <div className="space-y-4">
              {/* Feasibility Badge */}
              <div
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  estimate.isFeasible
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {estimate.isFeasible ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span className="font-medium">{estimate.feasibilityNote}</span>
              </div>

              {/* GPU Planning */}
              <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  GPU Planning
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Required throughput</p>
                    <p className="font-medium">{estimate.cardsPerDayRequired.toLocaleString()} cards/day</p>
                  </div>
                  {useLocalGpu && gpuConfig.local.enabled && (
                    <div>
                      <p className="text-text-secondary">Local capacity</p>
                      <p className="font-medium">{estimate.localGpuCardsPerDay.toLocaleString()} cards/day</p>
                    </div>
                  )}
                  <div>
                    <p className="text-text-secondary flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      Cloud GPUs needed
                    </p>
                    <p className="font-medium text-lg">
                      {estimate.cloudGpusRequired}x {gpuConfig.cloud.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Total cloud hours</p>
                    <p className="font-medium">{estimate.totalCloudHours} hours</p>
                  </div>
                </div>
              </div>

              {/* Costs */}
              <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                <h4 className="font-medium mb-3">Projected Costs (IDR)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Cloud GPU</span>
                    <span>{formatIDR(estimate.cloudCostIDR)}</span>
                  </div>
                  {useLocalGpu && estimate.electricityCostIDR > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Electricity</span>
                      <span>{formatIDR(estimate.electricityCostIDR)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t border-border">
                    <span>Total Cost</span>
                    <span>{formatIDR(estimate.totalCostIDR)}</span>
                  </div>
                </div>
              </div>

              {/* Profitability */}
              <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Profitability
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-text-secondary text-xs">Revenue</p>
                    <p className="font-medium text-income">{formatIDR(estimate.revenueIDR)}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs">Profit</p>
                    <p
                      className={`font-medium text-lg ${
                        estimate.profitIDR >= 0 ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {formatIDR(estimate.profitIDR)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs">Margin</p>
                    <p
                      className={`font-bold text-xl ${
                        estimate.marginPercent >= 50
                          ? 'text-green-600 dark:text-green-400'
                          : estimate.marginPercent >= 20
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatPercent(estimate.marginPercent)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-text-secondary">Per card revenue</p>
                    <p>{formatIDR(estimate.revenuePerCardIDR)}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Per card cost</p>
                    <p>{formatIDR(estimate.costPerCardIDR)}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Per card profit</p>
                    <p className={estimate.profitPerCardIDR >= 0 ? 'text-income' : 'text-expense'}>
                      {formatIDR(estimate.profitPerCardIDR)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this batch..."
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !estimate || pricePerCardUSDT <= 0}
            >
              {loading ? 'Creating...' : 'Create Batch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
