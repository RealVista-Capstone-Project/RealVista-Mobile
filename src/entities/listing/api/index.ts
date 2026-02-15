import http from '@/shared/lib/http'
import type { Listing, PriceHistoryResponse } from '../model/types'

export const listingApi = {
  /**
   * Get listing detail by ID or slug
   * GET /listings/:id
   */
  getById: (id: string) => http.get<Listing>(`/listings/${id}`),

  /**
   * Get listing price history
   * GET /listings/:id/price-history
   */
  getPriceHistory: (id: string) => http.get<PriceHistoryResponse>(`/listings/${id}/price-history`),
} as const
