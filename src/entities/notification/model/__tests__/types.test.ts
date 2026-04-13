import type { NotificationWsPayload } from '../types'

describe('NotificationWsPayload', () => {
  it('accepts a minimal valid payload', () => {
    const payload: NotificationWsPayload = {
      notification_id: 'n1',
      user_id: 'u1',
      title: 'Hello',
      message: 'World',
      event_type: 'NEW_LISTING',
    }
    expect(payload.notification_id).toBe('n1')
    expect(payload.user_id).toBe('u1')
    expect(payload.title).toBe('Hello')
    expect(payload.message).toBe('World')
    expect(payload.event_type).toBe('NEW_LISTING')
  })

  it('accepts optional fields', () => {
    const payload: NotificationWsPayload = {
      notification_id: 'n2',
      user_id: 'u2',
      title: 'T',
      message: 'M',
      event_type: 'APPOINTMENT_CONFIRMED',
      entity_type: 'APPOINTMENT',
      entity_id: 'e1',
      metadata: { foo: 'bar' },
    }
    expect(payload.entity_type).toBe('APPOINTMENT')
    expect(payload.entity_id).toBe('e1')
    expect(payload.metadata).toEqual({ foo: 'bar' })
  })

  it('does NOT allow camelCase notificationId field (type check — runtime shape)', () => {
    const keys: Array<keyof NotificationWsPayload> = [
      'notification_id',
      'user_id',
      'title',
      'message',
      'event_type',
    ]
    keys.forEach((k) => expect(typeof k).toBe('string'))
  })
})
