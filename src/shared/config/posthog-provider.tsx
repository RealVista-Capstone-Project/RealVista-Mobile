/**
 * PostHog Analytics Provider for React Native
 * Wraps the app with PostHog context for event tracking
 */

import { PostHogProvider as PHProvider, usePostHog } from 'posthog-react-native'
import { useEffect, type ReactNode } from 'react'

import { useAuthStore } from '@/entities/user'
import { behaviorTracker, destroyEventQueue } from '@/shared/lib/analytics'

const POSTHOG_KEY = 'phc_ong5Ek667U8GZn1bAftpWfP2WYPiefXtidQJepGI1dA'
const POSTHOG_HOST = 'https://us.i.posthog.com'

/**
 * Inner component that initializes the behavior tracker
 * and handles user identify/reset via PostHog
 */
function PostHogInitializer({ children }: { children: ReactNode }) {
  const posthog = usePostHog()
  const { user, isAuthenticated } = useAuthStore()

  // Initialize behavior tracker with PostHog instance
  useEffect(() => {
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
      posthog.identify(user.id, {
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
        enableSessionReplay: false,
      }}
    >
      <PostHogInitializer>{children}</PostHogInitializer>
    </PHProvider>
  )
}
