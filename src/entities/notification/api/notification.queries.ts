import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Notification, PaginatedNotificationResponse } from '../model/types'
import { notificationApi } from './index'
import { notificationKeys } from './keys'
import { PaginatedNotificationResponseSchema } from '../model/schema'

/**
 * Notification Query Factory
 * TanStack Query v5 queryOptions for type-safe queries
 *
 * Backend contract (notification-plan.md):
 *   GET /api/v1/notifications?page=0&size=20
 *   Response: { success, data: { content, page, size, total_elements, total_pages } }
 */
export const notificationQueries = {
  /**
   * Get paginated list of notifications
   * page is 0-indexed (Spring Page convention)
   */
  list: (page = 0, size = 20) =>
    queryOptions({
      queryKey: notificationKeys.list(page),
      queryFn: async (): Promise<PaginatedNotificationResponse> => {
        const res = await notificationApi.getNotifications(page, size)

        // Backend wraps data in { success, data: { content, ... } }
        const validated = PaginatedNotificationResponseSchema.safeParse(res.data)

        if (!validated.success) {
          console.error('Invalid notification list response:', validated.error)
          throw new Error('Invalid notification data received')
        }

        return validated.data as PaginatedNotificationResponse
      },
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Mobile doesn't need this
      refetchOnReconnect: true, // Important for mobile
    }),
} as const

/**
 * Mutation: Mark single notification as read
 * PUT /api/v1/notifications/{id}/read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() })

      // Optimistically update cache — mark notification as read in content[]
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (old: PaginatedNotificationResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            content: old.content.map((notification) =>
              notification.notification_id === notificationId
                ? { ...notification, is_read: true }
                : notification
            ),
          }
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
    onError: () => {
      console.error('Failed to mark notification as read')
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

/**
 * Mutation: Mark all notifications as read
 * PUT /api/v1/notifications/read-all
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() })

      // Optimistically mark all as read in cache
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (old: PaginatedNotificationResponse | undefined) => {
          if (!old) return old
          return {
            ...old,
            content: old.content.map((notification) => ({ ...notification, is_read: true })),
          }
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
    onError: () => {
      console.error('Failed to mark all notifications as read')
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

/**
 * Mutation: Delete notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

/**
 * Mutation: Send test notification
 */
export const useSendTestNotification = () => {
  return useMutation({
    mutationFn: (data: { token: string; title: string; body: string }) =>
      notificationApi.sendTestNotification(data),
    onSuccess: (response) => {
      console.log('Test notification sent:', response.data.messageId)
    },
    onError: (error) => {
      console.error('Failed to send test notification:', error)
    },
  })
}
