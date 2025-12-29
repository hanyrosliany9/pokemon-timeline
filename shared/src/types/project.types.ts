/**
 * Card Project Types
 * Simple cumulative card tracking - just title, goal, and entries
 */

export interface CardProject {
  id: string
  title: string          // e.g., "Pokemon Base Set Cropping"
  goalTotal: number      // Target cards (e.g., 3000)
  progress: number       // 0-100 percentage
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateCardProjectDto {
  title: string
  goalTotal: number
}

export interface UpdateCardProjectDto {
  title?: string
  goalTotal?: number
}

/**
 * Card Entry Types
 * Log each time you complete cards
 */

export interface CardEntry {
  id: string
  projectId: string
  date: string           // ISO date (YYYY-MM-DD)
  cardsAdded: number     // Cards processed this session
  cumulativeTotal: number // Running total after this entry
  notes?: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateCardEntryDto {
  projectId: string
  date: string           // ISO date (YYYY-MM-DD)
  cardsAdded: number
  notes?: string
}

export interface UpdateCardEntryDto {
  cardsAdded?: number
  notes?: string
}

/**
 * Progress Statistics
 * Auto-calculated from entries
 */

export interface ProjectStats {
  totalProcessed: number
  goalTotal: number
  remaining: number
  percentComplete: number
  averageDaily: number
  estimatedCompletionDate?: string
  daysWorked: number
}

/**
 * Card Project with entries included
 */
export interface CardProjectWithEntries extends CardProject {
  entries: CardEntry[]
}
