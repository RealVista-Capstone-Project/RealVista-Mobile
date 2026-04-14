import { billingKeys } from '@/entities/billing'
import { notificationKeys } from '@/entities/notification'
import type { NotificationWsPayload } from '@/entities/notification'
import { useAuthStore } from '@/entities/user'
import { NotificationService } from '@/shared/services/notification'
import { useWebSocket } from '@/shared/lib/websocket'
import type { IMessage } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'

const NOTIFICATION_DESTINATION = '/user/queue/notifications'

// Exported for unit testing only — do not import from outside this module
export function getWsEndpointForTest(): string {
  return getWsEndpoint()
}

// Exported for unit testing only
export function buildDedupIdForTest(raw: NotificationWsPayload): string {
  return buildDedupId(raw)
}

function getWsEndpoint(): string {
  let endpoint = process.env.EXPO_PUBLIC_WS_ENDPOINT
  if (!endpoint && process.env.EXPO_PUBLIC_API_URL) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL // e.g., http://192.168.56.1:8080/api/v1
    const parts = apiUrl.split('/api/')
    endpoint = parts[0]
  }

  if (!endpoint && __DEV__) {
    if (Platform.OS === 'android') endpoint = 'ws://10.0.2.2:8080'
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

function buildDedupId(raw: NotificationWsPayload): string {
  return raw.notification_id ?? ''
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
    async (message: IMessage) => {
      try {
        const raw = JSON.parse(message.body) as NotificationWsPayload

        // Deduplicate using only snake_case notification_id
        const id = buildDedupId(raw)
        if (id) {
          if (seenIds.current.has(id)) return
          seenIds.current.add(id)
        } else if (__DEV__) {
          console.warn('[Notifications] WS frame missing notification_id — skipping dedup', raw)
        }

        queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })

        // Show foreground local notification
        await NotificationService.scheduleLocalNotification(raw.title, raw.message)

        // Invalidate quota when a 3D generation event arrives
        const is3dEvent =
          raw.event_type === 'PROPERTY_3D_GENERATED' || raw.event_type === 'PROPERTY_3D_FAILED'
        if (is3dEvent) {
          queryClient.invalidateQueries({ queryKey: billingKeys.mySubscriptions() })
        }
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
