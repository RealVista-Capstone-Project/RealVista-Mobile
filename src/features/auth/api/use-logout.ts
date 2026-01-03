import { useMutation, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '@/entities/user'

export function useLogout() {
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Call logout API if you have one
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
