import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export function ReactQueryProvider({
  children,
  client,
}: {
  children: ReactNode
  client?: QueryClient
}) {
  const [internalClient] = useState(
    () =>
      client ||
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false, // Not relevant for React Native
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return <QueryClientProvider client={internalClient}>{children}</QueryClientProvider>
}
