import http from '@/shared/lib/http'
import type { Listing } from '../model/types'

export const listingApi = {
  /**
   * Get listing detail by ID or slug
   * GET /listings/:id
   */
  getById: (id: string) => http.get<Listing>(`/listings/${id}`),
} as const
