import { useState, memo } from 'react'
import { Expense, Currency } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import expenseService from '@/services/expense.service'
import { Trash2, Edit } from 'lucide-react'
import { CategoryBadge } from '@/lib/category-icons'
import UpdateExpenseModal from './UpdateExpenseModal'
import './ExpenseCard.css'

interface ExpenseCardProps {
  expense: Expense
}

function ExpenseCard({ expense }: ExpenseCardProps) {
  const { preferredCurrency, deleteExpense, showToast } = useStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const date = new Date(expense.expenseDate).toLocaleDateString()
  const amount = preferredCurrency === Currency.USDT ? expense.amountUSDT : expense.amountIDR
  const symbol = preferredCurrency === Currency.USDT ? '$' : 'Rp'

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await expenseService.delete(expense.id)
      deleteExpense(expense.id)
      showToast('success', `Expense deleted: ${expense.description}`)
      setShowDeleteConfirm(false)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to delete expense')
    } finally {
      setDeleting(false)
    }
  }

  // Fallback category if not populated - using semantic gray
  const categoryDisplay = expense.category || {
    id: '',
    name: '',
    label: 'Unknown',
    icon: 'MoreHorizontal',
    color: 'hsl(var(--text-secondary))',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return (
    <>
      <div className="expense-card">
        <div className="expense-card-inner">
          {/* Category Badge */}
          <div className="expense-category-section">
            <CategoryBadge category={categoryDisplay} />
          </div>

          {/* Content Section */}
          <div className="expense-content-section">
            <div className="expense-header">
              <h4 className="expense-description">{expense.description}</h4>
              <span className="expense-currency">{preferredCurrency}</span>
            </div>

            <p className="expense-date">{date}</p>

            {expense.notes && <p className="expense-notes">{expense.notes}</p>}

            {expense.tags && expense.tags.length > 0 && (
              <div className="expense-tags">
                {expense.tags.map((tag) => (
                  <span key={tag} className="expense-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Amount and Actions Section */}
          <div className="expense-actions-section">
            <p className="expense-amount">
              {symbol} {parseFloat(amount.toString()).toLocaleString()}
            </p>
            <div className="expense-buttons">
              <button
                className="expense-btn edit-btn"
                onClick={() => setShowEditModal(true)}
                title="Edit expense"
                aria-label="Edit expense"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="expense-btn delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete expense"
                aria-label="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="expense-delete-confirm">
            <p>Are you sure? This cannot be undone.</p>
            <div className="confirm-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Keep It
              </button>
              <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <UpdateExpenseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        expense={expense}
      />
    </>
  )
}

export default memo(ExpenseCard, (prevProps, nextProps) => {
  return prevProps.expense.id === nextProps.expense.id
})
