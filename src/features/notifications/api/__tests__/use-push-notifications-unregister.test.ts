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

const mockUnregisterPushToken = jest.fn().mockResolvedValue(undefined)
jest.mock('@/entities/notification', () => ({
  notificationApi: {
    registerPushToken: jest.fn().mockResolvedValue(undefined),
    unregisterPushToken: (...args: unknown[]) => mockUnregisterPushToken(...args),
  },
}))

jest.mock('@/shared/services/notification', () => ({
  NotificationService: {
    requestPermissions: jest.fn().mockResolvedValue(true),
    getDevicePushToken: jest.fn().mockResolvedValue('new-token'),
    getDeviceInfo: jest.fn().mockReturnValue({ device_id: 'dev1', platform: 'android' }),
  },
}))

describe('usePushNotifications — unregister on fresh restart', () => {
  beforeEach(() => {
    mockSetItem.mockClear()
    mockGetItem.mockClear()
    mockRemoveItem.mockClear()
    mockUnregisterPushToken.mockClear()
  })

  it('unregisters using stored AsyncStorage token when state is null (fresh restart)', async () => {
    // Simulate fresh restart: no in-memory pushToken, but stored in AsyncStorage
    mockGetItem.mockResolvedValueOnce('stored-fcm-token')

    const { result } = renderHook(() => usePushNotifications())
    // pushToken state is null at mount — we never called registerDevice

    await act(async () => {
      await result.current.unregisterDevice()
    })

    expect(mockGetItem).toHaveBeenCalledWith('fcm_token')
    expect(mockUnregisterPushToken).toHaveBeenCalledWith('stored-fcm-token')
    expect(mockRemoveItem).toHaveBeenCalledWith('fcm_token')
  })

  it('still unregisters when pushToken state is set (no fresh restart)', async () => {
    // No AsyncStorage fallback needed — state already has the token
    mockGetItem.mockResolvedValueOnce(null)

    const { result } = renderHook(() => usePushNotifications())

    // Simulate state being set
    const { NotificationService } = require('@/shared/services/notification')
    NotificationService.getDevicePushToken.mockResolvedValueOnce('in-memory-token')
    await act(async () => {
      await result.current.registerDevice()
    })

    mockUnregisterPushToken.mockClear()
    mockRemoveItem.mockClear()

    await act(async () => {
      await result.current.unregisterDevice()
    })

    expect(mockUnregisterPushToken).toHaveBeenCalledWith('in-memory-token')
    expect(mockRemoveItem).toHaveBeenCalledWith('fcm_token')
  })

  it('does nothing when both state and AsyncStorage are empty', async () => {
    mockGetItem.mockResolvedValueOnce(null)

    const { result } = renderHook(() => usePushNotifications())

    await act(async () => {
      await result.current.unregisterDevice()
    })

    expect(mockUnregisterPushToken).not.toHaveBeenCalled()
  })
})
