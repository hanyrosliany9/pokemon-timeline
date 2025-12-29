import { StateCreator } from 'zustand'
import { Category } from '@pokemon-timeline/shared'
import categoryService from '@/services/category.service'

export interface CategorySlice {
  categories: Category[]
  isLoadingCategories: boolean

  // Fetching
  fetchCategories: () => Promise<void>

  // CRUD operations (triggered by WebSocket)
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  updateCategory: (id: string, category: Category) => void
  removeCategory: (id: string) => void

  // Local mutations
  createCategory: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>
  updateCategoryLocal: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
}

export const createCategorySlice: StateCreator<CategorySlice> = (set) => ({
  categories: [],
  isLoadingCategories: false,

  /**
   * Fetch all categories from API and initialize store
   */
  fetchCategories: async () => {
    set({ isLoadingCategories: true })
    try {
      const categories = await categoryService.getAll()
      set({ categories, isLoadingCategories: false })
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      set({ isLoadingCategories: false })
      throw error
    }
  },

  /**
   * Set all categories (usually from API call)
   */
  setCategories: (categories: Category[]) => {
    set({ categories })
  },

  /**
   * Add new category to store (triggered by WebSocket)
   */
  addCategory: (category: Category) => {
    set((state) => ({
      categories: [...state.categories, category],
    }))
  },

  /**
   * Update category in store (triggered by WebSocket)
   */
  updateCategory: (id: string, category: Category) => {
    set((state) => ({
      categories: state.categories.map((cat) => (cat.id === id ? category : cat)),
    }))
  },

  /**
   * Remove category from store (triggered by WebSocket)
   */
  removeCategory: (id: string) => {
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    }))
  },

  /**
   * Create category via API
   */
  createCategory: async (data) => {
    try {
      const category = await categoryService.create(data)
      // Don't update store here - let WebSocket do it
      return category
    } catch (error) {
      console.error('Failed to create category:', error)
      throw error
    }
  },

  /**
   * Update category via API
   */
  updateCategoryLocal: async (id: string, data) => {
    try {
      const category = await categoryService.update(id, data)
      // Don't update store here - let WebSocket do it
      return category
    } catch (error) {
      console.error('Failed to update category:', error)
      throw error
    }
  },

  /**
   * Delete category via API
   */
  deleteCategory: async (id: string) => {
    try {
      await categoryService.delete(id)
      // Don't update store here - let WebSocket do it
    } catch (error) {
      console.error('Failed to delete category:', error)
      throw error
    }
  },
})
