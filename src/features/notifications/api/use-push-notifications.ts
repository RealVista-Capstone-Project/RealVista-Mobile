import { notificationApi } from '@/entities/notification'
import { NotificationService } from '@/shared/services/notification'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type * as Notifications from 'expo-notifications'
import { useCallback, useEffect, useState } from 'react'

/**
 * Feature Hook: Push Notification Setup
 * Handles push notification registration and token management
 */
export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Register device for push notifications
   */
  const registerDevice = useCallback(async () => {
    setIsRegistering(true)
    setError(null)

    try {
      const hasPermission = await NotificationService.requestPermissions()
      if (!hasPermission) {
        throw new Error('Permission not granted')
      }

      const token = await NotificationService.getDevicePushToken()

      if (!token) {
        throw new Error('Failed to get push token')
      }

      setPushToken(token)

      // Register token with backend
      const deviceInfo = NotificationService.getDeviceInfo()
      await notificationApi.registerPushToken({
        token,
        ...deviceInfo,
      })

      // Persist token so unregister can retrieve it after fresh restart
      await AsyncStorage.setItem('fcm_token', token)

      return token
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      console.error('Failed to register device:', error)
      return null
    } finally {
      setIsRegistering(false)
    }
  }, [])

  /**
   * Unregister device
   */
  const unregisterDevice = useCallback(async () => {
    if (!pushToken) return

    try {
      await notificationApi.unregisterPushToken(pushToken)
      setPushToken(null)
    } catch (err) {
      console.error('Failed to unregister device:', err)
    }
  }, [pushToken])

  return {
    pushToken,
    isRegistering,
    error,
    registerDevice,
    unregisterDevice,
  }
}

/**
 * Feature Hook: Notification Listeners
 * Sets up listeners for incoming notifications
 */
export function useNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    const receivedSubscription = NotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification)
        onNotificationReceived?.(notification)
      }
    )

    // Listener for notification responses (user tapped notification)
    const responseSubscription = NotificationService.addNotificationResponseListener((response) => {
      console.log('Notification response:', response)
      onNotificationResponse?.(response)
    })

    // Cleanup
    return () => {
      receivedSubscription.remove()
      responseSubscription.remove()
    }
  }, [onNotificationReceived, onNotificationResponse])
}
