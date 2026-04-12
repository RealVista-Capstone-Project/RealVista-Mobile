import http from '@/shared/lib/http'
import type { ApiResponse } from '@/shared/types'
import type { ActiveSubscriptionResponse } from '../model/types'

export const billingApi = {
  getMySubscriptions: (): Promise<ApiResponse<ActiveSubscriptionResponse[]>> =>
    http.get('/billing/subscriptions/me'),
}
