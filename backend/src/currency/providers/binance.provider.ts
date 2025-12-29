import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { Decimal } from 'decimal.js'

@Injectable()
export class BinanceProvider {
  private readonly logger = new Logger(BinanceProvider.name)
  private readonly exchangeRateUrl = 'https://api.exchangerate-api.com/v4/latest/USD'

  /**
   * Get USDT to IDR exchange rate
   * Uses Binance for crypto rates and exchangerate-api for fiat
   */
  async getUSDTtoIDR(): Promise<Decimal | null> {
    try {
      // USDT is pegged 1:1 to USD, so we just need USD to IDR rate
      // Using free exchangerate-api.com (no key required, 1500 requests/day)
      const response = await axios.get(this.exchangeRateUrl, {
        timeout: 5000,
      })

      if (response.data?.rates?.IDR) {
        const rate = new Decimal(response.data.rates.IDR)
        this.logger.log(`USDT/IDR rate: ${rate.toString()} (via USD/IDR from exchangerate-api)`)
        return rate
      }

      return null
    } catch (error) {
      this.logger.error('Failed to fetch rate from exchangerate-api:', error.message)
      return null
    }
  }
}
