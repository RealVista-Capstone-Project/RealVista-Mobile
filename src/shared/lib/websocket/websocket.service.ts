import type {
  STOMPMessage,
  StoredSubscription,
  SubscriptionOptions,
  WebSocketCallbacks,
  WebSocketOptions,
  WebSocketState,
} from '@/shared/types/websocket'
import { Client, type IMessage } from '@stomp/stompjs'

interface WebSocketServiceOptions extends WebSocketOptions {
  token?: string
}

/**
 * WebSocket Service for Spring Boot STOMP over native WebSocket.
 * Adapted for React Native (no SockJS — uses raw WebSocket).
 */
export class WebSocketService {
  private client: Client | null = null
  private state: WebSocketState = 'idle'
  private options: Required<Omit<WebSocketOptions, 'headers'>> & {
    headers: WebSocketOptions['headers']
    token?: string
  }
  private callbacks: WebSocketCallbacks
  private subscriptions: Map<string, StoredSubscription> = new Map()
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null

  constructor(options: WebSocketServiceOptions & WebSocketCallbacks) {
    this.options = {
      endpoint: options.endpoint,
      token: options.token,
      connectionTimeout: options.connectionTimeout ?? 5000,
      autoReconnect: options.autoReconnect ?? true,
      reconnectDelay: options.reconnectDelay ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      headers: options.headers ?? {},
      debug: options.debug ?? false,
    }

    this.callbacks = {
      onConnect: options.onConnect,
      onDisconnect: options.onDisconnect,
      onError: options.onError,
      onMessage: options.onMessage,
    }
  }

  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') return

    this.state = 'connecting'
    this.log('Connecting to', this.options.endpoint)

    this.connectionTimeoutTimer = setTimeout(() => {
      if (this.state === 'connecting') {
        this.handleConnectionError(
          new Error('Connection timeout (10000ms) - Is the backend WS port open?')
        )
      }
    }, this.options.connectionTimeout || 10000)

    try {
      // Convert http(s) to ws(s) for native WebSocket
      const wsUrl = this.options.endpoint.replace(/^http/, 'ws').replace(/\/$/, '')

      this.client = new Client({
        // React Native requires a webSocketFactory to use its native WebSocket API.
        // brokerURL alone will sometimes incorrectly assume browser context.
        webSocketFactory: () => new WebSocket(wsUrl) as any,
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        connectHeaders: {
          ...this.getAuthHeaders(),
          ...this.options.headers,
        },
        reconnectDelay: this.options.reconnectDelay,
        // Disable heartbeats if they cause connection drops on RN, or keep them if backend enforces
        heartbeatIncoming: 0,
        heartbeatOutgoing: 0,
        debug: this.options.debug ? (str) => this.log(str) : undefined,
        onConnect: () => this.onConnected(),
        onDisconnect: () => this.onDisconnected(),
        onStompError: (frame) => this.onError(frame),
        onWebSocketClose: () => this.onDisconnected(),
        onWebSocketError: (error) => this.onError(error),
      })

      this.client.activate()
    } catch (error) {
      this.handleConnectionError(error as Error)
    }
  }

  disconnect(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }

    this.unsubscribeAll()

    if (this.client?.connected) {
      this.client.deactivate()
    }

    this.client = null
    this.state = 'disconnected'
    this.callbacks.onDisconnect()
  }

  subscribe(options: SubscriptionOptions): () => void {
    if (!this.client?.connected) return () => {}

    const { destination, onMessage, id } = options
    const subscriptionId = id || destination

    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.get(subscriptionId)?.unsubscribe()
      this.subscriptions.delete(subscriptionId)
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      this.log('Message received from', destination)
      onMessage(message)
      this.callbacks.onMessage?.(message)
    })

    const storedSubscription: StoredSubscription = {
      destination,
      callback: onMessage,
      unsubscribe: () => {
        subscription.unsubscribe()
        this.subscriptions.delete(subscriptionId)
      },
    }

    this.subscriptions.set(subscriptionId, storedSubscription)
    return storedSubscription.unsubscribe
  }

  unsubscribe(destinationOrId: string): void {
    this.subscriptions.get(destinationOrId)?.unsubscribe()
  }

  send(message: STOMPMessage): void {
    if (!this.client?.connected) return

    const { destination, body, headers = {}, skipAuth = false } = message
    const headersWithAuth = skipAuth ? headers : { ...headers, ...this.getAuthHeaders() }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
      headers: headersWithAuth,
    })
  }

  getState(): WebSocketState {
    return this.state
  }

  isConnected(): boolean {
    return this.client?.connected === true
  }

  private unsubscribeAll(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.subscriptions.clear()
  }

  private resubscribeAll(): void {
    const subs = Array.from(this.subscriptions.values())
    this.subscriptions.clear()
    subs.forEach(({ destination, callback }) => {
      this.subscribe({ destination, onMessage: callback })
    })
  }

  private onConnected(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }
    this.state = 'connected'
    this.resubscribeAll()
    this.callbacks.onConnect()
  }

  private onDisconnected(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }
    this.state = 'disconnected'
    this.callbacks.onDisconnect()
  }

  private onError(error: unknown): void {
    this.log('WebSocket error', error)
    this.handleConnectionError(error as Error)
  }

  private handleConnectionError(error: unknown): void {
    this.state = 'disconnected'
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }
    const errorObj = error instanceof Error ? error : new Error(String(error))
    this.callbacks.onError(errorObj)
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.options.token) {
      return { Authorization: `Bearer ${this.options.token}` }
    }
    return {}
  }

  private log(...args: unknown[]): void {
    if (this.options.debug) {
      console.log('[WebSocketService]', ...args)
    }
  }
}
