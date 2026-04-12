import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Box, Plus } from 'lucide-react-native'

interface EmptyStateProps {
  onCreatePress?: () => void
}

export function EmptyState({ onCreatePress }: EmptyStateProps) {
  return (
    <View className='flex-1 items-center justify-center py-24 px-8'>
      <View className='w-24 h-24 rounded-3xl bg-white items-center justify-center mb-6 shadow-sm'>
        <Box size={44} color='#9CA3AF' />
      </View>

      <Text
        className='text-xl text-gray-800 text-center mb-3'
        style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
      >
        Chưa có không gian 3D nào
      </Text>

      <Text
        className='text-sm text-gray-500 text-center leading-5 mb-8'
        style={{ fontFamily: 'PlusJakartaSans_500Medium' }}
      >
        Tạo 3D cho các phòng để khách hàng có trải nghiệm tham quan thực tế ảo tốt hơn.
      </Text>

      <TouchableOpacity
        className='flex-row items-center bg-main-primary px-8 py-4 rounded-2xl'
        onPress={onCreatePress}
        activeOpacity={0.85}
      >
        <Plus size={20} color='#FFFFFF' />
        <Text
          className='text-white text-base ml-2'
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          Tạo không gian mới
        </Text>
      </TouchableOpacity>
    </View>
  )
}
