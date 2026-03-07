import http from '@/shared/lib/http'
import type { Listing, PriceHistoryResponse, SimilarListingsResponse } from '../model/types'

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

  /**
   * Get listing price history
   * GET /listings/:id/price-history
   */
  getPriceHistory: (id: string) => http.get<PriceHistoryResponse>(`/listings/${id}/price-history`),
} as const
