import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { RedisService } from '@/redis/redis.service'
import { WebSocketEvent } from '@pokemon-timeline/shared'

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server

  private readonly logger = new Logger(SocketGateway.name)
  private connectedClients = new Set<string>()

  constructor(
    private redis: RedisService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized')
    this.setupRedisSubscriptions()
  }

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id)
    this.logger.log(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`)

    // Send connection confirmation
    client.emit(WebSocketEvent.CONNECTION_ESTABLISHED, {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    })
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id)
    this.logger.log(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`)
  }

  /**
   * Setup Redis subscriptions to relay events to all connected WebSocket clients
   */
  private setupRedisSubscriptions() {
    const redisSubscriber = this.redis.getSubscriber()

    // Check if Redis subscriber is initialized
    if (!redisSubscriber) {
      this.logger.warn('Redis subscriber not initialized yet, retrying in 1 second...')
      setTimeout(() => this.setupRedisSubscriptions(), 1000)
      return
    }

    // Subscribe to all relevant channels
    const channels = [
      'category:created',
      'category:updated',
      'category:deleted',
      'project:created',
      'project:updated',
      'project:deleted',
      'entry:created',
      'entry:updated',
      'entry:deleted',
      'expense:created',
      'expense:updated',
      'expense:deleted',
      'income:created',
      'income:updated',
      'income:deleted',
      'currency:refreshed',
    ]

    channels.forEach((channel) => {
      redisSubscriber.subscribe(channel, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to channel ${channel}:`, err)
        } else {
          this.logger.log(`Subscribed to Redis channel: ${channel}`)
        }
      })
    })

    // Handle messages from Redis
    redisSubscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message)

        // Map Redis channel to WebSocket event
        let event: WebSocketEvent
        switch (channel) {
          case 'category:created':
            event = WebSocketEvent.CATEGORY_CREATED
            break
          case 'category:updated':
            event = WebSocketEvent.CATEGORY_UPDATED
            break
          case 'category:deleted':
            event = WebSocketEvent.CATEGORY_DELETED
            break
          case 'project:created':
            event = WebSocketEvent.PROJECT_CREATED
            break
          case 'project:updated':
            event = WebSocketEvent.PROJECT_UPDATED
            break
          case 'project:deleted':
            event = WebSocketEvent.PROJECT_DELETED
            break
          case 'entry:created':
            event = WebSocketEvent.ENTRY_CREATED
            break
          case 'entry:updated':
            event = WebSocketEvent.ENTRY_UPDATED
            break
          case 'entry:deleted':
            event = WebSocketEvent.ENTRY_DELETED
            break
          case 'expense:created':
            event = WebSocketEvent.EXPENSE_CREATED
            break
          case 'expense:updated':
            event = WebSocketEvent.EXPENSE_UPDATED
            break
          case 'expense:deleted':
            event = WebSocketEvent.EXPENSE_DELETED
            break
          case 'income:created':
            event = WebSocketEvent.INCOME_CREATED
            break
          case 'income:updated':
            event = WebSocketEvent.INCOME_UPDATED
            break
          case 'income:deleted':
            event = WebSocketEvent.INCOME_DELETED
            break
          case 'currency:refreshed':
            event = WebSocketEvent.CURRENCY_REFRESHED
            break
          default:
            return
        }

        // Broadcast to all connected clients
        this.server.emit(event, {
          event,
          data,
          timestamp: new Date().toISOString(),
        })

        this.logger.debug(
          `Broadcasted ${event} to ${this.connectedClients.size} clients`,
        )
      } catch (error) {
        this.logger.error(`Error processing Redis message from ${channel}:`, error)
      }
    })
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastEvent(event: WebSocketEvent, data: any) {
    this.server.emit(event, {
      event,
      data,
      timestamp: new Date().toISOString(),
    })

    this.logger.debug(
      `Broadcasted ${event} to ${this.connectedClients.size} clients`,
    )
  }

  /**
   * Get number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size
  }
}
