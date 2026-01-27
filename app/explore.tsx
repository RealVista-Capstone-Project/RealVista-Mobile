import { PropertySearchPage } from '@/screens/property-search'
import { SidebarDrawer } from '@/widgets/sidebar-drawer'
import { TopNav } from '@/widgets/top-nav'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ExploreScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <TopNav />
      <PropertySearchPage />
      <SidebarDrawer />
    </SafeAreaView>
  )
}
