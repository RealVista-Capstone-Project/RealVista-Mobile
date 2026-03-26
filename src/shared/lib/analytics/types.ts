/**
 * Types for behavior tracking and recommendation APIs
 */

export interface BehaviorEventDTO {
  event_type: string
  listing_id: string
  duration_seconds?: number | null
  metadata?: Record<string, unknown> | null
}

export interface UserBehaviorRequest {
  user_id: string
  events: BehaviorEventDTO[]
}

export interface BehaviorEventMetadata {
  listing_type?: 'RENT' | 'SALE'
  property_type?: string
  price?: number
  source_page?: 'home' | 'buy' | 'rent' | 'detail' | 'search' | 'similar' | 'map'
  position?: number
}
