import { queryOptions } from '@tanstack/react-query'
import { listingApi } from './index'
import { listingKeys } from './keys'

/**
 * Listing Query Factory
 * TanStack Query v5 queryOptions for type-safe queries
 */
export const listingQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: listingKeys.detail(id),
      queryFn: () => listingApi.getById(id).then((res) => res.data),
      enabled: !!id,
      // Data remains fresh for 10 minutes (listing details don't change often)
      staleTime: 10 * 60 * 1000,
      // Keep cached data for 30 minutes (users often return to same listing)
      gcTime: 30 * 60 * 1000,
      // Retry failed requests up to 2 times (better UX for flaky networks)
      retry: 2,
      // Refetch when app reconnects to internet (mobile use case)
      refetchOnReconnect: true,
      // Don't refetch when screen remounts if data is fresh
      refetchOnMount: false,
    }),

  priceHistory: (id: string) =>
    queryOptions({
      queryKey: listingKeys.priceHistory(id),
      queryFn: () => listingApi.getPriceHistory(id).then((res) => res.data),
      enabled: !!id,
      // Price history doesn't change frequently
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnReconnect: true,
      refetchOnMount: false,
    }),
} as const
