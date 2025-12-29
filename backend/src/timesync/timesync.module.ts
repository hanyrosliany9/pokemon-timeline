import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TimeSyncService } from './timesync.service'
import { TimeSyncController } from './timesync.controller'
import { RedisModule } from '@/redis/redis.module'

/**
 * Time Sync Module
 *
 * Provides timezone-aware time synchronization for the application.
 * - Syncs with external time APIs at midnight UTC+7
 * - Caches synced time in Redis
 * - Provides endpoints to check and force sync
 */
@Module({
  imports: [ScheduleModule.forRoot(), RedisModule],
  controllers: [TimeSyncController],
  providers: [TimeSyncService],
  exports: [TimeSyncService],
})
export class TimeSyncModule {}
