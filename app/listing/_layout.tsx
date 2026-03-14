import { Box } from '@/shared/ui/box'
import { ApplyAppBar } from '@/widgets/apply-appbar'
import { Tabs, useRouter } from 'expo-router'
import { View } from 'react-native'
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
