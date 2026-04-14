import { renderHook, act } from '@testing-library/react-native'
import { usePushNotifications } from '../use-push-notifications'

const mockSetItem = jest.fn().mockResolvedValue(undefined)
const mockGetItem = jest.fn()
const mockRemoveItem = jest.fn().mockResolvedValue(undefined)

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: (...args: unknown[]) => mockSetItem(...args),
    getItem: (...args: unknown[]) => mockGetItem(...args),
    removeItem: (...args: unknown[]) => mockRemoveItem(...args),
  },
}))

jest.mock('@/entities/notification', () => ({
  notificationApi: {
    registerPushToken: jest.fn().mockResolvedValue(undefined),
    unregisterPushToken: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('@/shared/services/notification', () => ({
  NotificationService: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    getDevicePushToken: jest.fn().mockResolvedValue('fcm-token-abc'),
    getDeviceInfo: jest.fn().mockReturnValue({ device_id: 'dev1', platform: 'android' }),
  },
}))

describe('usePushNotifications — AsyncStorage persistence', () => {
  beforeEach(() => {
    mockSetItem.mockClear()
    mockGetItem.mockClear()
    mockRemoveItem.mockClear()
  })

  it('calls AsyncStorage.setItem with fcm_token after successful registration', async () => {
    const { result } = renderHook(() => usePushNotifications())

    await act(async () => {
      await result.current.registerDevice()
    })

    expect(mockSetItem).toHaveBeenCalledWith('fcm_token', 'fcm-token-abc')
  })

  it('does NOT call AsyncStorage.setItem if permission is denied', async () => {
    const { NotificationService } = require('@/shared/services/notification')
    NotificationService.requestPermissions.mockResolvedValueOnce(false)

    const { result } = renderHook(() => usePushNotifications())

    await act(async () => {
      await result.current.registerDevice()
    })

    expect(mockSetItem).not.toHaveBeenCalled()
  })
})
