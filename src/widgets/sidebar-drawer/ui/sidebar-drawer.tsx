import { useDrawerStore } from '@/shared/stores/drawer-store'
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter } from '@/shared/ui/drawer'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { Text, TouchableOpacity, View } from 'react-native'
import LogoFill from '../../../../assets/images/logo-fill.svg'

type MenuItem = {
  id: string
  label: string
  icon: string
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'Explore', label: 'Explore', icon: 'explore' },
  { id: 'Favorited', label: 'Favorited', icon: 'heart' },
  { id: 'My listings', label: 'My listings', icon: 'apartment' },
  { id: 'Appointments', label: 'Appointments', icon: 'calendar' },
]

const HELP_ITEMS: MenuItem[] = [
  { id: 'Help', label: 'Help', icon: 'help' },
  { id: 'Settings', label: 'Settings', icon: 'settings' },
]

export function SidebarDrawer() {
  const { isOpen, setIsOpen, activeItem, setActiveItem } = useDrawerStore()

  const handleMenuItemPress = (itemId: string) => {
    setActiveItem(itemId)
    setIsOpen(false)
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
