import { ReactQueryProvider } from '@/shared/lib/react-query/QueryClientProvider'
import { ReactElement, ReactNode } from 'react'
import { NotificationProvider } from '../services/notification/notification-provider'

import { PostHogProvider } from './posthog-provider'

type Provider = ({ children }: { children: ReactNode }) => ReactElement

export function combineProviders(...providers: Provider[]) {
  return function CombinedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children as ReactElement
    )
  }
}

export const AppProviders = combineProviders(
  ReactQueryProvider as Provider,
  NotificationProvider as Provider,
  PostHogProvider as Provider
  // Add more providers here (Theme, Auth, etc.)
)
