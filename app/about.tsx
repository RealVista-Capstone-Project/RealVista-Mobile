import { AboutPage } from '@/screens/about'
import { SidebarDrawer } from '@/widgets/sidebar-drawer'
import { TopNav } from '@/widgets/top-nav'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AboutScreen() {
  return (
    <SafeAreaView className='flex-1 bg-white' edges={['bottom']}>
      <TopNav />
      <AboutPage />
      <SidebarDrawer />
    </SafeAreaView>
  )
}
