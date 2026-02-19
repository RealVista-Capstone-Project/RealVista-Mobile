/**
 * Query keys factory for Listing entity
 */

export const listingKeys = {
  all: ['listings'] as const,
  detail: (id: string) => [...listingKeys.all, 'detail', id] as const,
  similar: (id: string, limit: number) => [...listingKeys.all, 'similar', id, limit] as const,
} as const
