import { useGoogleLogin } from '@/features/auth/api/use-google-login'
import { useLogin } from '@/features/auth/api/use-login'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Google from 'expo-auth-session/providers/google'
import { Link } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

WebBrowser.maybeCompleteAuthSession()

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { mutate: login, isPending: isLoginPending } = useLogin()
  const { mutate: googleLogin, isPending: isGoogleLoginPending } = useGoogleLogin()

  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  })

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params
      const token = id_token
      if (token) {
        googleLogin({ idToken: token })
      }
    }
  }, [response, googleLogin])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder='Enter your email'
              autoCapitalize='none'
              keyboardType='email-address'
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name='password'
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder='Enter your password'
              secureTextEntry
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      </View>

      <Button
        title={isLoginPending ? 'Logging in...' : 'Login'}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoginPending || isGoogleLoginPending}
      />

      <Button
        title={isGoogleLoginPending ? 'Signing in with Google...' : 'Login with Google'}
        onPress={() => promptAsync()}
        disabled={isLoginPending || isGoogleLoginPending}
        color='#DB4437'
      />

      <View style={styles.footer}>
        <Text>Don&apos;t have an account? </Text>
        <Link href={'/(auth)/sign-up' as any} asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    color: 'blue',
    fontWeight: 'bold',
  },
})
