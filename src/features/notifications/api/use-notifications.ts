import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { notificationQueries, useMarkAsRead, useMarkAllAsRead } from '@/entities/notification'

/**
 * Feature Hook: Get Notifications List
 * Provides notifications with pagination and mark-as-read functionality.
 *
 * Backend returns Spring Page-style response:
 *   { content, page, size, total_elements, total_pages }
 *
 * page param is 0-indexed (Spring convention)
 */
export function useNotifications(page = 0, size = 20) {
  const query = useQuery(notificationQueries.list(page, size))
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  return useMemo(
    () => ({
      notifications: query.data?.content ?? [],
      totalElements: query.data?.total_elements ?? 0,
      totalPages: query.data?.total_pages ?? 0,
      page: query.data?.page ?? page,
      size: query.data?.size ?? size,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
      markAsRead: markAsRead.mutate,
      markAllAsRead: markAllAsRead.mutate,
      isMarkingAsRead: markAsRead.isPending,
      isMarkingAllAsRead: markAllAsRead.isPending,
    }),
    [query, markAsRead, markAllAsRead, page, size]
  )
}

/**
 * Feature Hook: Get Unread Notification Count
 *
 * The backend has no dedicated unread-count endpoint.
 * Count is derived client-side from the notification list already in cache.
 */
export function useUnreadCount() {
  const query = useQuery(notificationQueries.list(0, 100))

  return useMemo(() => {
    const unreadCount = query.data?.content?.filter((n) => !n.is_read).length ?? 0

    return {
      count: unreadCount,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
    }
  }, [query])
}
