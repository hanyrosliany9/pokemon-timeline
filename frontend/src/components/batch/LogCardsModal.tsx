import { useState, useEffect } from 'react'
import { RenderingBatch, CardEntry } from '@pokemon-timeline/shared'
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
  batch: RenderingBatch
  entries?: CardEntry[]  // Existing entries for this batch
  onSuccess?: () => void // Callback after successful log
}

/**
 * Log Cards Modal for Batches
 * The core action: "How many cards did you complete today for this batch?"
 * Simple input with instant preview of batch progress
 *
 * Uses UTC+7 (WIB) timezone for all date calculations
 */
export default function LogCardsModal({ isOpen, onClose, batch, entries = [], onSuccess }: LogCardsModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: getTodayUTC7(),
    cardsAdded: '',
    notes: '',
  })
  const [preview, setPreview] = useState({
    newTotal: 0,
    newProgress: 0,
    remaining: 0,
  })

  // Get current count from latest entry for this batch
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const latestEntry = sortedEntries[0]
  const currentCount = latestEntry?.cumulativeTotal || 0

  // Update preview when cards change
  useEffect(() => {
    const cardsAdded = parseInt(formData.cardsAdded) || 0
    const newTotal = currentCount + cardsAdded
    const newProgress = Math.min(100, Math.round((newTotal / batch.cardsCount) * 100))
    const remaining = Math.max(0, batch.cardsCount - newTotal)

    setPreview({ newTotal, newProgress, remaining })
  }, [formData.cardsAdded, currentCount, batch.cardsCount])

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

      // Create the entry for this batch
      await entryService.create({
        batchId: batch.id,
        date: formData.date,
        cardsAdded,
        notes: formData.notes || undefined,
      })

      toast({
        title: 'Progress Logged!',
        description: `+${cardsAdded} cards - Batch now at ${preview.newProgress}%`,
      })

      // Reset form and close
      setFormData({
        date: getTodayUTC7(),
        cardsAdded: '',
        notes: '',
      })

      onSuccess?.()
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
  const batchProgress = Math.round((currentCount / batch.cardsCount) * 100)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Cards - Batch #{batch.batchNumber}</DialogTitle>
          <DialogDescription>
            Record how many cards you completed today for this batch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Batch Info */}
          <div className="bg-bg-primary rounded-lg p-4">
            <h4 className="font-semibold text-text-primary">Batch #{batch.batchNumber}</h4>
            <p className="text-sm text-text-secondary">
              Current: {currentCount.toLocaleString()} / {batch.cardsCount.toLocaleString()} cards ({batchProgress}%)
            </p>
            <div className="w-full bg-bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-interactive rounded-full h-2 transition-all duration-300"
                style={{ width: `${batchProgress}%` }}
              />
            </div>
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">New Total:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  {preview.newTotal.toLocaleString()} cards
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${preview.newProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">Progress:</span>
                <span className={`font-bold ${preview.newProgress >= 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-900 dark:text-blue-100'}`}>
                  {preview.newProgress}%
                </span>
              </div>
              {preview.remaining > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Remaining:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {preview.remaining.toLocaleString()} cards
                  </span>
                </div>
              )}
              {preview.newProgress >= 100 && (
                <div className="text-center text-green-600 dark:text-green-400 font-bold mt-2">
                  🎉 Batch Complete!
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
