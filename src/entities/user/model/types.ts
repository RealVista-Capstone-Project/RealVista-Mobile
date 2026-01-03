/**
 * User entity types
 */

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}
