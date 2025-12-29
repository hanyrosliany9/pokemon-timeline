import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import { RedisService } from '@/redis/redis.service'
import { CategoryService } from '@/category/category.service'

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private categoryService: CategoryService,
  ) {}

  /**
   * Initialize default categories on app startup
   */
  async onModuleInit() {
    try {
      await this.categoryService.seedDefaults()
    } catch (error) {
      console.error('Failed to seed default categories:', error)
    }
  }

  async getHealth() {
    const dbHealth = await this.prisma.healthCheck()
    const redisHealth = await this.redis.healthCheck()

    return {
      status: dbHealth && redisHealth ? 'ok' : 'degraded',
      database: dbHealth ? 'connected' : 'disconnected',
      redis: redisHealth ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    }
  }

  getInfo() {
    return {
      name: 'Pokemon Timeline & Expense Tracker',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
    }
  }
}
