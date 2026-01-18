import { act, renderHook } from '@testing-library/react-native'
import type { StateCreator } from 'zustand'
import { useAuthStore } from '../store'
import type { AuthStore, User } from '../types'

// Mock zustand persist to avoid AsyncStorage issues in tests
jest.mock('zustand/middleware', () => ({
  ...jest.requireActual('zustand/middleware'),
  persist: (config: StateCreator<AuthStore>) => (set: any, get: any, api: any) => {
    // Return the config without persistence for testing
    const store = config(set, get, api)
    return store
  },
}))

describe('useAuthStore', () => {
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state before each test
    useAuthStore.getState().logout()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
  })

  it('should set user and update isAuthenticated', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setUser(mockUser)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should set token', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockToken = 'test-token-123'

    act(() => {
      result.current.setToken(mockToken)
    })

    expect(result.current.token).toBe(mockToken)
  })

  it('should logout and clear all state', () => {
    const { result } = renderHook(() => useAuthStore())

    // Setup initial state
    act(() => {
      result.current.setUser(mockUser)
      result.current.setToken('test-token')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('test-token')

    // Logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
  })

  it('should handle multiple setUser calls', () => {
    const { result } = renderHook(() => useAuthStore())

    const user1: User = { ...mockUser, id: 1, firstName: 'User 1' }
    const user2: User = { ...mockUser, id: 2, firstName: 'User 2' }

    act(() => {
      result.current.setUser(user1)
    })
    expect(result.current.user).toEqual(user1)

    act(() => {
      result.current.setUser(user2)
    })
    expect(result.current.user).toEqual(user2)
  })

  it('should maintain isAuthenticated when setting same user', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setUser(mockUser)
    })
    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.setUser(mockUser)
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle setting token before user', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setToken('early-token')
    })

    expect(result.current.token).toBe('early-token')
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
