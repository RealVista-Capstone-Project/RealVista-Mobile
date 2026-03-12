/**
 * Query keys factory for Chat entity
 */

export const chatKeys = {
  all: ['conversations'] as const,
  list: () => [...chatKeys.all, 'list'] as const,
  detail: (id: string) => [...chatKeys.all, 'detail', id] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
} as const
