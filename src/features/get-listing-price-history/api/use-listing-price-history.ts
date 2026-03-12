import { listingQueries } from '@/entities/listing'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'

/**
 * useListingPriceHistory Hook
 * Fetches listing price history using queryOptions from entities
 * Uses listing ID from route params
 */
export function useListingPriceHistory() {
  const { id } = useLocalSearchParams<{ id?: string }>()

  const query = useQuery({
    ...listingQueries.priceHistory(id || ''),
    enabled: !!id,
  })

  return {
    ...query,
    listingId: id,
  }
}
