/**
 * Chat Entity Types
 * Aligned with BE DTOs (snake_case from Jackson SnakeCaseStrategy)
 */

export type MessageType = 'TEXT' | 'LISTING_CARD' | 'CONTRACT_CARD' | 'SYSTEM'

export interface SenderInfo {
  user_id: string
  name: string
  avatar_url: string | null
}

export interface SendMessagePayload {
  recipient_user_id: string
  message_type: MessageType
  content: string
  metadata?: string
  reply_to_message_id?: string
}

export interface MessageResponse {
  message_id: string
  conversation_id: string
  reply_to_message_id: string | null
  message_type: MessageType
  content: string
  metadata: string | null
  sender: SenderInfo
  created_at: string
}

export interface ConversationListItem {
  conversation_id: string
  other_user: SenderInfo
  last_message: string | null
  last_message_type: string | null
  last_message_time: string | null
  unread_count: number
  created_at: string
}

export interface MessagePaginationResponse {
  messages: MessageResponse[]
  pagination: {
    has_next: boolean
    has_previous: boolean
    next_cursor: string | null
    previous_cursor: string | null
  }
}

export interface SendMessageResponse {
  message_id: string
  conversation_id: string
  sender: SenderInfo
  recipient_user_id: string
  message_type: MessageType
  content: string
  metadata: string | null
  reply_to_message_id: string | null
  created_at: string
  conversation_created: boolean
}
