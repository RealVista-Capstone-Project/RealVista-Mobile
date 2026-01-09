import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import 'react-native-reanimated'

import { useAuthStore } from '@/entities/user'
import { AppProviders } from '@/shared/config/providers'
import { useColorScheme } from '@/shared/lib/hooks/use-color-scheme'
import { GluestackUIProvider } from '@/shared/ui/gluestack-ui-provider'
import '../global.css'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { isAuthenticated } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const [isNavigationReady, setNavigationReady] = useState(false)

  useEffect(() => {
    if (rootNavigationState?.key) {
      setNavigationReady(true)
    }
  }, [rootNavigationState?.key])

  useEffect(() => {
    if (!isNavigationReady) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, segments, isNavigationReady, router])

  return (
    <AppProviders>
      <GluestackUIProvider mode='dark'>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen name='(auth)/login' options={{ headerShown: false }} />
            <Stack.Screen name='modal' options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style='auto' />
        </ThemeProvider>
      </GluestackUIProvider>
    </AppProviders>
  )
}
