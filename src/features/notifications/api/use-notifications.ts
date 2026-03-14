import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { notificationQueries, useMarkAsRead, useMarkAllAsRead } from '@/entities/notification'

/**
 * Feature Hook: Get Notifications List
 * Provides notifications with pagination and mark-as-read functionality
 */
export function useNotifications(page = 1, limit = 20) {
  const query = useQuery(notificationQueries.list(page, limit))
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  return useMemo(
    () => ({
      notifications: query.data?.data ?? [],
      total: query.data?.total ?? 0,
      page: query.data?.page ?? page,
      limit: query.data?.limit ?? limit,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
      markAsRead: markAsRead.mutate,
      markAllAsRead: markAllAsRead.mutate,
      isMarkingAsRead: markAsRead.isPending,
      isMarkingAllAsRead: markAllAsRead.isPending,
    }),
    [query, markAsRead, markAllAsRead, page, limit]
  )
}

/**
 * Feature Hook: Get Unread Notification Count
 * Provides unread count with auto-refresh
 */
export function useUnreadCount() {
  const query = useQuery(notificationQueries.unreadCount())

  return useMemo(
    () => ({
      count: query.data ?? 0,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
    }),
    [query]
  )
}
