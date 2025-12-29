import api from './api.service'
import { CardProject, CreateCardProjectDto, UpdateCardProjectDto } from '@pokemon-timeline/shared'

/**
 * Project Service
 * API calls for card project management
 */
class ProjectService {
  private readonly basePath = '/api/project'

  async getAll(): Promise<CardProject[]> {
    return api.get<CardProject[]>(this.basePath)
  }

  async getOne(id: string): Promise<CardProject> {
    return api.get<CardProject>(`${this.basePath}/${id}`)
  }

  async create(data: CreateCardProjectDto): Promise<CardProject> {
    return api.post<CardProject>(this.basePath, data)
  }

  async update(id: string, data: UpdateCardProjectDto): Promise<CardProject> {
    return api.patch<CardProject>(`${this.basePath}/${id}`, data)
  }

  async delete(id: string): Promise<CardProject> {
    return api.delete<CardProject>(`${this.basePath}/${id}`)
  }

  async getStats(): Promise<{
    totalProjects: number
    completedProjects: number
    inProgressProjects: number
    totalCardsProcessed: number
  }> {
    return api.get(`${this.basePath}/stats`)
  }
}

export default new ProjectService()
