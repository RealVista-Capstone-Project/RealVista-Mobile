import { useEffect, useRef, useState, useCallback } from 'react'
import type { IMessage } from '@stomp/stompjs'
import type {
  WebSocketOptions,
  WebSocketState,
  SubscriptionOptions,
  STOMPMessage,
} from '@/shared/types/websocket'
import { WebSocketService } from './websocket.service'

interface UseWebSocketOptions extends WebSocketOptions {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onMessage?: (message: IMessage) => void
  token?: string
}

/**
 * React hook for WebSocket connection management in React Native.
 */
export function useWebSocket(options: UseWebSocketOptions) {
  const serviceRef = useRef<WebSocketService | null>(null)
  const [state, setState] = useState<WebSocketState>('idle')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!options.token) {
      console.log('[useWebSocket] Waiting for auth token before connecting')
      return
    }

    const service = new WebSocketService({
      ...options,
      onConnect: () => {
        setState('connected')
        setIsConnected(true)
        options.onConnect?.()
      },
      onDisconnect: () => {
        setState('disconnected')
        setIsConnected(false)
        options.onDisconnect?.()
      },
      onError: (error) => {
        setState('disconnected')
        setIsConnected(false)
        options.onError?.(error)
      },
      onMessage: options.onMessage,
    })

    serviceRef.current = service
    service.connect()

    return () => {
      service.disconnect()
      serviceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.token])

  const subscribe = useCallback((subscriptionOptions: SubscriptionOptions) => {
    if (!serviceRef.current) return () => {}
    return serviceRef.current.subscribe(subscriptionOptions)
  }, [])

  const send = useCallback((message: STOMPMessage) => {
    if (!serviceRef.current) return
    serviceRef.current.send(message)
  }, [])

  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect()
  }, [])

  return { state, isConnected, subscribe, send, disconnect }
}
