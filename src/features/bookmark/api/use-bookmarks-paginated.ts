import { bookmarkQueries } from '@/entities/bookmark'
import type { BookmarkListingCard, GetBookmarksParams } from '@/entities/bookmark'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type UseBookmarksPaginatedFilters = Omit<GetBookmarksParams, 'page'>

/**
 * Bookmark list with infinite-style paging (page 0, 1, …) merged into one array.
 * Resets when filter params change (serialized).
 */
export function useBookmarksPaginated(filterParams: UseBookmarksPaginatedFilters) {
  const pageSize = filterParams.size ?? 20

  const normalized = useMemo(
    (): Omit<GetBookmarksParams, 'page'> => ({
      propertyTypes: filterParams.propertyTypes,
      listingType: filterParams.listingType,
      sortDirection: filterParams.sortDirection,
      size: pageSize,
    }),
    [filterParams.listingType, filterParams.sortDirection, pageSize, filterParams.propertyTypes]
  )

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        pt: normalized.propertyTypes,
        lt: normalized.listingType,
        sd: normalized.sortDirection,
        s: pageSize,
      }),
    [normalized.listingType, normalized.propertyTypes, normalized.sortDirection, pageSize]
  )

  const [page, setPage] = useState(0)
  const [allBookmarks, setAllBookmarks] = useState<BookmarkListingCard[]>([])

  useEffect(() => {
    setPage(0)
    setAllBookmarks([])
  }, [filterKey])

  const params: GetBookmarksParams = useMemo(() => ({ ...normalized, page }), [normalized, page])

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    ...bookmarkQueries.list(params),
  })

  useEffect(() => {
    if (data?.content) {
      if (page === 0) {
        setAllBookmarks(data.content)
      } else {
        setAllBookmarks((prev) => {
          const newItems = data.content.filter(
            (item) => !prev.some((p) => p.listing_id === item.listing_id)
          )
          return [...prev, ...newItems]
        })
      }
    }
  }, [data, page])

  const nextPage = useCallback(() => {
    if (data && !data.last && !isFetching) {
      setPage((p) => p + 1)
    }
  }, [data, isFetching])

  const removeBookmark = useCallback((listingId: string) => {
    setAllBookmarks((prev) => prev.filter((b) => b.listing_id !== listingId))
  }, [])

  return {
    bookmarks: allBookmarks,
    totalElements: data?.total_elements ?? 0,
    isLoading: isLoading && page === 0,
    isFetchingNextPage: isFetching && page > 0,
    isLastPage: data?.last ?? true,
    error,
    refetch,
    nextPage,
    removeBookmark,
  }
}
