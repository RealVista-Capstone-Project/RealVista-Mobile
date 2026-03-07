import { listingQueries } from '@/entities/listing'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'

/**
 * useSimilarListings Hook
 * Fetches similar listings using queryOptions from entities
 * Uses listing ID from route params
 */
export function useSimilarListings(limit: number = 5) {
  const { id } = useLocalSearchParams<{ id?: string }>()

  const query = useQuery({
    ...listingQueries.similar(id || '', limit),
    enabled: !!id,
  })

  return {
    ...query,
    listings: query.data?.listings || [],
    total: query.data?.total || 0,
  }
}
