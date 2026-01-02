import apiService from './api.service'
import { CreateBatchDto, UpdateBatchDto, RenderingBatch, BatchStats } from '@pokemon-timeline/shared'

const BATCH_API = '/batch'

/**
 * Batch API Service
 * Handles all batch-related API calls
 */
export const batchService = {
  /**
   * Create a new batch
   */
  async create(data: CreateBatchDto): Promise<RenderingBatch> {
    console.log('[BatchService] Creating batch:', data)
    return apiService.post<RenderingBatch>(BATCH_API, data)
  },

  /**
   * Get all batches for a project
   */
  async getByProject(projectId: string): Promise<RenderingBatch[]> {
    console.log('[BatchService] Fetching batches for project:', projectId)
    return apiService.get<RenderingBatch[]>(`${BATCH_API}/project/${projectId}`)
  },

  /**
   * Get a single batch by ID
   */
  async getById(id: string): Promise<RenderingBatch> {
    console.log('[BatchService] Fetching batch:', id)
    return apiService.get<RenderingBatch>(`${BATCH_API}/${id}`)
  },

  /**
   * Get batch statistics (projected vs actual)
   */
  async getStats(id: string): Promise<BatchStats> {
    console.log('[BatchService] Fetching batch stats:', id)
    return apiService.get<BatchStats>(`${BATCH_API}/${id}/stats`)
  },

  /**
   * Update a batch (status, notes, timestamps)
   */
  async update(id: string, data: UpdateBatchDto): Promise<RenderingBatch> {
    console.log('[BatchService] Updating batch:', id, data)
    return apiService.patch<RenderingBatch>(`${BATCH_API}/${id}`, data)
  },

  /**
   * Delete a batch
   */
  async delete(id: string): Promise<RenderingBatch> {
    console.log('[BatchService] Deleting batch:', id)
    return apiService.delete<RenderingBatch>(`${BATCH_API}/${id}`)
  },
}
