import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter } from '../drawer'
import { IconSymbol } from '../icon-symbol'
import { RealVistaPriceRangeSlider } from '../realvista-price-range-slider'

export interface FilterValues {
  category: ('Houses' | 'Rooms' | 'Apartment')[]
  priceRange: { min: number; max: number }
  bedrooms: number
  bathrooms: number
  rentalPeriod: 'Any' | '1-12' | '13-24' | '24+' | null
}

interface RealVistaPropertyFilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterValues
  onApply: (filters: FilterValues) => void
}

const CATEGORIES = ['Houses', 'Rooms', 'Apartment'] as const
const RENTAL_PERIODS = [
  { value: 'Any', label: 'Bất kỳ' },
  { value: '1-12', label: '1 - 12 tháng' },
  { value: '13-24', label: '13 - 24 tháng' },
  { value: '24+', label: '24+ tháng' },
] as const

const MIN_PRICE = 5000000
const MAX_PRICE = 100000000

export function RealVistaPropertyFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
}: RealVistaPropertyFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters)

  const handleReset = () => {
    const defaultFilters: FilterValues = {
      category: [],
      priceRange: { min: MIN_PRICE, max: MAX_PRICE },
      bedrooms: 0,
      bathrooms: 0,
      rentalPeriod: 'Any',
    }
    setLocalFilters(defaultFilters)
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const updateCategory = (category: (typeof CATEGORIES)[number]) => {
    setLocalFilters((prev) => {
      const isSelected = prev.category.includes(category)
      return {
        ...prev,
        category: isSelected
          ? prev.category.filter((c) => c !== category)
          : [...prev.category, category],
      }
    })
  }

  const updateBedrooms = (increment: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      bedrooms: Math.max(0, prev.bedrooms + (increment ? 1 : -1)),
    }))
  }

  const updateBathrooms = (increment: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      bathrooms: Math.max(0, prev.bathrooms + (increment ? 1 : -1)),
    }))
  }

  const updateRentalPeriod = (period: FilterValues['rentalPeriod']) => {
    setLocalFilters((prev) => ({
      ...prev,
      rentalPeriod: period,
    }))
  }

  const updateMinPrice = React.useCallback((value: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      priceRange: { ...prev.priceRange, min: Math.min(value, prev.priceRange.max) },
    }))
  }, [])

  const updateMaxPrice = React.useCallback((value: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      priceRange: { ...prev.priceRange, max: Math.max(value, prev.priceRange.min) },
    }))
  }, [])

  // Reset local filters to match props when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]) // Only depend on isOpen, not filters, to avoid infinite loops

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size='full' anchor='bottom'>
      <DrawerBackdrop />
      <DrawerContent
        className='rounded-t-3xl bg-white'
        style={{ paddingBottom: 32, maxHeight: '95%', display: 'flex', flexDirection: 'column' }}
        collapsable={false}
      >
        {/* Drag Indicator */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <View
            style={{
              width: 56,
              height: 5,
              borderRadius: 32,
              backgroundColor: '#E5E6EB',
            }}
          />
        </View>

        {/* Header */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 8,
              paddingBottom: 16,
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }} activeOpacity={0.7}>
              <IconSymbol name='xmark' size={24} color='#9EA3AE' />
            </TouchableOpacity>
            <Text
              className="font-['PlusJakartaSans_700Bold'] text-xl text-[#100A55]"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#100A55' }}
            >
              Bộ lọc
            </Text>
            <View style={{ width: 40 }} />
          </View>
          {/* Full-width separator line */}
          <View
            style={{
              height: 1,
              backgroundColor: '#E5E6EB',
              marginLeft: -20,
              marginRight: -20,
            }}
          />
        </View>

        <DrawerBody style={{ flex: 1, paddingTop: 24 }}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            bounces={true}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Category Section */}
            <View style={{ marginBottom: 32 }}>
              <Text
                className="font-['PlusJakartaSans_700Bold'] mb-4 text-base text-[#000929]"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, marginBottom: 16 }}
              >
                Danh mục
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => updateCategory(category)}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: localFilters.category.includes(category)
                        ? '#7065F0'
                        : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: localFilters.category.includes(category) ? '#7065F0' : '#E0DEF7',
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      className="font-['PlusJakartaSans_600SemiBold'] text-sm"
                      style={{
                        fontFamily: 'PlusJakartaSans_600SemiBold',
                        fontSize: 14,
                        color: localFilters.category.includes(category) ? '#FFFFFF' : '#000929',
                      }}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Separator Line */}
            <View
              style={{
                height: 1,
                backgroundColor: '#E5E6EB',
                marginBottom: 32,
              }}
            />

            {/* Price Range Section */}
            <RealVistaPriceRangeSlider
              minValue={MIN_PRICE}
              maxValue={MAX_PRICE}
              currentMin={localFilters.priceRange.min}
              currentMax={localFilters.priceRange.max}
              onMinChange={updateMinPrice}
              onMaxChange={updateMaxPrice}
              histogramData={[6, 8, 8, 12, 21, 35, 38, 28, 21, 12, 8, 6]}
            />

            {/* Separator Line */}
            <View
              style={{
                height: 1,
                backgroundColor: '#E5E6EB',
                marginBottom: 32,
              }}
            />

            {/* Features Section */}
            <View style={{ marginBottom: 32 }}>
              <Text
                className="font-['PlusJakartaSans_700Bold'] mb-4 text-base text-[#000929]"
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 18,
                  marginBottom: 16,
                  color: '#000929',
                }}
              >
                Tiện nghi
              </Text>
              {/* Bedroom Counter */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text
                  className="font-['PlusJakartaSans_500Medium'] text-base text-[#000929]"
                  style={{
                    fontFamily: 'PlusJakartaSans_500Medium',
                    fontSize: 16,
                    color: '#000929',
                  }}
                >
                  Phòng ngủ
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity
                    onPress={() => updateBedrooms(false)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: localFilters.bedrooms >= 1 ? '#7065F0' : '#E5E6EB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name='minus' size={28} color='#FFFF' weight='medium' />
                  </TouchableOpacity>
                  <Text
                    className="font-['PlusJakartaSans_600SemiBold'] text-base text-[#000929]"
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 16,
                      minWidth: 24,
                      textAlign: 'center',
                    }}
                  >
                    {localFilters.bedrooms}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateBedrooms(true)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#7065F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name='plus' size={28} color='#FFFFFF' weight='medium' />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Bathroom Counter */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  className="font-['PlusJakartaSans_500Medium'] text-base text-[#000929]"
                  style={{
                    fontFamily: 'PlusJakartaSans_500Medium',
                    fontSize: 16,
                    color: '#000929',
                  }}
                >
                  Phòng tắm
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity
                    onPress={() => updateBathrooms(false)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: localFilters.bathrooms >= 1 ? '#7065F0' : '#E5E6EB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name='minus' size={28} color='#FFFF' weight='medium' />
                  </TouchableOpacity>
                  <Text
                    className="font-['PlusJakartaSans_600SemiBold'] text-base text-[#000929]"
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 16,
                      minWidth: 24,
                      textAlign: 'center',
                    }}
                  >
                    {localFilters.bathrooms}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateBathrooms(true)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#7065F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name='plus' size={28} color='#FFFFFF' weight='medium' />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Separator Line */}
            <View
              style={{
                height: 1,
                backgroundColor: '#E5E6EB',
                marginBottom: 32,
              }}
            />

            {/* Rental Period Section */}
            <View style={{ marginBottom: 16 }}>
              <Text
                className="font-['PlusJakartaSans_700Bold'] mb-4 text-base text-[#000929]"
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 18,
                  marginBottom: 16,
                  color: '#000929',
                }}
              >
                Thời hạn thuê
              </Text>
              <View style={{ gap: 12 }}>
                {RENTAL_PERIODS.map((period) => (
                  <TouchableOpacity
                    key={period.value}
                    onPress={() => updateRentalPeriod(period.value)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor:
                          localFilters.rentalPeriod === period.value ? '#7065F0' : '#D1D5DB',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {localFilters.rentalPeriod === period.value && (
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: '#7065F0',
                          }}
                        />
                      )}
                    </View>
                    <Text
                      className="font-['PlusJakartaSans_500Medium'] text-base text-[#000929]"
                      style={{
                        fontFamily: 'PlusJakartaSans_500Medium',
                        fontSize: 16,
                        color: '#000929',
                      }}
                    >
                      {period.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </DrawerBody>

        <DrawerFooter style={{ flexDirection: 'row', gap: 12, paddingTop: 16 }}>
          <TouchableOpacity
            onPress={handleReset}
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 8,
              backgroundColor: '#F0EFFE',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Text
              className="font-['PlusJakartaSans_700Bold'] text-base text-[#7065F0]"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
            >
              Đặt lại
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApply}
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 8,
              backgroundColor: '#7065F0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Text
              className="font-['PlusJakartaSans_700Bold'] text-base text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
            >
              Áp dụng
            </Text>
          </TouchableOpacity>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
