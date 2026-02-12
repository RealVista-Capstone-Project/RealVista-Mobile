// ============================================
// Map Search API Types
// Based on POST /map/listings
// ============================================

/** Request body for POST /map/listings */
export interface MapSearchRequest {
  north_lat: number
  south_lat: number
  east_lng: number
  west_lng: number
  listing_type?: 'RENT' | 'SALE'
  min_price?: number
  max_price?: number
  limit?: number
  sort_by?: 'price' | 'createdAt' | 'publishedAt'
  sort_direction?: 'asc' | 'desc'
  search_text?: string
  category?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  rental_period?: string
  page?: number
  size?: number
}

/** Coordinates in a marker response */
export interface MapCoordinates {
  latitude: number
  longitude: number
}

/** Single marker item in the response */
export interface MapMarkerItem {
  listingId: string
  coordinates: MapCoordinates
  streetAddress: string
  price: number
  listingType: 'RENT' | 'SALE'
  name: string
  thumbnailUrl: string | null
  bedrooms: number
  bathrooms: number
  sizeM2: number
  propertyType: string
  locationName: string
  isFavorite: boolean
}

/** Bounds echoed back in the response */
export interface MapBounds {
  northLat: number
  southLat: number
  eastLng: number
  westLng: number
}

/** Paginated response from POST /map/listings */
export interface MapSearchResponse {
  content: MapMarkerItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
  empty: boolean
  bounds: MapBounds
  filterMetadata?: {
    appliedFilters: Record<string, unknown>
    availablePriceRange?: { min: number; max: number }
    priceHistogram?: number[]
  }
}
