import api from './api.service'
import { CardEntry, CreateCardEntryDto, UpdateCardEntryDto, ProjectStats } from '@pokemon-timeline/shared'

/**
 * Entry Service
 * API calls for card entry (progress logging) management
 */
class EntryService {
  private readonly basePath = '/api/entry'

  async create(data: CreateCardEntryDto): Promise<CardEntry> {
    return api.post<CardEntry>(this.basePath, data)
  }

  async getByProject(projectId: string): Promise<CardEntry[]> {
    return api.get<CardEntry[]>(`${this.basePath}/project/${projectId}`)
  }

  async getStats(projectId: string): Promise<ProjectStats> {
    return api.get<ProjectStats>(`${this.basePath}/project/${projectId}/stats`)
  }

  async update(id: string, data: UpdateCardEntryDto): Promise<CardEntry> {
    return api.patch<CardEntry>(`${this.basePath}/${id}`, data)
  }

  async delete(id: string): Promise<CardEntry> {
    return api.delete<CardEntry>(`${this.basePath}/${id}`)
  }
}

export default new EntryService()
