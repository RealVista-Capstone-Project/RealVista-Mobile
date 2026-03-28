import http from '@/shared/lib/http'
import type { BookmarkPageResponse, BookmarkResponse, GetBookmarksParams } from '../model/types'

/**
 * Serialize params for Spring Boot @RequestParam List<String>
 * Spring expects repeated keys: propertyTypes=APARTMENT&propertyTypes=HOUSE
 * Axios default uses brackets which Spring doesn't parse correctly
 */
function serializeBookmarkParams(params: GetBookmarksParams): string {
  const p = new URLSearchParams()
  const { propertyTypes, ...rest } = params

  // Add array as repeated keys
  if (propertyTypes && propertyTypes.length > 0) {
    propertyTypes.forEach((type) => p.append('propertyTypes', type))
  }

  // Add scalar params
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      p.append(key, String(value))
    }
  })

  return p.toString()
}

export const bookmarkApi = {
  toggle: (listingId: string) => http.post<BookmarkResponse>(`/listings/bookmark/${listingId}`),

  getBookmarks: (params: GetBookmarksParams = {}) =>
    http.get<BookmarkPageResponse>(`/listings/bookmark?${serializeBookmarkParams(params)}`),
} as const
