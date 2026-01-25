import { useEffect, useState } from 'react'
import { Platform, Alert } from 'react-native'
import {
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
  onTokenRefresh,
} from '@/shared/lib/firebase/fcm'

interface UseFCMMobileReturn {
  token: string | null
  error: string | null
  isLoading: boolean
}

const getBackendUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.3.2:8080' // Genymotion
  }
  return 'http://localhost:8080'
}

export function useFCMMobile(): UseFCMMobileReturn {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Send token to backend
  const sendTokenToBackend = async (fcmToken: string) => {
    try {
      const backendUrl = getBackendUrl()
      console.log('Sending to:', `${backendUrl}/api/test/send`)

      const response = await fetch(`${backendUrl}/api/test/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          title: 'Test from React Native',
          body: 'This is a test notification from mobile',
        }),
      })

      if (response.ok) {
        console.log('Token sent to backend successfully')
        Alert.alert('Success', 'FCM token registered!')
      } else {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        setError(`Backend error: ${response.status}`)
      }
    } catch (err: any) {
      console.error('Backend Connection Error:', err)
      setError(err.message) // Don't throw, just set error
    }
  }

  useEffect(() => {
    const setupFCM = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const hasPermission = await requestNotificationPermission()

        if (!hasPermission) {
          setError('Notification permission denied')
          setIsLoading(false)
          return
        }

        console.log('Notification permission granted')
        const fcmToken = await getFCMToken()

        if (fcmToken) {
          setToken(fcmToken)
          console.log('FCM Token:', fcmToken)
          // Automatically send to backend for testing
          await sendTokenToBackend(fcmToken)
        } else {
          setError('Failed to get FCM token')
        }
      } catch (err: any) {
        console.error('FCM Setup Error:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    setupFCM()

    // Listeners
    const unsubscribeForeground = onForegroundMessage((remoteMessage) => {
      console.log('Foreground notification:', remoteMessage)
      Alert.alert(
        remoteMessage.notification?.title || 'New Message',
        remoteMessage.notification?.body || ''
      )
    })

    const unsubscribeToken = onTokenRefresh((newToken) => {
      console.log('Token refreshed:', newToken)
      setToken(newToken)
      // Note: In real app, you should also update backend here
    })

    return () => {
      unsubscribeForeground()
      unsubscribeToken()
    }
  }, [])

  return { token, error, isLoading }
}
