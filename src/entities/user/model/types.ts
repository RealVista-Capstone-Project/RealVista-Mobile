/**
 * User entity types
 */

export type UserRole = 'ADMIN' | 'USER'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' // Add other statuses as needed

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  status: UserStatus
  role: UserRole
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  type: string
  email: string
  access_token: string
  user_id: string
}

export interface AuthStore {
  user: User | null
  userId: string | null
  isAuthenticated: boolean
  token: string | null
  setUser: (user: User) => void
  setUserId: (id: string) => void
  setToken: (token: string) => void
  setIsAuthenticated: (status: boolean) => void
  logout: () => void
}
