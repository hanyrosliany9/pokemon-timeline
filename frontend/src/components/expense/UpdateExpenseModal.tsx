import { useState, useEffect } from 'react'
import { Expense, Currency } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import expenseService from '@/services/expense.service'

interface UpdateExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense | null
}

export default function UpdateExpenseModal({ isOpen, onClose, expense }: UpdateExpenseModalProps) {
  const { showToast, categories } = useStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    currency: 'USDT' as Currency,
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
    tags: '',
  })

  // Initialize form when expense changes
  useEffect(() => {
    if (expense && isOpen) {
      // Safely parse the expense date
      let expenseDateStr = new Date().toISOString().split('T')[0]
      try {
        // Handle various date formats
        let dateValue = expense.expenseDate
        if (typeof dateValue === 'string' && dateValue) {
          expenseDateStr = new Date(dateValue).toISOString().split('T')[0]
        } else if (dateValue instanceof Date) {
          expenseDateStr = dateValue.toISOString().split('T')[0]
        } else if (typeof dateValue === 'number') {
          expenseDateStr = new Date(dateValue).toISOString().split('T')[0]
        }
        // If dateValue is an object or invalid, fallback to today's date (already set above)
      } catch (error) {
        console.warn('Invalid expense date:', error)
        // Fallback to today's date
      }

      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        categoryId: expense.categoryId,
        currency: expense.currency,
        expenseDate: expenseDateStr,
        notes: expense.notes || '',
        tags: expense.tags?.join(', ') || '',
      })
    }
  }, [expense, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!expense) return

    if (!formData.description.trim() || !formData.amount || !formData.categoryId) {
      showToast({
        message: 'Please fill in description, amount, and category',
        type: 'error',
      })
      return
    }

    try {
      setLoading(true)

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const updateData = {
        description: formData.description,
        amount: formData.amount,
        categoryId: formData.categoryId,
        currency: formData.currency,
        expenseDate: formData.expenseDate,
        notes: formData.notes || undefined,
        tags: tags.length > 0 ? tags : [],
      }

      await expenseService.update(expense.id, updateData)

      showToast({
        message: `Expense updated: ${formData.description}`,
        type: 'success',
      })

      onClose()
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to update expense',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !expense) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content update-expense-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Expense</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              id="description"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Card cropping supplies"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency *</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                <option value="USDT">USDT</option>
                <option value="IDR">IDR</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="expenseDate">Date *</label>
              <input
                id="expenseDate"
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional notes about this expense"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., urgent, pokemon, cropping"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
