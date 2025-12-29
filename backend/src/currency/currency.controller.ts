import { Controller, Get, Post, Body } from '@nestjs/common'
import { CurrencyService } from './currency.service'
import { Decimal } from 'decimal.js'

@Controller('api/currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('rate')
  async getRate() {
    const rateData = await this.currencyService.getRate()
    return {
      fromCurrency: 'USDT',
      toCurrency: 'IDR',
      rate: rateData.rate.toString(),
      provider: rateData.provider,
      timestamp: rateData.timestamp,
      cacheAge: rateData.cacheAge,
    }
  }

  @Post('convert')
  async convert(@Body() body: { amount: string; fromCurrency: string; toCurrency: string }) {
    const amount = new Decimal(body.amount)
    const converted = await this.currencyService.convertAmount(
      amount,
      body.fromCurrency,
      body.toCurrency,
    )

    return {
      originalAmount: body.amount,
      fromCurrency: body.fromCurrency,
      convertedAmount: converted.toString(),
      toCurrency: body.toCurrency,
      timestamp: new Date().toISOString(),
    }
  }
}
