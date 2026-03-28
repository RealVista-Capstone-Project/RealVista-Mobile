/**
 * Recommendation Entity Types
 * Based on BE API response from GET /api/v1/recommendations
 */

import type { Attribute, ListingStatus } from '@/entities/listing/model/types'

export interface RecommendedListingDTO {
  listing_id: string
  listing_type: string
  slug: string
  name: string
  price: number
  thumbnail: string
  /** Legacy; prefer full_address / street + district + city from search-shaped payloads */
  location?: string
  score: number
  reason: string
  street_address?: string
  ward_name?: string
  district_name?: string
  city_name?: string
  full_address?: string
  area?: number
  bedrooms?: number
  bathrooms?: number
  attributes?: Attribute[]
  status?: ListingStatus
  is_favorite?: boolean
  boosted?: boolean
  is_boosted?: boolean
}

export interface RecommendationResponse {
  recommendations: RecommendedListingDTO[]
  user_id: string
  generated_at: string
  behavior_summary: string
  from_cache: boolean
}

/** GET /recommendations/status */
export interface RecommendationStatusData {
  user_id: string
  event_count: number
  threshold_met: boolean
}
