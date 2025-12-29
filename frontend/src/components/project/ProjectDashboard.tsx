import { useState, useEffect } from 'react'
import { useStore } from '@/store/store'
import projectService from '@/services/project.service'
import ProjectCard from './ProjectCard'
import AddProjectModal from './AddProjectModal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

/**
 * Project Dashboard
 * Main view for card tracking - shows all projects with progress
 */
export default function ProjectDashboard() {
  const { projects, setProjects, setLoading, isLoading } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const { toast } = useToast()

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        const data = await projectService.getAll()
        setProjects(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [setProjects, setLoading, toast])

  // Calculate totals
  const totalCards = projects.reduce((sum, p) => {
    // Get cumulative from latest entry if available
    const entries = (p as any).entries || []
    const latest = entries[0]
    return sum + (latest?.cumulativeTotal || 0)
  }, 0)

  const totalGoal = projects.reduce((sum, p) => sum + p.goalTotal, 0)
  const overallProgress = totalGoal > 0 ? Math.round((totalCards / totalGoal) * 100) : 0

  return (
    <>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">
              Track your card processing progress
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + New Project
          </Button>
        </div>

        {/* Overall Progress Card */}
        {projects.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 mb-2">
              <div
                className="bg-bg-secondary rounded-full h-3 transition-all duration-500"
                style={{ width: `${Math.min(100, overallProgress)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>{totalCards.toLocaleString()} cards processed</span>
              <span>{totalGoal.toLocaleString()} total goal</span>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="bg-bg-secondary rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Your Projects</h3>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-16 text-center bg-bg-primary rounded-lg border-2 border-dashed border-border space-y-5">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-text-primary font-medium">No projects yet</p>
              <p className="text-text-secondary text-sm">
                Create a project to start tracking your card processing progress
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                + Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  )
}
