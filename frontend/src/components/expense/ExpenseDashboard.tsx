import { useState } from 'react'
import { useStore } from '@/store/store'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import ExpenseList from './ExpenseList'
import IncomeList from './IncomeList'
import ExpenseStats from './ExpenseStats'
import ExpenseCharts from './ExpenseCharts'
import ExpenseFilters from './ExpenseFilters'
import AddExpenseDialog from './AddExpenseDialog'
import AddIncomeDialog from './AddIncomeDialog'
import WalletBalance from './WalletBalance'
import { Button } from '@/components/ui/button'

export default function ExpenseDashboard() {
  const { expenses, income } = useStore()
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false)
  const [showAddIncomeDialog, setShowAddIncomeDialog] = useState(false)

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'e',
      ctrl: true,
      handler: () => setShowAddExpenseDialog(true),
      description: 'Add new expense',
    },
    {
      key: 'i',
      ctrl: true,
      handler: () => setShowAddIncomeDialog(true),
      description: 'Add new income',
    },
  ])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">Track all project expenses in USDT and IDR</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddIncomeDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            title="Add new income (Ctrl+I)"
            aria-label="Add income (Ctrl+I)"
          >
            + Add Income
          </Button>
          <Button
            onClick={() => setShowAddExpenseDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            title="Add new expense (Ctrl+E)"
            aria-label="Add expense (Ctrl+E)"
          >
            + Add Expense
          </Button>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <WalletBalance currency="USDT" />
        <WalletBalance currency="IDR" />
      </div>

      {/* Stats Section */}
      <ExpenseStats />

      {/* Recent Income List */}
      {income.length > 0 && <IncomeList income={income} />}

      {/* Recent Expenses List */}
      <ExpenseList expenses={expenses} />

      {/* Filters Section */}
      <ExpenseFilters />

      {/* Charts Section */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Analytics</h3>
        <ExpenseCharts />
      </div>

      <AddExpenseDialog isOpen={showAddExpenseDialog} onClose={() => setShowAddExpenseDialog(false)} />
      <AddIncomeDialog isOpen={showAddIncomeDialog} onClose={() => setShowAddIncomeDialog(false)} />
    </div>
  )
}
