/**
 * Feature hook: useRecommendations
 * Fetches personalized listing recommendations for authenticated users
 */

import {
  recommendationApi,
  recommendationKeys,
  type RecommendationListingTypeParam,
  type RecommendedListingDTO,
} from '@/entities/recommendation'
import { useAuthStore } from '@/entities/user'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

export function useRecommendations(
  limit: number = 6,
  listingType?: RecommendationListingTypeParam
) {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: recommendationKeys.list(limit, listingType),
    queryFn: async () => {
      const res = await recommendationApi.getRecommendations(limit, listingType)
      const payload = res?.data
      const recommendationsLength = payload?.recommendations?.length ?? 0
      const fromCache = payload?.from_cache
      const behaviorSummary = payload?.behavior_summary

      console.log('[Recommendations][GET] length=', recommendationsLength, 'from_cache=', fromCache)
      console.log('[Recommendations][GET] behavior_summary=', behaviorSummary)
      return res
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!token,
  })

  const rawRecommendations: RecommendedListingDTO[] = useMemo(
    () => query.data?.data?.recommendations ?? [],
    [query.data]
  )

  /** BE đã lọc theo listingType; giữ lọc phía client phòng API cũ / lệch chữ hoa */
  const recommendations: RecommendedListingDTO[] = useMemo(() => {
    if (!listingType) return rawRecommendations
    return rawRecommendations.filter(
      (r) => String(r.listing_type || '').toUpperCase() === listingType
    )
  }, [rawRecommendations, listingType])

  const behaviorSummary: string | undefined = query.data?.data?.behavior_summary

  const refresh = useCallback(async () => {
    try {
      const res = await recommendationApi.refreshRecommendations(limit, listingType)
      const payload = res?.data
      const recommendationsLength = payload?.recommendations?.length ?? 0
      const fromCache = payload?.from_cache
      const behaviorSummary = payload?.behavior_summary
      console.log(
        '[Recommendations][POST refresh] length=',
        recommendationsLength,
        'from_cache=',
        fromCache
      )
      console.log('[Recommendations][POST refresh] behavior_summary=', behaviorSummary)
      queryClient.setQueryData(recommendationKeys.list(limit, listingType), res)
    } catch {
      console.warn('[Recommendations] Failed to force refresh')
    }
  }, [limit, listingType, queryClient])

  return {
    recommendations,
    rawRecommendations,
    behaviorSummary,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    isError: query.isError,
    refetch: query.refetch,
    refresh,
  }
}
