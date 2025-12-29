import { Module } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { DatabaseModule } from '../database/database.module'
import { RedisModule } from '../redis/redis.module'

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
