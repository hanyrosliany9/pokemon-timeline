import { useState } from 'react'
import { Currency } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import incomeService from '@/services/income.service'

interface AddIncomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
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

      const incomeData = {
        description: formData.description,
        amount: formData.amount,
        currency: formData.currency,
        incomeDate: formData.incomeDate,
        notes: formData.notes || undefined,
        tags: tags.length > 0 ? tags : [],
      }

      await incomeService.create(incomeData)

      showToast({
        message: `Income added: ${formData.description}`,
        type: 'success',
      })

      setFormData({
        description: '',
        amount: '',
        currency: 'USDT',
        incomeDate: new Date().toISOString().split('T')[0],
        notes: '',
        tags: '',
      })

      onClose()
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to add income',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-income-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Income</h2>
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
              placeholder="e.g., Card sale payment"
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
              placeholder="e.g., sale, pokemon, bulk"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
