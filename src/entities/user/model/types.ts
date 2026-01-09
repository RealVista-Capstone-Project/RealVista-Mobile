/**
 * User entity types
 */

export type UserRole = 'ADMIN' | 'USER'

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: UserRole
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
