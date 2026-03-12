import { listingQueries } from '@/entities/listing'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'

/**
 * useListingDetail Hook
 * Fetches listing detail using queryOptions from entities
 * Uses listing ID from route params
 */
export function useListingDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>()

  const query = useQuery({
    ...listingQueries.detail(id || ''),
    enabled: !!id,
  })

  return {
    ...query,
    listingId: id,
  }
}
