import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { RedisService } from '@/redis/redis.service'
import axios from 'axios'
import {
  getTodayUTC7,
  getTimeUTC7,
  getDateTimeUTC7,
  TIMEZONE_ID,
  TIMEZONE_NAME,
} from '@pokemon-timeline/shared'

/**
 * Time Sync Service
 *
 * Syncs system time with external time API at midnight UTC+7.
 * Uses WorldTimeAPI (free, no API key required) as primary source,
 * with TimeAPI.io as fallback.
 *
 * The synced time is stored in Redis for quick access across the app.
 */
@Injectable()
export class TimeSyncService implements OnModuleInit {
  private readonly logger = new Logger(TimeSyncService.name)

  // Redis keys for cached time data
  private readonly REDIS_KEY_LAST_SYNC = 'timesync:last_sync'
  private readonly REDIS_KEY_SERVER_TIME = 'timesync:server_time'
  private readonly REDIS_KEY_SYNC_STATUS = 'timesync:status'

  // Free time APIs (no API key required)
  private readonly TIME_APIS = [
    {
      name: 'WorldTimeAPI',
      url: `http://worldtimeapi.org/api/timezone/${TIMEZONE_ID}`,
      parseResponse: (data: any) => ({
        datetime: data.datetime,
        date: data.datetime.split('T')[0],
        time: data.datetime.split('T')[1].split('+')[0].split('.')[0],
        timezone: data.timezone,
        utcOffset: data.utc_offset,
      }),
    },
    {
      name: 'TimeAPI.io',
      url: `https://timeapi.io/api/Time/current/zone?timeZone=${TIMEZONE_ID}`,
      parseResponse: (data: any) => ({
        datetime: `${data.date}T${data.time}`,
        date: data.date,
        time: data.time,
        timezone: data.timeZone,
        utcOffset: '+07:00',
      }),
    },
  ]

  constructor(private redis: RedisService) {}

  async onModuleInit() {
    // Sync time on startup
    this.logger.log(`Initializing Time Sync Service for ${TIMEZONE_NAME}`)
    await this.syncTime()
  }

  /**
   * Sync time at midnight UTC+7 (17:00 UTC previous day)
   * Cron: 0 0 0 * * * = At 00:00:00 every day
   *
   * Note: The cron runs in server timezone, so we calculate the offset
   * For UTC+7, midnight = 17:00 UTC previous day
   */
  @Cron('0 0 17 * * *', {
    name: 'midnight-time-sync',
    timeZone: 'UTC',
  })
  async handleMidnightSync() {
    this.logger.log('🕛 Midnight UTC+7 - Running scheduled time sync')
    await this.syncTime()

    // Publish sync event to all connected clients
    await this.redis.publish('timesync:midnight', {
      event: 'midnight',
      date: getTodayUTC7(),
      time: getTimeUTC7(),
      syncedAt: new Date().toISOString(),
    })
  }

  /**
   * Sync time from external API
   * Tries each API in order until one succeeds
   */
  async syncTime(): Promise<SyncResult> {
    for (const api of this.TIME_APIS) {
      try {
        this.logger.debug(`Attempting to sync time from ${api.name}...`)

        const response = await axios.get(api.url, {
          timeout: 5000, // 5 second timeout
        })

        const timeData = api.parseResponse(response.data)

        // Store in Redis using the publisher client
        const client = this.redis.getPublisher()
        await client.hset(this.REDIS_KEY_SERVER_TIME, {
          datetime: timeData.datetime,
          date: timeData.date,
          time: timeData.time,
          timezone: timeData.timezone,
          utcOffset: timeData.utcOffset,
          source: api.name,
          syncedAt: new Date().toISOString(),
        })

        await this.redis.set(this.REDIS_KEY_LAST_SYNC, new Date().toISOString())
        await this.redis.set(this.REDIS_KEY_SYNC_STATUS, 'success')

        this.logger.log(
          `✅ Time synced from ${api.name}: ${timeData.date} ${timeData.time} (${TIMEZONE_NAME})`,
        )

        return {
          success: true,
          source: api.name,
          data: timeData,
          syncedAt: new Date().toISOString(),
        }
      } catch (error) {
        this.logger.warn(
          `Failed to sync from ${api.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    // All APIs failed - use local calculation
    this.logger.warn('All time APIs failed, using local UTC+7 calculation')

    const localTime = {
      datetime: getDateTimeUTC7(),
      date: getTodayUTC7(),
      time: getTimeUTC7(),
      timezone: TIMEZONE_ID,
      utcOffset: '+07:00',
    }

    const client = this.redis.getPublisher()
    await client.hset(this.REDIS_KEY_SERVER_TIME, {
      ...localTime,
      source: 'local',
      syncedAt: new Date().toISOString(),
    })
    await this.redis.set(this.REDIS_KEY_LAST_SYNC, new Date().toISOString())
    await this.redis.set(this.REDIS_KEY_SYNC_STATUS, 'fallback')

    return {
      success: true,
      source: 'local',
      data: localTime,
      syncedAt: new Date().toISOString(),
      fallback: true,
    }
  }

  /**
   * Get the current synced time from Redis
   */
  async getSyncedTime(): Promise<SyncedTime | null> {
    const client = this.redis.getPublisher()
    const data = await client.hgetall(this.REDIS_KEY_SERVER_TIME)

    if (!data || Object.keys(data).length === 0) {
      return null
    }

    return {
      datetime: data.datetime,
      date: data.date,
      time: data.time,
      timezone: data.timezone,
      utcOffset: data.utcOffset,
      source: data.source,
      syncedAt: data.syncedAt,
    }
  }

  /**
   * Get the last sync timestamp
   */
  async getLastSync(): Promise<string | null> {
    return this.redis.get(this.REDIS_KEY_LAST_SYNC)
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<string | null> {
    return this.redis.get(this.REDIS_KEY_SYNC_STATUS)
  }

  /**
   * Force a time sync (useful for testing or manual refresh)
   */
  async forceSync(): Promise<SyncResult> {
    this.logger.log('Force sync requested')
    return this.syncTime()
  }

  /**
   * Get current time using local calculation (for quick access)
   * This doesn't hit Redis - just calculates UTC+7 locally
   */
  getCurrentTimeLocal(): LocalTime {
    return {
      date: getTodayUTC7(),
      time: getTimeUTC7(),
      datetime: getDateTimeUTC7(),
      timezone: TIMEZONE_ID,
      utcOffset: '+07:00',
    }
  }
}

// Types
export interface SyncedTime {
  datetime: string
  date: string
  time: string
  timezone: string
  utcOffset: string
  source: string
  syncedAt: string
}

export interface SyncResult {
  success: boolean
  source: string
  data: {
    datetime: string
    date: string
    time: string
    timezone: string
    utcOffset: string
  }
  syncedAt: string
  fallback?: boolean
}

export interface LocalTime {
  date: string
  time: string
  datetime: string
  timezone: string
  utcOffset: string
}
