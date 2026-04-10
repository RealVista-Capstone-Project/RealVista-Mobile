import { useRouter } from 'expo-router'
import { Box, Camera, Globe } from 'lucide-react-native'
import React, { useCallback } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'

import { Image } from 'expo-image'

import {
  useMyProperties,
  useProperty3dOperations,
  type Property3dOperation,
  type PropertySummaryResponse,
} from '@/entities/property'

function PropertyCard({ property }: { property: PropertySummaryResponse }) {
  const router = useRouter()
  const { data: operations } = useProperty3dOperations(property.property_id)
  const thumbnail = property.thumbnail_url

  // Derive 3D state from both the summary flag AND live operations data.
  // The summary's has_3d can lag behind, so we also check if any operation
  // has SUCCEEDED or if there are any operations at all.
  const hasSucceededOp = operations?.some((op: Property3dOperation) => op.status === 'SUCCEEDED')
  const has3D = property.has_3d || hasSucceededOp || false
  const pendingOp = operations?.find(
    (op: Property3dOperation) => op.status === 'PENDING' || op.status === 'GENERATING'
  )
  const hasAnyOp = (operations?.length ?? 0) > 0
  const address = property.street_address || 'No address'
  const locationLabel = [property.location_info?.district_name, property.location_info?.city_name]
    .filter(Boolean)
    .join(', ')

  const handleAdd3D = useCallback(() => {
    router.push({ pathname: '/capture', params: { propertyId: property.property_id } })
  }, [router, property.property_id])

  const handleView3D = useCallback(() => {
    router.push({ pathname: '/manage-3d/[id]', params: { id: property.property_id } })
  }, [router, property.property_id])

  const isAvailable = property.status === 'AVAILABLE'

  return (
    <View className='bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100'>
      {/* Thumbnail */}
      <View className='h-44 relative'>
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            style={{ width: '100%', height: '100%' }}
            contentFit='cover'
          />
        ) : (
          <View className='w-full h-full bg-gray-50 items-center justify-center'>
            <Box size={32} color='#4B5563' />
          </View>
        )}

        {/* Status badge */}
        <View
          className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl border border-white/20 ${
            isAvailable ? 'bg-emerald-500/95' : 'bg-slate-500/95'
          }`}
        >
          <Text
            className='text-white text-xs uppercase tracking-widest'
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
          >
            {property.status}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className='p-4'>
        <Text
          className='text-base text-slate-900 mb-1'
          numberOfLines={1}
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          {address}
        </Text>

        {locationLabel ? (
          <Text
            className='text-sm text-slate-500 mb-1'
            numberOfLines={1}
            style={{ fontFamily: 'PlusJakartaSans_500Medium' }}
          >
            {locationLabel}
          </Text>
        ) : null}

        {property.land_size_m2 != null && (
          <Text
            className='text-xs text-slate-400 mb-4'
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            {property.land_size_m2} m²
          </Text>
        )}

        {/* 3D Action Area */}
        <View className='border-t border-gray-100 pt-4'>
          {has3D ? (
            <View className='flex-row gap-2.5'>
              <Pressable
                className='flex-1 flex-row items-center justify-center bg-purple-50 border border-purple-200/50 py-3 rounded-2xl gap-2'
                onPress={handleView3D}
              >
                <Globe size={15} color='#7065F0' />
                <Text
                  className='text-sm text-main-primary'
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                >
                  Quản lý 3D
                </Text>
              </Pressable>
              <Pressable
                className='flex-1 flex-row items-center justify-center bg-main-primary py-3 rounded-2xl gap-2'
                onPress={handleAdd3D}
              >
                <Camera size={15} color='#FFFFFF' />
                <Text
                  className='text-sm text-white'
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                >
                  Cập nhật
                </Text>
              </Pressable>
            </View>
          ) : pendingOp ? (
            <View className='flex-row items-center gap-2.5'>
              <View className='flex-1 flex-row items-center justify-center bg-amber-50 border border-amber-200/50 py-3 rounded-2xl gap-2'>
                <ActivityIndicator size='small' color='#F59E0B' />
                <Text
                  className='text-sm text-amber-500'
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                >
                  Đang xử lý 3D...
                </Text>
              </View>
              <Pressable
                className='bg-main-primary px-4 py-3 rounded-2xl items-center justify-center'
                onPress={handleView3D}
              >
                <Text
                  className='text-sm text-white'
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                >
                  Quản lý
                </Text>
              </Pressable>
            </View>
          ) : hasAnyOp ? (
            // Has operations but none succeeded yet (e.g. all failed) — still show manage button
            <View className='flex-row gap-2.5'>
              <Pressable
                className='flex-1 flex-row items-center justify-center bg-purple-50 border border-purple-200/50 py-3 rounded-2xl gap-2'
                onPress={handleView3D}
              >
                <Globe size={15} color='#7065F0' />
                <Text
                  className='text-sm text-main-primary'
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                >
                  Quản lý 3D
                </Text>
              </Pressable>
              <Pressable
                className='flex-1 flex-row items-center justify-center bg-main-primary py-3 rounded-2xl gap-2'
                onPress={handleAdd3D}
              >
                <Camera size={15} color='#FFFFFF' />
                <Text
                  className='text-sm text-white'
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                >
                  Cập nhật
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              className='flex-row items-center justify-center bg-main-primary py-3 rounded-2xl gap-2'
              onPress={handleAdd3D}
            >
              <Camera size={16} color='#FFFFFF' />
              <Text
                className='text-sm text-white'
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
              >
                Tạo 3D Tour mới
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

export function ManagePropertiesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useMyProperties({
    page: 0,
    size: 50,
  })

  const properties = Array.isArray(data?.data?.content) ? data?.data?.content : []

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50 px-8'>
        <ActivityIndicator size='large' color='#7065F0' />
        <Text
          className='mt-3 text-sm text-gray-500'
          style={{ fontFamily: 'PlusJakartaSans_500Medium' }}
        >
          Đang tải bất động sản...
        </Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50 px-8'>
        <Text
          className='text-base text-red-500 mb-4'
          style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
        >
          Không thể tải danh sách
        </Text>
        <Pressable className='bg-main-primary px-6 py-3 rounded-xl' onPress={() => refetch()}>
          <Text
            className='text-white text-sm'
            style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
          >
            Thử lại
          </Text>
        </Pressable>
      </View>
    )
  }

  if (properties.length === 0) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50 px-8'>
        <Box size={48} color='#9CA3AF' />
        <Text
          className='text-lg text-gray-800 mt-4 mb-2'
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          Chưa có bất động sản
        </Text>
        <Text
          className='text-sm text-gray-500 text-center leading-5'
          style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
        >
          Tạo bất động sản trên trang web trước để quản lý ở đây.
        </Text>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.property_id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor='#7065F0' />
        }
        ItemSeparatorComponent={() => <View className='h-3' />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
