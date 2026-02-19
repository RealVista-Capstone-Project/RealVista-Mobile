import http from '@/shared/lib/http'
import type {
  AdvancedSearchRequest,
  ApiResponse,
  Listing,
  ListingSearchResponse,
  PageResponse,
} from '../model/types'

export const listingApi = {
  /**
   * Get listing detail by ID or slug
   * GET /listings/:id
   */
  getById: (id: string) => http.get<Listing>(`/listings/${id}`),

  /**
   * Search listings with advanced criteria
   * GET /listings/search
   */
  searchListings: (criteria: AdvancedSearchRequest, page = 0, size = 10) => {
    const params: Record<string, string | number> = {
      page,
      size,
    }

    if (criteria.listingType) params.listingType = criteria.listingType
    if (criteria.propertyType) params.propertyType = criteria.propertyType
    if (criteria.propertyCategory) params.propertyCategory = criteria.propertyCategory
    if (criteria.location) params.location = criteria.location
    if (criteria.minPrice) params.minPrice = criteria.minPrice
    if (criteria.maxPrice) params.maxPrice = criteria.maxPrice
    if (criteria.minArea) params.minArea = criteria.minArea
    if (criteria.maxArea) params.maxArea = criteria.maxArea
    if (criteria.sortBy) params.sortBy = criteria.sortBy

    // Handle dynamic attributes (e.g., bedrooms, bathrooms)
    if (criteria.dynamicAttributes) {
      Object.entries(criteria.dynamicAttributes).forEach(([key, value]) => {
        if (value) {
          params[`dynamicAttributes[${key}]`] = value
        }
      })
    }

    return http
      .get<PageResponse<ListingSearchResponse>>('/listings/search', { params })
      .then((response) => response.data)
  },
} as const
