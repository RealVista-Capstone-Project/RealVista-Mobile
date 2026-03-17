import http from '@/shared/lib/http'
import type {
  Notification,
  NotificationListResponse,
  PushToken,
  SendTestNotificationRequest,
  SendTestNotificationResponse,
} from '../model/types'

/**
 * Notification API Client
 * Handles all notification-related API calls
 */
export const notificationApi = {
  /**
   * Get user notifications (paginated)
   * TODO: Backend endpoint not implemented yet - placeholder for future
   * GET /api/notifications
   */
  getNotifications: (page = 1, limit = 20) =>
    http.get<NotificationListResponse>('/notifications', {
      params: { page, limit },
    }),

  /**
   * Get unread notification count
   * TODO: Backend endpoint not implemented yet - placeholder for future
   * GET /api/notifications/unread-count
   */
  getUnreadCount: () => http.get<{ count: number }>('/notifications/unread-count'),

  /**
   * Mark notification as read
   * TODO: Backend endpoint not implemented yet - placeholder for future
   * PATCH /api/notifications/:id/read
   */
  markAsRead: (notificationId: string) =>
    http.patch<Notification>(`/notifications/${notificationId}/read`),

  /**
   * Mark all notifications as read
   * TODO: Backend endpoint not implemented yet - placeholder for future
   * PATCH /api/notifications/read-all
   */
  markAllAsRead: () => http.patch<void>('/notifications/read-all'),

  /**
   * Delete notification
   * TODO: Backend endpoint not implemented yet - placeholder for future
   * DELETE /api/notifications/:id
   */
  deleteNotification: (notificationId: string) =>
    http.delete<void>(`/notifications/${notificationId}`),

  /**
   * Register push notification token
   * TODO: Backend endpoint not implemented yet - placeholder for future
   * POST /api/notifications/tokens
   */
  registerPushToken: (data: PushToken) => http.post<void>('/notifications/tokens', data),

  /**
   * Unregister push notification token
   * TODO: Backend endpoint not implemented yet - placeholder for future
   * DELETE /api/notifications/tokens/:token
   */
  unregisterPushToken: (token: string) => http.delete<void>(`/notifications/tokens/${token}`),

  /**
   * Send test Firebase notification (EXISTING ENDPOINT)
   * POST /api/test/send
   */
  sendTestNotification: (data: SendTestNotificationRequest) =>
    http.post<SendTestNotificationResponse>('/test/send', data),
} as const
