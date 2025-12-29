import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configuration } from '@/config/configuration'
import { DatabaseModule } from '@/database/database.module'
import { RedisModule } from '@/redis/redis.module'
import { ProjectModule } from '@/project/project.module'
import { EntryModule } from '@/entry/entry.module'
import { ExpenseModule } from '@/expense/expense.module'
import { IncomeModule } from '@/income/income.module'
import { CategoryModule } from '@/category/category.module'
import { CurrencyModule } from '@/currency/currency.module'
import { WebSocketModule } from '@/websocket/websocket.module'
import { TimeSyncModule } from '@/timesync/timesync.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    RedisModule,
    TimeSyncModule, // Time sync with UTC+7 and midnight cron
    ProjectModule,
    EntryModule,
    CategoryModule,
    ExpenseModule,
    IncomeModule,
    CurrencyModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
