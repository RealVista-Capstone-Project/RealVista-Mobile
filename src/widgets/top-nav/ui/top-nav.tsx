import { useDrawerStore } from '@/shared/stores/drawer-store'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { Text, TouchableOpacity, View } from 'react-native'
import { MenuIcon } from '../../../../assets/icon/menu'
import { NotificationIcon } from '../../../../assets/icon/notification'

export function TopNav() {
  const { setIsOpen } = useDrawerStore()

  const handleMenuPress = () => {
    setIsOpen(true)
  }

  return (
    <View className='flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200'>
      {/* Hamburger Menu Button */}
      <TouchableOpacity onPress={handleMenuPress} className='p-2'>
        <MenuIcon />
      </TouchableOpacity>

      {/* Right Side - Notifications & User Avatar */}
      <View className='flex-row items-center gap-3'>
        {/* Notification Button */}
        <TouchableOpacity className='p-2'>
          <NotificationIcon />
        </TouchableOpacity>

        {/* User Avatar with Dropdown */}
        <TouchableOpacity className='flex-row items-center gap-2 border border-gray-200 rounded-full pl-1 pr-2 py-1'>
          <View className='w-8 h-8 rounded-full bg-indigo-500 items-center justify-center'>
            <Text className='text-sm font-semibold text-white'>GI</Text>
          </View>
          <IconSymbol name='chevron.down' size={16} color='#6366F1' />
        </TouchableOpacity>
      </View>
    </View>
  )
}
