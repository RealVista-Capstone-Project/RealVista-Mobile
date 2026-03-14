import { useDrawerStore } from '@/shared/stores/drawer-store'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { MenuIcon } from '../../../../assets/icon/menu'
import { NotificationIcon } from '../../../../assets/icon/notification'

export function TopNav({ title, showBack }: { title?: string; showBack?: boolean }) {
  const { setIsOpen } = useDrawerStore()
  const router = useRouter()

  const handleMenuPress = () => {
    setIsOpen(true)
  }

  const handleBackPress = () => {
    router.back()
  }

  return (
    <View className='flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200'>
      {/* Left Side - Hamburger or Back */}
      {showBack ? (
        <TouchableOpacity onPress={handleBackPress} className='p-2'>
          <IconSymbol name='chevron.left' size={24} color='#100A55' />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleMenuPress} className='p-2'>
          <MenuIcon />
        </TouchableOpacity>
      )}

      {/* Title */}
      {title && (
        <View className='flex-1 items-center'>
          <Text className='text-lg font-bold text-gray-900'>{title}</Text>
        </View>
      )}

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
