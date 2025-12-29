import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { CurrencyService } from './currency.service'
import { CurrencyController } from './currency.controller'
import { CurrencyScheduler } from './currency.scheduler'
import { CoinGeckoProvider } from './providers/coingecko.provider'
import { BinanceProvider } from './providers/binance.provider'
import { DatabaseModule } from '@/database/database.module'
import { RedisModule } from '@/redis/redis.module'

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, RedisModule],
  controllers: [CurrencyController],
  providers: [
    CurrencyService,
    CurrencyScheduler,
    CoinGeckoProvider,
    BinanceProvider,
  ],
  exports: [CurrencyService],
})
export class CurrencyModule {}
