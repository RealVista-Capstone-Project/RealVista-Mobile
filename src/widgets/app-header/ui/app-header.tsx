import { Pressable, View } from 'react-native'
import { useDrawerStore } from '@/shared/stores/drawer-store'
import { Box } from '@/shared/ui/box'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { Text } from '@/shared/ui/text'

export function AppHeader() {
  const { toggleDrawer } = useDrawerStore()

  return (
    <View className="flex-row items-center justify-between border-b border-border bg-white px-4 py-3">
      {/* Hamburger Menu Button */}
      <Pressable
        onPress={toggleDrawer}
        className="h-10 w-10 items-center justify-center rounded-lg active:bg-grey-100"
      >
        <IconSymbol name="line.3.horizontal" size={24} color="#100a55" />
      </Pressable>

      {/* Title */}
      <Text className="font-jakarta-semibold text-base text-main-secondary">Real Estate</Text>

      {/* Placeholder for right side (avatar, notifications, etc.) */}
      <Box className="h-10 w-10" />
    </View>
  )
}
