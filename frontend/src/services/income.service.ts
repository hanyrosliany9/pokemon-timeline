import { Income, CreateIncomeDto, UpdateIncomeDto } from '@pokemon-timeline/shared'
import apiService from './api.service'
import { normalizeIncome } from '../lib/decimal-normalizer'

class IncomeService {
  async getAll(skip = 0, take = 100): Promise<Income[]> {
    const incomeList = await apiService.get(`/api/income`, {
      params: { skip, take },
    })
    return incomeList.map(normalizeIncome)
  }

  async getOne(id: string): Promise<Income> {
    const income = await apiService.get(`/api/income/${id}`)
    return normalizeIncome(income)
  }

  async create(data: CreateIncomeDto): Promise<Income> {
    const income = await apiService.post(`/api/income`, data)
    return normalizeIncome(income)
  }

  async update(id: string, data: UpdateIncomeDto): Promise<Income> {
    const income = await apiService.patch(`/api/income/${id}`, data)
    return normalizeIncome(income)
  }

  async delete(id: string): Promise<Income> {
    const income = await apiService.delete(`/api/income/${id}`)
    return normalizeIncome(income)
  }
}

export default new IncomeService()
