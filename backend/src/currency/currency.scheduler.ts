import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { CurrencyService } from './currency.service'

@Injectable()
export class CurrencyScheduler {
  private readonly logger = new Logger(CurrencyScheduler.name)

  constructor(private currencyService: CurrencyService) {}

  /**
   * Update exchange rates every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateExchangeRates() {
    this.logger.debug('Starting scheduled exchange rate update')
    await this.currencyService.refreshRates()
  }

  /**
   * Clean up old rates every day at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldRates() {
    this.logger.debug('Starting scheduled cleanup of old exchange rates')
    await this.currencyService.cleanupOldRates(30)
  }
}
