import { useQuery } from '@tanstack/react-query'

import { propertyApi } from './property.api'

export function useMyProperties(params: { keyword?: string; page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: ['my-properties', params.keyword, params.page, params.size],
    queryFn: () => propertyApi.getMyProperties(params),
  })
}
