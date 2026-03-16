import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from './index'
import { notificationKeys } from './keys'
import { NotificationListResponseSchema } from '../model/schema'

/**
 * Notification Query Factory
 * TanStack Query v5 queryOptions for type-safe queries
 */
export const notificationQueries = {
  /**
   * Get paginated list of notifications
   */
  list: (page = 1, limit = 20) =>
    queryOptions({
      queryKey: notificationKeys.list(page),
      queryFn: async () => {
        const res = await notificationApi.getNotifications(page, limit)

        // Validate response with Zod
        const validated = NotificationListResponseSchema.safeParse(res.data)

        if (!validated.success) {
          console.error('Invalid notification list response:', validated.error)
          throw new Error('Invalid notification data received')
        }

        return validated.data
      },
      enabled: true,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Mobile doesn't need this
      refetchOnReconnect: true, // Important for mobile
    }),

  /**
   * Get unread notification count
   */
  unreadCount: () =>
    queryOptions({
      queryKey: notificationKeys.unreadCount(),
      queryFn: async () => {
        const res = await notificationApi.getUnreadCount()
        return res.data.count
      },
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchInterval: 60 * 1000, // Refresh every minute
      retry: 2,
    }),
} as const

/**
 * Mutation: Mark notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() })

      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((notification: any) =>
            notification.notification_id === notificationId
              ? { ...notification, is_read: true }
              : notification
          ),
        }
      })
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
    onError: (error, notificationId, context) => {
      console.error('Failed to mark notification as read:', error)
      // Rollback optimistic update on error
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })
}

/**
 * Mutation: Mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
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
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
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
