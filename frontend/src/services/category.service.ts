import { Category, CreateCategoryInput, UpdateCategoryInput } from '@pokemon-timeline/shared'
import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const CATEGORY_ENDPOINT = `${API_BASE_URL}/api/category`

class CategoryService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: CATEGORY_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    try {
      const response = await this.client.get<Category[]>('/')
      return response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw error
    }
  }

  /**
   * Get a single category by ID
   */
  async getOne(id: string): Promise<Category> {
    try {
      const response = await this.client.get<Category>(`/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategoryInput): Promise<Category> {
    try {
      const response = await this.client.post<Category>('/', data)
      return response.data
    } catch (error) {
      console.error('Failed to create category:', error)
      throw error
    }
  }

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    try {
      const response = await this.client.patch<Category>(`/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`/${id}`)
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error)
      throw error
    }
  }
}

export default new CategoryService()
