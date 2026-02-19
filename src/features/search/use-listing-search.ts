import { listingApi } from '@/entities/listing/api'
import type { AdvancedSearchRequest, ListingSearchResponse } from '@/entities/listing/model/types'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export function useListingSearch(initialCriteria: AdvancedSearchRequest = {}) {
  const [criteria, setCriteria] = useState<AdvancedSearchRequest>(initialCriteria)
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [allListings, setAllListings] = useState<ListingSearchResponse[]>([])

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['listings', 'search', criteria, page],
    queryFn: () => listingApi.searchListings(criteria, page, pageSize),
    placeholderData: (previousData) => previousData,
  })

  // Append new data when page changes or data updates
  useEffect(() => {
    if (data?.content) {
      if (page === 0) {
        setAllListings(data.content)
      } else {
        setAllListings((prev) => {
          // Filter out duplicates just in case
          const newItems = data.content.filter(
            (item) => !prev.some((p) => p.listing_id === item.listing_id)
          )
          return [...prev, ...newItems]
        })
      }
    }
  }, [data, page])

  const search = (newCriteria: Partial<AdvancedSearchRequest>) => {
    // Merge on top of initial criteria (not prev), so listingType is never lost
    // and stale values from previous searches don't bleed into new ones
    setCriteria({ ...initialCriteria, ...newCriteria })
    setPage(0) // Reset to first page on new search
    setAllListings([]) // Clear current list
  }

  // Merge partial criteria additively (e.g., update only location while keeping filters)
  const updateCriteria = (partial: Partial<AdvancedSearchRequest>) => {
    setCriteria((prev) => ({ ...prev, ...partial }))
    setPage(0)
    setAllListings([])
  }

  const updateDynamicAttribute = (key: string, value: string | undefined) => {
    setCriteria((prev) => {
      const currentAttributes = prev.dynamicAttributes || {}
      if (!value) {
        const { [key]: _, ...rest } = currentAttributes
        return { ...prev, dynamicAttributes: rest }
      }
      return {
        ...prev,
        dynamicAttributes: {
          ...currentAttributes,
          [key]: value,
        },
      }
    })
    setPage(0)
    setAllListings([])
  }

  const nextPage = () => {
    if (data && !data.last && !isFetching) {
      setPage((p) => p + 1)
    }
  }

  return {
    listings: allListings,
    totalElements: data?.total_elements || 0,
    totalPages: data?.total_pages || 0,
    currentPage: data?.page || 0,
    isLastPage: data?.last || false,
    isLoading: isLoading && page === 0, // Only show main loading on first page
    isFetchingNextPage: isFetching && page > 0,
    error,
    search,
    updateCriteria,
    updateDynamicAttribute,
    nextPage,
    criteria,
    setCriteria,
    refetch,
  }
}
