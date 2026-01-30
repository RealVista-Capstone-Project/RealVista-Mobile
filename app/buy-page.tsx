import { BuyPage } from '@/screens/buy/ui/buy-page'
import { SidebarDrawer } from '@/widgets/sidebar-drawer'
import { TopNav } from '@/widgets/top-nav'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function BuyPageScreen() {
  return (
    <SafeAreaView className='flex-1 bg-white' edges={['bottom']}>
      <TopNav />
      <BuyPage />
      <SidebarDrawer />
    </SafeAreaView>
  )
}
