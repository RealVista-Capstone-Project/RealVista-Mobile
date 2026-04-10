import http from '@/shared/lib/http'
import type {
  CreateProperty3dOperationRequest,
  Property3dOperation,
  PropertyDetailResponse,
  PropertySummaryResponse,
  PageResponse,
} from './property-api.types'

export const propertyApi = {
  getMyProperties: (params: { keyword?: string; page?: number; size?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.keyword) query.append('keyword', params.keyword)
    query.append('page', (params.page ?? 0).toString())
    query.append('size', (params.size ?? 20).toString())

    return http.get<PageResponse<PropertySummaryResponse>>(`/properties/me?${query.toString()}`)
  },

  getPropertyDetail: (propertyId: string) => {
    return http.get<PropertyDetailResponse>(`/properties/${propertyId}`)
  },

  get3dOperations: (propertyId: string) => {
    return http.get<Property3dOperation[]>(`/properties/${propertyId}/3d-operations`)
  },

  initiate3dOperation: (propertyId: string, request: CreateProperty3dOperationRequest) => {
    return http.post<Property3dOperation>(`/properties/${propertyId}/3d-operations`, request)
  },

  deleteMedia: (mediaId: string) => {
    return http.delete(`/media/${mediaId}`)
  },

  delete3dOperation: (propertyId: string, operationId: string) => {
    return http.delete(`/properties/${propertyId}/3d-operations/${operationId}`)
  },

  updateRoomName: (propertyId: string, operationId: string, roomName: string) => {
    return http.patch<Property3dOperation>(
      `/properties/${propertyId}/3d-operations/${operationId}`,
      { room_name: roomName }
    )
  },
}
