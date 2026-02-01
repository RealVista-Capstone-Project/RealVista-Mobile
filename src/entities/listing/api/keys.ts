/**
 * Query keys factory for Listing entity
 */

export const listingKeys = {
  all: ['listings'] as const,
  detail: (id: string) => [...listingKeys.all, 'detail', id] as const,
} as const
