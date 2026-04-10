import { useQuery } from '@tanstack/react-query'

import { propertyApi } from './property.api'

interface UsePropertyDetailOptions {
  refetchInterval?: number | false
}

export function usePropertyDetail(propertyId: string, options: UsePropertyDetailOptions = {}) {
  return useQuery({
    queryKey: ['property-detail', propertyId],
    queryFn: async () => {
      if (!propertyId) return null
      const res = await propertyApi.getPropertyDetail(propertyId)
      return res.data ?? null
    },
    enabled: !!propertyId,
    refetchInterval: options.refetchInterval ?? false,
  })
}
