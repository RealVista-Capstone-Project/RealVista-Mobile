import http from '@/shared/lib/http'
import type { MapSearchRequest, MapSearchResponse } from './map-search.types'

/**
 * Map Search API
 * POST /map/listings — search property markers within a bounding box
 */
export const mapSearchApi = {
  search: (params: MapSearchRequest) => http.post<MapSearchResponse>('/map/listings', params),
} as const
