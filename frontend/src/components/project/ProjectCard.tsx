import { useState } from 'react'
import { CardProject } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import projectService from '@/services/project.service'
import LogCardsModal from './LogCardsModal'
import EditProjectModal from './EditProjectModal'
import ProjectDetails from './ProjectDetails'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ProjectCardProps {
  project: CardProject
}

/**
 * Project Card
 * Displays a single project with progress bar and quick actions
 */
export default function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject } = useStore()
  const { toast } = useToast()
  const [showLogModal, setShowLogModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get latest entry data if available
  const entries = (project as any).entries || []
  const latestEntry = entries[0]
  const currentCount = latestEntry?.cumulativeTotal || 0
  const remaining = Math.max(0, project.goalTotal - currentCount)

  // Progress color based on completion
  const getProgressColor = () => {
    if (project.progress >= 100) return 'bg-green-500'
    if (project.progress >= 75) return 'bg-blue-500'
    if (project.progress >= 50) return 'bg-yellow-500'
    return 'bg-text-tertiary'
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return

    try {
      setIsDeleting(true)
      await projectService.delete(project.id)
      deleteProject(project.id)
      toast({
        title: 'Deleted',
        description: `Project "${project.title}" deleted`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-bg-secondary border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary truncate">{project.title}</h4>
            <p className="text-sm text-text-secondary">
              Goal: {project.goalTotal.toLocaleString()} cards
            </p>
          </div>
          {project.progress >= 100 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              Complete
            </span>
          )}
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-text-primary">
              {currentCount.toLocaleString()} / {project.goalTotal.toLocaleString()}
            </span>
            <span className="font-bold text-text-primary">{project.progress}%</span>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-3">
            <div
              className={`${getProgressColor()} rounded-full h-3 transition-all duration-500`}
              style={{ width: `${Math.min(100, project.progress)}%` }}
            />
          </div>
          {remaining > 0 && (
            <p className="text-xs text-text-secondary mt-1">
              {remaining.toLocaleString()} remaining
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLogModal(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={project.progress >= 100}
          >
            + Log Cards
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDetails(true)}
            className="px-3"
          >
            View
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
            className="px-3"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? '...' : '×'}
          </Button>
        </div>
      </div>

      <LogCardsModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        project={project}
      />

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
      />

      <ProjectDetails
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        project={project}
      />
    </>
  )
}
