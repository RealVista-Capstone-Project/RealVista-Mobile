import { queryOptions } from '@tanstack/react-query'
import { tenantApplicationApi } from './index'
import { tenantApplicationKeys } from './keys'

export const tenantApplicationQueries = {
  myApplications: () =>
    queryOptions({
      queryKey: tenantApplicationKeys.my(),
      queryFn: () => tenantApplicationApi.getMyApplications(),
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnReconnect: true,
      refetchOnMount: true,
    }),
} as const
