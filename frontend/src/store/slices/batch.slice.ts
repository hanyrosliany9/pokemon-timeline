import { StateCreator } from 'zustand'
import { RenderingBatch, BatchStatus, CardEntry } from '@pokemon-timeline/shared'
import { Decimal } from 'decimal.js'

// Safe number parsing - returns 0 for null/undefined/NaN
function safeParseFloat(value: string | number | null | undefined): number {
  if (value == null) return 0
  const parsed = typeof value === 'number' ? value : parseFloat(String(value))
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
}

// P&L result for a single batch
export interface BatchPL {
  batchId: string
  cardsTarget: number
  cardsRendered: number
  progressPercent: number

  // Projected (from batch creation)
  projectedCostIDR: number
  projectedRevenueIDR: number
  projectedProfitIDR: number
  projectedMarginPercent: number

  // Actual (computed from expenses + entries)
  actualCostIDR: number
  actualRevenueIDR: number   // Based on cards rendered
  actualProfitIDR: number
  actualMarginPercent: number

  // Variance
  costVarianceIDR: number    // positive = under budget
  profitVarianceIDR: number  // positive = better than expected
  costVariancePercent: number
  profitVariancePercent: number

  // Per-card metrics
  projectedCostPerCard: number
  actualCostPerCard: number
  projectedProfitPerCard: number
  actualProfitPerCard: number
}

// Aggregated P&L for a project
export interface ProjectPL {
  projectId: string
  totalBatches: number
  completedBatches: number
  totalCardsTarget: number
  totalCardsRendered: number

  // Aggregated projected
  totalProjectedCostIDR: number
  totalProjectedRevenueIDR: number
  totalProjectedProfitIDR: number

  // Aggregated actual
  totalActualCostIDR: number
  totalActualRevenueIDR: number
  totalActualProfitIDR: number

  // Variance
  totalCostVarianceIDR: number
  totalProfitVarianceIDR: number
}

export interface BatchSlice {
  batches: Record<string, RenderingBatch[]>  // keyed by projectId
  selectedBatch: RenderingBatch | null

  // Setters
  setBatches: (projectId: string, batches: RenderingBatch[]) => void
  addBatch: (batch: RenderingBatch) => void
  updateBatch: (batch: RenderingBatch) => void
  deleteBatch: (batchId: string, projectId: string) => void
  setSelectedBatch: (batch: RenderingBatch | null) => void
  clearBatches: () => void

  // Computed getters
  getBatchesByProject: (projectId: string) => RenderingBatch[]
  getBatchById: (batchId: string) => RenderingBatch | undefined
  getBatchActualCost: (batchId: string, expenses: { batchId?: string | null; amountIDR: string | number }[]) => number
  getProjectTotalProjectedCost: (projectId: string) => number
  getProjectTotalActualCost: (projectId: string, expenses: { batchId?: string | null; amountIDR: string | number }[]) => number
  getProjectStats: (projectId: string, expenses: { batchId?: string | null; amountIDR: string | number }[]) => {
    totalBatches: number
    completedBatches: number
    totalCardsInBatches: number
    totalProjectedCostIDR: number
    totalActualCostIDR: number
    totalProjectedRevenueIDR: number
    totalProjectedProfitIDR: number
  }

  // P&L Computed Methods
  getBatchPL: (
    batchId: string,
    expenses: { batchId?: string | null; amountIDR: string | number }[],
    cardsRendered: number,
    pricePerCardIDR: number
  ) => BatchPL | null

  getProjectPL: (
    projectId: string,
    expenses: { batchId?: string | null; amountIDR: string | number }[],
    getCardsRenderedByBatch: (batchId: string) => number,
    pricePerCardIDR: number
  ) => ProjectPL
}

export const createBatchSlice: StateCreator<BatchSlice> = (set, get) => ({
  batches: {},
  selectedBatch: null,

  setBatches: (projectId: string, batches: RenderingBatch[]) => {
    set((state) => ({
      batches: {
        ...state.batches,
        [projectId]: batches,
      },
    }))
  },

  addBatch: (batch: RenderingBatch) => {
    set((state) => {
      const projectBatches = state.batches[batch.projectId] || []
      return {
        batches: {
          ...state.batches,
          [batch.projectId]: [...projectBatches, batch],
        },
      }
    })
  },

  updateBatch: (batch: RenderingBatch) => {
    set((state) => {
      const projectBatches = state.batches[batch.projectId] || []
      return {
        batches: {
          ...state.batches,
          [batch.projectId]: projectBatches.map((b) =>
            b.id === batch.id ? batch : b
          ),
        },
      }
    })
  },

  deleteBatch: (batchId: string, projectId: string) => {
    set((state) => {
      const projectBatches = state.batches[projectId] || []
      return {
        batches: {
          ...state.batches,
          [projectId]: projectBatches.filter((b) => b.id !== batchId),
        },
        selectedBatch: state.selectedBatch?.id === batchId ? null : state.selectedBatch,
      }
    })
  },

  setSelectedBatch: (batch: RenderingBatch | null) => {
    set({ selectedBatch: batch })
  },

  clearBatches: () => {
    set({ batches: {}, selectedBatch: null })
  },

  getBatchesByProject: (projectId: string) => {
    return get().batches[projectId] || []
  },

  getBatchById: (batchId: string) => {
    const allBatches = Object.values(get().batches).flat()
    return allBatches.find((b) => b.id === batchId)
  },

  getBatchActualCost: (batchId: string, expenses) => {
    return expenses
      .filter((e) => e.batchId === batchId)
      .reduce((sum, e) => sum + parseFloat(String(e.amountIDR || '0')), 0)
  },

  getProjectTotalProjectedCost: (projectId: string) => {
    const projectBatches = get().batches[projectId] || []
    return projectBatches.reduce((sum, batch) => {
      return sum + safeParseFloat(batch.projectedTotalCostIDR)
    }, 0)
  },

  getProjectTotalActualCost: (projectId: string, expenses) => {
    const projectBatches = get().batches[projectId] || []
    const batchIds = new Set(projectBatches.map((b) => b.id))
    return expenses
      .filter((e) => e.batchId && batchIds.has(e.batchId))
      .reduce((sum, e) => sum + parseFloat(String(e.amountIDR || '0')), 0)
  },

  getProjectStats: (projectId: string, expenses) => {
    const projectBatches = get().batches[projectId] || []
    const batchIds = new Set(projectBatches.map((b) => b.id))

    const totalBatches = projectBatches.length
    const completedBatches = projectBatches.filter(
      (b) => b.status === BatchStatus.COMPLETED
    ).length
    const totalCardsInBatches = projectBatches.reduce(
      (sum, b) => sum + b.cardsCount,
      0
    )
    const totalProjectedCostIDR = projectBatches.reduce(
      (sum, b) => new Decimal(sum).plus(b.projectedTotalCostIDR || '0').toNumber(),
      0
    )
    const totalActualCostIDR = expenses
      .filter((e) => e.batchId && batchIds.has(e.batchId))
      .reduce((sum, e) => sum + parseFloat(String(e.amountIDR || '0')), 0)
    const totalProjectedRevenueIDR = projectBatches.reduce(
      (sum, b) => new Decimal(sum).plus(b.projectedRevenueIDR || '0').toNumber(),
      0
    )
    const totalProjectedProfitIDR = projectBatches.reduce(
      (sum, b) => new Decimal(sum).plus(b.projectedProfitIDR || '0').toNumber(),
      0
    )

    return {
      totalBatches,
      completedBatches,
      totalCardsInBatches,
      totalProjectedCostIDR,
      totalActualCostIDR,
      totalProjectedRevenueIDR,
      totalProjectedProfitIDR,
    }
  },

  // P&L Computed Methods
  getBatchPL: (batchId, expenses, cardsRendered, pricePerCardIDR) => {
    const batch = get().getBatchById(batchId)
    if (!batch) return null

    const cardsTarget = batch.cardsCount
    const progressPercent = cardsTarget > 0 ? Math.round((cardsRendered / cardsTarget) * 100) : 0

    // Projected values
    const projectedCostIDR = safeParseFloat(batch.projectedTotalCostIDR)
    const projectedRevenueIDR = safeParseFloat(batch.projectedRevenueIDR)
    const projectedProfitIDR = safeParseFloat(batch.projectedProfitIDR)
    const projectedMarginPercent = safeParseFloat(batch.projectedMarginPercent)

    // Actual values
    const actualCostIDR = expenses
      .filter((e) => e.batchId === batchId)
      .reduce((sum, e) => sum + parseFloat(String(e.amountIDR || '0')), 0)

    // Actual revenue = cards rendered × price per card
    const actualRevenueIDR = cardsRendered * pricePerCardIDR
    const actualProfitIDR = actualRevenueIDR - actualCostIDR
    const actualMarginPercent = actualRevenueIDR > 0
      ? (actualProfitIDR / actualRevenueIDR) * 100
      : 0

    // Variance (positive = good)
    const costVarianceIDR = projectedCostIDR - actualCostIDR
    const profitVarianceIDR = actualProfitIDR - projectedProfitIDR
    const costVariancePercent = projectedCostIDR > 0
      ? (costVarianceIDR / projectedCostIDR) * 100
      : 0
    const profitVariancePercent = projectedProfitIDR > 0
      ? (profitVarianceIDR / projectedProfitIDR) * 100
      : 0

    // Per-card metrics
    const projectedCostPerCard = cardsTarget > 0 ? projectedCostIDR / cardsTarget : 0
    const actualCostPerCard = cardsRendered > 0 ? actualCostIDR / cardsRendered : 0
    const projectedProfitPerCard = cardsTarget > 0 ? projectedProfitIDR / cardsTarget : 0
    const actualProfitPerCard = cardsRendered > 0 ? actualProfitIDR / cardsRendered : 0

    return {
      batchId,
      cardsTarget,
      cardsRendered,
      progressPercent,
      projectedCostIDR,
      projectedRevenueIDR,
      projectedProfitIDR,
      projectedMarginPercent,
      actualCostIDR,
      actualRevenueIDR,
      actualProfitIDR,
      actualMarginPercent,
      costVarianceIDR,
      profitVarianceIDR,
      costVariancePercent,
      profitVariancePercent,
      projectedCostPerCard,
      actualCostPerCard,
      projectedProfitPerCard,
      actualProfitPerCard,
    }
  },

  getProjectPL: (projectId, expenses, getCardsRenderedByBatch, pricePerCardIDR) => {
    const projectBatches = get().batches[projectId] || []
    const batchIds = new Set(projectBatches.map((b) => b.id))

    let totalCardsTarget = 0
    let totalCardsRendered = 0
    let totalProjectedCostIDR = 0
    let totalProjectedRevenueIDR = 0
    let totalProjectedProfitIDR = 0
    let totalActualCostIDR = 0
    let totalActualRevenueIDR = 0
    let totalActualProfitIDR = 0

    for (const batch of projectBatches) {
      const cardsRendered = getCardsRenderedByBatch(batch.id)

      totalCardsTarget += batch.cardsCount
      totalCardsRendered += cardsRendered
      totalProjectedCostIDR += safeParseFloat(batch.projectedTotalCostIDR)
      totalProjectedRevenueIDR += safeParseFloat(batch.projectedRevenueIDR)
      totalProjectedProfitIDR += safeParseFloat(batch.projectedProfitIDR)

      // Actual cost from expenses linked to this batch
      const batchActualCost = expenses
        .filter((e) => e.batchId === batch.id)
        .reduce((sum, e) => sum + parseFloat(String(e.amountIDR || '0')), 0)
      totalActualCostIDR += batchActualCost

      // Actual revenue from cards rendered
      totalActualRevenueIDR += cardsRendered * pricePerCardIDR
    }

    totalActualProfitIDR = totalActualRevenueIDR - totalActualCostIDR

    return {
      projectId,
      totalBatches: projectBatches.length,
      completedBatches: projectBatches.filter((b) => b.status === BatchStatus.COMPLETED).length,
      totalCardsTarget,
      totalCardsRendered,
      totalProjectedCostIDR,
      totalProjectedRevenueIDR,
      totalProjectedProfitIDR,
      totalActualCostIDR,
      totalActualRevenueIDR,
      totalActualProfitIDR,
      totalCostVarianceIDR: totalProjectedCostIDR - totalActualCostIDR,
      totalProfitVarianceIDR: totalActualProfitIDR - totalProjectedProfitIDR,
    }
  },
})
