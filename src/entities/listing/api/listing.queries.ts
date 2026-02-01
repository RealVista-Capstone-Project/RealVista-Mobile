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
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
} as const
