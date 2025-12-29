import { useState, useEffect } from 'react'
import { Category, CreateCategoryInput } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import categoryService from '@/services/category.service'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
}

export default function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const { showToast } = useStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    icon: 'Grid',
    color: '#3b82f6',
  })

  // Popular Lucide icon names for category selection
  const ICON_OPTIONS = [
    'Grid',
    'Video',
    'Hammer',
    'Box',
    'Cpu',
    'Wrench',
    'Package',
    'Zap',
    'Palette',
    'Camera',
    'Code',
    'Database',
    'Smartphone',
    'Monitor',
    'Layers',
    'Settings',
    'Briefcase',
    'Shield',
    'Rocket',
    'Heart',
  ]

  // Initialize form when modal opens or category changes
  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name,
        label: category.label,
        icon: category.icon,
        color: category.color,
      })
    } else if (isOpen && !category) {
      setFormData({
        name: '',
        label: '',
        icon: 'Grid',
        color: '#3b82f6',
      })
    }
  }, [category, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showToast({
        message: 'Please enter a category name (e.g., MOTION_WORK)',
        type: 'error',
      })
      return false
    }

    if (!/^[A-Z_]+$/.test(formData.name)) {
      showToast({
        message: 'Category name must be uppercase with underscores only (e.g., MOTION_WORK)',
        type: 'error',
      })
      return false
    }

    if (!formData.label.trim()) {
      showToast({
        message: 'Please enter a display label (e.g., Motion Work)',
        type: 'error',
      })
      return false
    }

    if (!formData.icon.trim()) {
      showToast({
        message: 'Please select an icon',
        type: 'error',
      })
      return false
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(formData.color)) {
      showToast({
        message: 'Please enter a valid hex color (e.g., #3b82f6)',
        type: 'error',
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const categoryData: CreateCategoryInput = {
        name: formData.name,
        label: formData.label,
        icon: formData.icon,
        color: formData.color,
      }

      if (category) {
        // Update existing category
        await categoryService.update(category.id, categoryData)
        showToast({
          message: `Category updated: ${formData.label}`,
          type: 'success',
        })
      } else {
        // Create new category
        await categoryService.create(categoryData)
        showToast({
          message: `Category created: ${formData.label}`,
          type: 'success',
        })
      }

      onClose()
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to save category',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{category ? 'Edit Category' : 'Add New Category'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name">Category Name (Internal) *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., MOTION_WORK (uppercase, underscores only)"
              disabled={!!category} // Disable name editing for existing categories
              required
            />
            <small>Used internally. Format: UPPERCASE_WITH_UNDERSCORES</small>
          </div>

          <div className="form-group">
            <label htmlFor="label">Display Label *</label>
            <input
              id="label"
              type="text"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              placeholder="e.g., Motion Work"
              required
            />
            <small>How the category appears to users</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="icon">Icon *</label>
              <select id="icon" name="icon" value={formData.icon} onChange={handleInputChange} required>
                <option value="">Select an icon</option>
                {ICON_OPTIONS.map((iconName) => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="color">Color *</label>
              <div className="color-input-wrapper">
                <input
                  id="color"
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="#3b82f6"
                  pattern="^#[0-9a-fA-F]{6}$"
                  required
                />
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="color-picker"
                  title="Pick a color"
                />
              </div>
              <small>Hex color code (e.g., #3b82f6)</small>
            </div>
          </div>

          <div className="category-preview">
            <div
              className="preview-box"
              style={{
                backgroundColor: formData.color,
              }}
            >
              <span className="preview-text">{formData.label || 'Preview'}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (category ? 'Updating...' : 'Creating...') : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
