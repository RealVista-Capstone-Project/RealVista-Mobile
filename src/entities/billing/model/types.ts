export interface ActiveSubscriptionResponse {
  subscription_id: string
  package_code: string
  package_name: string
  feature_type: string // e.g. '3D_TOUR' | 'LISTING' | 'AI_REQUEST'
  quota_limit?: number | null
  remaining_quota: number | null
  unlimited: boolean
  tier_level?: number
  start_date: string
  end_date: string | null
  status: string
}
