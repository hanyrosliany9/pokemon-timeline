import { io, Socket } from 'socket.io-client'
import { WebSocketEvent } from '@pokemon-timeline/shared'

class WebSocketService {
  private socket: Socket | null = null

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    const wsURL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

    this.socket = io(wsURL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: WebSocketEvent, callback: (data: any) => void): void {
    if (!this.socket) {
      this.connect()
    }
    this.socket?.on(event, callback)
  }

  off(event: WebSocketEvent, callback: (data: any) => void): void {
    this.socket?.off(event, callback)
  }

  emit(event: string, data: any): void {
    this.socket?.emit(event, data)
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export default new WebSocketService()
