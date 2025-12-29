import { useState, useEffect } from 'react'
import { CardProject, CardEntry } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import entryService from '@/services/entry.service'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ProjectDetailsProps {
  isOpen: boolean
  onClose: () => void
  project: CardProject
}

/**
 * Project Details Modal
 * Shows progress stats and history of entries
 */
export default function ProjectDetails({ isOpen, onClose, project }: ProjectDetailsProps) {
  const { entries, setEntries, stats, setStats, deleteEntry } = useStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const projectEntries = entries[project.id] || []
  const projectStats = stats[project.id]

  // Load entries and stats when modal opens
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      try {
        setLoading(true)
        const [entriesData, statsData] = await Promise.all([
          entryService.getByProject(project.id),
          entryService.getStats(project.id),
        ])
        setEntries(project.id, entriesData)
        setStats(project.id, statsData)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isOpen, project.id, setEntries, setStats, toast])

  const handleDeleteEntry = async (entry: CardEntry) => {
    if (!confirm(`Delete entry from ${entry.date}?`)) return

    try {
      await entryService.delete(entry.id)
      deleteEntry(entry.id, project.id)
      // Refresh stats
      const newStats = await entryService.getStats(project.id)
      setStats(project.id, newStats)
      toast({
        title: 'Deleted',
        description: 'Entry removed',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{project.title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto flex-1">
            {/* Stats Grid */}
            {projectStats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {projectStats.totalProcessed.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">Cards Done</div>
                </div>
                <div className="bg-bg-primary rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">
                    {projectStats.remaining.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-secondary">Remaining</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {projectStats.percentComplete}%
                  </div>
                  <div className="text-sm text-green-700">Complete</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {projectStats.averageDaily.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-700">Avg / Day</div>
                </div>
              </div>
            )}

            {/* Estimated Completion */}
            {projectStats?.estimatedCompletionDate && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <div className="text-sm text-amber-700">Estimated Completion</div>
                <div className="text-lg font-bold text-amber-900">
                  {new Date(projectStats.estimatedCompletionDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  Based on {projectStats.daysWorked} days of progress
                </div>
              </div>
            )}

            {/* Entry History */}
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Progress History</h4>
              {projectEntries.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No entries yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {projectEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between bg-bg-primary rounded-lg p-3"
                    >
                      <div>
                        <div className="font-medium text-text-primary">
                          +{entry.cardsAdded.toLocaleString()} cards
                        </div>
                        <div className="text-sm text-text-secondary">
                          {formatDate(entry.date)}
                          {entry.notes && (
                            <span className="ml-2 text-text-tertiary">• {entry.notes}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-text-primary">
                            {entry.cumulativeTotal.toLocaleString()}
                          </div>
                          <div className="text-xs text-text-secondary">total</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
