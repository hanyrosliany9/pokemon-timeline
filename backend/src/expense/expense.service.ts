import { Injectable, Logger } from '@nestjs/common'
import { Decimal } from 'decimal.js'
import { PrismaService } from '@/database/prisma.service'
import { RedisService } from '@/redis/redis.service'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { Expense, Currency as PrismaCurrency } from '@prisma/client'

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name)

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Get all expenses
   */
  async findAll(skip = 0, take = 100): Promise<Expense[]> {
    try {
      return await this.prisma.expense.findMany({
        skip,
        take,
        orderBy: { expenseDate: 'desc' },
        include: {
          exchangeRate: true,
          category: true,
        },
      })
    } catch (error) {
      this.logger.error('Failed to fetch expenses:', error)
      throw error
    }
  }

  /**
   * Get a single expense by ID
   */
  async findOne(id: string): Promise<Expense | null> {
    try {
      return await this.prisma.expense.findUnique({
        where: { id },
        include: {
          exchangeRate: true,
          category: true,
        },
      })
    } catch (error) {
      this.logger.error(`Failed to fetch expense ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new expense
   */
  async create(createDto: CreateExpenseDto): Promise<Expense> {
    try {
      // Validate category exists
      const category = await this.prisma.category.findUnique({
        where: { id: createDto.categoryId },
      })
      if (!category) {
        throw new Error(`Category ${createDto.categoryId} not found`)
      }

      const amount = new Decimal(createDto.amount)

      // Get current exchange rate
      const rate = await this.getExchangeRate()

      // Calculate converted amounts
      let amountUSDT = new Decimal(0)
      let amountIDR = new Decimal(0)

      if (createDto.currency === 'USDT') {
        amountUSDT = amount
        amountIDR = amount.times(rate)
      } else {
        amountIDR = amount
        amountUSDT = amount.dividedBy(rate)
      }

      const expense = await this.prisma.expense.create({
        data: {
          description: createDto.description,
          categoryId: createDto.categoryId,
          amount: amount,
          currency: createDto.currency as PrismaCurrency,
          amountUSDT,
          amountIDR,
          projectId: createDto.projectId,
          expenseDate: createDto.expenseDate || new Date(),
          notes: createDto.notes,
          receiptUrl: createDto.receiptUrl,
          tags: createDto.tags || [],
        },
        include: { category: true },
      })

      // Publish event to Redis
      await this.redis.publish('expense:created', {
        expense,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Expense created: ${expense.id}`)
      return expense
    } catch (error) {
      this.logger.error('Failed to create expense:', error)
      throw error
    }
  }

  /**
   * Update an expense
   */
  async update(id: string, updateDto: UpdateExpenseDto): Promise<Expense> {
    try {
      const existingExpense = await this.prisma.expense.findUnique({
        where: { id },
      })

      if (!existingExpense) {
        throw new Error(`Expense ${id} not found`)
      }

      // Validate category exists if provided
      if (updateDto.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: updateDto.categoryId },
        })
        if (!category) {
          throw new Error(`Category ${updateDto.categoryId} not found`)
        }
      }

      const amount = updateDto.amount ? new Decimal(updateDto.amount) : existingExpense.amount
      const currency = updateDto.currency || existingExpense.currency

      // Get current exchange rate
      const rate = await this.getExchangeRate()

      // Calculate converted amounts
      let amountUSDT = new Decimal(0)
      let amountIDR = new Decimal(0)

      if (currency === 'USDT') {
        amountUSDT = amount
        amountIDR = amount.times(rate)
      } else {
        amountIDR = amount
        amountUSDT = amount.dividedBy(rate)
      }

      const expense = await this.prisma.expense.update({
        where: { id },
        data: {
          description: updateDto.description,
          categoryId: updateDto.categoryId,
          amount: updateDto.amount ? new Decimal(updateDto.amount) : undefined,
          currency: currency as any,
          amountUSDT,
          amountIDR,
          projectId: updateDto.projectId,
          expenseDate: updateDto.expenseDate,
          notes: updateDto.notes,
          receiptUrl: updateDto.receiptUrl,
          tags: updateDto.tags,
        },
        include: { category: true },
      })

      // Publish event to Redis
      await this.redis.publish('expense:updated', {
        expense,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Expense updated: ${id}`)
      return expense
    } catch (error) {
      this.logger.error(`Failed to update expense ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete an expense
   */
  async remove(id: string): Promise<Expense> {
    try {
      const expense = await this.prisma.expense.delete({
        where: { id },
      })

      // Publish event to Redis
      await this.redis.publish('expense:deleted', {
        expense,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Expense deleted: ${id}`)
      return expense
    } catch (error) {
      this.logger.error(`Failed to delete expense ${id}:`, error)
      throw error
    }
  }

  /**
   * Get expense statistics
   */
  async getStats() {
    try {
      const expenses = await this.prisma.expense.findMany({
        include: { category: true },
      })

      const totalUSDT = expenses.reduce((sum, exp) => sum.plus(exp.amountUSDT), new Decimal(0))
      const totalIDR = expenses.reduce((sum, exp) => sum.plus(exp.amountIDR), new Decimal(0))
      const averageUSDT = expenses.length > 0 ? totalUSDT.dividedBy(expenses.length) : new Decimal(0)
      const averageIDR = expenses.length > 0 ? totalIDR.dividedBy(expenses.length) : new Decimal(0)

      // Group by category
      const byCategory: Record<string, any> = {}
      expenses.forEach((exp) => {
        if (!byCategory[exp.categoryId]) {
          byCategory[exp.categoryId] = {
            categoryId: exp.categoryId,
            categoryName: exp.category?.label || 'Unknown',
            count: 0,
            totalUSDT: new Decimal(0),
            totalIDR: new Decimal(0),
          }
        }
        byCategory[exp.categoryId].count++
        byCategory[exp.categoryId].totalUSDT = byCategory[exp.categoryId].totalUSDT.plus(
          exp.amountUSDT,
        )
        byCategory[exp.categoryId].totalIDR = byCategory[exp.categoryId].totalIDR.plus(exp.amountIDR)
      })

      return {
        totalExpenseUSDT: totalUSDT.toString(),
        totalExpenseIDR: totalIDR.toString(),
        averageExpenseUSDT: averageUSDT.toString(),
        averageExpenseIDR: averageIDR.toString(),
        expenseCount: expenses.length,
        byCategory: Object.values(byCategory),
      }
    } catch (error) {
      this.logger.error('Failed to fetch expense statistics:', error)
      throw error
    }
  }

  /**
   * Get exchange rate (delegates to CurrencyService)
   */
  private async getExchangeRate(): Promise<Decimal> {
    try {
      // Get latest exchange rate from database
      const rate = await this.prisma.exchangeRate.findFirst({
        where: {
          fromCurrency: 'USDT',
          toCurrency: 'IDR',
        },
        orderBy: { timestamp: 'desc' },
      })

      if (rate) {
        return new Decimal(rate.rate)
      }

      // Default rate if none found
      return new Decimal(15500)
    } catch (error) {
      this.logger.error('Failed to get exchange rate:', error)
      return new Decimal(15500)
    }
  }
}
