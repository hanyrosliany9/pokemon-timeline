import Decimal from 'decimal.js'
import { BatchEstimate, BatchEstimateInput, LocalGpuConfig } from '@pokemon-timeline/shared'

/**
 * Batch Calculator Service
 *
 * Pure calculation engine for estimating GPU requirements, costs, and profitability
 * for rendering batches. Uses Decimal.js for financial precision.
 *
 * Supports multiple local GPUs and selectable cloud GPU per batch.
 *
 * Key formulas:
 * - cards_per_day = (24 * 60) / render_time_minutes
 * - local_capacity = SUM(cards_per_day for each selected local GPU)
 * - cloud_needed = ceil((required_per_day - local_capacity) / cloud_capacity_per_gpu)
 * - cloud_cost = cloud_gpus × deadline_days × 24 × cost_per_hour_usd × exchange_rate
 * - electricity = SUM(deadline_days × 24 × (watts / 1000) for each local GPU) × rate_per_kwh
 * - profit = revenue - total_cost
 */

const MINUTES_PER_DAY = 24 * 60
const HOURS_PER_DAY = 24

/**
 * Calculate cards per day capacity for a single GPU
 */
function gpuCardsPerDay(renderTimeMinutes: number): number {
  return Math.floor(MINUTES_PER_DAY / renderTimeMinutes)
}

/**
 * Calculate total local GPU capacity (cards per day) from selected GPUs
 */
function calculateLocalCapacity(localGpus: LocalGpuConfig[]): number {
  return localGpus.reduce((total, gpu) => total + gpuCardsPerDay(gpu.renderTimeMinutes), 0)
}

/**
 * Calculate total power draw from selected local GPUs (in Watts)
 */
function calculateTotalPowerDraw(localGpus: LocalGpuConfig[]): number {
  return localGpus.reduce((total, gpu) => total + gpu.powerDrawWatts, 0)
}

export function calculateBatchEstimate(input: BatchEstimateInput): BatchEstimate {
  const {
    cardsCount,
    deadlineDays,
    pricePerCardUSDT,
    selectedLocalGpus,
    selectedCloudGpu,
    electricityRateIDR,
    exchangeRateUSDTtoIDR,
  } = input

  // Step 1: Calculate required throughput
  const cardsPerDayRequired = Math.ceil(cardsCount / deadlineDays)

  // Step 2: Calculate local GPU capacity (sum of all selected local GPUs)
  const localGpuCardsPerDay = calculateLocalCapacity(selectedLocalGpus)

  // Step 3: Calculate cloud GPU needs
  const cloudCardsPerDayNeeded = Math.max(0, cardsPerDayRequired - localGpuCardsPerDay)

  let cloudGpuCardsPerDay = 0
  let cloudGpusRequired = 0

  if (selectedCloudGpu && cloudCardsPerDayNeeded > 0) {
    cloudGpuCardsPerDay = gpuCardsPerDay(selectedCloudGpu.renderTimeMinutes)
    cloudGpusRequired = Math.ceil(cloudCardsPerDayNeeded / cloudGpuCardsPerDay)
  }

  // Step 4: Calculate hours
  const totalCloudHours = cloudGpusRequired * deadlineDays * HOURS_PER_DAY
  const totalLocalHours = selectedLocalGpus.length > 0 ? deadlineDays * HOURS_PER_DAY : 0

  // Step 5: Calculate costs (IDR) using Decimal.js for precision
  let cloudCostIDR = 0
  if (selectedCloudGpu && totalCloudHours > 0) {
    const cloudCostUSD = new Decimal(totalCloudHours).times(selectedCloudGpu.costPerHourUSD)
    cloudCostIDR = cloudCostUSD.times(exchangeRateUSDTtoIDR).round().toNumber()
  }

  // Calculate electricity cost for all selected local GPUs
  const totalPowerDrawWatts = calculateTotalPowerDraw(selectedLocalGpus)
  const electricityKWh = new Decimal(totalLocalHours)
    .times(totalPowerDrawWatts)
    .dividedBy(1000)
  const electricityCostIDR = electricityKWh
    .times(electricityRateIDR)
    .round()
    .toNumber()

  const totalCostIDR = cloudCostIDR + electricityCostIDR

  // Step 6: Calculate revenue (IDR)
  const revenueUSDT = new Decimal(cardsCount).times(pricePerCardUSDT)
  const revenueIDR = revenueUSDT
    .times(exchangeRateUSDTtoIDR)
    .round()
    .toNumber()

  // Step 7: Calculate profit
  const profitIDR = revenueIDR - totalCostIDR
  const marginPercent = revenueIDR > 0
    ? new Decimal(profitIDR).dividedBy(revenueIDR).times(100).toNumber()
    : 0

  // Step 8: Feasibility check
  const totalCapacityPerDay = localGpuCardsPerDay + (cloudGpusRequired * cloudGpuCardsPerDay)
  const isFeasible = totalCapacityPerDay >= cardsPerDayRequired

  let feasibilityNote: string
  if (isFeasible) {
    if (cloudGpusRequired === 0 && selectedLocalGpus.length > 0) {
      feasibilityNote = `Can complete with ${selectedLocalGpus.length} local GPU${selectedLocalGpus.length > 1 ? 's' : ''} only`
    } else if (cloudGpusRequired > 0 && selectedCloudGpu) {
      feasibilityNote = `Need ${cloudGpusRequired}× ${selectedCloudGpu.name}`
    } else {
      feasibilityNote = 'Select GPUs to see estimate'
    }
  } else {
    feasibilityNote = 'Need more GPUs or longer deadline'
  }

  // Step 9: Per-card metrics
  const revenuePerCardIDR = cardsCount > 0 ? Math.round(revenueIDR / cardsCount) : 0
  const costPerCardIDR = cardsCount > 0 ? Math.round(totalCostIDR / cardsCount) : 0
  const profitPerCardIDR = cardsCount > 0 ? Math.round(profitIDR / cardsCount) : 0

  return {
    isFeasible,
    feasibilityNote,
    cardsPerDayRequired,
    localGpuCardsPerDay,
    cloudCardsPerDayNeeded,
    cloudGpusRequired,
    totalCloudHours,
    totalLocalHours,
    cloudCostIDR,
    electricityCostIDR,
    totalCostIDR,
    revenueIDR,
    profitIDR,
    marginPercent: Math.round(marginPercent * 10) / 10,
    revenuePerCardIDR,
    costPerCardIDR,
    profitPerCardIDR,
  }
}

/**
 * Format IDR currency for display
 */
export function formatIDR(amount: number): string {
  // Handle NaN, undefined, null, or Infinity
  if (amount == null || !isFinite(amount) || isNaN(amount)) {
    return 'Rp 0'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Calculate days until deadline
 */
export function getDaysUntilDeadline(deadlineAt: string | Date): number {
  const deadline = new Date(deadlineAt)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
