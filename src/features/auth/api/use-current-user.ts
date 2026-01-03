import { useAuthStore, userQueries } from '@/entities/user'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

/**
 * useCurrentUser Hook
 * Fetches current user using queryOptions from entities
 */
export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser)
  const token = useAuthStore((state) => state.token)

  const query = useQuery({
    ...userQueries.current(),
    enabled: !!token, // Only fetch if we have a token
  })

  // Update store when data changes
  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  return query
}
