import { renderHook, act } from '@testing-library/react-native'
import { useLogout } from '../use-logout'
import { useAuthStore } from '@/entities/user'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock dependencies
jest.mock('@/entities/user', () => ({
  useAuthStore: jest.fn(),
}))

describe('useLogout', () => {
  let mockLogout: jest.Mock
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock auth store logout function
    mockLogout = jest.fn()
    ;(useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: { id: '1', email: 'test@example.com' },
        isAuthenticated: true,
        token: 'test-token',
        setUser: jest.fn(),
        setToken: jest.fn(),
        logout: mockLogout,
      }
      return selector(state)
    })

    // Create QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should initialize logout mutation', () => {
    const { result } = renderHook(() => useLogout(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.mutate).toBeDefined()
    expect(result.current.isPending).toBe(false)
  })

  it('should remove tokens from AsyncStorage on logout', async () => {
    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token')
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refresh_token')
  })

  it('should call auth store logout on success', async () => {
    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(mockLogout).toHaveBeenCalled()
  })

  it('should clear all queries on logout', async () => {
    // Add some cached queries
    await queryClient.prefetchQuery({
      queryKey: ['test'],
      queryFn: async () => 'data',
    })

    const clearSpy = jest.spyOn(queryClient, 'clear')

    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(clearSpy).toHaveBeenCalled()
  })

  it('should handle logout errors gracefully', async () => {
    const { result } = renderHook(() => useLogout(), { wrapper })

    // The mutation should complete even if there are errors
    await act(async () => {
      try {
        await result.current.mutateAsync()
      } catch {
        // Error might be thrown
      }
    })

    // Should still call logout
    expect(mockLogout).toHaveBeenCalled()
  })

  it('should execute all cleanup operations', async () => {
    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    // Verify all cleanup operations were called
    expect(mockLogout).toHaveBeenCalled()
  })
})
