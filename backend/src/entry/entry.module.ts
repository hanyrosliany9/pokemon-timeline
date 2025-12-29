import { Module } from '@nestjs/common'
import { EntryController } from './entry.controller'
import { EntryService } from './entry.service'
import { DatabaseModule } from '@/database/database.module'
import { RedisModule } from '@/redis/redis.module'

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [EntryController],
  providers: [EntryService],
  exports: [EntryService],
})
export class EntryModule {}
