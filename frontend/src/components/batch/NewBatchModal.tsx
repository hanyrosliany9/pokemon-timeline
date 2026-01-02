import { useState, useMemo } from 'react'
import { useStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'
import { calculateBatchEstimate, formatIDR, formatPercent } from '@/services/batchCalculator'
import { batchService } from '@/services/batch.service'
import { CardProject, LocalGpuConfig, CloudGpuConfig } from '@pokemon-timeline/shared'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Cpu,
  Cloud,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Hash,
  Zap,
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
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Multi-GPU selection state
  // Default: all local GPUs selected, first cloud GPU selected (if any)
  const [selectedLocalGpuIds, setSelectedLocalGpuIds] = useState<Set<string>>(
    () => new Set(gpuConfig.localGpus.map((gpu) => gpu.id))
  )
  const [selectedCloudGpuId, setSelectedCloudGpuId] = useState<string | null>(
    () => gpuConfig.cloudGpus[0]?.id ?? null
  )

  // Get selected GPU objects for calculations
  const selectedLocalGpus: LocalGpuConfig[] = useMemo(
    () => gpuConfig.localGpus.filter((gpu) => selectedLocalGpuIds.has(gpu.id)),
    [gpuConfig.localGpus, selectedLocalGpuIds]
  )

  const selectedCloudGpu: CloudGpuConfig | null = useMemo(
    () => gpuConfig.cloudGpus.find((gpu) => gpu.id === selectedCloudGpuId) ?? null,
    [gpuConfig.cloudGpus, selectedCloudGpuId]
  )

  // Toggle local GPU selection
  const toggleLocalGpu = (gpuId: string) => {
    setSelectedLocalGpuIds((prev) => {
      const next = new Set(prev)
      if (next.has(gpuId)) {
        next.delete(gpuId)
      } else {
        next.add(gpuId)
      }
      return next
    })
  }

  // Get price per card from project (handle null/undefined/NaN)
  const pricePerCardUSDT = useMemo(() => {
    if (project.pricePerCardUSDT == null) return 0
    const parsed = parseFloat(String(project.pricePerCardUSDT))
    return isNaN(parsed) ? 0 : parsed
  }, [project.pricePerCardUSDT])

  // Calculate exchange rate (with fallback)
  const currentRate = useMemo(() => {
    const parsed = parseFloat(exchangeRate || '16691')
    return isNaN(parsed) ? 16691 : parsed
  }, [exchangeRate])

  // Calculate estimate on input change
  const estimate = useMemo(() => {
    const cards = parseInt(cardsCount)
    const days = parseInt(deadlineDays)

    // Validate inputs - isNaN check catches NaN values that slip through
    if (!cards || cards <= 0 || !days || days <= 0 || isNaN(pricePerCardUSDT) || pricePerCardUSDT <= 0) {
      return null
    }

    return calculateBatchEstimate({
      cardsCount: cards,
      deadlineDays: days,
      pricePerCardUSDT,
      selectedLocalGpus,
      selectedCloudGpu,
      electricityRateIDR: gpuConfig.electricityRateIDR,
      exchangeRateUSDTtoIDR: currentRate,
    })
  }, [cardsCount, deadlineDays, selectedLocalGpus, selectedCloudGpu, gpuConfig.electricityRateIDR, currentRate, pricePerCardUSDT])

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
        useLocalGpu: selectedLocalGpus.length > 0,
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
          {/* Batch Details Section */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-bg-secondary rounded-lg border border-border">
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
          </div>

          {/* GPU Selection Section */}
          <div className="space-y-4 p-4 bg-bg-secondary rounded-lg border border-border">
            <h4 className="font-medium text-sm">GPU Selection</h4>

            {/* Local GPUs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Cpu className="h-3 w-3 text-blue-500" />
                <span>Local GPUs ({selectedLocalGpus.length} selected)</span>
              </div>
              {gpuConfig.localGpus.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">
                  No local GPUs configured. Add them in Settings.
                </p>
              ) : (
                <div className="space-y-2">
                  {gpuConfig.localGpus.map((gpu) => (
                    <div
                      key={gpu.id}
                      className="flex items-center justify-between p-2 bg-bg-primary rounded border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={selectedLocalGpuIds.has(gpu.id)}
                          onCheckedChange={() => toggleLocalGpu(gpu.id)}
                        />
                        <span className="text-sm font-medium">{gpu.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-secondary">
                        <span>{gpu.renderTimeMinutes} min/card</span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          {gpu.powerDrawWatts}W
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cloud GPU */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Cloud className="h-3 w-3 text-purple-500" />
                <span>Cloud GPU (for overflow capacity)</span>
              </div>
              {gpuConfig.cloudGpus.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">
                  No cloud GPUs configured. Add them in Settings.
                </p>
              ) : (
                <Select
                  value={selectedCloudGpuId ?? 'none'}
                  onValueChange={(val) => setSelectedCloudGpuId(val === 'none' ? null : val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cloud GPU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No cloud GPU (local only)</SelectItem>
                    {gpuConfig.cloudGpus.map((gpu) => (
                      <SelectItem key={gpu.id} value={gpu.id}>
                        {gpu.name} • {gpu.renderTimeMinutes} min • ${gpu.costPerHourUSD}/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                  {selectedLocalGpus.length > 0 && (
                    <div>
                      <p className="text-text-secondary">Local capacity</p>
                      <p className="font-medium">
                        {estimate.localGpuCardsPerDay.toLocaleString()} cards/day
                        <span className="text-xs text-text-tertiary ml-1">
                          ({selectedLocalGpus.length} GPU{selectedLocalGpus.length > 1 ? 's' : ''})
                        </span>
                      </p>
                    </div>
                  )}
                  {selectedCloudGpu && (
                    <>
                      <div>
                        <p className="text-text-secondary flex items-center gap-1">
                          <Cloud className="h-3 w-3" />
                          Cloud GPUs needed
                        </p>
                        <p className="font-medium text-lg">
                          {estimate.cloudGpusRequired}x {selectedCloudGpu.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Total cloud hours</p>
                        <p className="font-medium">{estimate.totalCloudHours} hours</p>
                      </div>
                    </>
                  )}
                  {!selectedCloudGpu && estimate.cloudCardsPerDayNeeded > 0 && (
                    <div className="col-span-2">
                      <p className="text-yellow-600 dark:text-yellow-400 text-xs">
                        Need {estimate.cloudCardsPerDayNeeded} more cards/day capacity. Select a cloud GPU.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Costs */}
              <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                <h4 className="font-medium mb-3">Projected Costs (IDR)</h4>
                <div className="space-y-2 text-sm">
                  {selectedCloudGpu && estimate.cloudCostIDR > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Cloud GPU</span>
                      <span>{formatIDR(estimate.cloudCostIDR)}</span>
                    </div>
                  )}
                  {selectedLocalGpus.length > 0 && estimate.electricityCostIDR > 0 && (
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
