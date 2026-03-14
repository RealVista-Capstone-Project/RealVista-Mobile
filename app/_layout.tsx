import '@/shared/lib/websocket/polyfills'
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
import { SidebarDrawer } from '@/widgets/sidebar-drawer'
import { TopNav } from '@/widgets/top-nav'
import '../global.css'

export const unstable_settings = {
  anchor: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

const _AUTH_GROUP = '(auth)'
const _HOME_GROUP = '(tabs)'

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

  // TODO: Remove this block before merging - for reviewer UI testing only
  useEffect(() => {
    if (!isNavigationReady || !loaded) return
    // Using the listing_id from the API response for development
    router.replace('/listing/71cea53a-bff0-b29b-3a9e-9e041c3d0524' as Href)
  }, [isNavigationReady, router, loaded])

  // useEffect(() => {
  //   if (!isNavigationReady || !loaded) return

  //   const inAuthGroup = segments[0] === _AUTH_GROUP

  //   if (!isAuthenticated && !inAuthGroup) {
  //     router.replace(`/${_AUTH_GROUP}/login` as Href)
  //   } else if (isAuthenticated && inAuthGroup) {
  //     router.replace(`/${_HOME_GROUP}` as Href)
  //   }
  // }, [isAuthenticated, segments, isNavigationReady, router, loaded])

  if (!loaded || !isNavigationReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <GluestackUIProvider mode='dark'>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SafeAreaView className='flex-1 bg-gray-50' edges={['top', 'left', 'right']}>
              <SidebarDrawer />
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen
                  name='(tabs)'
                  options={{
                    headerShown: true,
                    header: () => null, // Custom header per screen
                  }}
                />
                <Stack.Screen name='(auth)/login' options={{ headerShown: false }} />
                <Stack.Screen name='modal' options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen
                  name='my-applications'
                  options={{
                    headerShown: true,
                    header: () => <TopNav />,
                  }}
                />
                <Stack.Screen
                  name='listing'
                  options={{
                    headerShown: true,
                    header: () => <TopNav />,
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
