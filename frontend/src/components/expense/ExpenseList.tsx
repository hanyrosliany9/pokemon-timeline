import { useMemo, useState } from 'react'
import { Expense } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import ExpenseCard from './ExpenseCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ExpenseListProps {
  expenses: Expense[]
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const {
    preferredCurrency,
    categoryFilter,
    currencyFilter,
    dateRangeFilter,
    searchQuery,
    minAmount,
    maxAmount,
  } = useStore()
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  // Filter expenses based on active filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      if (categoryFilter !== 'ALL' && expense.categoryId !== categoryFilter) {
        return false
      }

      // Currency filter
      if (currencyFilter !== 'ALL' && expense.currency !== currencyFilter) {
        return false
      }

      // Search query filter (search in description and notes)
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesDescription = expense.description.toLowerCase().includes(searchLower)
        const matchesNotes = expense.notes?.toLowerCase().includes(searchLower) ?? false
        if (!matchesDescription && !matchesNotes) {
          return false
        }
      }

      // Date range filter
      if (dateRangeFilter.start || dateRangeFilter.end) {
        const expenseDate = new Date(expense.expenseDate).getTime()
        if (dateRangeFilter.start) {
          const startDate = new Date(dateRangeFilter.start).getTime()
          if (expenseDate < startDate) {
            return false
          }
        }
        if (dateRangeFilter.end) {
          const endDate = new Date(dateRangeFilter.end).getTime()
          if (expenseDate > endDate) {
            return false
          }
        }
      }

      // Amount range filter (use preferred currency for comparison)
      if (minAmount !== null || maxAmount !== null) {
        const amount =
          preferredCurrency === 'USDT'
            ? parseFloat(expense.amountUSDT.toString())
            : parseFloat(expense.amountIDR.toString())

        if (minAmount !== null && amount < minAmount) {
          return false
        }
        if (maxAmount !== null && amount > maxAmount) {
          return false
        }
      }

      return true
    })
  }, [expenses, categoryFilter, currencyFilter, dateRangeFilter, searchQuery, minAmount, maxAmount, preferredCurrency])

  // Sort filtered expenses
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      if (sortBy === 'amount') {
        const amountA =
          preferredCurrency === 'USDT' ? parseFloat(a.amountUSDT.toString()) : parseFloat(a.amountIDR.toString())
        const amountB =
          preferredCurrency === 'USDT' ? parseFloat(b.amountUSDT.toString()) : parseFloat(b.amountIDR.toString())
        return amountB - amountA
      }
      return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    })
  }, [filteredExpenses, sortBy, preferredCurrency])

  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">
          Recent Expenses {filteredExpenses.length !== expenses.length && `(${filteredExpenses.length}/${expenses.length})`}
        </h3>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'amount')}>
          <SelectTrigger className="w-40 border-border text-text-primary">
            <SelectValue className="text-text-primary" />
          </SelectTrigger>
          <SelectContent className="bg-bg-secondary border-border">
            <SelectItem value="date" className="text-text-primary">Sort by Date</SelectItem>
            <SelectItem value="amount" className="text-text-primary">Sort by Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {sortedExpenses.length === 0 ? (
          <div className="p-12 text-center bg-bg-primary rounded-lg border-2 border-dashed border-border">
            <p className="text-text-primary font-medium">
              {expenses.length === 0
                ? 'No expenses yet. Add one to get started!'
                : 'No expenses match your filters.'}
            </p>
          </div>
        ) : (
          sortedExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))
        )}
      </div>
    </div>
  )
}
