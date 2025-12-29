import { Expense, CreateExpenseDto, UpdateExpenseDto } from '@pokemon-timeline/shared'
import apiService from './api.service'
import { normalizeExpense } from '../lib/decimal-normalizer'

class ExpenseService {
  async getAll(skip = 0, take = 100): Promise<Expense[]> {
    const expenses = await apiService.get(`/api/expense`, {
      params: { skip, take },
    })
    return expenses.map(normalizeExpense)
  }

  async getOne(id: string): Promise<Expense> {
    const expense = await apiService.get(`/api/expense/${id}`)
    return normalizeExpense(expense)
  }

  async create(data: CreateExpenseDto): Promise<Expense> {
    const expense = await apiService.post(`/api/expense`, data)
    return normalizeExpense(expense)
  }

  async update(id: string, data: UpdateExpenseDto): Promise<Expense> {
    const expense = await apiService.patch(`/api/expense/${id}`, data)
    return normalizeExpense(expense)
  }

  async delete(id: string): Promise<Expense> {
    const expense = await apiService.delete(`/api/expense/${id}`)
    return normalizeExpense(expense)
  }

  async getStats() {
    return apiService.get(`/api/expense/stats`)
  }
}

export default new ExpenseService()
