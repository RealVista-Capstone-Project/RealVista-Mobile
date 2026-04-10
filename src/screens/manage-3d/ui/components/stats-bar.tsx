import React from 'react'
import { View, Text } from 'react-native'

interface StatsBarProps {
  total: number
  ready: number
  processing: number
}

export function StatsBar({ total, ready, processing }: StatsBarProps) {
  return (
    <View className='bg-white mx-5 mb-5 rounded-3xl p-5 shadow-sm'>
      {/* Title */}
      <Text
        className='text-2xl text-gray-900 mb-1.5'
        style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
      >
        Thống kê ảnh 3D
      </Text>

      {/* Subtitle */}
      <Text
        className='text-sm text-gray-500 leading-5 mb-5'
        style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
      >
        Quản lý ảnh 3D các phòng và theo dõi trạng thái xử lý của từng không gian.
      </Text>

      {/* Stat pills */}
      <View className='flex-row gap-3'>
        <View className='flex-1 bg-gray-100 rounded-2xl px-4 py-3'>
          <Text
            className='text-xs text-gray-500 uppercase tracking-widest mb-1'
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Tổng{'\n'}phòng
          </Text>
          <Text
            className='text-3xl text-main-primary'
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
          >
            {total}
          </Text>
        </View>

        <View className='flex-1 bg-gray-100 rounded-2xl px-4 py-3'>
          <Text
            className='text-xs text-gray-500 uppercase tracking-widest mb-1'
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Đã{'\n'}hoàn thành
          </Text>
          <Text
            className='text-3xl text-emerald-500'
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
          >
            {ready}
          </Text>
        </View>

        {processing > 0 && (
          <View className='flex-1 bg-gray-100 rounded-2xl px-4 py-3'>
            <Text
              className='text-xs text-gray-500 uppercase tracking-widest mb-1'
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              Đang{'\n'}xử lý
            </Text>
            <Text
              className='text-3xl text-amber-500'
              style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
            >
              {processing}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
