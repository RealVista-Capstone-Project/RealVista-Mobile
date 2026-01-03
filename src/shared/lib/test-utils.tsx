/**
 * Testing utilities for the project
 * Provides common mocks, helpers, and test utilities
 */

import { render } from '@testing-library/react-native';
import React, { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 * Add more providers as needed (QueryClient, Theme, etc.)
 */
export function renderWithProviders(ui: ReactElement) {
  return render(ui);
}

/**
 * Mock navigation for testing screen components
 */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
};

/**
 * Mock route for testing screen components
 */
export const mockRoute = {
  params: {},
  key: 'test',
  name: 'TestScreen',
  path: '/test',
};

/**
 * Create a mock store for Zustand stores
 */
export function createMockStore<T>(initialState: T) {
  let state = initialState;
  return {
    getState: () => state,
    setState: (partial: Partial<T>) => {
      state = { ...state, ...partial };
    },
    subscribe: jest.fn(),
    destroy: jest.fn(),
  };
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock AsyncStorage for tests
 */
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

/**
 * Mock HTTP client responses
 */
export const mockAxiosResponse = (data: unknown, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

export const mockAxiosError = (message: string, status = 500) => {
  const error: any = new Error(message);
  error.response = {
    data: { message },
    status,
    statusText: 'Error',
    headers: {},
    config: {},
  };
  return error;
};
