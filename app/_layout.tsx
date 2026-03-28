import { NotificationService } from '@/shared/services/notification'
import { useAuthStore } from '@/entities/user'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Href, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuthStore } from '@/entities/user'
import { AppProviders } from '@/shared/config/providers'
import { useColorScheme } from '@/shared/lib/hooks/use-color-scheme'
import { GluestackUIProvider } from '@/shared/ui/gluestack-ui-provider'
import { MobileHeader } from '@/widgets/mobile-header'
import AsyncStorage from '@react-native-async-storage/async-storage'
import '../global.css'

const _AUTH_GROUP = '(auth)'
const _HOME_GROUP = '(tabs)'

export const unstable_settings = {
  anchor: '(tabs)/explore',
}

SplashScreen.preventAutoHideAsync()

const _AUTH_GROUP = '(auth)'
const _DEFAULT_PAGE = '/(tabs)/explore'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const segments = useSegments()
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const segments = useSegments()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
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

  // Validate token on app start
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = await AsyncStorage.getItem('token')

      // If user claims to be authenticated but no token in storage, logout
      if (isAuthenticated && !storedToken) {
        console.log('[Auth] No token found in storage, logging out')
        logout()
      }

      // If token in storage but user not authenticated in state, also clear
      if (!isAuthenticated && storedToken) {
        console.log('[Auth] Token found but not authenticated, clearing storage')
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('refresh_token')
      }
    }

    if (isNavigationReady && loaded) {
      validateToken()
    }
  }, [isNavigationReady, loaded, isAuthenticated, logout])

  // Route guard - redirect based on auth state
  useEffect(() => {
    if (!isNavigationReady || !loaded) return

    const inAuthGroup = segments[0] === _AUTH_GROUP

    // If not authenticated (or no token), redirect to login
    if ((!isAuthenticated || !token) && !inAuthGroup) {
      router.replace(`/${_AUTH_GROUP}/login` as Href)
    }
    // If authenticated with token, redirect away from auth pages
    else if (isAuthenticated && token && inAuthGroup) {
      router.replace(_DEFAULT_PAGE as Href)
    }
  }, [isAuthenticated, token, segments, isNavigationReady, router, loaded])

  useEffect(() => {
    // Request Permission on App Start (or wait for user action)
    // The NotificationProvider already handles registration on mount,
    // but we can still check permissions here if needed for early UI logic.
    NotificationService.requestPermissions().then((granted) => {
      if (granted) {
        console.log('Global notification permission granted')
      }
    })
  }, [])

  if (!loaded || !isNavigationReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <GluestackUIProvider mode='dark'>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SafeAreaView className='flex-1 bg-gray-50' edges={['top', 'left', 'right']}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                <Stack.Screen name='(auth)/login' options={{ headerShown: false }} />
                <Stack.Screen name='modal' options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen
                  name='listing'
                  options={{
                    headerShown: true,
                    header: () => <MobileHeader />,
                  }}
                />
                <Stack.Screen
                  name='notifications'
                  options={{
                    headerShown: true,
                    header: () => <TopNav showBack />,
                  }}
                />
                <Stack.Screen name='buy-page' options={{ headerShown: false }} />
                <Stack.Screen name='rent-page' options={{ headerShown: false }} />
                <Stack.Screen name='saved' options={{ headerShown: false }} />
              </Stack>
              <StatusBar style='auto' />
            </SafeAreaView>
          </ThemeProvider>
        </GluestackUIProvider>
      </AppProviders>
    </GestureHandlerRootView>
  )
}
