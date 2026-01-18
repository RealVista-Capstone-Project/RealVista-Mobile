import { useAuthStore, userApi } from '@/entities/user'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export const useLogin = () => {
  return useMutation({
    mutationFn: userApi.login,
    onSuccess: async (res) => {
      // res is ApiResponse<AuthResponse>
      if (res.success && res.data.access_token) {
        await AsyncStorage.setItem('token', res.data.access_token)

        // Update user store
        const { setToken, setIsAuthenticated } = useAuthStore.getState()
        setToken(res.data.access_token)
        setIsAuthenticated(true)

        Alert.alert('Success', 'Login successful')
        router.replace('/(tabs)') // Adjust route as needed, checking app structure
      } else {
        Alert.alert('Error', res.message || 'Login failed')
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Login failed')
    },
  })
}
