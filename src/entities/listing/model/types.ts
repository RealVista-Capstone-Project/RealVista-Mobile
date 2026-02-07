/**
 * Listing Entity Types
 * Based on API response from GET /listings/:id
 */

// ============================================
// Property Types
// ============================================

export interface Property {
  description: string
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
// Agent Types
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

  // Nested objects
  property: Property
  location: Location
  propertyType: PropertyType
  media: Media[]
  agent: Agent
  attributes: Attribute[]
  cost_breakdown?: CostBreakdown
}
