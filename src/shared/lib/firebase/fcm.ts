import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { Platform, PermissionsAndroid } from 'react-native'

/**
 * Request notification permission (Android 13+ support)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED
  }

  const authStatus = await messaging().requestPermission()
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  )
}

/**
 * Get FCM Token
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages()
    }
    return await messaging().getToken()
  } catch (error) {
    console.error('FCM Token Error:', error)
    return null
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => void
): () => void {
  return messaging().onMessage(handler)
}

/**
 * Listen for token refresh
 */
export function onTokenRefresh(handler: (token: string) => void): () => void {
  return messaging().onTokenRefresh(handler)
}

/**
 * Background message handler (Must be called outside of components, usually in index.js)
 */
export function setBackgroundMessageHandler(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<void>
) {
  messaging().setBackgroundMessageHandler(handler)
}
