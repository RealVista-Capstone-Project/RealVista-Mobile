import { formatVND } from '@/shared/lib/format-currency'
import {
  isListingRented,
  isListingSold,
  isListingSoldOrRented,
} from '@/shared/lib/listing-unavailable'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Path, Svg } from 'react-native-svg'

import type { RealVistaPropertyCardData } from './realvista-property-listing-card'

interface RealVistaPropertyHorizontalCardProps {
  property: RealVistaPropertyCardData
  onToggleFavorite?: (id: string) => void
  onClick?: (id: string) => void
  variant?: 'rent' | 'buy'
  className?: string
}

export function RealVistaPropertyHorizontalCard({
  property,
  onToggleFavorite,
  onClick,
  variant = 'rent',
  className = '',
}: RealVistaPropertyHorizontalCardProps) {
  const isUnavailable = isListingSoldOrRented(property.status)
  const isSold = isListingSold(property.status)
  const isRented = isListingRented(property.status)

  const goDetail = () => {
    if (isUnavailable) return
    onClick?.(property.id)
  }

  const heartButton = (
    <TouchableOpacity
      activeOpacity={0.8}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPress={() => onToggleFavorite?.(property.id)}
    >
      <FavoriteHeartIcon filled={!!property.isFavorite} size={16} />
    </TouchableOpacity>
  )

  const heartOnOverlay = (
    <TouchableOpacity
      activeOpacity={0.8}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPress={() => onToggleFavorite?.(property.id)}
      className='h-9 w-9 items-center justify-center rounded-full border border-purple-92 bg-white shadow-sm'
    >
      <FavoriteHeartIcon filled={!!property.isFavorite} size={16} />
    </TouchableOpacity>
  )

  return (
    <View
      className={`rounded-2xl border border-purple-92 bg-white p-3 relative overflow-hidden ${className}`}
    >
      <View className='flex-row'>
        <View style={styles.imageWrap}>
          {!isUnavailable ? (
            <TouchableOpacity activeOpacity={0.9} onPress={goDetail}>
              <Image source={{ uri: property.image }} resizeMode='cover' style={styles.image} />
            </TouchableOpacity>
          ) : (
            <Image source={{ uri: property.image }} resizeMode='cover' style={styles.image} />
          )}
        </View>

        <View className='ml-3 flex-1 justify-between'>
          <View>
            <View className='mb-1 flex-row items-center justify-between'>
              <View className='rounded-md bg-purple-96 px-2 py-1'>
                <Text className='font-jakarta-medium text-xs text-grey-500'>
                  {property.categoryLabel || 'Property'}
                </Text>
              </View>
              {!isUnavailable ? heartButton : null}
            </View>

            {!isUnavailable ? (
              <TouchableOpacity activeOpacity={0.7} onPress={goDetail}>
                <Text numberOfLines={1} className='font-jakarta-bold text-xl text-main-black'>
                  {property.title}
                </Text>

                <View className='mt-1 flex-row items-center'>
                  <IconLucide name='MapPin' size={14} color='#6C727F' />
                  <Text
                    numberOfLines={1}
                    className='ml-1 font-jakarta-medium text-base text-grey-500'
                  >
                    {property.address || 'Đang cập nhật địa chỉ'}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View>
                <Text numberOfLines={1} className='font-jakarta-bold text-xl text-main-black'>
                  {property.title}
                </Text>

                <View className='mt-1 flex-row items-center'>
                  <IconLucide name='MapPin' size={14} color='#6C727F' />
                  <Text
                    numberOfLines={1}
                    className='ml-1 font-jakarta-medium text-base text-grey-500'
                  >
                    {property.address || 'Đang cập nhật địa chỉ'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {!isUnavailable ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={goDetail}
              className='mt-2 flex-row items-end'
            >
              <Text className='font-jakarta-bold text-2xl text-main-black'>
                {formatVND(property.price)}
              </Text>
              {variant === 'rent' && (
                <Text className='ml-1 font-jakarta-medium text-base text-grey-500'>/tháng</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View className='mt-2 flex-row items-end'>
              <Text className='font-jakarta-bold text-2xl text-main-black'>
                {formatVND(property.price)}
              </Text>
              {variant === 'rent' && (
                <Text className='ml-1 font-jakarta-medium text-base text-grey-500'>/tháng</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {isUnavailable ? (
        <>
          <View pointerEvents='none' style={[StyleSheet.absoluteFillObject, styles.overlay]} />
          {isSold ? (
            <View pointerEvents='none' style={[styles.tagBase, styles.tagTopLeft]}>
              <Text className='font-jakarta-bold text-xs text-white'>SOLD</Text>
            </View>
          ) : null}
          {isRented ? (
            <View pointerEvents='none' style={[styles.tagBase, styles.tagBottomRight]}>
              <Text className='font-jakarta-bold text-xs text-white'>RENTED</Text>
            </View>
          ) : null}
          <View style={styles.heartOverlay} pointerEvents='box-none'>
            {heartOnOverlay}
          </View>
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  imageWrap: {
    width: 110,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: 110,
    height: 100,
    borderRadius: 10,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 16,
    zIndex: 2,
  },
  tagBase: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#100A55',
    zIndex: 3,
  },
  tagTopLeft: {
    top: 12,
    left: 12,
  },
  tagBottomRight: {
    bottom: 12,
    right: 12,
  },
  heartOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 4,
  },
})

function FavoriteHeartIcon({ filled, size = 16 }: { filled: boolean; size?: number }) {
  const color = filled ? '#EF4444' : '#7065F0'
  return (
    <Svg width={size} height={size} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M10 17.5C10 17.5 2.5 13.75 2.5 7.91667C2.5 6.75544 2.96094 5.64181 3.78141 4.82134C4.60188 4.00087 5.71551 3.53993 6.87674 3.53993C8.28571 3.53993 9.44118 4.21569 10 5.24157C10.5588 4.21569 11.7143 3.53993 13.1233 3.53993C14.2845 3.53993 15.3981 4.00087 16.2186 4.82134C17.0391 5.64181 17.5 6.75544 17.5 7.91667C17.5 13.75 10 17.5 10 17.5Z'
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}
