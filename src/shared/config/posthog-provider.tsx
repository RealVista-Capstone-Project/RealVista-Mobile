/**
 * PostHog Analytics Provider for React Native
 * Wraps the app with PostHog context for event tracking
 */

import { PostHogProvider as PHProvider, usePostHog } from 'posthog-react-native'
import { useEffect, type ReactNode } from 'react'

import { useAuthStore } from '@/entities/user'
import { behaviorTracker, destroyEventQueue } from '@/shared/lib/analytics'

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? ''
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

/**
 * Inner component that initializes the behavior tracker
 * and handles user identify/reset via PostHog
 */
function PostHogInitializer({ children }: { children: ReactNode }) {
  const posthog = usePostHog()
  const { user, isAuthenticated } = useAuthStore()

  // Initialize behavior tracker with PostHog instance
  useEffect(() => {
    console.log('[PostHog] instance from usePostHog:', posthog ? 'ready' : 'null')
    if (posthog) {
      behaviorTracker.init(posthog)
    }

    return () => {
      destroyEventQueue()
    }
  }, [posthog])

  // Identify / reset user when auth state changes
  useEffect(() => {
    if (!posthog) return

    if (isAuthenticated && user) {
      // Use email as distinctId to match web FE identity (consistency across platforms)
      posthog.identify(user.email, {
        id: user.id,
        email: user.email,
        name: user.fullName,
      })
    } else {
      posthog.reset()
    }
  }, [posthog, isAuthenticated, user])

  return <>{children}</>
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <PHProvider
      apiKey={POSTHOG_KEY}
      options={{
        host: POSTHOG_HOST,
        flushAt: 1,
        flushInterval: 5000,
      }}
    >
      <PostHogInitializer>{children}</PostHogInitializer>
    </PHProvider>
  )
}
