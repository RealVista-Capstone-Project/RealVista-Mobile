import { useAuthStore } from '@/entities/user'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation } from '@tanstack/react-query'

interface LoginCredentials {
  email: string
  password: string
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  return useMutation({
    // mutationFn: (credentials: LoginCredentials) => userApi.getCurrent(),
    mutationFn: async (credentials: LoginCredentials) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const role = credentials.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER'

      return {
        payload: {
          id: '1',
          email: credentials.email,
          name: 'Mock User',
          role: role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    },
    onSuccess: async (response) => {
      // Assuming your API returns token and user
      // Adjust this based on your actual API response
      // const user = { ...response.payload, role: 'USER' as const } // Mocking role for now
      const user = response.payload as any

      // Store token
      await AsyncStorage.setItem('token', 'dummy-token') // Replace with actual token from response

      // Update Zustand store
      setUser(user)
      setToken('dummy-token') // Replace with actual token from response
    },
  })
}
