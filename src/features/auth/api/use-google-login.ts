import { useAuthStore, userApi } from '@/entities/user'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: userApi.loginGoogle,
    onSuccess: async (res) => {
      // res is ApiResponse<AuthResponse>
      if (res.success && res.data.access_token) {
        await AsyncStorage.setItem('token', res.data.access_token)

        // Update user store
        const { setToken, setIsAuthenticated } = useAuthStore.getState()
        setToken(res.data.access_token)
        setIsAuthenticated(true)

        Alert.alert('Success', 'Google Login successful')
        router.replace('/(tabs)')
      } else {
        Alert.alert('Error', res.message || 'Google Login failed')
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Google Login failed')
    },
  })
}
