/**
 * Bookmark entity types
 * Mirrors BookmarkResponse and BookmarkListingCardDTO from BE
 */

export interface BookmarkResponse {
  user_id: string
  listing_id: string
  user_email: string
  user_full_name: string
  listing_type: 'SALE' | 'RENT'
  property_address: string
  bookmarked: boolean
  action_timestamp: string
}

export interface BookmarkAttributeDTO {
  attribute_code: string
  attribute_name: string
  value_number?: number
  value_text?: string
  value_boolean?: boolean
  priority?: number
}

export interface BookmarkListingCard {
  listing_id: string
  slug: string
  title: string
  price: number
  listing_type: 'SALE' | 'RENT'
  is_negotiable: boolean
  primary_image_url: string
  street_address: string
  city_name: string
  district_name: string
  ward_name: string
  full_address: string
  property_type_name: string
  property_category_name: string
  attributes: BookmarkAttributeDTO[]
  bookmarked_at: string
  area_sqft: number
  usable_size_m2: number
  status: string
}

export interface GetBookmarksParams {
  propertyTypes?: string[]
  listingType?: 'SALE' | 'RENT'
  sortDirection?: 'NEWEST' | 'OLDEST'
  page?: number
  size?: number
}

export interface BookmarkPageResponse {
  content: BookmarkListingCard[]
  page: number
  size: number
  total_elements: number
  total_pages: number
  first: boolean
  last: boolean
}
