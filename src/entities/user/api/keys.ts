/**
 * Query keys factory for User entity
 */

export const userKeys = {
  all: ['users'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  profile: () => [...userKeys.current(), 'profile'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
} as const
