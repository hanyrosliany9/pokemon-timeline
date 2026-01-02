import { Module } from '@nestjs/common'
import { BatchService } from './batch.service'
import { BatchController } from './batch.controller'
import { DatabaseModule } from '@/database/database.module'
import { RedisModule } from '@/redis/redis.module'

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
