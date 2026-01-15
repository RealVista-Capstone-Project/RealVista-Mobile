import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
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

SplashScreen.preventAutoHideAsync()

const AUTH_GROUP = '(auth)'
const HOME_GROUP = '(tabs)'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { isAuthenticated } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const [isNavigationReady, setNavigationReady] = useState(false)
  const [loaded] = useFonts({
    PlusJakartaSans_500Medium: require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    PlusJakartaSans_700Bold: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    PlusJakartaSans_200ExtraLight: require('../assets/fonts/PlusJakartaSans-ExtraLight.ttf'),
    PlusJakartaSans_300Light: require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    PlusJakartaSans_400Regular: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    PlusJakartaSans_600SemiBold: require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    PlusJakartaSans_800ExtraBold: require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  })

  useEffect(() => {
    if (loaded && rootNavigationState?.key) {
      setNavigationReady(true)
      SplashScreen.hideAsync()
    }
  }, [loaded, rootNavigationState?.key])

  useEffect(() => {
    if (!isNavigationReady || !loaded) return

    const inAuthGroup = segments[0] === AUTH_GROUP

    if (!isAuthenticated && !inAuthGroup) {
      router.replace(`/${AUTH_GROUP}/login` as Href)
    } else if (isAuthenticated && inAuthGroup) {
      router.replace(`/${HOME_GROUP}` as Href)
    }
  }, [isAuthenticated, segments, isNavigationReady, router, loaded])

  if (!loaded || !isNavigationReady) {
    return null
  }

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
