import { Controller, Get, Post } from '@nestjs/common'
import { TimeSyncService } from './timesync.service'
import { getTodayUTC7, getTimeUTC7, TIMEZONE_NAME } from '@pokemon-timeline/shared'

/**
 * Time Sync Controller
 * Provides endpoints to check and force time synchronization
 */
@Controller('api/time')
export class TimeSyncController {
  constructor(private readonly timeSyncService: TimeSyncService) {}

  /**
   * Get current time in UTC+7
   * Returns both synced time (from API) and local calculated time
   */
  @Get()
  async getCurrentTime() {
    const synced = await this.timeSyncService.getSyncedTime()
    const local = this.timeSyncService.getCurrentTimeLocal()
    const lastSync = await this.timeSyncService.getLastSync()
    const status = await this.timeSyncService.getSyncStatus()

    return {
      current: {
        date: getTodayUTC7(),
        time: getTimeUTC7(),
        timezone: TIMEZONE_NAME,
        utcOffset: '+07:00',
      },
      synced,
      local,
      lastSync,
      status,
    }
  }

  /**
   * Force a time sync from external API
   */
  @Post('sync')
  async forceSync() {
    const result = await this.timeSyncService.forceSync()
    return {
      message: result.success ? 'Time synced successfully' : 'Sync failed',
      ...result,
    }
  }

  /**
   * Get sync status
   */
  @Get('status')
  async getStatus() {
    const lastSync = await this.timeSyncService.getLastSync()
    const status = await this.timeSyncService.getSyncStatus()
    const synced = await this.timeSyncService.getSyncedTime()

    return {
      status,
      lastSync,
      source: synced?.source || 'unknown',
      timezone: TIMEZONE_NAME,
    }
  }
}
