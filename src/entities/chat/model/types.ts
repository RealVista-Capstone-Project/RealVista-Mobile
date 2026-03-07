/**
 * Chat Entity Types
 * Based on API: POST /conversations/messages
 */

export type MessageType = 'TEXT' | 'LISTING_CARD'

export interface SendMessagePayload {
  recipient_user_id: string
  message_type: MessageType
  content: string
  metadata?: string
}

export interface Message {
  message_id: string
  conversation_id: string
  sender_id: string
  message_type: MessageType
  content: string
  metadata?: string
  created_at: string
}

export interface Conversation {
  conversation_id: string
  participants: string[]
  last_message?: Message
  created_at: string
  updated_at: string
}
