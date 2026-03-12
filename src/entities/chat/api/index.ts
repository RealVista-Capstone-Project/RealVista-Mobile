import http from '@/shared/lib/http'
import type {
  ConversationListItem,
  MessagePaginationResponse,
  SendMessagePayload,
  SendMessageResponse,
} from '../model/types'

export const chatApi = {
  /** GET /conversations - list user conversations */
  getConversations: () => http.get<ConversationListItem[]>('/conversations'),

  /** GET /conversations/:id/messages - get messages for a conversation */
  getMessages: (
    conversationId: string,
    params?: { limit?: number; before?: string; after?: string }
  ) => http.get<MessagePaginationResponse>(`/conversations/${conversationId}/messages`, { params }),

  /** POST /conversations/messages - send a message */
  sendMessage: (payload: SendMessagePayload) =>
    http.post<SendMessageResponse>('/conversations/messages', payload),
} as const
