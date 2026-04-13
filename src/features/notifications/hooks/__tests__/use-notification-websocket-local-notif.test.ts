// Verify that scheduleLocalNotification is called when a WS message arrives.
// We test via the hook using renderHook + mocked dependencies.

import { renderHook } from '@testing-library/react-native'
import { useNotificationWebSocket } from '../use-notification-websocket'

// Mock all external deps
jest.mock('@/entities/billing', () => ({ billingKeys: { mySubscriptions: () => ['billing'] } }))
jest.mock('@/entities/notification', () => ({
  notificationKeys: {
    lists: () => ['notifications', 'list'],
    unreadCount: () => ['notifications', 'unread-count'],
  },
}))
jest.mock('@/entities/user', () => ({
  useAuthStore: () => ({ token: 'test-token' }),
}))
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}))

const mockScheduleLocalNotification = jest.fn().mockResolvedValue('notif-id')
jest.mock('@/shared/services/notification', () => ({
  NotificationService: {
    scheduleLocalNotification: (...args: unknown[]) => mockScheduleLocalNotification(...args),
  },
}))

let capturedOnMessage: ((msg: { body: string }) => Promise<void>) | null = null
const mockSubscribe = jest.fn((opts: { onMessage: (msg: { body: string }) => Promise<void> }) => {
  capturedOnMessage = opts.onMessage
  return jest.fn()
})

jest.mock('@/shared/lib/websocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    subscribe: mockSubscribe,
  }),
}))

describe('useNotificationWebSocket — foreground local notification', () => {
  beforeEach(() => {
    mockScheduleLocalNotification.mockClear()
    mockSubscribe.mockClear()
    capturedOnMessage = null
  })

  it('calls scheduleLocalNotification with title and message on WS frame', async () => {
    renderHook(() => useNotificationWebSocket())

    expect(capturedOnMessage).not.toBeNull()

    const frame = {
      body: JSON.stringify({
        notification_id: 'n-1',
        user_id: 'u-1',
        title: 'New Property',
        message: 'A listing was added near you',
        event_type: 'NEW_LISTING',
      }),
    }

    await capturedOnMessage!(frame)

    expect(mockScheduleLocalNotification).toHaveBeenCalledWith(
      'New Property',
      'A listing was added near you'
    )
  })

  it('does not call scheduleLocalNotification on duplicate notification_id', async () => {
    renderHook(() => useNotificationWebSocket())

    const frame = {
      body: JSON.stringify({
        notification_id: 'dup-1',
        user_id: 'u-1',
        title: 'Dup',
        message: 'Duplicate',
        event_type: 'SYSTEM',
      }),
    }

    await capturedOnMessage!(frame)
    await capturedOnMessage!(frame)

    expect(mockScheduleLocalNotification).toHaveBeenCalledTimes(1)
  })
})
