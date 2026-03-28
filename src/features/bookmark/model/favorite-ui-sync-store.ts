import { create } from 'zustand'

/**
 * Last-known bookmark toggle result per listing, shared across screens.
 * Fixes list rows not updating after favoriting on detail (search list uses copied state).
 */
type FavoriteUiSyncState = {
  bookmarkedByListingId: Record<string, boolean>
  setBookmarked: (listingId: string, bookmarked: boolean) => void
  clearAllNotInListingIds: (ids: Set<string>) => void
}

export const useFavoriteUiSyncStore = create<FavoriteUiSyncState>((set) => ({
  bookmarkedByListingId: {},
  setBookmarked: (listingId, bookmarked) =>
    set((s) => ({
      bookmarkedByListingId: { ...s.bookmarkedByListingId, [listingId]: bookmarked },
    })),
  clearAllNotInListingIds: (ids) =>
    set((s) => {
      const next = { ...s.bookmarkedByListingId }
      let changed = false
      for (const id of Object.keys(next)) {
        if (!ids.has(id)) {
          delete next[id]
          changed = true
        }
      }
      return changed ? { bookmarkedByListingId: next } : s
    }),
}))
