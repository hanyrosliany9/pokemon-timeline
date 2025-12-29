import { useState } from 'react'
import projectService from '@/services/project.service'
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

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Add Project Modal
 * Simple form: just title and goal total - that's all you need!
 */
export default function AddProjectModal({ isOpen, onClose }: AddProjectModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    goalTotal: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a project title',
        variant: 'destructive',
      })
      return
    }

    const goalTotal = parseInt(formData.goalTotal)
    if (!goalTotal || goalTotal <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid goal (number of cards)',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      await projectService.create({
        title: formData.title,
        goalTotal,
      })

      toast({
        title: 'Success',
        description: `Project "${formData.title}" created!`,
      })

      // Reset form
      setFormData({ title: '', goalTotal: '' })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new card project with a target goal to track your progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Pokemon Base Set Cropping"
              autoFocus
            />
          </div>

          {/* Goal Total */}
          <div className="space-y-2">
            <Label htmlFor="goalTotal">Total Cards to Process *</Label>
            <Input
              id="goalTotal"
              type="number"
              value={formData.goalTotal}
              onChange={(e) => setFormData({ ...formData, goalTotal: e.target.value })}
              placeholder="e.g., 3000"
              min="1"
            />
            <p className="text-xs text-text-secondary">
              How many cards do you need to complete for this project?
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
