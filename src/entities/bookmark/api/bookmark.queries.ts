import { queryOptions } from '@tanstack/react-query'

import { bookmarkApi } from './index'
import { bookmarkKeys } from './keys'
import type { GetBookmarksParams } from '../model/types'

/**
 * Bookmark Query Factory
 * TanStack Query v5 queryOptions for type-safe queries
 */
export const bookmarkQueries = {
  list: (params: GetBookmarksParams = {}) =>
    queryOptions({
      queryKey: bookmarkKeys.list(params),
      queryFn: () => bookmarkApi.getBookmarks(params).then((res) => res.data),
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnReconnect: true,
      refetchOnMount: true,
    }),
} as const
