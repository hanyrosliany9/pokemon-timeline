import Decimal from 'decimal.js'
import { BatchEstimate, BatchEstimateInput } from '@pokemon-timeline/shared'

/**
 * Batch Calculator Service
 *
 * Pure calculation engine for estimating GPU requirements, costs, and profitability
 * for rendering batches. Uses Decimal.js for financial precision.
 *
 * Key formulas:
 * - cards_per_day = (24 * 60) / render_time_minutes
 * - cloud_needed = ceil((required_per_day - local_capacity) / cloud_capacity_per_gpu)
 * - cloud_cost = cloud_gpus × deadline_days × 24 × cost_per_hour_usd × exchange_rate
 * - electricity = deadline_days × 24 × (watts / 1000) × rate_per_kwh
 * - profit = revenue - total_cost
 */

const MINUTES_PER_DAY = 24 * 60

export function calculateBatchEstimate(input: BatchEstimateInput): BatchEstimate {
  const {
    cardsCount,
    deadlineDays,
    pricePerCardUSDT,
    useLocalGpu,
    gpuConfig,
    exchangeRateUSDTtoIDR,
  } = input

  // Step 1: Calculate required throughput
  const cardsPerDayRequired = Math.ceil(cardsCount / deadlineDays)

  // Step 2: Calculate local GPU capacity (cards per day)
  const localGpuCardsPerDay = useLocalGpu && gpuConfig.local.enabled
    ? Math.floor(MINUTES_PER_DAY / gpuConfig.local.renderTimeMinutes)
    : 0

  // Step 3: Calculate cloud GPU needs
  const cloudCardsPerDayNeeded = Math.max(0, cardsPerDayRequired - localGpuCardsPerDay)
  const cloudGpuCardsPerDay = Math.floor(MINUTES_PER_DAY / gpuConfig.cloud.renderTimeMinutes)
  const cloudGpusRequired = cloudCardsPerDayNeeded > 0
    ? Math.ceil(cloudCardsPerDayNeeded / cloudGpuCardsPerDay)
    : 0

  // Step 4: Calculate hours
  const totalCloudHours = cloudGpusRequired * deadlineDays * 24
  const totalLocalHours = useLocalGpu && gpuConfig.local.enabled
    ? deadlineDays * 24
    : 0

  // Step 5: Calculate costs (IDR) using Decimal.js for precision
  const cloudCostUSD = new Decimal(totalCloudHours)
    .times(gpuConfig.cloud.costPerHourUSD)
  const cloudCostIDR = cloudCostUSD
    .times(exchangeRateUSDTtoIDR)
    .round()
    .toNumber()

  const electricityKWh = new Decimal(totalLocalHours)
    .times(gpuConfig.local.powerDrawWatts)
    .dividedBy(1000)
  const electricityCostIDR = electricityKWh
    .times(gpuConfig.electricityRateIDR)
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
    if (cloudGpusRequired === 0) {
      feasibilityNote = 'Can complete with local GPU only'
    } else {
      feasibilityNote = `Need ${cloudGpusRequired} cloud GPU${cloudGpusRequired > 1 ? 's' : ''}`
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
