import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

/**
 * Push Notification Service
 * Handles all push notification operations including permissions,
 * token management, and notification listeners
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
})

export class NotificationService {
  /**
   * Check if device supports push notifications
   */
  static isDeviceSupported(): boolean {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices')
      return false
    }
    return true
  }

  /**
   * Request notification permissions
   * @returns true if permissions granted, false otherwise
   */
  static async requestPermissions(): Promise<boolean> {
    if (!this.isDeviceSupported()) {
      return false
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted')
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to request notification permissions:', error)
      return false
    }
  }

  /**
   * Get Expo push notification token
   * @returns Push token string or null if failed
   */
  static async getPushToken(): Promise<string | null> {
    if (!this.isDeviceSupported()) {
      return null
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId

      if (!projectId) {
        console.error('EAS project ID not found in app config')
        return null
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      })

      return tokenData.data
    } catch (error) {
      console.error('Failed to get push token:', error)
      return null
    }
  }

  /**
   * Get device information for token registration
   */
  static getDeviceInfo(): {
    device_id: string
    platform: 'ios' | 'android' | 'web'
  } {
    return {
      device_id: Device.deviceName || Device.modelName || 'unknown',
      platform: Platform.OS as 'ios' | 'android' | 'web',
    }
  }

  /**
   * Register device for push notifications
   * Requests permissions and gets push token
   * @returns Push token if successful, null otherwise
   */
  static async registerDevice(): Promise<string | null> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) {
      return null
    }

    const token = await this.getPushToken()
    if (!token) {
      return null
    }

    return token
  }

  /**
   * Add listener for notifications received while app is foregrounded
   * @param callback Function to call when notification is received
   * @returns Subscription object to remove listener
   */
  static addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback)
  }

  /**
   * Add listener for notification responses (when user taps notification)
   * @param callback Function to call when user interacts with notification
   * @returns Subscription object to remove listener
   */
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback)
  }

  /**
   * Schedule a local notification
   * @param title Notification title
   * @param body Notification body
   * @param data Optional data payload
   * @param trigger Optional trigger (default: immediate)
   */
  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null = immediate
    })
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync()
  }

  /**
   * Set notification badge count (iOS)
   */
  static async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count)
  }

  /**
   * Get notification badge count (iOS)
   */
  static async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync()
  }

  /**
   * Clear all notifications from notification center
   */
  static async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync()
  }

  /**
   * Get last notification response (useful for deep linking)
   */
  static async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync()
  }
}
