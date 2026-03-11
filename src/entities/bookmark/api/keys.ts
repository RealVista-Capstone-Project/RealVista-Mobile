/**
 * Query keys factory for Bookmark entity
 */

export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  list: (params: object) => [...bookmarkKeys.lists(), params] as const,
} as const
