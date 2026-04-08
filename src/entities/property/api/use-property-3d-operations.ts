import { useQuery } from '@tanstack/react-query'

import { propertyApi } from './property.api'

export function useProperty3dOperations(propertyId: string) {
  return useQuery({
    queryKey: ['property-3d-operations', propertyId],
    queryFn: async () => {
      if (!propertyId) return []
      const res = await propertyApi.get3dOperations(propertyId)
      return res.data ?? []
    },
    enabled: !!propertyId,
    refetchInterval: 15_000,
  })
}
