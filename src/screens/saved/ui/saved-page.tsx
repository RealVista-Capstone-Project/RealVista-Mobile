import React, { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ArrowDownUp,
  Building2,
  Factory,
  Home,
  LayoutGrid,
  Landmark,
  GitCompareArrows,
} from 'lucide-react-native'

import type { BookmarkListingCard, GetBookmarksParams } from '@/entities/bookmark'
import { useBookmarks, useToggleBookmark } from '@/features/bookmark'
import { Box } from '@/shared/ui/box'
import {
  RealVistaPropertyCard,
  type RealVistaPropertyCardData,
} from '@/shared/ui/realvista-property-listing-card'
import { Text } from '@/shared/ui/text'

// ── Category config ───────────────────────────────────────────────────────────

type CategoryCode = 'ALL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'LAND'

const CATEGORY_TYPE_CODES: Record<Exclude<CategoryCode, 'ALL'>, string[]> = {
  RESIDENTIAL: ['APARTMENT', 'HOUSE', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE', 'STUDIO'],
  COMMERCIAL: ['OFFICE', 'SHOPHOUSE', 'RETAIL', 'MALL', 'RESTAURANT', 'HOTEL'],
  INDUSTRIAL: ['WAREHOUSE', 'FACTORY', 'WORKSHOP', 'LOGISTICS'],
  LAND: ['LAND_RESIDENTIAL', 'LAND_COMMERCIAL', 'LAND_INDUSTRIAL', 'LAND_AGRICULTURAL'],
}

const CATEGORIES: {
  code: CategoryCode
  label: string
  Icon: React.ComponentType<{ size: number; color: string }>
}[] = [
  { code: 'ALL', label: 'Tất cả', Icon: LayoutGrid },
  { code: 'RESIDENTIAL', label: 'Nhà Ở', Icon: Home },
  { code: 'COMMERCIAL', label: 'Thương Mại', Icon: Building2 },
  { code: 'INDUSTRIAL', label: 'Công Nghiệp', Icon: Factory },
  { code: 'LAND', label: 'Đất', Icon: Landmark },
]

type SortDirection = 'NEWEST' | 'OLDEST'
type ListingTypeFilter = 'SALE' | 'RENT' | null

// ── Transform ─────────────────────────────────────────────────────────────────

function transformBookmarkToCard(bookmark: BookmarkListingCard): RealVistaPropertyCardData {
  const bedrooms =
    bookmark.attributes.find((a) => a.attribute_code === 'BEDROOMS')?.value_number ?? 0
  const bathrooms =
    bookmark.attributes.find((a) => a.attribute_code === 'BATHROOMS')?.value_number ?? 0
  const area = bookmark.usable_size_m2 ?? bookmark.area_sqft ?? 0

  return {
    id: bookmark.listing_id,
    image: bookmark.primary_image_url ?? '',
    title: bookmark.title,
    address: bookmark.full_address ?? bookmark.street_address,
    price: bookmark.price,
    beds: bedrooms,
    bathrooms: bathrooms,
    area: area,
    isFavorite: true,
    status: bookmark.status,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SavedPage() {
  const router = useRouter()
  const [category, setCategory] = useState<CategoryCode>('ALL')
  const [listingType, setListingType] = useState<ListingTypeFilter>('SALE')
  const [sortDirection, setSortDirection] = useState<SortDirection>('NEWEST')

  const propertyTypes = category !== 'ALL' ? CATEGORY_TYPE_CODES[category] : undefined

  const params: GetBookmarksParams = {
    propertyTypes,
    listingType: listingType ?? undefined,
    sortDirection,
    size: 20,
  }

  const { bookmarks, isLoading, error, refetch } = useBookmarks(params)
  const { mutate: toggleBookmark } = useToggleBookmark()

  const handleToggleFavorite = (id: string) => {
    Alert.alert(
      'Xóa khỏi yêu thích',
      'Bạn có muốn xóa tin đăng này khỏi danh sách yêu thích không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => toggleBookmark(id) },
      ]
    )
  }

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'NEWEST' ? 'OLDEST' : 'NEWEST'))
  }

  const items = bookmarks.map((b) => ({
    card: transformBookmarkToCard(b),
    status: b.status,
    listingType: b.listing_type,
  }))

  return (
    <View className='flex-1 bg-white'>
      {/* ── Filter bar ── */}
      <Box className='border-b border-gray-100 pt-3 pb-2'>
        {/* Category chips — circular icon + label below */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          className='mb-3'
        >
          {CATEGORIES.map(({ code, label, Icon }) => {
            const active = category === code
            return (
              <TouchableOpacity
                key={code}
                onPress={() => setCategory(code)}
                className='items-center gap-1'
              >
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center border ${
                    active ? 'bg-main-primary border-main-primary' : 'bg-white border-gray-200'
                  }`}
                >
                  <Icon size={20} color={active ? '#ffffff' : '#7065f0'} />
                </View>
                <Text
                  bold={active}
                  size='xs'
                  className={active ? 'text-main-primary' : 'text-gray-500'}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Bottom row: Rent/Buy | Sort | Compare (right-aligned) */}
        <Box className='flex-row items-center gap-2 px-4'>
          {/* Listing type toggle */}
          <Box className='flex-row rounded-full border border-gray-200 overflow-hidden'>
            {(
              [
                ['RENT', 'Thuê'],
                ['SALE', 'Mua'],
              ] as ['SALE' | 'RENT', string][]
            ).map(([val, lbl]) => (
              <TouchableOpacity
                key={val}
                onPress={() => setListingType((prev) => (prev === val ? null : val))}
                className={`px-3 py-1.5 ${listingType === val ? 'bg-main-primary' : 'bg-white'}`}
              >
                <Text
                  bold={listingType === val}
                  size='sm'
                  className={listingType === val ? 'text-white' : 'text-gray-500'}
                >
                  {lbl}
                </Text>
              </TouchableOpacity>
            ))}
          </Box>

          {/* Sort button */}
          <TouchableOpacity
            onPress={toggleSort}
            className='flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white'
          >
            <ArrowDownUp size={14} color='#7065f0' />
            <Text size='sm' className='text-main-black'>
              {sortDirection === 'NEWEST' ? 'Mới nhất' : 'Cũ nhất'}
            </Text>
          </TouchableOpacity>

          {/* Compare button — square, right-aligned, purple */}
          <TouchableOpacity className='flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-main-primary ml-auto'>
            <GitCompareArrows size={14} color='#ffffff' />
            <Text size='sm' bold className='text-white'>
              So sánh
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>

      {/* ── Content ── */}
      {isLoading ? (
        <Box className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' color='#7065F0' />
        </Box>
      ) : error ? (
        <Box className='flex-1 items-center justify-center p-6'>
          <Text className='text-gray-500 text-center mb-4'>
            Không thể tải danh sách. Thử lại sau.
          </Text>
          <TouchableOpacity
            onPress={() => void refetch()}
            className='px-6 py-3 bg-main-primary rounded-lg'
          >
            <Text bold className='text-white'>
              Thử lại
            </Text>
          </TouchableOpacity>
        </Box>
      ) : items.length === 0 ? (
        <Box className='flex-1 items-center justify-center p-6'>
          <Text className='text-gray-500 text-center'>Chưa có tin đăng yêu thích nào.</Text>
        </Box>
      ) : (
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          <Box className='px-4 py-4 gap-6'>
            {items.map(({ card, status, listingType }) => {
              const isUnavailable = status === 'SOLD' || status === 'RENTED'
              return (
                <RealVistaPropertyCard
                  key={card.id}
                  property={card}
                  variant={listingType === 'RENT' ? 'rent' : 'buy'}
                  onToggleFavorite={() => handleToggleFavorite(card.id)}
                  onClick={isUnavailable ? undefined : (id) => router.push(`/listing/${id}`)}
                />
              )
            })}
          </Box>
        </ScrollView>
      )}
    </View>
  )
}
