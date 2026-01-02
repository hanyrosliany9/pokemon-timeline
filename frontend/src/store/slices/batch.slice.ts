import { StateCreator } from 'zustand'
import { RenderingBatch, BatchStatus } from '@pokemon-timeline/shared'
import { Decimal } from 'decimal.js'

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
  getBatchActualCost: (batchId: string, expenses: { batchId?: string | null; amountIDR: string }[]) => number
  getProjectTotalProjectedCost: (projectId: string) => number
  getProjectTotalActualCost: (projectId: string, expenses: { batchId?: string | null; amountIDR: string }[]) => number
  getProjectStats: (projectId: string, expenses: { batchId?: string | null; amountIDR: string }[]) => {
    totalBatches: number
    completedBatches: number
    totalCardsInBatches: number
    totalProjectedCostIDR: number
    totalActualCostIDR: number
    totalProjectedRevenueIDR: number
    totalProjectedProfitIDR: number
  }
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
      .reduce((sum, e) => sum + parseFloat(e.amountIDR || '0'), 0)
  },

  getProjectTotalProjectedCost: (projectId: string) => {
    const projectBatches = get().batches[projectId] || []
    return projectBatches.reduce((sum, batch) => {
      return sum + parseFloat(batch.projectedTotalCostIDR || '0')
    }, 0)
  },

  getProjectTotalActualCost: (projectId: string, expenses) => {
    const projectBatches = get().batches[projectId] || []
    const batchIds = new Set(projectBatches.map((b) => b.id))
    return expenses
      .filter((e) => e.batchId && batchIds.has(e.batchId))
      .reduce((sum, e) => sum + parseFloat(e.amountIDR || '0'), 0)
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
      .reduce((sum, e) => sum + parseFloat(e.amountIDR || '0'), 0)
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
})
