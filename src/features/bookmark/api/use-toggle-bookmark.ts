import { useMutation, useQueryClient } from '@tanstack/react-query'

import { bookmarkApi, bookmarkKeys, type BookmarkPageResponse } from '@/entities/bookmark'
import type { ListingSearchResponse, PageResponse } from '@/entities/listing/model/types'
import { listingKeys } from '@/entities/listing/api/keys'

import { useFavoriteUiSyncStore } from '../model/favorite-ui-sync-store'

export function useToggleBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listingId: string) => bookmarkApi.toggle(listingId).then((res) => res.data),
    onSuccess: (data, listingId) => {
      useFavoriteUiSyncStore.getState().setBookmarked(listingId, data.bookmarked)

      if (!data.bookmarked) {
        queryClient.setQueriesData<BookmarkPageResponse>({ queryKey: bookmarkKeys.all }, (old) => {
          if (!old?.content?.length) return old
          if (!old.content.some((b) => b.listing_id === listingId)) return old
          const content = old.content.filter((b) => b.listing_id !== listingId)
          return {
            ...old,
            content,
            total_elements: Math.max(0, old.total_elements - 1),
          }
        })
      }

      queryClient.setQueriesData<PageResponse<ListingSearchResponse>>(
        { queryKey: ['listings', 'search'] },
        (old) => {
          if (!old?.content) return old
          return {
            ...old,
            content: old.content.map((item) =>
              item.listing_id === listingId ? { ...item, is_favorite: data.bookmarked } : item
            ),
          }
        }
      )

      void queryClient.invalidateQueries({ queryKey: bookmarkKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['listings', 'search'] })
      void queryClient.invalidateQueries({ queryKey: ['map-search'] })
      void queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) })
    },
  })
}
