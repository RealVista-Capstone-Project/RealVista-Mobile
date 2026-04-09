import { z } from 'zod'

/**
 * Zod Validation Schemas for Notification Entity
 * Runtime type validation for API responses
 */

// Enum schemas — use .catch() so unknown values from backend degrade gracefully
// instead of failing the entire response when the backend adds new event types.
export const DeliveryStatusSchema = z.enum(['PENDING', 'SENT', 'FAILED', 'PARTIAL']).catch('SENT')

export const NotificationChannelSchema = z.enum(['IN_APP', 'EMAIL', 'BOTH']).catch('IN_APP')

export const EventTypeSchema = z
  .enum([
    'NEW_LISTING',
    'PRICE_CHANGE',
    'APPOINTMENT_REMINDER',
    'APPOINTMENT_CONFIRMED',
    'APPOINTMENT_CANCELLED',
    'NEW_MESSAGE',
    'NEW_TOUR_REQUEST',
    'LISTING_EXPIRED',
    'LISTING_SOLD',
    'SYSTEM',
  ])
  .catch('SYSTEM')

export const EntityTypeSchema = z
  .enum(['LISTING', 'APPOINTMENT', 'MESSAGE', 'USER', 'PROPERTY'])
  .catch('LISTING')

// Metadata — backend may send either a JSON string or an already-parsed object
const MetadataSchema = z
  .union([
    // JSON string case: parse it into an object
    z.string().transform((s) => {
      try {
        return JSON.parse(s) as Record<string, unknown>
      } catch {
        return {}
      }
    }),
    // Already an object
    z.record(z.string(), z.unknown()),
  ])
  .optional()

// Main notification schema
// Use z.string() (not .uuid()) for IDs to avoid failures from non-standard UUID formats
export const NotificationSchema = z.object({
  notification_id: z.string(),
  user_id: z.string(),
  channel: NotificationChannelSchema,
  title: z.string().min(1, 'Title is required'),
  message: z.string(),
  delivery_status: DeliveryStatusSchema,
  is_read: z.boolean(),
  event_type: EventTypeSchema,
  metadata: MetadataSchema,
  entity_type: EntityTypeSchema.optional(),
  entity_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Push token schema
export const PushTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  device_id: z.string().min(1, 'Device ID is required'),
  platform: z.enum(['ios', 'android', 'web']),
})

/**
 * Paginated response from GET /api/v1/notifications
 * Matches Spring Page-style pagination returned by backend
 */
export const PaginatedNotificationResponseSchema = z.object({
  content: z.array(z.unknown()), // validated per-item in query fn for graceful degradation
  page: z.number().int().nonnegative(),
  size: z.number().int().nonnegative(),
  total_elements: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
})

export const SendTestNotificationResponseSchema = z.object({
  success: z.string(),
  messageId: z.string(),
})
