import { useAuthStore } from '@/entities/user'
import { useDrawerStore } from '@/shared/stores/drawer-store'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { useRouter, Href } from 'expo-router'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { MenuIcon } from '../../../../assets/icon/menu'
import { NotificationIcon } from '../../../../assets/icon/notification'

export function TopNav({ title, showBack }: { title?: string; showBack?: boolean }) {
  const { setIsOpen } = useDrawerStore()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleMenuPress = () => {
    setIsOpen(true)
  }

  const handleBackPress = () => {
    router.back()
  }

  const handleAvatarPress = () => {
    Alert.alert('Tài khoản', `Xin chào, ${user?.fullName || user?.email || 'Khách'}`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: user ? 'Đăng xuất' : 'Đăng nhập',
        style: user ? 'destructive' : 'default',
        onPress: () => {
          if (user) {
            logout()
          }
          router.replace('/(auth)/login' as Href)
        },
      },
    ])
  }

  const getInitials = (name?: string) => {
    if (!name) return 'US'
    const parts = name.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
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
        <TouchableOpacity
          onPress={handleAvatarPress}
          className='flex-row items-center gap-2 border border-gray-200 rounded-full pl-1 pr-2 py-1'
        >
          <View className='w-8 h-8 rounded-full bg-indigo-500 items-center justify-center'>
            <Text className='text-sm font-semibold text-white'>{getInitials(user?.fullName)}</Text>
          </View>
          <IconSymbol name='chevron.down' size={16} color='#6366F1' />
        </TouchableOpacity>
      </View>
    </View>
  )
}
