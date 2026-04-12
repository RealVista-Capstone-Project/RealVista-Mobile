import { useQuery, useQueryClient } from '@tanstack/react-query'
import { billingKeys, billingQueries } from '../api'

export interface ThreeDQuota {
  remaining: number
  quotaLimit: number | null
  unlimited: boolean
  isLocked: boolean
  isLoading: boolean
  isError: boolean
  invalidateQuota: () => void
}

export function useThreeDQuota(): ThreeDQuota {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery(billingQueries.mySubscriptions())

  const subscription = data?.find((s) => s.feature_type === '3D_TOUR' && s.status === 'ACTIVE')

  const remaining = subscription?.remaining_quota ?? 0
  const quotaLimit = subscription?.quota_limit ?? null
  const unlimited = subscription?.unlimited ?? false

  const isLocked = !isLoading && !isError && (!subscription || (!unlimited && remaining <= 0))

  const invalidateQuota = () => {
    queryClient.invalidateQueries({ queryKey: billingKeys.mySubscriptions() })
  }

  return {
    remaining,
    quotaLimit,
    unlimited,
    isLocked,
    isLoading,
    isError,
    invalidateQuota,
  }
}
