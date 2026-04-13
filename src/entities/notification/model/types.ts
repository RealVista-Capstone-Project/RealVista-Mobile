/**
 * Notification Entity Types
 * Based on Backend API schema
 */

// ============================================
// Enums matching Backend
// ============================================

export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED' | 'PARTIAL'

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'BOTH'

export type EventType =
  | 'NEW_LISTING'
  | 'PRICE_CHANGE'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'NEW_MESSAGE'
  | 'NEW_TOUR_REQUEST'
  | 'LISTING_EXPIRED'
  | 'LISTING_SOLD'
  | 'SYSTEM'

export type EntityType = 'LISTING' | 'APPOINTMENT' | 'MESSAGE' | 'USER' | 'PROPERTY'

// ============================================
// Main Notification Interface
// ============================================

export interface Notification {
  notification_id: string
  user_id: string
  channel: NotificationChannel
  title: string
  message: string
  delivery_status: DeliveryStatus
  is_read: boolean
  event_type: EventType
  metadata?: Record<string, any>
  entity_type?: EntityType
  entity_id?: string
  created_at: string
  updated_at: string
}

// ============================================
// Push Notification Token
// ============================================

export interface PushToken {
  token: string
  device_id: string
  platform: 'ios' | 'android' | 'web'
}

// ============================================
// API Response Types
// ============================================

/**
 * Paginated response from GET /api/v1/notifications
 * Backend returns Spring Page-style pagination
 */
export interface PaginatedNotificationResponse {
  content: Notification[]
  page: number
  size: number
  total_elements: number
  total_pages: number
}

export interface SendTestNotificationRequest {
  token: string
  title: string
  body: string
}

export interface SendTestNotificationResponse {
  success: string
  messageId: string
}

// ============================================
// WebSocket Payload (snake_case — from backend STOMP frames)
// ============================================

export interface NotificationWsPayload {
  notification_id: string
  user_id: string
  title: string
  message: string
  event_type: string
  entity_type?: string
  entity_id?: string
  metadata?: Record<string, unknown>
}
