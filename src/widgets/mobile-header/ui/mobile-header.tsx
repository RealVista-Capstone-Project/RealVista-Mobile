import { IconSymbol } from '@/shared/ui/icon-symbol'
import { NotificationBadge } from '@/widgets/notification-badge'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export function MobileHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { mode } = useLocalSearchParams<{ mode?: string }>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'rent' | 'buy'>(mode === 'rent' ? 'rent' : 'buy')
  const isExploreTab = pathname.includes('/explore')
  const isDetailPage = pathname.includes('/listing/') || pathname.includes('/messages/')
  const pageTitle = useMemo(() => {
    if (pathname.includes('/chat')) return 'Trò chuyện'
    if (pathname.includes('/favorite')) return 'Yêu thích'
    if (pathname.includes('/profile')) return 'Hồ sơ'
    return 'Khám phá'
  }, [pathname])
  const selectedLabel = useMemo(
    () => (selectedMode === 'rent' ? 'Dành cho thuê' : 'Dành cho mua'),
    [selectedMode]
  )

  useEffect(() => {
    setSelectedMode(mode === 'rent' ? 'rent' : 'buy')
  }, [mode])

  const navigateToListingType = (type: 'rent' | 'buy') => {
    setIsMenuOpen(false)
    setSelectedMode(type)
    router.replace({
      pathname: '/(tabs)/explore',
      params: { mode: type },
    })
  }

  return (
    <View className='flex-row items-center justify-between bg-white px-4 py-3'>
      {isDetailPage ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className='flex-row items-center'
        >
          <IconSymbol name='chevron.left' size={22} color='#878E9A' />
          <Text className='ml-1.5 text-base font-medium text-[#878E9A]'>Quay lại</Text>
        </TouchableOpacity>
      ) : isExploreTab ? (
        <View className='relative'>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsMenuOpen((prev) => !prev)}
            className='flex-row items-center'
          >
            <View>
              <Text className='text-sm text-text-muted pt-1'>Bất động sản</Text>
              <View className='flex-row gap-1 items-center'>
                <Text className='text-lg font-semibold text-main-black'>{selectedLabel}</Text>
                <IconSymbol name='chevron.down' size={16} color='#100A55' />
              </View>
            </View>
          </TouchableOpacity>
          <View className='absolute left-0 top-12'>
            {isMenuOpen ? (
              <View className='w-40 rounded-xl border border-purple-92 bg-white p-1 shadow-sm'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigateToListingType('rent')}
                  className={`rounded-lg px-3 py-2 ${
                    selectedLabel === 'Dành cho thuê' ? 'bg-purple-98' : ''
                  }`}
                >
                  <Text className='text-sm text-main-black'>Dành cho thuê</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigateToListingType('buy')}
                  className={`rounded-lg px-3 py-2 ${
                    selectedLabel === 'Dành cho mua' ? 'bg-purple-98' : ''
                  }`}
                >
                  <Text className='text-sm text-main-black'>Dành cho mua</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
      {!isDetailPage && !isExploreTab ? (
        <View className='flex-1'>
          <Text className='text-2xl font-semibold text-main-black'>{pageTitle}</Text>
        </View>
      ) : null}

      <View className='flex-row items-center'>
        <View className='relative'>
          <TouchableOpacity
            activeOpacity={0.7}
            className='h-10 w-10 items-center justify-center rounded-full bg-purple-98'
          >
            <IconSymbol name='bell' size={22} color='#100A55' />
          </TouchableOpacity>
          <NotificationBadge />
        </View>
      </View>
    </View>
  )
}
