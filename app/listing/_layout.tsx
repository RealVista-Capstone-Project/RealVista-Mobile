import { ListingLayoutContainer } from '@/screens/listing'
import { Tabs } from 'expo-router'

/**
 * Listing Layout - Routing configuration only
 *
 * This file's SINGLE RESPONSIBILITY:
 * - Define tab/navigation structure
 * - Configure screen options
 *
 * Business logic, data fetching, and UI rendering
 * are delegated to ListingLayoutContainer
 */
export default function ListingLayout() {
  return (
    <ListingLayoutContainer>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name='[id]' options={{ href: null }} />
      </Tabs>
    </ListingLayoutContainer>
  )
}
