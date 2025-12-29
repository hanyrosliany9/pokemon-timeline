import { Module } from '@nestjs/common'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'
import { DatabaseModule } from '@/database/database.module'
import { RedisModule } from '@/redis/redis.module'

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
