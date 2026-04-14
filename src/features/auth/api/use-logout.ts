import { useMutation, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '@/entities/user'
import { flushEventQueue } from '@/shared/lib/analytics'
import { notificationApi } from '@/entities/notification/api'

export function useLogout() {
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Flush any pending behavior events before logout
      flushEventQueue()

      // Unregister FCM push token so server stops sending notifications to this device
      const fcmToken = await AsyncStorage.getItem('fcm_token')
      if (fcmToken) {
        try {
          await notificationApi.unregisterPushToken(fcmToken)
        } catch {
          // Non-fatal — proceed with logout even if unregister fails
        }
        await AsyncStorage.removeItem('fcm_token')
      }

      // Remove auth tokens
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('refresh_token')
    },
    onSuccess: () => {
      // Clear store
      logout()

      // Clear all queries
      queryClient.clear()
    },
  })
}
