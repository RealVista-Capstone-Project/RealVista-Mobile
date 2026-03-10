import {
  chatKeys,
  type MessagePaginationResponse,
  type MessageResponse,
  type SendMessageResponse,
} from '@/entities/chat'
import { useAuthStore } from '@/entities/user'
import { useWebSocket } from '@/shared/lib/websocket'
import type { ApiResponse } from '@/shared/types'
import type { IMessage } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import { useCallback, useEffect } from 'react'
import { Platform } from 'react-native'

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

/**
 * Chat-specific WebSocket hook.
 * Subscribes to /user/queue/messages for incoming real-time messages
 * and invalidates relevant TanStack queries.
 */
export function useChatWebSocket() {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  const wsEndpoint = getWsEndpoint()

  const { isConnected, send, subscribe } = useWebSocket({
    endpoint: wsEndpoint,
    debug: __DEV__,
    token: token ?? undefined,
    onConnect: () => {
      console.log(`[Chat] WebSocket connected to ${wsEndpoint}`)
    },
    onError: (err) => {
      console.error('[Chat] WebSocket Error:', err)
    },
  })

  useEffect(() => {
    if (!isConnected || !token) return

    const unsubMsg = subscribe({
      destination: '/user/queue/messages',
      onMessage: (message: IMessage) => {
        try {
          const response: SendMessageResponse = JSON.parse(message.body)

          // 1. Update list query
          queryClient.invalidateQueries({ queryKey: chatKeys.list() })

          // 2. Instantly update the message list cache for snappy UI
          if (response.conversation_id) {
            const queryKey = chatKeys.messages(response.conversation_id)

            // Map SendMessageResponse back to MessageResponse format
            const newMessage: MessageResponse = {
              message_id: response.message_id,
              conversation_id: response.conversation_id,
              reply_to_message_id: response.reply_to_message_id,
              message_type: response.message_type,
              content: response.content,
              metadata: response.metadata,
              sender: response.sender,
              created_at: response.created_at || new Date().toISOString(),
            }

            queryClient.setQueryData<ApiResponse<MessagePaginationResponse>>(
              queryKey,
              (oldData) => {
                if (!oldData?.data) return oldData

                // Avoid duplicates if we already added it optimistically
                const exists = oldData.data.messages.some(
                  (m) => m.message_id === newMessage.message_id
                )
                if (exists) return oldData

                return {
                  ...oldData,
                  data: {
                    ...oldData.data,
                    // Prepend new message since the API returns newest first (descending)
                    messages: [newMessage, ...oldData.data.messages],
                  },
                }
              }
            )

            // Still invalidate to ensure cursor and future fetches are clean
            queryClient.invalidateQueries({ queryKey })
          }
        } catch (error) {
          console.error('[Chat] Failed to parse WS message:', error)
        }
      },
    })

    return () => {
      unsubMsg()
    }
  }, [isConnected, token, subscribe, queryClient])

  const sendMessage = useCallback(
    (payload: {
      conversation_id?: string
      recipientUserId: string
      message_type: string
      content: string
      metadata?: string
    }) => {
      send({
        destination: '/app/chat.send',
        body: {
          conversation_id: payload.conversation_id,
          recipient_user_id: payload.recipientUserId,
          message_type: payload.message_type,
          content: payload.content,
          metadata: payload.metadata,
        },
      })
    },
    [send]
  )

  return { isConnected, sendMessage }
}
