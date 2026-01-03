import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLogin } from '../use-login';
import { useAuthStore } from '@/entities/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@/entities/user', () => ({
  useAuthStore: jest.fn(),
  userApi: {
    getCurrent: jest.fn(),
  },
}));

describe('useLogin', () => {
  let mockSetUser: jest.Mock;
  let mockSetToken: jest.Mock;
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock auth store functions
    mockSetUser = jest.fn();
    mockSetToken = jest.fn();

    (useAuthStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        user: null,
        isAuthenticated: false,
        token: null,
        setUser: mockSetUser,
        setToken: mockSetToken,
        logout: jest.fn(),
      };
      return selector(state);
    });

    // Create QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should initialize login mutation', () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('should call userApi.getCurrent on login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const userApi = require('@/entities/user').userApi;
    userApi.getCurrent.mockResolvedValue({
      status: 200,
      payload: mockUser,
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(userApi.getCurrent).toHaveBeenCalled();
  });

  it('should store token in AsyncStorage on successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const userApi = require('@/entities/user').userApi;
    userApi.getCurrent.mockResolvedValue({
      status: 200,
      payload: mockUser,
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'dummy-token');
  });

  it('should update auth store with user data on successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const userApi = require('@/entities/user').userApi;
    userApi.getCurrent.mockResolvedValue({
      status: 200,
      payload: mockUser,
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    expect(mockSetToken).toHaveBeenCalledWith('dummy-token');
  });

  it('should handle login errors', async () => {
    const userApi = require('@/entities/user').userApi;
    userApi.getCurrent.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), { wrapper });

    let error: any;
    try {
      await act(async () => {
        await result.current.mutateAsync({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        });
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockSetToken).not.toHaveBeenCalled();
  });

  it('should set isPending to true during mutation', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const userApi = require('@/entities/user').userApi;
    userApi.getCurrent.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ status: 200, payload: mockUser });
          }, 100);
        })
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
