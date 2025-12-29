import { useState, useEffect } from 'react'
import { Income, Currency } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import incomeService from '@/services/income.service'

interface UpdateIncomeModalProps {
  isOpen: boolean
  onClose: () => void
  income: Income
}

export default function UpdateIncomeModal({ isOpen, onClose, income }: UpdateIncomeModalProps) {
  const { showToast } = useStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'USDT' as Currency,
    incomeDate: new Date().toISOString().split('T')[0],
    notes: '',
    tags: '',
  })

  // Initialize form when income changes
  useEffect(() => {
    if (income) {
      setFormData({
        description: income.description,
        amount: income.amount.toString(),
        currency: income.currency,
        incomeDate: new Date(income.incomeDate).toISOString().split('T')[0],
        notes: income.notes || '',
        tags: income.tags?.join(', ') || '',
      })
    }
  }, [income])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim() || !formData.amount) {
      showToast({
        message: 'Please fill in description and amount',
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
        currency: formData.currency,
        incomeDate: formData.incomeDate,
        notes: formData.notes || undefined,
        tags: tags.length > 0 ? tags : [],
      }

      await incomeService.update(income.id, updateData)

      showToast({
        message: `Income updated: ${formData.description}`,
        type: 'success',
      })

      onClose()
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to update income',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content update-income-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Income</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="income-form">
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              id="description"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Payment from client"
              required
            />
          </div>

          <div className="form-row">
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="incomeDate">Date *</label>
              <input
                id="incomeDate"
                type="date"
                name="incomeDate"
                value={formData.incomeDate}
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
              placeholder="Optional notes about this income"
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
              placeholder="e.g., payment, freelance, project"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
