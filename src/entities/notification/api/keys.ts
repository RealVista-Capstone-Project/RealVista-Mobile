/**
 * Query keys factory for Notification entity
 * Follows TanStack Query best practices for cache management
 */

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (page: number) => [...notificationKeys.lists(), page] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
} as const
