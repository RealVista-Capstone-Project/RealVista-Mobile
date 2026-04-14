import React from 'react'
import { render } from '@testing-library/react-native'

// We cannot easily render RootLayout (it has fonts, navigation, etc.)
// Instead we test the auto-register logic in a minimal wrapper component
// that mirrors the exact hook composition used in _layout.tsx

import { useEffect } from 'react'
import { View } from 'react-native'

const mockRegisterDevice = jest.fn().mockResolvedValue('token-xyz')

jest.mock('@/features/notifications/api/use-push-notifications', () => ({
  usePushNotifications: () => ({
    registerDevice: mockRegisterDevice,
    unregisterDevice: jest.fn(),
    pushToken: null,
    isRegistering: false,
    error: null,
  }),
}))

// Simulated isAuthenticated value controlled per test
// Must be prefixed with `mock` so jest.mock hoisting can reference it
let mockIsAuthenticated = false
jest.mock('@/entities/user', () => ({
  useAuthStore: (selector: (state: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: mockIsAuthenticated }),
}))

// Minimal component that duplicates the auto-register effect from _layout.tsx
function AutoRegisterTestComponent() {
  const { registerDevice } =
    require('@/features/notifications/api/use-push-notifications').usePushNotifications()
  const isAuthenticated = require('@/entities/user').useAuthStore(
    (s: { isAuthenticated: boolean }) => s.isAuthenticated
  )

  useEffect(() => {
    if (isAuthenticated) {
      registerDevice()
    }
  }, [isAuthenticated, registerDevice])

  return <View />
}

describe('auto-register after auth', () => {
  beforeEach(() => {
    mockRegisterDevice.mockClear()
  })

  it('calls registerDevice when isAuthenticated is true', () => {
    mockIsAuthenticated = true
    render(<AutoRegisterTestComponent />)
    expect(mockRegisterDevice).toHaveBeenCalledTimes(1)
  })

  it('does NOT call registerDevice when isAuthenticated is false', () => {
    mockIsAuthenticated = false
    render(<AutoRegisterTestComponent />)
    expect(mockRegisterDevice).not.toHaveBeenCalled()
  })
})
