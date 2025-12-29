import { useState } from 'react'
import { Category } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import categoryService from '@/services/category.service'
import CategoryModal from './CategoryModal'
import './CategoryManagement.css'

export default function CategoryManagement() {
  const { categories, showToast, removeCategory } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setModalOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setModalOpen(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setDeleting(true)
      await categoryService.delete(categoryId)
      removeCategory(categoryId)
      showToast('success', 'Category deleted successfully')
      setDeleteConfirm(null)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCategory(null)
  }

  return (
    <div className="category-management">
      <div className="management-header">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Expense Categories</h3>
          <p className="text-sm text-text-secondary mt-1">Manage your expense categories. These are used to organize and track your spending.</p>
        </div>
        <button className="btn-primary" onClick={handleAddCategory}>
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories yet. Create your first category to get started.</p>
        </div>
      ) : (
        <div className="categories-list">
          {categories.map((category) => (
            <div key={category.id} className="category-item">
              <div className="category-preview-small">
                <div
                  className="preview-circle"
                  style={{
                    backgroundColor: category.color,
                  }}
                >
                  <span className="preview-initial">{category.label.charAt(0).toUpperCase()}</span>
                </div>
              </div>

              <div className="category-info">
                <div className="category-name">{category.label}</div>
                <div className="category-meta">
                  <span className="badge">{category.name}</span>
                  <span className="icon-name">Icon: {category.icon}</span>
                </div>
              </div>

              <div className="category-actions">
                {deleteConfirm === category.id ? (
                  <div className="delete-confirm">
                    <p>Are you sure? This cannot be undone.</p>
                    <div className="confirm-buttons">
                      <button
                        className="btn-cancel"
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deleting}
                      >
                        No, Keep It
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditCategory(category)}
                      title="Edit category"
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete-icon"
                      onClick={() => setDeleteConfirm(category.id)}
                      title="Delete category"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal isOpen={modalOpen} onClose={handleCloseModal} category={selectedCategory} />
    </div>
  )
}
