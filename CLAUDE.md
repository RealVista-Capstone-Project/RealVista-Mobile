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

### Directory Structure
```
src/
├── entities/         # Business entities and data models
│   └── user/         # User entity with auth state
├── features/         # Feature-based modules
│   └── auth/         # Authentication feature
├── screens/          # Screen components (file-based routing)
├── shared/           # Shared utilities and components
│   ├── config/       # App providers configuration
│   ├── lib/          # Utilities (http, react-query, hooks)
│   ├── ui/           # Reusable UI components
│   └── types/        # Shared TypeScript types
└── widgets/          # High-level UI widgets
```

### Component Organization

**UI Components** (`src/shared/ui/`):
- Platform-specific implementations (`.ios.tsx`, `.web.tsx`)
- Core components: Box, Text, Button, Input, Icon, Divider
- Components export from both `@/shared/ui/component` and `components/ui/component`

**Features** (`src/features/`):
- Feature folders contain: `api/`, `model/`, `ui/`, and `index.ts` barrel export
- Auth feature includes login/register forms and auth hooks

**Widgets** (`src/widgets/`):
- Composed UI components (SidebarDrawer, TopNav, UserHeader)
- MainLayout wrapper for screen structure

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
<Box className="flex-row items-center gap-2 p-4 bg-white">
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
