import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import { LoginForm } from '../login-form'

// Mock the useLogin hook
jest.mock('@/features/auth/api/use-login', () => ({
  useLogin: jest.fn(),
}))

jest.mock('@/features/auth/api/use-google-login', () => ({
  useGoogleLogin: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  }),
}))

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn().mockReturnValue([
    null, // request
    null, // response
    jest.fn(), // promptAsync
  ]),
}))

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}))

/* eslint-disable @typescript-eslint/no-require-imports */
describe('LoginForm', () => {
  let queryClient: QueryClient
  let mockMutate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient()
    cleanup()

    // Setup default mock for useLogin
    mockMutate = jest.fn()
    const { useLogin } = require('@/features/auth/api/use-login')
    useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  afterEach(() => {
    cleanup()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should render login form correctly', () => {
    render(<LoginForm />, { wrapper })

    expect(screen.getAllByText(/Welcome back/i).length).toBeGreaterThan(0)
    expect(screen.getByTestId('login-text')).toBeTruthy()
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByText('Password')).toBeTruthy()
  })

  // ... (intermediate tests unchanged logic, but I need to make sure I don't delete them again!)
  // Wait, replace_file_content works on line ranges.
  // I will target SPECIFIC line ranges to avoid deleting the middle.
  // I need to be careful.
  // I'll update 'should render' block first.
  // Then update 'should disable' block separately.

  it('should render email input with correct placeholder', () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('hi@example.com')
    expect(emailInput).toBeTruthy()
  })

  it('should render password input with secure text entry', () => {
    render(<LoginForm />, { wrapper })

    const passwordInput = screen.getByPlaceholderText('Enter password')
    expect(passwordInput).toBeTruthy()
    expect(passwordInput.props.secureTextEntry).toBe(true)
  })

  it('should show validation error for invalid email', async () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('hi@example.com')
    const loginButton = screen.getByTestId('login-button')

    fireEvent.changeText(emailInput, 'invalid-email')
    fireEvent.press(loginButton)

    await waitFor(
      () => {
        expect(screen.getByText('Invalid email address')).toBeTruthy()
      },
      { timeout: 3000 }
    )
  })

  it('should show validation error for short password', async () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('hi@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter password')
    const loginButton = screen.getByTestId('login-button')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, '12345')
    fireEvent.press(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy()
    })
  })

  it('should call login mutation with valid credentials', async () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('hi@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter password')
    const loginButton = screen.getByTestId('login-button')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(loginButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should show loading state when isPending is true', () => {
    const { useLogin } = require('@/features/auth/api/use-login')
    useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    })

    render(<LoginForm />, { wrapper })
    expect(screen.getByTestId('login-loading')).toBeTruthy()
    expect(screen.queryByTestId('login-text')).toBeNull()
  })

  it('should disable button when isPending is true', () => {
    const { useLogin } = require('@/features/auth/api/use-login')
    useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    })

    render(<LoginForm />, { wrapper })

    const loginButton = screen.getByTestId('login-button')

    // Check truthiness of disabled prop or accessibilityState
    // TouchableOpacity often puts disabled into accessibilityState
    const isDisabled = loginButton.props.disabled || loginButton.props.accessibilityState?.disabled
    expect(isDisabled).toBeTruthy()
  })

  it('should enable button when isPending is false', () => {
    render(<LoginForm />, { wrapper })
    const loginButton = screen.getByTestId('login-button')
    expect(loginButton.props.disabled).toBe(false)
  })

  it('should not call login mutation with invalid email', async () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('hi@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter password')
    const loginButton = screen.getByTestId('login-button')

    fireEvent.changeText(emailInput, 'invalid-email')
    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.press(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeTruthy()
      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  it('should not call login mutation with short password', async () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('hi@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter password')
    const loginButton = screen.getByTestId('login-button')

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, '12345')
    fireEvent.press(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy()
      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  it('should handle empty fields', async () => {
    render(<LoginForm />, { wrapper })

    const loginButton = screen.getByTestId('login-button')
    fireEvent.press(loginButton)

    await waitFor(() => {
      // Should show validation errors
      expect(screen.getByText('Invalid email address')).toBeTruthy()
    })
  })
})
