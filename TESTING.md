# Unit Testing Setup with Jest + jest-expo

This project now has comprehensive unit tests following the FSD (Feature-Sliced Design) architecture.

## 📁 Test Structure

```
src/
├── shared/
│   ├── lib/
│   │   ├── utils/__tests__/cn.test.ts
│   │   ├── hooks/__tests__/use-color-scheme.test.tsx
│   │   └── react-query/__tests__/QueryClientProvider.test.tsx
│   └── ui/
│       ├── text/__tests__/text.test.tsx
│       ├── box/__tests__/box.test.tsx
│       └── themed-text/__tests__/themed-text.test.tsx
├── entities/
│   └── user/
│       ├── model/__tests__/store.test.ts
│       └── api/__tests__/userApi.test.ts
└── features/
    └── auth/
        ├── api/__tests__/
        │   ├── use-login.test.tsx
        │   └── use-logout.test.tsx
        └── ui/__tests__/login-form.test.tsx
```

## 🚀 Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## ✅ What's Tested

### Shared Layer

- **Utils**: `cn()` className utility function
- **Hooks**: `useColorScheme` hook
- **React Query**: QueryClientProvider configuration
- **UI Components**: Text, Box, ThemedText components

### Entities Layer

- **User Store**: Zustand store with persistence
- **User API**: API calls (getCurrent, getById, update)

### Features Layer

- **Auth Hooks**: useLogin, useLogout mutations
- **Auth UI**: LoginForm component with validation

## 🔧 Configuration

- **Preset**: `jest-expo`
- **Setup File**: `jest.setup.js`
- **Testing Library**: `@testing-library/react-native`
- **Coverage**: Configured for `src/**/*.{js,jsx,ts,tsx}`

## 📝 Test Utilities

Available in `src/shared/lib/test-utils.tsx`:

- `renderWithProviders()` - Render with necessary providers
- `mockNavigation` - Mock navigation object
- `mockRoute` - Mock route object
- `createMockStore()` - Create Zustand mock stores
- `waitForAsync()` - Wait for async operations
- `mockAxiosResponse()` - Mock HTTP responses
- `mockAxiosError()` - Mock HTTP errors

## 🎯 Running Specific Tests

```bash
# Test specific file
npm test -- cn.test

# Test specific layer
npm test -- --testPathPattern="shared"

# Test specific pattern
npm test -- --testPathPattern="auth"
```

## 📊 Test Coverage

To generate coverage report:

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.
