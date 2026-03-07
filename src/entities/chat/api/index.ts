import http from '@/shared/lib/http'
import type { Message, SendMessagePayload } from '../model/types'

export const chatApi = {
  /**
   * Send a message (or initiate a conversation)
   * POST /conversations/messages
   */
  sendMessage: (payload: SendMessagePayload) =>
    http.post<Message>('/conversations/messages', payload),
} as const
