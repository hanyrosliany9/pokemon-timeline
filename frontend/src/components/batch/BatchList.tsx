import { useState, useEffect } from 'react'
import { useStore } from '@/store/store'
import { batchService } from '@/services/batch.service'
import { RenderingBatch, BatchStatus, BATCH_STATUS_LABELS } from '@pokemon-timeline/shared'
import BatchCard from './BatchCard'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Loader2 } from 'lucide-react'

interface BatchListProps {
  projectId: string
  onAddBatch: () => void
  onSelectBatch: (batch: RenderingBatch) => void
}

type FilterStatus = 'all' | BatchStatus

/**
 * BatchList Component
 * Filterable, sortable list of batches for a project
 */
export default function BatchList({ projectId, onAddBatch, onSelectBatch }: BatchListProps) {
  const { batches, setBatches, expenses } = useStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')

  const projectBatches = batches[projectId] || []

  // Fetch batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true)
        const data = await batchService.getByProject(projectId)
        setBatches(projectId, data)
      } catch (error) {
        console.error('Failed to fetch batches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [projectId, setBatches])

  // Filter batches
  const filteredBatches = filter === 'all'
    ? projectBatches
    : projectBatches.filter((b) => b.status === filter)

  // Sort by batch number (newest first)
  const sortedBatches = [...filteredBatches].sort((a, b) => b.batchNumber - a.batchNumber)

  // Calculate actual costs for each batch
  const getActualCost = (batchId: string) => {
    // Defensive: ensure expenses is an array
    if (!Array.isArray(expenses)) return 0
    return expenses
      .filter((e) => e.batchId === batchId)
      .reduce((sum, e) => sum + parseFloat(String(e.amountIDR || '0')), 0)
  }

  // Status counts for filter badges
  const statusCounts = {
    all: projectBatches.length,
    [BatchStatus.PENDING]: projectBatches.filter((b) => b.status === BatchStatus.PENDING).length,
    [BatchStatus.IN_PROGRESS]: projectBatches.filter((b) => b.status === BatchStatus.IN_PROGRESS).length,
    [BatchStatus.COMPLETED]: projectBatches.filter((b) => b.status === BatchStatus.COMPLETED).length,
    [BatchStatus.CANCELLED]: projectBatches.filter((b) => b.status === BatchStatus.CANCELLED).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Batches</h3>
          <span className="text-sm text-text-secondary">
            ({projectBatches.length})
          </span>
        </div>
        <Button onClick={onAddBatch} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Batch
        </Button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-text-secondary" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-interactive text-white'
              : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
          }`}
        >
          All ({statusCounts.all})
        </button>
        {Object.values(BatchStatus).map((status) => (
          statusCounts[status] > 0 && (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === status
                  ? 'bg-interactive text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
              }`}
            >
              {BATCH_STATUS_LABELS[status]} ({statusCounts[status]})
            </button>
          )
        ))}
      </div>

      {/* Batch List */}
      {sortedBatches.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          {filter === 'all' ? (
            <>
              <p className="mb-4">No batches yet</p>
              <Button onClick={onAddBatch} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Create First Batch
              </Button>
            </>
          ) : (
            <p>No {BATCH_STATUS_LABELS[filter as BatchStatus].toLowerCase()} batches</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              actualCostIDR={getActualCost(batch.id)}
              onClick={() => onSelectBatch(batch)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
