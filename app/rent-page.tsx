import { RentPage } from '@/screens/rent/ui/rent-page'
import { SidebarDrawer } from '@/widgets/sidebar-drawer'
import { TopNav } from '@/widgets/top-nav'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RentPageScreen() {
  return (
    <SafeAreaView className='flex-1 bg-white' edges={['bottom']}>
      <TopNav />
      <RentPage />
      <SidebarDrawer />
    </SafeAreaView>
  )
}
