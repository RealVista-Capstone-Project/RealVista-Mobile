import { useGoogleLogin } from '@/features/auth/api/use-google-login'
import { useLogin } from '@/features/auth/api/use-login'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Google from 'expo-auth-session/providers/google'
import { Link } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

import { Ionicons } from '@expo/vector-icons'
import LogoGoogle from '../../../../assets/images/google-logo.svg'
import LogoApp from '../../../../assets/images/logo.svg'

WebBrowser.maybeCompleteAuthSession()

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { mutate: login, isPending: isLoginPending } = useLogin()
  const { mutate: googleLogin, isPending: isGoogleLoginPending } = useGoogleLogin()
  const [showPassword, setShowPassword] = useState(false)

  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  })

  useEffect(() => {
    console.log(Platform.OS)
    if (response?.type === 'success') {
      const { id_token } = response.params
      const token = id_token
      if (token) {
        googleLogin({
          idToken: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        })
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
    <View className='flex-1 bg-white'>
      {/* Header */}
      <View className='mb-10 border-b border-gray-100 pb-4'>
        <View className='flex-row items-center'>
          <LogoApp width={32} height={32} className='mr-3' />
          <Text className='text-xl text-brand-secondary font-jakarta-bold'>RealVista</Text>
        </View>
      </View>

      {/* Welcome Text */}
      <View className='mb-8 items-center'>
        <Text className='mb-2 text-[32px] leading-tight text-text-main font-jakarta-bold text-center'>
          Welcome back
        </Text>
        <Text className='text-base text-text-muted font-jakarta text-center'>
          Welcome back! Please enter your details.
        </Text>
      </View>

      {/* Form */}
      <View className='space-y-6'>
        {/* Email */}
        <View>
          <Text className='mb-2 text-sm text-text-main font-jakarta-medium'>Email</Text>
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, value } }) => (
              <TextInput
                className='h-[48px] rounded-lg border border-input-border bg-input-bg px-4 text-base text-text-main font-jakarta-medium'
                placeholder='hi@example.com'
                placeholderTextColor='#9EA3AE'
                autoCapitalize='none'
                keyboardType='email-address'
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text className='mt-1 text-sm text-red-500 font-jakarta'>{errors.email.message}</Text>
          )}
        </View>

        {/* Password */}
        <View>
          <Text className='mb-2 text-sm text-text-main font-jakarta-medium'>Password</Text>
          <Controller
            control={control}
            name='password'
            render={({ field: { onChange, value } }) => (
              <View className='relative'>
                <TextInput
                  className='h-[48px] rounded-lg border border-input-border bg-input-bg pl-4 pr-12 text-base text-text-main font-jakarta-medium'
                  placeholder='Enter password'
                  placeholderTextColor='#9EA3AE'
                  secureTextEntry={!showPassword}
                  onChangeText={onChange}
                  value={value}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className='absolute bottom-0 right-0 top-0 items-center justify-center px-4'
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color='#9EA3AE'
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && (
            <Text className='mt-1 text-sm text-red-500 font-jakarta'>
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Forgot Password */}
        <View className='items-end'>
          <TouchableOpacity className='py-1'>
            <Text className='text-sm font-bold text-brand-primary font-jakarta-bold'>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isLoginPending}
          testID='login-button'
          className='h-[48px] w-full items-center justify-center rounded-lg bg-brand-primary active:opacity-90 mt-2'
        >
          {isLoginPending ? (
            <ActivityIndicator color='white' testID='login-loading' />
          ) : (
            <Text className='text-base font-bold text-white font-jakarta-bold' testID='login-text'>
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* Google Login */}
        <TouchableOpacity
          onPress={() => promptAsync()}
          disabled={isGoogleLoginPending}
          className='h-[48px] w-full flex-row items-center justify-center rounded-lg border border-gray-200 bg-white active:bg-gray-50 mt-4'
        >
          {isGoogleLoginPending ? (
            <ActivityIndicator color='#000' />
          ) : (
            <>
              <LogoGoogle width={20} height={20} style={{ marginRight: 8 }} />
              <Text className='text-base font-bold text-text-main font-jakarta-bold'>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View className='mt-6 flex-row justify-center'>
          <Text className='text-text-muted font-jakarta'>Don&apos;t have an account? </Text>
          <Link href={'/(auth)/sign-up' as any} asChild>
            <TouchableOpacity>
              <Text className='font-bold text-text-main font-jakarta-bold'>Sign up for free</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  )
}
