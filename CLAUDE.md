# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm install` - Install dependencies
- `npx expo start` or `npm start` - Start the development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser

### Code Quality

- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Single Test

Run a specific test file: `npm test -- path/to/test.spec.tsx`

## Architecture Overview

### Tech Stack

- **Framework**: Expo SDK 54 with React Native 0.81.5
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native) + Gluestack UI
- **State Management**: Zustand (for auth), React Query (server state)
- **Fonts**: Plus Jakarta Sans (multiple weights)
- **Icons**: Lucide React Native, Expo Vector Icons, SF Symbols (IconSymbol)

### Feature-Slice Design Architecture

This codebase follows **Feature-Slice Design (FSD)** architecture, which organizes code by business features rather than technical layers.

#### Core FSD Layers

**entities/** (Domain Layer)

- Business entities and core business logic
- Agnostic of frameworks and UI
- Examples: `src/entities/user/` - User entity with auth state management
- Structure: `model/` (state, types), `api/` (data access, queries)

**features/** (Feature Layers)

- Self-contained feature modules
- Each feature contains everything needed for that business capability
- Structure:
  - `model/` - Feature-specific state and types
  - `api/` - Data fetching hooks and queries
  - `ui/` - Feature-specific UI components
  - `index.ts` - Public API barrel export
- Examples: `src/features/auth/` - Authentication (login, register, logout)

**shared/** (Shared Layer)

- Code reused across multiple features
- Split by technical concern:
  - `ui/` - Generic reusable UI components (Button, Input, Text, Box, etc.)
  - `lib/` - Utilities (http client, react-query setup, custom hooks)
  - `config/` - App configuration (providers, constants)
  - `types/` - Global TypeScript types
  - `constants/` - App-wide constants

**widgets/** (Compose UI Layer)

- High-level UI components composed from features and shared UI
- Cross-feature composition
- Examples: `MainLayout`, `SidebarDrawer`, `TopNav`, `UserHeader`

**screens/** (Routing Layer)

- Screen-level components that orchestrate features and widgets
- Thin layer that wires together features
- Maps to file-based routes in `app/`

#### FSD Rules

1. **Import Rule**: Modules can only import from lower layers
   - `entities` ← `features` ← `shared` ← `widgets` ← `screens`
   - Never import upward (e.g., features cannot import from screens)
   - Cross-feature imports go through shared layer
2. **Public API**: Each folder exports public API via `index.ts` barrel files
3. **Segments**: Each slice (entities, features, shared, widgets) is self-contained
4. **Absolute Imports**: Use `@/` prefix for imports from src root

#### Key Architectural Patterns

**Entity Structure**:

```tsx
entities/user/
├── model/
│   ├── store.ts        # Zustand store (auth state)
│   └── types.ts        # User types
├── api/
│   ├── user.queries.ts # React Query definitions
│   ├── index.ts        # Barrel exports
│   └── __tests__/
└── index.ts            # Public API
```

**Feature Structure**:

```tsx
features/auth/
├── model/
│   └── use-auth.ts    # Auth state composition
├── api/
│   ├── use-login.ts   # Login mutation hook
│   ├── use-logout.ts  # Logout hook
│   └── index.ts
├── ui/
│   ├── login-form.tsx # Login UI component
│   ├── register-form.tsx
│   └── __tests__/
└── index.ts
```

**Component Import Paths**:

- Shared UI: `@/shared/ui/button` or `components/ui/button`
- Entities: `@/entities/user` (exposes public API via index.ts)
- Features: `@/features/auth` (exposes public API via index.ts)
- Widgets: `@/widgets/main-layout`

**State Management Strategy**:

- **Domain State** (entities): Zustand stores for global domain entities
- **Server State** (features): React Query for API data, mutations, caching
- **UI State** (components): React useState, useEffect for local UI state
- Keep server state out of Zustand - let React Query handle it

**Data Flow**:

1. UI component calls feature hook: `useLogin()`
2. Feature hook uses React Query mutation from entities: `userApi.login()`
3. Mutation updates Zustand store: `useAuthStore.getState().setUser()`
4. State changes trigger re-renders across components

## Directory Structure

```
src/
├── entities/         # Domain business logic and state
│   └── user/         # User entity with auth
├── features/         # Feature modules (self-contained)
│   └── auth/         # Authentication feature
├── screens/          # Screen orchestrators (file-based routing)
├── shared/           # Cross-cutting technical concerns
│   ├── config/       # Providers, app configuration
│   ├── lib/          # HTTP, React Query, utilities
│   ├── ui/           # Generic UI components
│   └── types/        # Shared types
└── widgets/          # Composed UI components
```

### Routing

- File-based routing via Expo Router
- Auth group: `app/(auth)/` - login, sign-up (protected routes)
- Tabs group: `app/(tabs)/` - main app navigation
- Special routes: `app/listing-detail.tsx` - property detail page
- Currently redirects to `/listing-detail` for development (see `app/_layout.tsx:54`)
- Screen components are thin orchestrators in `src/screens/`

### Component Organization

**Shared UI Components** (`src/shared/ui/`):

- Platform-specific implementations (`.ios.tsx`, `.web.tsx`)
- Core components: Box, Text, Button, Input, Icon, Divider, Avatar
- Components export from both `@/shared/ui/component` and `components/ui/component`
- These are generic, reusable building blocks

**Widgets** (`src/widgets/`):

- High-level composed components using features + shared UI
- Examples: MainLayout, SidebarDrawer, TopNav, UserHeader
- May use multiple features (e.g., SidebarDrawer uses auth + user features)
- Cross-feature composition happens here

**Screens** (`src/screens/`):

- Orchestrate features and widgets for specific routes
- Should be thin - delegate logic to features
- Example: `screens/listing-detail/ui/listing-detail-page.tsx` uses property data but could extract property entity

### Routing

- File-based routing via Expo Router
- Auth group: `app/(auth)/` - login, sign-up
- Tabs group: `app/(tabs)/` - main app navigation
- Special routes: `app/listing-detail.tsx` - property detail page
- Currently redirects to `/listing-detail` for development (see `app/_layout.tsx:54`)

### Theming System

**Brand Colors** (Figma-based, in `tailwind.config.js`):

- Primary: `#7065F0` (brand-primary, main-primary)
- Secondary: `#100A55` (brand-secondary, main-secondary)
- Text: `#000929` (main-black, text-main)
- Muted: `#9EA3AE` (text-muted)
- White: `#FFFFFF` (main-white)

**Purple Shades**:

- 98: `#F7F7FD` (input-bg, purple-98) - light backgrounds
- 96: `#F0EFFB` (purple-96) - borders
- 94: `#E8E6F9` (purple-94) - selected states
- 92: `#E0DEF7` (input-border, purple-92) - borders
- 90: `#D8D6F5` (purple-90) - medium purple

**Greyscale**:

- grey-50 through grey-900 - Full range from #F9FAFB to #0B0A0F
- grey-500: `#6C727F` - commonly used for muted text

**Usage**:

```tsx
<Text className="text-main-black">Title</Text>
<Box className="bg-purple-98 border border-purple-92">Content</Box>
<Text className="text-brand-primary">Accent</Text>
```

### Theme Configuration

- `theme/color.ts` - Color definitions (light/dark modes)
- `tailwind.config.js` - Tailwind with brand colors
- `hooks/useColor` hook for accessing theme colors
- Components use brand colors directly via Tailwind classes

### UI Component Patterns

**Box Component**: Universal container (View wrapper)

```tsx
<Box className='flex-row items-center gap-2 p-4 bg-white'>
  <Text>Content</Text>
</Box>
```

**Text Component**: Typography with variants

```tsx
<Text size="lg" bold className="text-main-black">Title</Text>
<Text size="sm" className="text-gray-500">Caption</Text>
```

**Icon System**:

- Lucide icons: `IconLucide name='IconName' size={24} color='#7065f0'`
- SF Symbols (iOS): `IconSymbol size={24} name='calendar' color='#7065f0'`
- Generic Icon: `Icon as={LucideIcon} className="w-4 h-4 text-brand-primary"`

### State Management

- **Zustand**: Auth state in `entities/user/model/store.ts`
- **React Query**: Server state via `@tanstack/react-query`
  - Queries in `entities/*/api/*.queries.ts`
  - Hooks in `features/*/api/use-*.ts`
  - Provider: `ReactQueryProvider` in `AppProviders`

### Platform-Specific Code

- Use `.web.tsx`, `.ios.tsx` extensions for platform components
- React Native web compatibility via `react-native-web`
- SafeAreaView with edges for proper padding

### Testing

- Test files: `**/__tests__/**/*.spec.tsx` or `**/*.test.tsx`
- Setup: `jest.setup.js`
- Coverage from `src/**/*` excluding tests and stories
- Use `@testing-library/react-native`

### File-Based Routing Conventions

- Screen files in `app/` directory become routes
- Groups: `(tabs)`, `(auth)` for navigation organization
- `_layout.tsx` files define route configuration and shared layouts
- Modal routes via presentation: 'modal' option

### Provider Setup

`AppProviders` combines providers:

1. ReactQueryProvider - TanStack Query
2. Add more providers (Theme, Auth) as needed in `shared/config/providers.tsx`

### Development Notes

- Husky installed for git hooks
- Prettier with Tailwind plugin for formatting
- Commitlint for conventional commits
- Use `main-black` (#000929) for primary text, not black
- Use purple shades (purple-92 to purple-98) for backgrounds/borders
- Border width should be 1.5px to match Figma designs
- When creating Pull Requests, always use 'develop' as the base branch.
- When creating Pull Requests, follow the template in '.github/pull_request_template.md'
