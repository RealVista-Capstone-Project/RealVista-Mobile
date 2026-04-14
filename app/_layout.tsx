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

import { AppProviders } from '@/shared/config/providers'
import { usePushNotifications } from '@/features/notifications/api/use-push-notifications'
import { useColorScheme } from '@/shared/lib/hooks/use-color-scheme'
import { GluestackUIProvider } from '@/shared/ui/gluestack-ui-provider'
import { MobileHeader } from '@/widgets/mobile-header'
import { TopNav } from '@/widgets/top-nav'
import AsyncStorage from '@react-native-async-storage/async-storage'
import '../global.css'

const _AUTH_GROUP = '(auth)'
const _DEFAULT_PAGE = '/(tabs)/explore'

export const unstable_settings = {
  anchor: '(tabs)/explore',
}

SplashScreen.preventAutoHideAsync()

// Exported for unit testing — resolves notification tap data to a route descriptor
export function resolveDeepLinkRoute(data: {
  event_type: string | undefined
  propertyId: string | undefined
  roomName: string | undefined
  entity_id: string | undefined
}): { pathname: string; params: Record<string, string> } {
  const { event_type, propertyId, roomName, entity_id } = data

  switch (event_type) {
    // BE sends PROPERTY_3D_GENERATED when a 3D tour is ready — entity_id is the property ID
    case 'PROPERTY_3D_GENERATED':
    case 'VIRTUAL_TOUR':
    case '3D_VIEW': {
      const params: Record<string, string> = {}
      // entity_id is the property ID for 3D/tour notifications from BE
      const resolvedPropertyId = propertyId ?? entity_id
      if (resolvedPropertyId) params.propertyId = resolvedPropertyId
      if (roomName) params.roomName = roomName
      return { pathname: '/world-viewer', params }
    }
    // BE sends NEW_TOUR_REQUEST to property owner when someone books a tour
    case 'NEW_TOUR_REQUEST':
    case 'APPOINTMENT':
    case 'APPOINTMENT_REMINDER':
    case 'APPOINTMENT_CONFIRMED':
    case 'APPOINTMENT_CANCELLED': {
      const params: Record<string, string> = {}
      if (entity_id) params.entity_id = entity_id
      return { pathname: '/appointments', params }
    }
    case 'NEW_LISTING':
    case 'PRICE_CHANGE':
    case 'LISTING':
    case 'PROPERTY': {
      return { pathname: '/listing/[id]', params: { id: entity_id ?? '' } }
    }
    default:
      return { pathname: '/(tabs)', params: {} }
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const segments = useSegments()
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const { registerDevice } = usePushNotifications()
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

  // Auto-register push notifications when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      registerDevice()
    }
  }, [isAuthenticated, registerDevice])

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

  // Handle notification tap — navigate by event type
  useEffect(() => {
    if (!isNavigationReady) return

    const subscription = NotificationService.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>
      const propertyId = (data?.property_id ?? data?.propertyId) as string | undefined
      const roomName = (data?.room_name ?? data?.roomName) as string | undefined
      const event_type = data?.event_type as string | undefined
      const entity_id = data?.entity_id as string | undefined

      const route = resolveDeepLinkRoute({ event_type, propertyId, roomName, entity_id })
      router.push(route as Href)
    })

    return () => {
      subscription.remove()
    }
  }, [isNavigationReady, router])

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
                <Stack.Screen
                  name='capture'
                  options={{
                    headerShown: false,
                    animation: 'slide_from_bottom',
                  }}
                />
                <Stack.Screen
                  name='world-generation'
                  options={{
                    headerShown: false,
                    animation: 'slide_from_bottom',
                  }}
                />
                <Stack.Screen
                  name='world-viewer'
                  options={{
                    headerShown: false,
                    animation: 'fade',
                  }}
                />
                <Stack.Screen
                  name='appointments'
                  options={{
                    headerShown: true,
                    header: () => <TopNav showBack />,
                  }}
                />
                <Stack.Screen
                  name='manage-3d/[id]'
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
              </Stack>
              <StatusBar style='auto' />
            </SafeAreaView>
          </ThemeProvider>
        </GluestackUIProvider>
      </AppProviders>
    </GestureHandlerRootView>
  )
}
