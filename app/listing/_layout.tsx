import { Tabs, useRouter } from 'expo-router'
import { ListingLayoutContainer } from '@/screens/listing'

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
  const router = useRouter()

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
