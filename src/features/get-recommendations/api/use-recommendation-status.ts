/**
 * GET /recommendations/status — event_count vs threshold for UX (show/hide widget)
 */

import { recommendationApi, recommendationKeys } from '@/entities/recommendation'
import { useAuthStore } from '@/entities/user'
import { useQuery } from '@tanstack/react-query'

export function useRecommendationStatus() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: recommendationKeys.status(),
    queryFn: async () => {
      const res = await recommendationApi.getStatus()
      return res.data
    },
    staleTime: 60 * 1000,
    enabled: !!token,
  })
}
