/**
 * Category types for expense categorization
 */

export interface Category {
  id: string
  name: string // 'MOTION_WORK' (internal key, unique)
  label: string // 'Motion Work' (display name)
  icon: string // 'Video' (Lucide icon name)
  color: string // '#007aff' (hex color)
  createdAt: Date
  updatedAt: Date
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateCategoryInput = Partial<CreateCategoryInput>
