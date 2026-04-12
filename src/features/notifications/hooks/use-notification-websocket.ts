import { notificationKeys } from '@/entities/notification'
import { useAuthStore } from '@/entities/user'
import { useWebSocket } from '@/shared/lib/websocket'
import type { IMessage } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import { useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'

const NOTIFICATION_DESTINATION = '/user/queue/notifications'

// Keep in sync with useChatWebSocket.ts — copied from that file exactly
function getWsEndpoint(): string {
  let endpoint = process.env.EXPO_PUBLIC_WS_ENDPOINT
  console.log(endpoint)
  if (!endpoint && process.env.EXPO_PUBLIC_API_URL) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL // e.g., http://192.168.56.1:8080/api/v1
    const parts = apiUrl.split('/api/')
    endpoint = parts[0]
  }

  if (!endpoint && __DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri
    const ip = debuggerHost?.split(':')[0]
    if (ip) endpoint = `ws://${ip}:8080`
    else if (Platform.OS === 'android') endpoint = 'ws://10.0.2.2:8080'
    else endpoint = 'ws://localhost:8080'
  }

  if (!endpoint) endpoint = 'ws://your-api.com'

  // Aggressively force ws:// scheme
  endpoint = endpoint.replace(/^http/, 'ws').replace(/\/$/, '')

  // The backend uses a Native WebSocket endpoint at `/ws`
  if (!endpoint.endsWith('/ws')) {
    endpoint += '/ws'
  }

  return endpoint
}

export function useNotificationWebSocket() {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const seenIds = useRef<Set<string>>(new Set())
  const wsEndpoint = getWsEndpoint()

  const { isConnected, subscribe } = useWebSocket({
    endpoint: wsEndpoint,
    debug: __DEV__,
    token: token ?? undefined,
    onConnect: () => {
      console.log(`[Notifications] WebSocket connected to ${wsEndpoint}`)
    },
    onError: (err) => {
      console.error('[Notifications] WebSocket Error:', err)
    },
  })

  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const raw = JSON.parse(message.body) as Record<string, unknown>
        const id = ((raw.notificationId ?? raw.notification_id) as string) ?? ''
        if (!id || seenIds.current.has(id)) return
        seenIds.current.add(id)

        queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
      } catch {
        // Ignore malformed frames
      }
    },
    [queryClient]
  )

  useEffect(() => {
    if (!isConnected || !token) return

    const unsubscribe = subscribe({
      destination: NOTIFICATION_DESTINATION,
      onMessage: handleMessage,
    })

    return () => {
      unsubscribe()
    }
  }, [isConnected, token, subscribe, handleMessage])
}
