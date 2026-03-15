/**
 * Recommendation Entity API
 * Handles data fetching for recommendations
 */

import http from '@/shared/lib/http'
import type { RecommendationResponse } from '../model/types'

export const recommendationApi = {
  /** Fetch personalized recommendations */
  getRecommendations(limit: number = 6) {
    return http.get<RecommendationResponse>(`/recommendations?limit=${limit}`)
  },

  /** Force refresh recommendations (bypass cache/threshold) */
  refreshRecommendations(limit: number = 6) {
    return http.post<RecommendationResponse>(`/recommendations/refresh?limit=${limit}`)
  },
}

/** Query key factory for recommendations */
export const recommendationKeys = {
  all: ['recommendations'] as const,
  list: (limit: number) => [...recommendationKeys.all, limit] as const,
}
