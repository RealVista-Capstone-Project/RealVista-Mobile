import { queryOptions } from '@tanstack/react-query'
import { billingApi } from './billing.api'
import { billingKeys } from './keys'

export const billingQueries = {
  mySubscriptions: () =>
    queryOptions({
      queryKey: billingKeys.mySubscriptions(),
      queryFn: () => billingApi.getMySubscriptions().then((res) => res.data),
      staleTime: 2 * 60 * 1000,
    }),
} as const
