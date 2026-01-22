import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { SidebarDrawer } from '@/widgets/sidebar-drawer'
import { TopNav } from '@/widgets/top-nav'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DevScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <TopNav />

      <Box className='flex-1 items-center justify-center gap-4 p-4'>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>Dev Screen</Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          This is a temporary screen for UI testing
        </Text>
        <Text style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          Click hamburger menu to open sidebar drawer
        </Text>
      </Box>

      <SidebarDrawer />
    </SafeAreaView>
  )
}
