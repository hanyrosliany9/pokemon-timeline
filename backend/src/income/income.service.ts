import { Injectable, Logger } from '@nestjs/common'
import { Decimal } from 'decimal.js'
import { PrismaService } from '@/database/prisma.service'
import { RedisService } from '@/redis/redis.service'
import { CreateIncomeDto } from './dto/create-income.dto'
import { UpdateIncomeDto } from './dto/update-income.dto'
import { Income, Currency as PrismaCurrency } from '@prisma/client'

@Injectable()
export class IncomeService {
  private readonly logger = new Logger(IncomeService.name)

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Get all income entries
   */
  async findAll(skip = 0, take = 100): Promise<Income[]> {
    try {
      return await this.prisma.income.findMany({
        skip,
        take,
        orderBy: { incomeDate: 'desc' },
      })
    } catch (error) {
      this.logger.error('Failed to fetch income:', error)
      throw error
    }
  }

  /**
   * Get a single income entry by ID
   */
  async findOne(id: string): Promise<Income | null> {
    try {
      return await this.prisma.income.findUnique({
        where: { id },
      })
    } catch (error) {
      this.logger.error(`Failed to fetch income ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new income entry
   */
  async create(createDto: CreateIncomeDto): Promise<Income> {
    try {
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

      // Convert incomeDate to ISO-8601 DateTime if it's a date string
      let incomeDate = createDto.incomeDate || new Date()
      if (typeof incomeDate === 'string' && incomeDate.length === 10) {
        // Convert YYYY-MM-DD to ISO-8601 DateTime
        incomeDate = new Date(incomeDate + 'T00:00:00.000Z')
      }

      const income = await this.prisma.income.create({
        data: {
          description: createDto.description,
          amount: amount,
          currency: createDto.currency as PrismaCurrency,
          amountUSDT,
          amountIDR,
          incomeDate,
          notes: createDto.notes,
          tags: createDto.tags || [],
        },
      })

      // Publish event to Redis
      await this.redis.publish('income:created', {
        income,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Income created: ${income.id}`)
      return income
    } catch (error) {
      this.logger.error('Failed to create income:', error)
      throw error
    }
  }

  /**
   * Update an income entry
   */
  async update(id: string, updateDto: UpdateIncomeDto): Promise<Income> {
    try {
      const existingIncome = await this.prisma.income.findUnique({
        where: { id },
      })

      if (!existingIncome) {
        throw new Error(`Income ${id} not found`)
      }

      const amount = updateDto.amount ? new Decimal(updateDto.amount) : existingIncome.amount
      const currency = updateDto.currency || existingIncome.currency

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

      // Convert incomeDate to ISO-8601 DateTime if it's a date string
      let incomeDate = updateDto.incomeDate
      if (typeof incomeDate === 'string' && incomeDate.length === 10) {
        // Convert YYYY-MM-DD to ISO-8601 DateTime
        incomeDate = new Date(incomeDate + 'T00:00:00.000Z')
      }

      const income = await this.prisma.income.update({
        where: { id },
        data: {
          description: updateDto.description,
          amount: updateDto.amount ? new Decimal(updateDto.amount) : undefined,
          currency: currency as any,
          amountUSDT,
          amountIDR,
          incomeDate,
          notes: updateDto.notes,
          tags: updateDto.tags,
        },
      })

      // Publish event to Redis
      await this.redis.publish('income:updated', {
        income,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Income updated: ${id}`)
      return income
    } catch (error) {
      this.logger.error(`Failed to update income ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete an income entry
   */
  async remove(id: string): Promise<Income> {
    try {
      const income = await this.prisma.income.delete({
        where: { id },
      })

      // Publish event to Redis
      await this.redis.publish('income:deleted', {
        income,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Income deleted: ${id}`)
      return income
    } catch (error) {
      this.logger.error(`Failed to delete income ${id}:`, error)
      throw error
    }
  }

  /**
   * Get exchange rate
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
