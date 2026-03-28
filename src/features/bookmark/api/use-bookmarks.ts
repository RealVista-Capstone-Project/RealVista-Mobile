import { useQuery } from '@tanstack/react-query'

import { bookmarkQueries } from '@/entities/bookmark'
import type { GetBookmarksParams } from '@/entities/bookmark'

export function useBookmarks(params: GetBookmarksParams = {}) {
  const { data, isLoading, error, refetch } = useQuery(bookmarkQueries.list(params))

  return {
    bookmarks: data?.content ?? [],
    totalElements: data?.total_elements ?? 0,
    totalPages: data?.total_pages ?? 0,
    isFirst: data?.first ?? true,
    isLast: data?.last ?? true,
    isLoading,
    error,
    refetch,
  }
}
