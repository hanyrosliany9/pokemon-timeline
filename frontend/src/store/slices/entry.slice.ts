import { StateCreator } from 'zustand'
import { CardEntry, ProjectStats } from '@pokemon-timeline/shared'

export interface EntrySlice {
  // State - entries keyed by projectId
  entries: Record<string, CardEntry[]>
  stats: Record<string, ProjectStats>

  // Actions
  setEntries: (projectId: string, entries: CardEntry[]) => void
  addEntry: (entry: CardEntry) => void
  updateEntry: (entry: CardEntry) => void
  deleteEntry: (id: string, projectId: string) => void
  setStats: (projectId: string, stats: ProjectStats) => void

  // Computed
  getEntriesByProject: (projectId: string) => CardEntry[]
  getStatsByProject: (projectId: string) => ProjectStats | undefined
  getLatestEntry: (projectId: string) => CardEntry | undefined
}

export const createEntrySlice: StateCreator<EntrySlice, [], [], EntrySlice> = (set, get) => ({
  // Initial state
  entries: {},
  stats: {},

  // Actions
  setEntries: (projectId, entries) =>
    set((state) => ({
      entries: { ...state.entries, [projectId]: entries },
    })),

  addEntry: (entry) =>
    set((state) => {
      const projectEntries = state.entries[entry.projectId] || []
      // Insert in date order (newest first)
      const updated = [entry, ...projectEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      return {
        entries: { ...state.entries, [entry.projectId]: updated },
      }
    }),

  updateEntry: (entry) =>
    set((state) => {
      const projectEntries = state.entries[entry.projectId] || []
      return {
        entries: {
          ...state.entries,
          [entry.projectId]: projectEntries.map((e) => (e.id === entry.id ? entry : e)),
        },
      }
    }),

  deleteEntry: (id, projectId) =>
    set((state) => {
      const projectEntries = state.entries[projectId] || []
      return {
        entries: {
          ...state.entries,
          [projectId]: projectEntries.filter((e) => e.id !== id),
        },
      }
    }),

  setStats: (projectId, stats) =>
    set((state) => ({
      stats: { ...state.stats, [projectId]: stats },
    })),

  // Computed
  getEntriesByProject: (projectId) => get().entries[projectId] || [],

  getStatsByProject: (projectId) => get().stats[projectId],

  getLatestEntry: (projectId) => {
    const entries = get().entries[projectId] || []
    return entries[0] // Already sorted by date desc
  },
})
