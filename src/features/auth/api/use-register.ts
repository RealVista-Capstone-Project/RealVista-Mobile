import { userApi } from '@/entities/user'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export const useRegister = () => {
  return useMutation({
    mutationFn: userApi.register,
    onSuccess: (res) => {
      if (res.success) {
        Alert.alert('Success', 'Registration successful. Please login.')
        router.replace('/(auth)/login')
      } else {
        Alert.alert('Error', res.message || 'Registration failed')
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Registration failed')
    },
  })
}
