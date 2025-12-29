import { Module } from '@nestjs/common'
import { SocketGateway } from './websocket.gateway'
import { RedisModule } from '@/redis/redis.module'

@Module({
  imports: [RedisModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class WebSocketModule {}
