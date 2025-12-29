import { StateCreator } from 'zustand'
import { CardProject } from '@pokemon-timeline/shared'

export interface ProjectSlice {
  // State
  projects: CardProject[]
  selectedProject: CardProject | null
  isLoading: boolean

  // Actions
  setProjects: (projects: CardProject[]) => void
  addProject: (project: CardProject) => void
  updateProject: (project: CardProject) => void
  deleteProject: (id: string) => void
  setSelectedProject: (project: CardProject | null) => void
  setLoading: (loading: boolean) => void

  // Computed
  getProjectById: (id: string) => CardProject | undefined
  getCompletedProjects: () => CardProject[]
  getInProgressProjects: () => CardProject[]
}

export const createProjectSlice: StateCreator<ProjectSlice, [], [], ProjectSlice> = (set, get) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  isLoading: false,

  // Actions
  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),

  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
      selectedProject: state.selectedProject?.id === project.id ? project : state.selectedProject,
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
    })),

  setSelectedProject: (project) => set({ selectedProject: project }),

  setLoading: (loading) => set({ isLoading: loading }),

  // Computed
  getProjectById: (id) => get().projects.find((p) => p.id === id),

  getCompletedProjects: () => get().projects.filter((p) => p.progress >= 100),

  getInProgressProjects: () => get().projects.filter((p) => p.progress > 0 && p.progress < 100),
})
