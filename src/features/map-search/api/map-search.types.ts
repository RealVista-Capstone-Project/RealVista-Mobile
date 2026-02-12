// ============================================
// Map Search API Types
// Based on POST /map/listings
// All fields use snake_case to match backend API
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

/** Single marker item in the response (snake_case from API) */
export interface MapMarkerItem {
  listing_id: string
  coordinates: MapCoordinates
  street_address: string
  price: number
  listing_type: 'RENT' | 'SALE'
  name: string
  thumbnail_url: string | null
  bedrooms: number
  bathrooms: number
  size_m2: number
  property_type: string
  location_name: string
  is_favorite: boolean
}

/** Bounds echoed back in the response (snake_case from API) */
export interface MapBounds {
  north_lat: number
  south_lat: number
  east_lng: number
  west_lng: number
}

/** Paginated response from POST /map/listings (snake_case from API) */
export interface MapSearchResponse {
  content: MapMarkerItem[]
  page: number
  size: number
  total_elements: number
  total_pages: number
  last: boolean
  first: boolean
  has_more: boolean
  bounds: MapBounds
  filter_metadata?: {
    applied_filters: Record<string, unknown>
    available_price_range?: { min: number; max: number }
    price_histogram?: number[]
  }
}
