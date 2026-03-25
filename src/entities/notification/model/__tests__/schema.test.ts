import { NotificationSchema, PaginatedNotificationResponseSchema, PushTokenSchema } from '../schema'
import type { Notification } from '../types'

describe('Notification Schemas', () => {
  describe('NotificationSchema', () => {
    const validNotification: Notification = {
      notification_id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      channel: 'IN_APP',
      title: 'Test Notification',
      message: 'This is a test message',
      delivery_status: 'SENT',
      is_read: false,
      event_type: 'NEW_LISTING',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    }

    it('should validate correct notification', () => {
      const result = NotificationSchema.safeParse(validNotification)
      expect(result.success).toBe(true)
    })

    it('should reject notification with invalid UUID', () => {
      const invalid = { ...validNotification, notification_id: 'invalid-uuid' }
      const result = NotificationSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject notification with invalid channel', () => {
      const invalid = { ...validNotification, channel: 'INVALID' }
      const result = NotificationSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject notification with empty title', () => {
      const invalid = { ...validNotification, title: '' }
      const result = NotificationSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('PaginatedNotificationResponseSchema', () => {
    it('should validate correct paginated response', () => {
      const response = {
        content: [],
        page: 0,
        size: 20,
        total_elements: 0,
        total_pages: 0,
      }
      const result = PaginatedNotificationResponseSchema.safeParse(response)
      expect(result.success).toBe(true)
    })

    it('should reject negative total_elements', () => {
      const invalid = {
        content: [],
        page: 0,
        size: 20,
        total_elements: -1,
        total_pages: 0,
      }
      const result = PaginatedNotificationResponseSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('PushTokenSchema', () => {
    it('should validate correct push token', () => {
      const token = {
        token: 'ExponentPushToken[xxx]',
        device_id: 'device-123',
        platform: 'ios' as const,
      }
      const result = PushTokenSchema.safeParse(token)
      expect(result.success).toBe(true)
    })

    it('should reject empty token', () => {
      const invalid = {
        token: '',
        device_id: 'device-123',
        platform: 'ios' as const,
      }
      const result = PushTokenSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid platform', () => {
      const invalid = {
        token: 'token',
        device_id: 'device-123',
        platform: 'windows',
      }
      const result = PushTokenSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
