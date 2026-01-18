import { useRegister } from '@/features/auth/api/use-register'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import { RegisterForm } from '../register-form'

// Mock useRegister
jest.mock('@/features/auth/api/use-register', () => ({
  useRegister: jest.fn(),
}))

describe('RegisterForm', () => {
  let queryClient: QueryClient
  let mockRegister: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient()
    cleanup()

    mockRegister = jest.fn()
    ;(useRegister as jest.Mock).mockReturnValue({
      mutate: mockRegister,
      isPending: false,
    })
  })

  afterEach(() => {
    cleanup()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should render all fields correctly', () => {
    render(<RegisterForm />, { wrapper })

    expect(screen.getByPlaceholderText('First Name')).toBeTruthy()
    expect(screen.getByPlaceholderText('Last Name')).toBeTruthy()
    expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy()
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy()
    expect(screen.getByPlaceholderText('Confirm your password')).toBeTruthy()
    expect(screen.getByText('Sign Up')).toBeTruthy()
  })

  it('should show validation errors for empty submission', async () => {
    render(<RegisterForm />, { wrapper })

    const signUpButton = screen.getByText('Sign Up')
    fireEvent.press(signUpButton)

    await waitFor(() => {
      // First name required
      expect(screen.getByText('First name is required')).toBeTruthy()
      // Last name required
      expect(screen.getByText('Last name is required')).toBeTruthy()
      // Email checking isn't "required" but invalid email triggers
      expect(screen.getByText('Invalid email address')).toBeTruthy()
      // Password validation
      expect(screen.getAllByText('Password must be at least 6 characters').length).toBeGreaterThan(
        0
      )
    })
  })

  it('should validate email format', async () => {
    render(<RegisterForm />, { wrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    fireEvent.changeText(emailInput, 'invalid-email')

    const signUpButton = screen.getByText('Sign Up')
    fireEvent.press(signUpButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeTruthy()
    })
  })

  it('should validate password match', async () => {
    render(<RegisterForm />, { wrapper })

    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const confirmInput = screen.getByPlaceholderText('Confirm your password')

    fireEvent.changeText(passwordInput, 'password123')
    fireEvent.changeText(confirmInput, 'password456') // Mismatch

    const signUpButton = screen.getByText('Sign Up')
    fireEvent.press(signUpButton)

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeTruthy()
    })
  })

  it('should submit valid form data', async () => {
    render(<RegisterForm />, { wrapper })

    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'John')
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Doe')
    fireEvent.changeText(screen.getByPlaceholderText('Enter your email'), 'john@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'password123')
    fireEvent.changeText(screen.getByPlaceholderText('Confirm your password'), 'password123')

    const signUpButton = screen.getByText('Sign Up')
    fireEvent.press(signUpButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
    })
  })

  it('should show loading state', () => {
    ;(useRegister as jest.Mock).mockReturnValue({
      mutate: mockRegister,
      isPending: true,
    })

    render(<RegisterForm />, { wrapper })

    expect(screen.getByText('Creating Account...')).toBeTruthy()
  })
})
