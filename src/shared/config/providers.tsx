import { ReactQueryProvider } from '@/shared/lib/react-query/QueryClientProvider'
import { ReactElement, ReactNode } from 'react'

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

export const AppProviders = combineProviders(ReactQueryProvider, PostHogProvider)
