import { RegisterForm } from '@/features/auth/ui/register-form'
import { Stack } from 'expo-router'
import { StyleSheet, View } from 'react-native'

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sign Up', headerShown: false }} />
      <RegisterForm />
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
