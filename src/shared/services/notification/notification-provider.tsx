import * as Notifications from 'expo-notifications'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { NotificationService } from './notification-service'

interface NotificationContextType {
  expoPushToken: string | null
  devicePushToken: string | null
  notification: Notifications.Notification | null
  error: Error | null
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notifications.Notification | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function setupNotifications() {
      setIsLoading(true)
      try {
        // 1. Register for Expo Push Token
        const expoToken = await NotificationService.registerDevice()
        setExpoPushToken(expoToken)

        // 2. Get Native Device Token (FCM/APNs) for Firebase Backend
        const deviceToken = await NotificationService.getDevicePushToken()
        setDevicePushToken(deviceToken)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to setup notifications'))
      } finally {
        setIsLoading(false)
      }
    }

    setupNotifications()

    // 3. Listeners
    const notificationListener = NotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('🔔 Notification Received:', notification)
        setNotification(notification)
      }
    )

    const responseListener = NotificationService.addNotificationResponseListener((response) => {
      console.log('🔔 Notification Response:', response)
      // Handle deep linking or navigation here if needed
    })

    return () => {
      notificationListener.remove()
      responseListener.remove()
    }
  }, [])

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, devicePushToken, notification, error, isLoading }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
