/**
 * Jest setup file
 * Configures global mocks and test environment
 */

/* eslint-disable no-undef */
import '@testing-library/jest-native/extend-expect'

// Mock AsyncStorage globally
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
}))

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const GestureHandler = require('react-native-gesture-handler/jestSetup')
  return GestureHandler
})

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
  Selection: {},
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}))

// Silence console warnings in tests unless debugging
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'mobile',
    version: '1.0.0',
  },
}))
