import { Currency } from '../enums/currency.enum'
import { Category } from './category.types'

export interface Expense {
  id: string
  description: string
  category?: Category
  categoryId: string
  amount: string | number
  currency: Currency
  amountUSDT: string | number
  amountIDR: string | number
  exchangeRateId?: string
  projectId?: string
  batchId?: string | null  // Optional link to rendering batch
  expenseDate: string | Date
  notes?: string
  receiptUrl?: string
  tags: string[]
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateExpenseDto {
  description: string
  categoryId: string
  amount: string | number
  currency: Currency
  projectId?: string
  batchId?: string  // Optional link to rendering batch
  expenseDate?: string | Date
  notes?: string
  receiptUrl?: string
  tags?: string[]
}

export interface UpdateExpenseDto {
  description?: string
  categoryId?: string
  amount?: string | number
  currency?: Currency
  projectId?: string
  batchId?: string | null  // Optional link to rendering batch
  expenseDate?: string | Date
  notes?: string
  receiptUrl?: string
  tags?: string[]
}

export interface ExpenseQueryDto {
  categoryId?: string
  currency?: Currency
  startDate?: string | Date
  endDate?: string | Date
  skip?: number
  take?: number
  sortBy?: 'amount' | 'expenseDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ExpenseStats {
  totalExpenseUSDT: string | number
  totalExpenseIDR: string | number
  averageExpenseUSDT: string | number
  averageExpenseIDR: string | number
  expenseCount: number
  byCategory: CategoryStats[]
  byDate: DateStats[]
}

export interface CategoryStats {
  categoryId: string
  categoryName: string
  count: number
  totalUSDT: string | number
  totalIDR: string | number
}

export interface DateStats {
  date: string
  totalUSDT: string | number
  totalIDR: string | number
  count: number
}

export interface ConvertCurrencyDto {
  amount: string | number
  fromCurrency: Currency
  toCurrency: Currency
}

export interface ConversionResult {
  amount: string | number
  fromCurrency: Currency
  toCurrency: Currency
  convertedAmount: string | number
  rate: string | number
  timestamp: string
}

export interface Income {
  id: string
  description: string
  amount: string | number
  currency: Currency
  amountUSDT: string | number
  amountIDR: string | number
  incomeDate: string | Date
  notes?: string
  tags: string[]
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateIncomeDto {
  description: string
  amount: string | number
  currency: Currency
  incomeDate?: string | Date
  notes?: string
  tags?: string[]
}

export interface UpdateIncomeDto {
  description?: string
  amount?: string | number
  currency?: Currency
  incomeDate?: string | Date
  notes?: string
  tags?: string[]
}
