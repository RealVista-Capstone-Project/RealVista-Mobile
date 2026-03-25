import http from '@/shared/lib/http'
import type {
  Notification,
  PaginatedNotificationResponse,
  PushToken,
  SendTestNotificationRequest,
  SendTestNotificationResponse,
} from '../model/types'

/**
 * Notification API Client
 * Aligned with backend contract from notification-plan.md:
 *   GET  /api/v1/notifications           - paginated list ({ content, page, size, total_elements, total_pages })
 *   PUT  /api/v1/notifications/read-all  - mark all as read
 *   PUT  /api/v1/notifications/{id}/read - mark single as read
 */
export const notificationApi = {
  /**
   * Get user notifications (paginated)
   * GET /api/v1/notifications?page=0&size=20
   * Response: { success, data: { content, page, size, total_elements, total_pages } }
   */
  getNotifications: (page = 0, size = 20) =>
    http.get<PaginatedNotificationResponse>('/notifications', {
      params: { page, size },
    }),

  /**
   * Mark a single notification as read
   * PUT /api/v1/notifications/{id}/read
   */
  markAsRead: (notificationId: string) =>
    http.put<Notification>(`/notifications/${notificationId}/read`),

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/read-all
   */
  markAllAsRead: () => http.put<void>('/notifications/read-all'),

  /**
   * Delete notification
   * DELETE /api/v1/notifications/{id}
   */
  deleteNotification: (notificationId: string) =>
    http.delete<void>(`/notifications/${notificationId}`),

  /**
   * Register push notification token
   * POST /api/v1/notifications/tokens
   */
  registerPushToken: (data: PushToken) => http.post<void>('/notifications/tokens', data),

  /**
   * Unregister push notification token
   * DELETE /api/v1/notifications/tokens/{token}
   */
  unregisterPushToken: (token: string) => http.delete<void>(`/notifications/tokens/${token}`),

  /**
   * Send test Firebase notification (EXISTING ENDPOINT)
   * POST /api/test/send
   */
  sendTestNotification: (data: SendTestNotificationRequest) =>
    http.post<SendTestNotificationResponse>('/test/send', data),
} as const
