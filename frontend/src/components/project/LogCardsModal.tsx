import { useState, useEffect } from 'react'
import { CardProject } from '@pokemon-timeline/shared'
import entryService from '@/services/entry.service'
import { useToast } from '@/hooks/use-toast'
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
import { Textarea } from '@/components/ui/textarea'

// UTC+7 timezone utilities (Indonesia/Jakarta)
const UTC7_OFFSET_MS = 7 * 60 * 60 * 1000
const TIMEZONE_NAME = 'WIB (UTC+7)'

/**
 * Get today's date in YYYY-MM-DD format using UTC+7 timezone
 */
function getTodayUTC7(): string {
  const now = new Date()
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const utc7Date = new Date(utcTime + UTC7_OFFSET_MS)
  const year = utc7Date.getFullYear()
  const month = String(utc7Date.getMonth() + 1).padStart(2, '0')
  const day = String(utc7Date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface LogCardsModalProps {
  isOpen: boolean
  onClose: () => void
  project: CardProject
}

/**
 * Log Cards Modal
 * The core action: "How many cards did you complete today?"
 * Simple input with instant preview of progress
 *
 * Uses UTC+7 (WIB) timezone for all date calculations
 */
export default function LogCardsModal({ isOpen, onClose, project }: LogCardsModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: getTodayUTC7(), // Use UTC+7 timezone
    cardsAdded: '',
    notes: '',
  })
  const [preview, setPreview] = useState({
    newTotal: 0,
    newProgress: 0,
    remaining: 0,
  })

  // Get current count from latest entry
  const entries = (project as any).entries || []
  const latestEntry = entries[0]
  const currentCount = latestEntry?.cumulativeTotal || 0

  // Update preview when cards change
  useEffect(() => {
    const cardsAdded = parseInt(formData.cardsAdded) || 0
    const newTotal = currentCount + cardsAdded
    const newProgress = Math.min(100, Math.round((newTotal / project.goalTotal) * 100))
    const remaining = Math.max(0, project.goalTotal - newTotal)

    setPreview({ newTotal, newProgress, remaining })
  }, [formData.cardsAdded, currentCount, project.goalTotal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cardsAdded = parseInt(formData.cardsAdded)
    if (!cardsAdded || cardsAdded <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter how many cards you completed',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // Create the entry
      await entryService.create({
        projectId: project.id,
        date: formData.date,
        cardsAdded,
        notes: formData.notes || undefined,
      })

      toast({
        title: 'Progress Logged!',
        description: `+${cardsAdded} cards - Now at ${preview.newProgress}%`,
      })

      // Reset form and close
      setFormData({
        date: getTodayUTC7(),
        cardsAdded: '',
        notes: '',
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to log progress',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const today = getTodayUTC7()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Cards Completed</DialogTitle>
          <DialogDescription>
            Record how many cards you completed today for {project.title}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Info */}
          <div className="bg-bg-primary rounded-lg p-4">
            <h4 className="font-semibold text-text-primary">{project.title}</h4>
            <p className="text-sm text-text-secondary">
              Current: {currentCount.toLocaleString()} / {project.goalTotal.toLocaleString()} cards ({project.progress}%)
            </p>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date ({TIMEZONE_NAME})</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={today}
            />
          </div>

          {/* Cards Added - Main Input */}
          <div className="space-y-2">
            <Label htmlFor="cardsAdded" className="text-lg">
              Cards Completed *
            </Label>
            <Input
              id="cardsAdded"
              type="number"
              value={formData.cardsAdded}
              onChange={(e) => setFormData({ ...formData, cardsAdded: e.target.value })}
              placeholder="e.g., 150"
              min="1"
              autoFocus
              className="text-2xl font-bold text-center h-16"
            />
          </div>

          {/* Live Preview */}
          {formData.cardsAdded && parseInt(formData.cardsAdded) > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">New Total:</span>
                <span className="font-bold text-blue-900">
                  {preview.newTotal.toLocaleString()} cards
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${preview.newProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Progress:</span>
                <span className={`font-bold ${preview.newProgress >= 100 ? 'text-green-600' : 'text-blue-900'}`}>
                  {preview.newProgress}%
                </span>
              </div>
              {preview.remaining > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Remaining:</span>
                  <span className="font-medium text-blue-900">
                    {preview.remaining.toLocaleString()} cards
                  </span>
                </div>
              )}
              {preview.newProgress >= 100 && (
                <div className="text-center text-green-600 font-bold mt-2">
                  🎉 Project Complete!
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any notes about this session..."
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Log Progress'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
