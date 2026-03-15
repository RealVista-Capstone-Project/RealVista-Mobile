/**
 * Feature hook: useRecommendations
 * Fetches personalized listing recommendations for authenticated users
 */

import {
  recommendationApi,
  recommendationKeys,
  type RecommendedListingDTO,
} from '@/entities/recommendation'
import { useAuthStore } from '@/entities/user'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export function useRecommendations(limit: number = 6) {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: recommendationKeys.list(limit),
    queryFn: () => recommendationApi.getRecommendations(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!token,
  })

  const recommendations: RecommendedListingDTO[] = query.data?.data?.recommendations ?? []
  const behaviorSummary: string | undefined = query.data?.data?.behavior_summary

  const refresh = useCallback(async () => {
    try {
      const res = await recommendationApi.refreshRecommendations(limit)
      // Update cache with fresh data
      queryClient.setQueryData(recommendationKeys.list(limit), res)
    } catch {
      console.warn('[Recommendations] Failed to force refresh')
    }
  }, [limit, queryClient])

  return {
    recommendations,
    behaviorSummary,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    refresh,
  }
}
