/**
 * Recommendation Entity API
 * Handles data fetching for recommendations
 */

import http from '@/shared/lib/http'
import type { RecommendationResponse, RecommendationStatusData } from '../model/types'

export type RecommendationListingTypeParam = 'SALE' | 'RENT'

export const recommendationApi = {
  /** Fetch personalized recommendations (listingType → AI chỉ ứng viên SALE hoặc RENT) */
  getRecommendations(limit: number = 6, listingType?: RecommendationListingTypeParam) {
    return http.get<RecommendationResponse>('/recommendations', {
      params: {
        limit,
        ...(listingType ? { listingType } : {}),
      },
    })
  },

  /** Force refresh recommendations (bypass cache/threshold) */
  refreshRecommendations(limit: number = 6, listingType?: RecommendationListingTypeParam) {
    return http.post<RecommendationResponse>('/recommendations/refresh', undefined, {
      params: {
        limit,
        ...(listingType ? { listingType } : {}),
      },
    })
  },

  /** Behavior event count & threshold flag (for showing recommendation UI) */
  getStatus() {
    return http.get<RecommendationStatusData>('/recommendations/status')
  },
}

/** Query key factory for recommendations */
export const recommendationKeys = {
  all: ['recommendations'] as const,
  list: (limit: number, listingType?: RecommendationListingTypeParam) =>
    [...recommendationKeys.all, limit, listingType ?? 'ANY'] as const,
  status: () => [...recommendationKeys.all, 'status'] as const,
}
