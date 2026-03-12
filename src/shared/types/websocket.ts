import type { IMessage } from '@stomp/stompjs'

export type WebSocketState = 'idle' | 'connecting' | 'connected' | 'disconnected'

export interface WebSocketOptions {
  endpoint: string
  connectionTimeout?: number
  autoReconnect?: boolean
  reconnectDelay?: number
  maxReconnectAttempts?: number
  headers?: Record<string, string>
  debug?: boolean
}

export interface SubscriptionOptions {
  destination: string
  onMessage: (message: IMessage) => void
  id?: string
}

export interface STOMPMessage {
  destination: string
  body: unknown
  headers?: Record<string, string>
  skipAuth?: boolean
}

export interface WebSocketCallbacks {
  onConnect: () => void
  onDisconnect: () => void
  onError: (error: Error) => void
  onMessage?: (message: IMessage) => void
}

export interface StoredSubscription {
  destination: string
  callback: (message: IMessage) => void
  unsubscribe: () => void
}
