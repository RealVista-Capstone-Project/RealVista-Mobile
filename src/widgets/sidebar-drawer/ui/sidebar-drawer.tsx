import { useLogout } from '@/features/auth'
import { useDrawerStore } from '@/shared/stores/drawer-store'
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter } from '@/shared/ui/drawer'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import LogoFill from '../../../../assets/images/logo-fill.svg'

type MenuItem = {
  id: string
  label: string
  icon: string
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'Buy', label: 'Mua', icon: 'house.fill' },
  { id: 'Rent', label: 'Thuê', icon: 'key.fill' },
  { id: 'My listings', label: 'Tin đăng của tôi', icon: 'apartment' },
  { id: 'Favorited', label: 'Yêu thích', icon: 'heart' },
  { id: 'Appointments', label: 'Lịch hẹn', icon: 'calendar' },
  { id: 'Messages', label: 'Tin nhắn', icon: 'message' },
]

const HELP_ITEMS: MenuItem[] = [
  { id: 'Help', label: 'Trợ giúp', icon: 'help' },
  { id: 'About', label: 'Về RealVista', icon: 'info.circle.fill' },
  { id: 'Settings', label: 'Cài đặt', icon: 'settings' },
]

export function SidebarDrawer() {
  const { isOpen, setIsOpen, activeItem, setActiveItem } = useDrawerStore()
  const router = useRouter()
  const { mutate: logout } = useLogout()

  const handleMenuItemPress = (itemId: string) => {
    setActiveItem(itemId)
    setIsOpen(false)

    if (itemId === 'Buy') {
      router.replace('/buy-page')
    } else if (itemId === 'Rent') {
      router.replace('/rent-page')
    } else if (itemId === 'Favorited') {
      router.push('/saved')
    } else if (itemId === 'About') {
      router.replace('/about')
    } else if (itemId === 'Messages') {
      router.replace('/messages')
    }
  }

  const handleLogout = () => {
    setIsOpen(false)
    logout(undefined, {
      onSuccess: () => {
        router.replace('/login')
      },
    })
  }

  const isItemActive = (itemId: string) => activeItem === itemId

  return (
    <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} size='full' anchor='left'>
      <DrawerBackdrop />
      <DrawerContent className='bg-white' style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            paddingTop: 30,
            paddingBottom: 24,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <LogoFill width={40} height={40} />
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#100A55' }}>RealVista</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsOpen(false)}
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <IconSymbol name='xmark' size={24} color='#6B7280' />
          </TouchableOpacity>
        </View>
        <DrawerBody style={{ flex: 1 }}>
          {/* Main Menu */}
          <View style={{ gap: 16 }}>
            {MENU_ITEMS.map((item) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                isActive={isItemActive(item.id)}
                onPress={() => handleMenuItemPress(item.id)}
              />
            ))}
          </View>
        </DrawerBody>
        <DrawerFooter style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          {/* Help & Settings */}
          <View style={{ gap: 16, width: '100%' }}>
            {HELP_ITEMS.map((item) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                isActive={isItemActive(item.id)}
                onPress={() => handleMenuItemPress(item.id)}
              />
            ))}
          </View>

          {/* Logout */}
          <View
            style={{
              width: '100%',
              marginTop: 16,
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              paddingTop: 16,
            }}
          >
            <TouchableOpacity
              onPress={handleLogout}
              style={{ height: 48, width: '100%' }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  height: 48,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{ height: 20, width: 20, alignItems: 'center', justifyContent: 'center' }}
                >
                  <IconSymbol name='arrow.right.square' size={20} color='#EF4444' />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#EF4444' }}>Đăng xuất</Text>
              </View>
            </TouchableOpacity>
          </View>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

type MenuItemProps = {
  item: MenuItem
  isActive: boolean
  onPress: () => void
}

function MenuItemComponent({ item, isActive, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={{ height: 48, width: '100%' }} activeOpacity={0.7}>
      <View
        style={{
          height: 48,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: isActive ? '#F0EFFE' : 'transparent',
        }}
      >
        <View style={{ height: 20, width: 20, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol
            name={item.icon as any}
            size={20}
            color={isActive ? '#7065f0' : 'rgba(16, 10, 68, 0.5)'}
          />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: isActive ? '600' : '500',
            color: isActive ? '#7065f0' : 'rgba(0, 9, 41, 0.5)',
          }}
        >
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
