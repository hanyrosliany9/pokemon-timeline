import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  private pool: Pool

  constructor() {
    // Prisma 7 requires PostgreSQL adapter
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    super({ adapter })
    this.pool = pool
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connected successfully')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    await this.pool.end()
    this.logger.log('Database disconnected')
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      this.logger.error('Health check failed:', error)
      return false
    }
  }
}
