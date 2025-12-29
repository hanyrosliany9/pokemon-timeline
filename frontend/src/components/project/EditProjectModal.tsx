import { useState, useEffect } from 'react'
import { CardProject } from '@pokemon-timeline/shared'
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

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: CardProject | null
}

/**
 * Edit Project Modal
 * Edit existing project title and goal total
 */
export default function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    goalTotal: '',
  })

  // Pre-fill form when project changes
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title,
        goalTotal: project.goalTotal.toString(),
      })
    }
  }, [project, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!project) return

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

      await projectService.update(project.id, {
        title: formData.title,
        goalTotal,
      })

      toast({
        title: 'Success',
        description: `Project updated!`,
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update project',
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
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project title and target goal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Project Title *</Label>
            <Input
              id="edit-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Pokemon Base Set Cropping"
              autoFocus
            />
          </div>

          {/* Goal Total */}
          <div className="space-y-2">
            <Label htmlFor="edit-goalTotal">Total Cards to Process *</Label>
            <Input
              id="edit-goalTotal"
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
              {loading ? 'Updating...' : 'Update Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
