import { Module } from '@nestjs/common'
import { ExpenseService } from './expense.service'
import { ExpenseController } from './expense.controller'
import { DatabaseModule } from '@/database/database.module'
import { RedisModule } from '@/redis/redis.module'

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
