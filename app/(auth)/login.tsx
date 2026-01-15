import { LoginForm } from '@/features/auth/ui/login-form'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function LoginScreen() {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-1 px-6 pt-4'>
        <Stack.Screen options={{ headerShown: false }} />
        <LoginForm />
      </View>
    </SafeAreaView>
  )
}
