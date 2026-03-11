import { formatVND } from '@/shared/lib/format-currency'
import { Text } from '@/shared/ui/text'
import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { ClipPath, Defs, G, Path, Rect, Svg } from 'react-native-svg'

export interface RealVistaPropertyCardData {
  id: string
  image: string
  title: string
  address: string
  price: number
  currency?: string
  beds: number
  bathrooms: number
  area: number
  areaUnit?: string
  isPopular?: boolean
  isFavorite?: boolean
  status?: string
}

interface RealVistaPropertyCardProps {
  property: RealVistaPropertyCardData
  onToggleFavorite?: (id: string) => void
  onClick?: (id: string) => void
  className?: string
  variant?: 'rent' | 'buy'
}

export function RealVistaPropertyCard({
  property,
  onToggleFavorite,
  onClick,
  className = '',
  variant = 'rent',
}: RealVistaPropertyCardProps) {
  const handleFavoriteClick = (e: any) => {
    onToggleFavorite?.(property.id)
  }

  const handleCardClick = () => {
    onClick?.(property.id)
  }

  return (
    <TouchableOpacity
      onPress={handleCardClick}
      activeOpacity={0.9}
      className={`rounded-lg border-[1.5px] border-purple-96 bg-white ${className}`}
      style={{
        borderRadius: 8,
        borderWidth: 1.5,
      }}
    >
      {/* Property Image */}
      <View style={{ position: 'relative', aspectRatio: 16 / 10 }}>
        <Image
          source={{ uri: property.image }}
          style={{
            width: '100%',
            height: '100%',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
          resizeMode='cover'
        />

        {/* Sold / Rented overlay — white wash over image only */}
        {(property.status === 'SOLD' || property.status === 'RENTED') && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.55)',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              zIndex: 5,
            }}
          />
        )}

        {/* Sold / Rented ribbon badge — mirrors POPULAR badge style */}
        {(property.status === 'SOLD' || property.status === 'RENTED') && (
          <View style={{ position: 'absolute', bottom: -15, left: -8, zIndex: 10 }}>
            <View
              style={{
                position: 'relative',
                height: 32,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                backgroundColor: '#ef4444',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  lineHeight: 16,
                  letterSpacing: 0.5,
                  color: 'white',
                }}
              >
                {property.status === 'SOLD' ? 'Đã bán' : 'Đã cho thuê'}
              </Text>

              {/* Decorative cutout at bottom-left corner */}
              <View style={{ position: 'absolute', left: 0, top: '200%', height: 8, width: 8 }}>
                <Svg width={8} height={8} viewBox='0 0 8 8' fill='none' preserveAspectRatio='none'>
                  <Path d='M8 8L0 0H8V8Z' fill='#b91c1c' />
                </Svg>
              </View>
            </View>
          </View>
        )}

        {/* Popular Badge */}
        {property.isPopular && (
          <View style={{ position: 'absolute', bottom: -15, left: -8, zIndex: 10 }}>
            {/* Main badge body with special rounded corners */}
            <View
              className='bg-brand-primary'
              style={{
                position: 'relative',
                height: 32,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {/* Star Icon - 16x16 */}
                <Svg width={16} height={16} viewBox='0 0 16 16' fill='none'>
                  <Path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M4.0001 1.59961C4.21227 1.59961 4.41575 1.68389 4.56578 1.83392C4.71581 1.98395 4.8001 2.18744 4.8001 2.39961V3.19961H5.6001C5.81227 3.19961 6.01575 3.28389 6.16578 3.43392C6.31581 3.58395 6.4001 3.78744 6.4001 3.99961C6.4001 4.21178 6.31581 4.41527 6.16578 4.56529C6.01575 4.71532 5.81227 4.79961 5.6001 4.79961H4.8001V5.59961C4.8001 5.81178 4.71581 6.01527 4.56578 6.16529C4.41575 6.31532 4.21227 6.39961 4.0001 6.39961C3.78792 6.39961 3.58444 6.31532 3.43441 6.16529C3.28438 6.01527 3.2001 5.81178 3.2001 5.59961V4.79961H2.4001C2.18792 4.79961 1.98444 4.71532 1.83441 4.56529C1.68438 4.41527 1.6001 4.21178 1.6001 3.99961C1.6001 3.78744 1.68438 3.58395 1.83441 3.43392C1.98444 3.28389 2.18792 3.19961 2.4001 3.19961H3.2001V2.39961C3.2001 2.18744 3.28438 1.98395 3.43441 1.83392C3.58444 1.68389 3.78792 1.59961 4.0001 1.59961ZM4.0001 9.59961C4.21227 9.59961 4.41575 9.68389 4.56578 9.83392C4.71581 9.98395 4.8001 10.1874 4.8001 10.3996V11.1996H5.6001C5.81227 11.1996 6.01575 11.2839 6.16578 11.4339C6.31581 11.584 6.4001 11.7874 6.4001 11.9996C6.4001 12.2118 6.31581 12.4153 6.16578 12.5653C6.01575 12.7153 5.81227 12.7996 5.6001 12.7996H4.8001V13.5996C4.8001 13.8118 4.71581 14.0153 4.56578 14.1653C4.41575 14.3153 4.21227 14.3996 4.0001 14.3996C3.78792 14.3996 3.58444 14.3153 3.43441 14.1653C3.28438 14.0153 3.2001 13.8118 3.2001 13.5996V12.7996H2.4001C2.18792 12.7996 1.98444 12.7153 1.83441 12.5653C1.68438 12.4153 1.6001 12.2118 1.6001 11.9996C1.6001 11.7874 1.68438 11.584 1.83441 11.4339C1.98444 11.2839 2.18792 11.1996 2.4001 11.1996H3.2001V10.3996C3.2001 10.1874 3.28438 9.98395 3.43441 9.83392C3.58444 9.68389 3.78792 9.59961 4.0001 9.59961ZM9.6001 1.59961C9.77665 1.59955 9.94826 1.6579 10.0882 1.76556C10.2281 1.87322 10.3285 2.02414 10.3737 2.19481L11.3169 5.75961L14.0001 7.30681C14.1217 7.37703 14.2227 7.47802 14.2929 7.59963C14.3631 7.72124 14.4001 7.85919 14.4001 7.99961C14.4001 8.14003 14.3631 8.27798 14.2929 8.39959C14.2227 8.5212 14.1217 8.62219 14.0001 8.69241L11.3169 10.2404L10.3729 13.8044C10.3276 13.9749 10.2273 14.1257 10.0874 14.2332C9.94758 14.3408 9.77611 14.3991 9.5997 14.3991C9.42329 14.3991 9.25182 14.3408 9.11198 14.2332C8.97214 14.1257 8.87178 13.9749 8.8265 13.8044L7.8833 10.2396L5.2001 8.69241C5.07849 8.62219 4.97751 8.5212 4.9073 8.39959C4.83709 8.27798 4.80013 8.14003 4.80013 7.99961C4.80013 7.85919 4.83709 7.72124 4.9073 7.59963C4.97751 7.47802 5.07849 7.37703 5.2001 7.30681L7.8833 5.75881L8.8273 2.19481C8.87246 2.02427 8.97272 1.87345 9.11249 1.7658C9.25226 1.65816 9.42368 1.59973 9.6001 1.59961Z'
                    fill='white'
                  />
                </Svg>
                {/* Text */}
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    lineHeight: 16,
                    letterSpacing: 0.5,
                    color: 'white',
                  }}
                >
                  POPULAR
                </Text>
              </View>

              {/* Decorative cutout at bottom-left corner - creates paper wrap effect */}
              <View style={{ position: 'absolute', left: 0, top: '200%', height: 8, width: 8 }}>
                <Svg width={8} height={8} viewBox='0 0 8 8' fill='none' preserveAspectRatio='none'>
                  <Path d='M8 8L0 0H8V8Z' fill='#5245ED' />
                </Svg>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Property Details */}
      <View style={{ padding: 24 }}>
        {/* Price and Favorite */}
        <View
          style={{
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text
              className="font-['PlusJakartaSans_700Bold'] text-brand-primary"
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 24,
                lineHeight: 36,
                letterSpacing: -1,
              }}
            >
              {formatVND(property.price)}
            </Text>
            {variant === 'rent' && (
              <Text
                className="font-['PlusJakartaSans_500Medium'] text-grey-500"
                style={{
                  fontFamily: 'PlusJakartaSans_500Medium',
                  fontSize: 16,
                  lineHeight: 24,
                }}
              >
                /tháng
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleFavoriteClick}
            className='border-purple-94 bg-white'
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1.5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <HeartIcon filled={property.isFavorite} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text
          className="font-['PlusJakartaSans_700Bold'] text-main-black"
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 24,
            lineHeight: 36,
            letterSpacing: -1,
            marginBottom: 4,
          }}
        >
          {property.title}
        </Text>

        {/* Address */}
        <Text
          className="font-['PlusJakartaSans_500Medium'] text-grey-500"
          style={{
            fontFamily: 'PlusJakartaSans_500Medium',
            fontSize: 16,
            lineHeight: 24,
            marginBottom: 16,
          }}
        >
          {property.address}
        </Text>

        {/* Divider Line */}
        <View className='bg-purple-94' style={{ height: 1, marginBottom: 16 }} />

        {/* Property Specs */}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}
        >
          {/* Beds */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BedIcon />
            <Text
              className="font-['PlusJakartaSans_500Medium'] text-grey-500"
              style={{
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 14,
                lineHeight: 19.6,
                color: '#6C727F',
              }}
            >
              {property.beds} PN
            </Text>
          </View>

          {/* Bathrooms */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BathIcon />
            <Text
              className="font-['PlusJakartaSans_500Medium'] text-grey-500"
              style={{
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 14,
                lineHeight: 19.6,
                color: '#6C727F',
              }}
            >
              {property.bathrooms} WC
            </Text>
          </View>

          {/* Area */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AreaIcon />
            <Text
              className="font-['PlusJakartaSans_500Medium'] text-grey-500"
              style={{
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 14,
                lineHeight: 19.6,
                color: '#6C727F',
              }}
            >
              {property.area}
              {property.areaUnit || 'm²'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// Heart Icon
function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M10 17.5C10 17.5 2.5 13.75 2.5 7.91667C2.5 6.75544 2.96094 5.64181 3.78141 4.82134C4.60188 4.00087 5.71551 3.53993 6.87674 3.53993C8.28571 3.53993 9.44118 4.21569 10 5.24157C10.5588 4.21569 11.7143 3.53993 13.1233 3.53993C14.2845 3.53993 15.3981 4.00087 16.2186 4.82134C17.0391 5.64181 17.5 6.75544 17.5 7.91667C17.5 13.75 10 17.5 10 17.5Z'
        fill={filled ? '#7065F0' : 'none'}
        stroke='#7065F0'
        strokeWidth={2.3}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}

// Bed Icon (BedSingle equivalent)
function BedIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M2.5 14.1667V8.33333M2.5 8.33333V5.83333C2.5 5.3731 2.8731 5 3.33333 5H16.6667C17.1269 5 17.5 5.3731 17.5 5.83333V8.33333M2.5 8.33333H17.5M17.5 8.33333V14.1667M2.5 14.1667H17.5M2.5 14.1667V15.8333M17.5 14.1667V15.8333M5.83333 8.33333V6.66667M14.1667 8.33333V6.66667'
        stroke='#7065F0'
        strokeWidth={2.3}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}

// Bath Icon
function BathIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <Path
        d='M3.33333 7.5V5.83333C3.33333 4.91286 4.07953 4.16667 5 4.16667C5.92047 4.16667 6.66667 4.91286 6.66667 5.83333V7.5M3.33333 7.5H16.6667M3.33333 7.5V11.6667C3.33333 13.5076 4.82572 15 6.66667 15H13.3333C15.1743 15 16.6667 13.5076 16.6667 11.6667V7.5M5 15V16.6667M15 15V16.6667'
        stroke='#7065F0'
        strokeWidth={2.3}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}

// Area Icon
function AreaIcon() {
  return (
    <Svg width={20} height={20} viewBox='0 0 20 20' fill='none'>
      <G clipPath='url(#clip0_272_7379)'>
        <Path
          d='M8.83149 15.5437L3.45631 10.1685C2.8479 9.56011 2.8479 8.43989 3.45631 7.83148L8.83149 2.45631C9.43989 1.8479 10.5601 1.8479 11.1685 2.45631L16.5437 7.83148C17.1521 8.43989 17.1521 9.56011 16.5437 10.1685L11.1685 15.5437C10.5601 16.1521 9.43989 16.1521 8.83149 15.5437V15.5437Z'
          stroke='#7065F0'
          strokeWidth={2.1}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M2 13.1719L6.36371 17.5356'
          stroke='#7065F0'
          strokeWidth={2.1}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <Path
          d='M13.6362 17.5356L17.9999 13.1719'
          stroke='#7065F0'
          strokeWidth={2.1}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </G>
      <Defs>
        <ClipPath id='clip0_272_7379'>
          <Rect width={20} height={20} fill='white' />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
