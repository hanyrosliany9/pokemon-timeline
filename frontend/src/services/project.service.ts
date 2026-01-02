import api from './api.service'
import { CardProject, CreateCardProjectDto, UpdateCardProjectDto } from '@pokemon-timeline/shared'
import { normalizeProject } from '@/lib/decimal-normalizer'

/**
 * Project Service
 * API calls for card project management
 */
class ProjectService {
  private readonly basePath = '/api/project'

  async getAll(): Promise<CardProject[]> {
    const projects = await api.get<CardProject[]>(this.basePath)
    return projects.map(normalizeProject)
  }

  async getOne(id: string): Promise<CardProject> {
    const project = await api.get<CardProject>(`${this.basePath}/${id}`)
    return normalizeProject(project)
  }

  async create(data: CreateCardProjectDto): Promise<CardProject> {
    const project = await api.post<CardProject>(this.basePath, data)
    return normalizeProject(project)
  }

  async update(id: string, data: UpdateCardProjectDto): Promise<CardProject> {
    const project = await api.patch<CardProject>(`${this.basePath}/${id}`, data)
    return normalizeProject(project)
  }

  async delete(id: string): Promise<CardProject> {
    const project = await api.delete<CardProject>(`${this.basePath}/${id}`)
    return normalizeProject(project)
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
