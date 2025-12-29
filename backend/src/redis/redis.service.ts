import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private publisher: Redis
  private subscriber: Redis

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://redis:6379'

    this.publisher = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError: (err) => {
        if (err.message.includes('READONLY')) {
          return true
        }
        return false
      },
    })

    this.subscriber = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    this.publisher.on('error', (err) => {
      this.logger.error('Redis Publisher Error:', err)
    })

    this.subscriber.on('error', (err) => {
      this.logger.error('Redis Subscriber Error:', err)
    })

    this.logger.log('Redis connected successfully')
  }

  async onModuleDestroy() {
    await this.publisher.quit()
    await this.subscriber.quit()
    this.logger.log('Redis disconnected')
  }

  /**
   * Publish message to a channel
   */
  async publish(channel: string, message: any): Promise<void> {
    try {
      await this.publisher.publish(channel, JSON.stringify(message))
    } catch (error) {
      this.logger.error(`Failed to publish to channel ${channel}:`, error)
      throw error
    }
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel)
      this.subscriber.on('message', (ch, msg) => {
        if (ch === channel) {
          try {
            callback(JSON.parse(msg))
          } catch (error) {
            this.logger.error(`Failed to parse message from channel ${channel}:`, error)
          }
        }
      })
    } catch (error) {
      this.logger.error(`Failed to subscribe to channel ${channel}:`, error)
      throw error
    }
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.publisher.get(key)
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error)
      return null
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)
      if (ttlSeconds) {
        await this.publisher.setex(key, ttlSeconds, jsonValue)
      } else {
        await this.publisher.set(key, jsonValue)
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error)
      throw error
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.publisher.del(key)
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error)
      throw error
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.publisher.exists(key)
      return result === 1
    } catch (error) {
      this.logger.error(`Failed to check if key ${key} exists:`, error)
      return false
    }
  }

  /**
   * Get publisher instance (for advanced usage)
   */
  getPublisher(): Redis {
    return this.publisher
  }

  /**
   * Get subscriber instance (for advanced usage)
   */
  getSubscriber(): Redis {
    return this.subscriber
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.publisher.ping()
      return true
    } catch (error) {
      this.logger.error('Redis health check failed:', error)
      return false
    }
  }
}
