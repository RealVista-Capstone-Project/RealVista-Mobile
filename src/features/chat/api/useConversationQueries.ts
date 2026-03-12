import {
  chatApi,
  chatKeys,
  type ConversationListItem,
  type MessagePaginationResponse,
} from '@/entities/chat'
import type { ApiResponse } from '@/shared/types'
import { useQuery } from '@tanstack/react-query'

/** Fetch all user conversations */
export function useConversations() {
  return useQuery<ApiResponse<ConversationListItem[]>>({
    queryKey: chatKeys.list(),
    queryFn: () => chatApi.getConversations(),
  })
}

/** Fetch messages for a specific conversation */
export function useMessages(conversationId: string | null) {
  return useQuery<ApiResponse<MessagePaginationResponse>>({
    queryKey: chatKeys.messages(conversationId ?? ''),
    queryFn: () => chatApi.getMessages(conversationId!),
    enabled: !!conversationId,
  })
}
