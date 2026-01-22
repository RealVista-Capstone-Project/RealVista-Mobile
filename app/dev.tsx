import { useDrawerStore } from '@/shared/stores/drawer-store'
import { Box } from '@/shared/ui/box'
import { Button, ButtonText } from '@/shared/ui/button'
import { Text } from '@/shared/ui/text'
import { SidebarDrawer } from '@/widgets/sidebar-drawer'
import { View } from 'react-native'

export default function DevScreen() {
  const { setIsOpen } = useDrawerStore()

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <Box className='flex-1 items-center justify-center gap-4 p-4'>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>Dev Screen</Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          This is a temporary screen for UI testing
        </Text>

        <Button onPress={() => setIsOpen(true)} className='mt-4'>
          <ButtonText>Open Sidebar Drawer</ButtonText>
        </Button>
      </Box>

      <SidebarDrawer />
    </View>
  )
}
