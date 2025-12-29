import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { Decimal } from 'decimal.js'

@Injectable()
export class CoinGeckoProvider {
  private readonly logger = new Logger(CoinGeckoProvider.name)
  private readonly baseUrl = 'https://api.coingecko.com/api/v3'

  constructor(private configService: ConfigService) {}

  /**
   * Get USDT to IDR exchange rate from CoinGecko
   */
  async getUSDTtoIDR(): Promise<Decimal | null> {
    try {
      const apiKey = this.configService.get<string>('COINGECKO_API_KEY')

      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: 'tether',
          vs_currencies: 'idr',
          x_cg_demo_api_key: apiKey || 'CG-demo-key',
        },
        timeout: 5000,
      })

      if (response.data?.tether?.idr) {
        const rate = new Decimal(response.data.tether.idr)
        this.logger.log(`CoinGecko USDT/IDR rate: ${rate.toString()}`)
        return rate
      }

      return null
    } catch (error) {
      this.logger.error('Failed to fetch rate from CoinGecko:', error.message)
      return null
    }
  }
}
