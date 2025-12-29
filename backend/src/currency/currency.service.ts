import { Injectable, Logger } from '@nestjs/common'
import { Decimal } from 'decimal.js'
import { PrismaService } from '@/database/prisma.service'
import { RedisService } from '@/redis/redis.service'
// import { CoinGeckoProvider } from './providers/coingecko.provider'
import { BinanceProvider } from './providers/binance.provider'

const CACHE_KEY = 'currency:USDT:IDR'
const CACHE_TTL = 5 * 60 // 5 minutes in seconds

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name)

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    // CoinGecko no longer has free tier, keeping for potential future use
    // private coingecko: CoinGeckoProvider,
    private binance: BinanceProvider,
  ) {}

  /**
   * Get current USDT to IDR exchange rate
   * Implements 3-layer caching strategy
   */
  async getRate(): Promise<{
    rate: Decimal
    provider: string
    timestamp: string
    cacheAge?: string
  }> {
    try {
      // Layer 1: Check Redis cache
      const cachedRate = await this.redis.get(CACHE_KEY)
      if (cachedRate) {
        const data = JSON.parse(cachedRate)
        this.logger.log('Rate from Redis cache')
        return {
          rate: new Decimal(data.rate),
          provider: data.provider,
          timestamp: data.timestamp,
          cacheAge: '< 5 minutes',
        }
      }

      // Layer 2: Check PostgreSQL cache
      const dbCache = await this.prisma.currencyCache.findUnique({
        where: { fromCurrency_toCurrency: { fromCurrency: 'USDT', toCurrency: 'IDR' } },
      })

      if (dbCache && new Date(dbCache.expiresAt) > new Date()) {
        this.logger.log('Rate from database cache')
        await this.redis.set(CACHE_KEY, {
          rate: dbCache.rate.toString(),
          provider: dbCache.provider,
          timestamp: new Date().toISOString(),
        }, CACHE_TTL)

        return {
          rate: dbCache.rate,
          provider: dbCache.provider,
          timestamp: dbCache.updatedAt.toISOString(),
          cacheAge: '< 1 hour',
        }
      }

      // Layer 3: Call external API
      const rate = await this.fetchRateFromAPI()
      if (!rate) {
        this.logger.warn('Failed to fetch rate from external APIs, using default')
        // Fallback to default rate
        return {
          rate: new Decimal(15500),
          provider: 'fallback',
          timestamp: new Date().toISOString(),
        }
      }

      // Store in Redis
      await this.redis.set(CACHE_KEY, {
        rate: rate.toString(),
        provider: 'exchangerate-api',
        timestamp: new Date().toISOString(),
      }, CACHE_TTL)

      // Store in database
      await this.prisma.currencyCache.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: 'USDT', toCurrency: 'IDR' } },
        update: {
          rate,
          provider: 'exchangerate-api',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
        create: {
          fromCurrency: 'USDT',
          toCurrency: 'IDR',
          rate,
          provider: 'exchangerate-api',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      })

      // Store in history
      await this.prisma.exchangeRate.create({
        data: {
          fromCurrency: 'USDT',
          toCurrency: 'IDR',
          rate,
          provider: 'exchangerate-api',
          timestamp: new Date(),
        },
      })

      this.logger.log('Rate from external API (exchangerate-api)')
      return {
        rate,
        provider: 'exchangerate-api',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      this.logger.error('Failed to get exchange rate:', error)
      throw error
    }
  }

  /**
   * Fetch rate from external APIs with fallback
   */
  private async fetchRateFromAPI(): Promise<Decimal | null> {
    // Try free exchangerate-api via Binance provider (no API key needed)
    let rate = await this.binance.getUSDTtoIDR()
    if (rate) {
      return rate
    }

    // CoinGecko no longer offers free API, skip it
    // Keeping the provider for potential future paid usage
    // rate = await this.coingecko.getUSDTtoIDR()

    return null
  }

  /**
   * Convert amount from one currency to another
   */
  async convertAmount(amount: Decimal, fromCurrency: string, toCurrency: string): Promise<Decimal> {
    try {
      if (fromCurrency === toCurrency) {
        return amount
      }

      if (fromCurrency === 'USDT' && toCurrency === 'IDR') {
        const rateData = await this.getRate()
        return amount.times(rateData.rate)
      }

      if (fromCurrency === 'IDR' && toCurrency === 'USDT') {
        const rateData = await this.getRate()
        return amount.dividedBy(rateData.rate)
      }

      throw new Error(`Unsupported currency pair: ${fromCurrency} -> ${toCurrency}`)
    } catch (error) {
      this.logger.error('Failed to convert amount:', error)
      throw error
    }
  }

  /**
   * Refresh exchange rates (called by scheduler)
   */
  async refreshRates(): Promise<void> {
    try {
      const rate = await this.fetchRateFromAPI()

      if (!rate) {
        this.logger.warn('Failed to refresh rates from external APIs')
        return
      }

      // Update Redis cache
      await this.redis.set(CACHE_KEY, {
        rate: rate.toString(),
        provider: 'coingecko',
        timestamp: new Date().toISOString(),
      }, CACHE_TTL)

      // Update database cache
      await this.prisma.currencyCache.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: 'USDT', toCurrency: 'IDR' } },
        update: {
          rate,
          provider: 'coingecko',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
        create: {
          fromCurrency: 'USDT',
          toCurrency: 'IDR',
          rate,
          provider: 'coingecko',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      })

      // Store in history
      await this.prisma.exchangeRate.create({
        data: {
          fromCurrency: 'USDT',
          toCurrency: 'IDR',
          rate,
          provider: 'coingecko',
          timestamp: new Date(),
        },
      })

      // Publish to Redis subscribers
      await this.redis.publish('currency:refreshed', {
        fromCurrency: 'USDT',
        toCurrency: 'IDR',
        rate: rate.toString(),
        provider: 'coingecko',
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Exchange rates refreshed: 1 USDT = ${rate.toString()} IDR`)
    } catch (error) {
      this.logger.error('Failed to refresh exchange rates:', error)
    }
  }

  /**
   * Clean up old exchange rate records
   */
  async cleanupOldRates(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await this.prisma.exchangeRate.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      })

      this.logger.log(`Cleaned up ${result.count} old exchange rate records`)
    } catch (error) {
      this.logger.error('Failed to cleanup old rates:', error)
    }
  }
}
