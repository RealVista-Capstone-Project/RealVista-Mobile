import { z } from 'zod'

/**
 * Zod Validation Schemas for Notification Entity
 * Runtime type validation for API responses
 */

// Enum schemas
export const DeliveryStatusSchema = z.enum(['PENDING', 'SENT', 'FAILED', 'PARTIAL'])

export const NotificationChannelSchema = z.enum(['IN_APP', 'EMAIL', 'BOTH'])

export const EventTypeSchema = z.enum([
  'NEW_LISTING',
  'PRICE_CHANGE',
  'APPOINTMENT_REMINDER',
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_CANCELLED',
  'NEW_MESSAGE',
  'LISTING_EXPIRED',
  'LISTING_SOLD',
  'SYSTEM',
])

export const EntityTypeSchema = z.enum(['LISTING', 'APPOINTMENT', 'MESSAGE', 'USER', 'PROPERTY'])

// Main notification schema
export const NotificationSchema = z.object({
  notification_id: z.string().uuid(),
  user_id: z.string().uuid(),
  channel: NotificationChannelSchema,
  title: z.string().min(1, 'Title is required'),
  message: z.string(),
  delivery_status: DeliveryStatusSchema,
  is_read: z.boolean(),
  event_type: EventTypeSchema,
  metadata: z.record(z.string(), z.any()).optional(),
  entity_type: EntityTypeSchema.optional(),
  entity_id: z.string().uuid().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Push token schema
export const PushTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  device_id: z.string().min(1, 'Device ID is required'),
  platform: z.enum(['ios', 'android', 'web']),
})

// API response schemas
export const NotificationListResponseSchema = z.object({
  data: z.array(NotificationSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
})

export const SendTestNotificationResponseSchema = z.object({
  success: z.string(),
  messageId: z.string(),
})
