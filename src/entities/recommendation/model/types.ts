/**
 * Recommendation Entity Types
 * Based on BE API response from GET /api/v1/recommendations
 */

export interface RecommendedListingDTO {
  listing_id: string
  listing_type: string
  slug: string
  name: string
  price: number
  thumbnail: string
  location: string
  score: number
  reason: string
}

export interface RecommendationResponse {
  recommendations: RecommendedListingDTO[]
  user_id: string
  generated_at: string
  behavior_summary: string
  from_cache: boolean
}
