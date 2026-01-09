import { LoginForm } from '@/features/auth/ui/login-form'
import { Stack } from 'expo-router'
import { StyleSheet, View } from 'react-native'

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Login', headerShown: false }} />
      <LoginForm />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
})
