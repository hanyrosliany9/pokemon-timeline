import { Module } from '@nestjs/common'
import { IncomeService } from './income.service'
import { IncomeController } from './income.controller'
import { DatabaseModule } from '@/database/database.module'
import { RedisModule } from '@/redis/redis.module'

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
