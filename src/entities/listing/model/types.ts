/**
 * Listing Entity Types
 * Based on API response from GET /listings/:id
 */

// ============================================
// Property Types
// ============================================

export interface Property {
  descriptions: string
  property_id: string
  street_address: string
  land_size_m2: number
  usable_size_m2: number
  width_m: number
  length_m: number
  bedrooms: number
  bathrooms: number
  area_sqft: number
}

// ============================================
// Location Types
// ============================================

export interface Location {
  latitude: number
  longitude: number
  location_id: string
  city_name: string
  district_name: string
  ward_name: string
}

// ============================================
// Property Type Types
// ============================================

export interface PropertyType {
  property_type_id: string
  property_type_name: string
  property_type_code: string
  property_category_id: string
  property_category_name: string
  property_category_code: string
}

// ============================================
// Media Types
// ============================================

export interface Media {
  image: boolean
  '3D': boolean
  video: boolean
  media_id: string
  media_type: 'IMAGE' | 'VIDEO' | 'THREE_D'
  media_url: string
  thumbnail_url: string
  is_primary: boolean
  display_order: number
}

// ============================================
// Agent Types
// ============================================

export interface Agent {
  email: string
  phone: string
  company: string
  user_id: string
  first_name: string
  last_name: string
  full_name: string
  business_name: string
  avatar_url: string
  is_verified: boolean
}

export type Fee = {
  name: string
  amount: number
  fee_type: string
}

// ============================================
// CostBreakdown Types
// ============================================

export interface CostBreakdown {
  base_price: number
  base_price_unit: string
  required_fees: Fee[]
  required_fees_subtotal: number
  optional_fees: Fee[]
  optional_fees_subtotal: number
  total_cost: number
  disclaimer: string
}

// ============================================
// Attribute Types
// ============================================

export interface Attribute {
  icon: string
  text: boolean
  number: boolean
  boolean: boolean
  attribute_id: string
  attribute_code: string
  attribute_name: string
  data_type: 'TEXT' | 'NUMBER' | 'BOOLEAN'
  value_text?: string
  value_number?: number
  value_boolean?: boolean
  display_value: string
  unit?: string
}

// ============================================
// Listing Types
// ============================================

export type ListingStatus = 'DRAFT' | 'PUBLISHED' | 'RENTED' | 'SOLD' | 'EXPIRED'
export type ListingType = 'RENT' | 'SALE'

export interface User {
  user_id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  business_name: string
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'VERIFIED'
}

export interface Listing {
  listing_id: string
  property_id: string
  user_id: string
  status: ListingStatus
  slug: string
  name: string
  listing_type: ListingType
  price: number
  min_price?: number
  max_price?: number
  is_negotiable: boolean
  available_from: string
  published_at: string
  created_at: string
  updated_at: string
  total_photos: number
  total_videos: number
  total_3d_tours: number
  descriptions?: string // Legacy or flattened field

  // Nested objects
  property: Property
  location: Location
  propertyType: PropertyType
  media: Media[]
  agent: Agent
  user?: User // Added user field
  attributes: Attribute[]
  amenities?: Amenity[]
  cost_breakdown?: CostBreakdown
}
// ============================================
// Search Types
// ============================================

export interface AdvancedSearchRequest {
  listingType?: 'RENT' | 'SALE'
  propertyType?: string
  propertyCategory?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  sortBy?: string
  dynamicAttributes?: Record<string, string>
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ListingSearchResponse {
  listing_id: string
  name: string
  slug: string
  listing_type: 'RENT' | 'SALE'
  status: ListingStatus
  price: number
  area: number
  // Legacy field (older API shape)
  location?: string
  // Current BE search response fields
  street_address?: string
  ward_name?: string
  district_name?: string
  city_name?: string
  full_address?: string
  bedrooms?: number
  bathrooms?: number
  thumbnail: string
  published_at: string
  boosted: boolean
  user_type: string
  is_favorite: boolean
  attributes: Attribute[]
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
}

// ============================================
// Similar Listings Types
// ============================================

export interface SimilarListing {
  listing_id: string
  slug: string
  name: string
  listing_type: ListingType
  property_type_name: string
  price: number
  area: number
  location_name: string
  thumbnail_url: string
  similarity_score: number
  published_at: string
  attributes: Attribute[]
  display_price: string
  display_area: string
}

export interface SimilarListingsResponse {
  listings: SimilarListing[]
  total: number
  limit: number
}

// ============================================
// Price History Types
// ============================================

export type PriceChangeType = 'INCREASED' | 'DECREASED' | 'NO_CHANGE'

export interface PriceHistoryEntry {
  price: number
  price_history_id: string
  min_price: number
  max_price: number
  changed_at: string
  price_change: number
  price_change_percent: number
  change_type: PriceChangeType
}

export interface PriceHistoryResponse {
  listing_id: string
  current_price: number
  price_history: PriceHistoryEntry[]
}

// ============================================
// Amenity Types
// ============================================

export type AmenityType = 'ONSITE' | 'OFFSITE'

export interface Amenity {
  amenity_id: string
  amenity_name: string
  amenity_type: AmenityType
  description: string
  is_offsite: boolean
  is_onsite: boolean
}
