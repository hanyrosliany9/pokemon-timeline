import { BatchStatus } from '../enums/batch.enum'

// ============================================================================
// GPU Configuration (stored in localStorage)
// ============================================================================

export interface LocalGpuConfig {
  id: string                // UUID for identification
  name: string              // e.g., "RTX 3060 Ti"
  renderTimeMinutes: number // e.g., 14
  powerDrawWatts: number    // e.g., 300
}

export interface CloudGpuConfig {
  id: string                // UUID for identification
  name: string              // e.g., "RTX 5090"
  renderTimeMinutes: number // e.g., 2.5
  costPerHourUSD: number    // e.g., 0.36
}

export interface GpuConfig {
  localGpus: LocalGpuConfig[]   // Multiple local GPUs
  cloudGpus: CloudGpuConfig[]   // Multiple cloud GPU options
  electricityRateIDR: number    // e.g., 1600 (Rp/kWh)
}

// Preset cloud GPUs for quick-add
export const CLOUD_GPU_PRESETS: Omit<CloudGpuConfig, 'id'>[] = [
  { name: 'RTX 5090', renderTimeMinutes: 2.5, costPerHourUSD: 0.36 },
  { name: 'RTX 4090', renderTimeMinutes: 3, costPerHourUSD: 0.28 },
  { name: 'A100 40GB', renderTimeMinutes: 1.5, costPerHourUSD: 0.85 },
]

// ============================================================================
// Batch Estimation (client-side calculation)
// ============================================================================

export interface BatchEstimateInput {
  cardsCount: number
  deadlineDays: number
  pricePerCardUSDT: number
  selectedLocalGpus: LocalGpuConfig[]  // User-selected local GPUs for this batch
  selectedCloudGpu: CloudGpuConfig | null  // User-selected cloud GPU (or null if not using cloud)
  electricityRateIDR: number
  exchangeRateUSDTtoIDR: number
}

export interface BatchEstimate {
  // Feasibility
  isFeasible: boolean
  feasibilityNote: string

  // GPU Planning
  cardsPerDayRequired: number
  localGpuCardsPerDay: number
  cloudCardsPerDayNeeded: number
  cloudGpusRequired: number
  totalCloudHours: number
  totalLocalHours: number

  // Costs (IDR)
  cloudCostIDR: number
  electricityCostIDR: number
  totalCostIDR: number

  // Revenue & Profit (IDR)
  revenueIDR: number
  profitIDR: number
  marginPercent: number

  // Per Card (IDR)
  revenuePerCardIDR: number
  costPerCardIDR: number
  profitPerCardIDR: number
}

// ============================================================================
// Rendering Batch (database model)
// ============================================================================

export interface RenderingBatch {
  id: string
  projectId: string

  // Batch Definition
  batchNumber: number
  cardsCount: number
  deadlineAt: string  // ISO date string

  // GPU Planning (snapshot at creation)
  useLocalGpu: boolean
  cloudGpusPlanned: number
  cloudHoursPlanned: string  // Decimal as string

  // Exchange rate snapshot
  exchangeRateUsed: string  // Decimal as string

  // Projections (all in IDR, stored as string for Decimal)
  projectedCloudCostIDR: string
  projectedElectricityCostIDR: string
  projectedTotalCostIDR: string
  projectedRevenueIDR: string
  projectedProfitIDR: string
  projectedMarginPercent: string
  projectedCostPerCardIDR: string
  projectedProfitPerCardIDR: string

  // Status & Timing
  status: BatchStatus
  startedAt?: string | null
  completedAt?: string | null

  // Notes
  notes?: string | null

  // Timestamps
  createdAt: string
  updatedAt: string
}

// ============================================================================
// DTOs for API
// ============================================================================

export interface CreateBatchDto {
  projectId: string
  cardsCount: number
  deadlineAt: string  // ISO date string
  useLocalGpu: boolean
  cloudGpusPlanned: number
  cloudHoursPlanned: number
  exchangeRateUsed: number
  projectedCloudCostIDR: number
  projectedElectricityCostIDR: number
  projectedTotalCostIDR: number
  projectedRevenueIDR: number
  projectedProfitIDR: number
  projectedMarginPercent: number
  projectedCostPerCardIDR: number
  projectedProfitPerCardIDR: number
  notes?: string
}

export interface UpdateBatchDto {
  status?: BatchStatus
  startedAt?: string | null
  completedAt?: string | null
  notes?: string
}

// ============================================================================
// Batch Statistics
// ============================================================================

export interface BatchStats {
  batchId: string
  projectedCostIDR: number
  actualCostIDR: number
  varianceIDR: number
  variancePercent: number
}

export interface ProjectBatchSummary {
  projectId: string
  totalBatches: number
  completedBatches: number
  totalCardsInBatches: number
  totalProjectedCostIDR: number
  totalActualCostIDR: number
  totalProjectedRevenueIDR: number
  totalProjectedProfitIDR: number
}
