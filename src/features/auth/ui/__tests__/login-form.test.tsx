import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from '../login-form'

// Mock the useLogin hook
jest.mock('@/features/auth/api/use-login', () => ({
  useLogin: jest.fn(),
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

    const loginElements = screen.getAllByText('Login')
    expect(loginElements).toHaveLength(2) // Title and button
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByText('Password')).toBeTruthy()
  })

  it('should render email input with correct placeholder', () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toBeTruthy()
  })

  it('should render password input with secure text entry', () => {
    render(<LoginForm />, { wrapper })

    const passwordInput = screen.getByPlaceholderText('Enter your password')
    expect(passwordInput).toBeTruthy()
    expect(passwordInput.props.secureTextEntry).toBe(true)
  })

  it('should show validation error for invalid email', async () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const loginElements = screen.getAllByText('Login')
    const loginButton = loginElements[1] // Button is the second "Login" text

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

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const loginElements = screen.getAllByText('Login')
    const loginButton = loginElements[1]

    fireEvent.changeText(emailInput, 'test@example.com')
    fireEvent.changeText(passwordInput, '12345')
    fireEvent.press(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy()
    })
  })

  it('should call login mutation with valid credentials', async () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const loginElements = screen.getAllByText('Login')
    const loginButton = loginElements[1]

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

    expect(screen.getByText('Logging in...')).toBeTruthy()
  })

  it('should disable button when isPending is true', () => {
    const { useLogin } = require('@/features/auth/api/use-login')
    useLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    })

    render(<LoginForm />, { wrapper })

    const loginButton = screen.getByText('Logging in...')
    expect(loginButton.props.disabled).toBe(true)
  })

  it('should enable button when isPending is false', () => {
    render(<LoginForm />, { wrapper })

    const loginElements = screen.getAllByText('Login')
    const loginButton = loginElements[1]
    expect(loginButton.props.disabled).toBe(false)
  })

  it('should not call login mutation with invalid email', async () => {
    render(<LoginForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const loginElements = screen.getAllByText('Login')
    const loginButton = loginElements[1]

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

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const loginElements = screen.getAllByText('Login')
    const loginButton = loginElements[1]

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

    const loginElements = screen.getAllByText('Login')
    const loginButton = loginElements[1]
    fireEvent.press(loginButton)

    await waitFor(() => {
      // Should show validation errors
      expect(screen.getByText('Invalid email address')).toBeTruthy()
    })
  })
})
