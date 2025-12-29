import { StateCreator } from 'zustand'
import { Expense, Income } from '@pokemon-timeline/shared'
import { Decimal } from 'decimal.js'

// Helper function to normalize serialized Decimal values
function normalizeAmount(value: any): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)

  // Handle serialized Decimal format: {s, e, d}
  if (value && typeof value === 'object' && 's' in value && 'e' in value && 'd' in value) {
    try {
      const decimal = new Decimal(0)
      Object.assign(decimal, { s: value.s, e: value.e, d: value.d })
      return decimal.toString()
    } catch {
      return '0'
    }
  }

  return String(value || 0)
}

export interface ExpenseSlice {
  expenses: Expense[]
  income: Income[]
  selectedExpense: Expense | null
  setExpenses: (expenses: Expense[]) => void
  addExpense: (expense: Expense) => void
  updateExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void
  setSelectedExpense: (expense: Expense | null) => void
  setIncome: (income: Income[]) => void
  addIncome: (income: Income) => void
  updateIncome: (income: Income) => void
  deleteIncome: (id: string) => void
  getTotalUSDT: () => string
  getTotalIDR: () => string
  getIncomeUSDT: () => string
  getIncomeIDR: () => string
  getNetBalanceUSDT: () => string
  getNetBalanceIDR: () => string
  getAverageUSDT: () => string
  getAverageIDR: () => string
}

export const createExpenseSlice: StateCreator<ExpenseSlice> = (set, get) => ({
  expenses: [],
  income: [],
  selectedExpense: null,

  setExpenses: (expenses: Expense[]) => {
    set({ expenses })
  },

  addExpense: (expense: Expense) => {
    set((state) => ({
      expenses: [expense, ...state.expenses],
    }))
  },

  updateExpense: (expense: Expense) => {
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === expense.id ? expense : e,
      ),
    }))
  },

  deleteExpense: (id: string) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }))
  },

  setSelectedExpense: (expense: Expense | null) => {
    set({ selectedExpense: expense })
  },

  setIncome: (income: Income[]) => {
    set({ income })
  },

  addIncome: (income: Income) => {
    set((state) => ({
      income: [income, ...state.income],
    }))
  },

  updateIncome: (income: Income) => {
    set((state) => ({
      income: state.income.map((inc) =>
        inc.id === income.id ? income : inc,
      ),
    }))
  },

  deleteIncome: (id: string) => {
    set((state) => ({
      income: state.income.filter((inc) => inc.id !== id),
    }))
  },

  getTotalUSDT: () => {
    const expenses = get().expenses
    const total = expenses
      .filter((exp) => exp.currency === 'USDT')
      .reduce((sum, exp) => {
        return sum.plus(new Decimal(normalizeAmount(exp.amountUSDT)))
      }, new Decimal(0))
    return total.toFixed(2)
  },

  getTotalIDR: () => {
    const expenses = get().expenses
    const total = expenses
      .filter((exp) => exp.currency === 'IDR')
      .reduce((sum, exp) => {
        return sum.plus(new Decimal(normalizeAmount(exp.amountIDR)))
      }, new Decimal(0))
    return total.toFixed(2)
  },

  getIncomeUSDT: () => {
    const income = get().income
    const total = income
      .filter((inc) => inc.currency === 'USDT')
      .reduce((sum, inc) => {
        return sum.plus(new Decimal(normalizeAmount(inc.amountUSDT)))
      }, new Decimal(0))
    return total.toFixed(2)
  },

  getIncomeIDR: () => {
    const income = get().income
    const total = income
      .filter((inc) => inc.currency === 'IDR')
      .reduce((sum, inc) => {
        return sum.plus(new Decimal(normalizeAmount(inc.amountIDR)))
      }, new Decimal(0))
    return total.toFixed(2)
  },

  getNetBalanceUSDT: () => {
    const expenseTotal = new Decimal(get().getTotalUSDT())
    const incomeTotal = new Decimal(get().getIncomeUSDT())
    return incomeTotal.minus(expenseTotal).toFixed(2)
  },

  getNetBalanceIDR: () => {
    const expenseTotal = new Decimal(get().getTotalIDR())
    const incomeTotal = new Decimal(get().getIncomeIDR())
    return incomeTotal.minus(expenseTotal).toFixed(2)
  },

  getAverageUSDT: () => {
    const expenses = get().expenses
    const usdtExpenses = expenses.filter((exp) => exp.currency === 'USDT')
    if (usdtExpenses.length === 0) return '0.00'
    const total = usdtExpenses.reduce((sum, exp) => {
      return sum.plus(new Decimal(normalizeAmount(exp.amountUSDT)))
    }, new Decimal(0))
    return total.dividedBy(usdtExpenses.length).toFixed(2)
  },

  getAverageIDR: () => {
    const expenses = get().expenses
    const idrExpenses = expenses.filter((exp) => exp.currency === 'IDR')
    if (idrExpenses.length === 0) return '0.00'
    const total = idrExpenses.reduce((sum, exp) => {
      return sum.plus(new Decimal(normalizeAmount(exp.amountIDR)))
    }, new Decimal(0))
    return total.dividedBy(idrExpenses.length).toFixed(2)
  },
})
