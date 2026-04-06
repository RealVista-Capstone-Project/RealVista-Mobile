/**
 * Property API types for mobile, mirroring the web's property-api.types.ts
 * Only includes what's needed for the 3D generation flow.
 */

// --- My Properties ---

export interface PropertyTypeInfo {
  property_type_id: string
  property_type_name: string | null
  property_type_code: string | null
  property_category_id: string | null
  property_category_name: string | null
  property_category_code: string | null
}

export interface LocationInfo {
  location_id: string
  city_name: string | null
  district_name: string | null
  ward_name: string | null
  latitude: number | null
  longitude: number | null
}

export interface PropertyMediaItem {
  media_id: string
  media_type: string
  media_url: string
  thumbnail_url: string | null
  is_primary: boolean
  is_property_standard: boolean
  display_order: number
}

export interface PropertySummaryResponse {
  property_id: string
  property_type_id: string
  street_address: string
  status: 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD'
  land_size_m2: number | null
  usable_size_m2: number | null
  width_m: number | null
  length_m: number | null
  area_sqft: number | null
  description: string | null
  property_type_info: PropertyTypeInfo | null
  location_info: LocationInfo | null
  media?: PropertyMediaItem[] | null
  has_3d: boolean
  thumbnail_url: string | null
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements?: number
  totalPages?: number
  last?: boolean
  first?: boolean
  hasNext?: boolean
  hasPrevious?: boolean
}

// --- 3D Operations ---

export interface Property3dOperation {
  id?: string
  propertyId?: string
  operationId: string
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
  errorMessage?: string | null
  createdAt?: string | null
}

export interface CreateProperty3dOperationRequest {
  model: string
  display_name?: string
  room_name?: string
  images: { media_asset_id: string; azimuth: number }[]
}

// --- Property Detail (for 3D viewer) ---

export interface PropertyDetailMedia {
  media_id: string
  media_type: string
  media_url: string
  thumbnail_url: string | null
  is_primary: boolean
  display_order: number
  metadata: Record<string, unknown> | null
}

export interface PropertyDetailResponse {
  property_id: string
  street_address: string
  status: string
  media: PropertyDetailMedia[] | null
}
