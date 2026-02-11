import http from '@/shared/lib/http'
import type { Listing, SimilarListingsResponse } from '../model/types'

export const listingApi = {
  /**
   * Get listing detail by ID or slug
   * GET /listings/:id
   */
  getById: (id: string) => http.get<Listing>(`/listings/${id}`),

  /**
   * Get similar listings by listing ID
   * GET /listings/:id/similar?limit=5
   */
  getSimilar: (id: string, limit: number = 5) =>
    http.get<SimilarListingsResponse>(`/listings/${id}/similar`, {
      params: { limit },
    }),
} as const
