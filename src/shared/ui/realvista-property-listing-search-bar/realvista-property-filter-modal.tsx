import type { AdvancedSearchRequest } from '@/entities/listing/model/types'
import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_TYPES,
  PROPERTY_TYPES,
  type PropertyAttribute,
} from '@/shared/config/property-types'
import React, { useMemo, useState } from 'react'
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerFooter } from '../drawer'
import IconLucide from '../icon-lucide/icon'
import { IconSymbol } from '../icon-symbol'
import { RealVistaPriceRangeSlider } from '../realvista-price-range-slider'
import { DirectionPieChart } from '../charts/direction-pie-chart'

export interface FilterValues extends AdvancedSearchRequest {
  rentalPeriod?: 'Any' | '1-12' | '13-24' | '24+' | null
}

interface RealVistaPropertyFilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterValues
  onApply: (filters: FilterValues) => void
  showLeaseTerm?: boolean
  /** Upper bound of price slider. Default: 10_000_000_000 (10 tỷ). Pass a lower value for RENT screens. */
  maxPriceLimit?: number
}

const RENTAL_PERIODS = [
  { value: 'Any', label: 'Bất kỳ' },
  { value: '1-12', label: '1 - 12 tháng' },
  { value: '13-24', label: '13 - 24 tháng' },
  { value: '24+', label: '24+ tháng' },
] as const

const SORT_OPTIONS = [
  { value: 'PRIORITY', label: 'Ưu tiên (Nổi bật trước)' },
  { value: 'DATE_DESC', label: 'Mới nhất trước' },
  { value: 'PRICE_ASC', label: 'Giá: Thấp đến Cao' },
  { value: 'PRICE_DESC', label: 'Giá: Cao đến Thấp' },
] as const

const MIN_PRICE = 0
// MAX_PRICE is dynamic per screen — see maxPriceLimit prop
const DEFAULT_MAX_PRICE = 10_000_000_000 // 10 tỷ (covers cả SALE lẫn RENT)

export function RealVistaPropertyFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  showLeaseTerm = true,
  maxPriceLimit = DEFAULT_MAX_PRICE,
}: RealVistaPropertyFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters)

  // Reset local filters to match props when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
    }
  }, [isOpen, filters])

  const handleReset = () => {
    const defaultFilters: FilterValues = {
      propertyCategory: undefined,
      propertyType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minArea: undefined,
      maxArea: undefined,
      dynamicAttributes: {},
      rentalPeriod: 'Any',
      sortBy: 'PRIORITY',
    }
    setLocalFilters(defaultFilters)
  }

  const handleApply = () => {
    // Strip boundary values — if price is at absolute min/max the user didn't filter,
    // so send undefined to avoid accidentally excluding listings
    const priceFiltered: FilterValues = {
      ...localFilters,
      minPrice:
        localFilters.minPrice === undefined || localFilters.minPrice <= MIN_PRICE
          ? undefined
          : localFilters.minPrice,
      maxPrice:
        localFilters.maxPrice === undefined || localFilters.maxPrice >= maxPriceLimit
          ? undefined
          : localFilters.maxPrice,
    }
    onApply(priceFiltered)
    onClose()
  }

  // Determine active attributes based on selected property type
  const activeAttributes = useMemo(() => {
    if (!localFilters.propertyType) return []
    for (const category of PROPERTY_TYPES) {
      const type = category.types.find((t) => t.code === localFilters.propertyType)
      if (type) return type.attributes
    }
    return []
  }, [localFilters.propertyType])

  const updateCategory = (categoryCode: string) => {
    // If selecting new category, reset property type
    const isSameCategory = localFilters.propertyCategory === categoryCode
    setLocalFilters((prev) => ({
      ...prev,
      propertyCategory: isSameCategory ? undefined : categoryCode,
      propertyType: undefined, // Reset type when category changes
      dynamicAttributes: {}, // Reset dynamic attrs
    }))
  }

  const updatePropertyType = (typeCode: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      propertyType: prev.propertyType === typeCode ? undefined : typeCode,
      dynamicAttributes: {}, // Reset dynamic attrs when type changes
    }))
  }

  const updateDynamicAttribute = (key: string, value: string | undefined) => {
    setLocalFilters((prev) => {
      const currentAttrs = prev.dynamicAttributes || {}
      if (value === undefined || value === '') {
        const { [key]: _, ...rest } = currentAttrs
        return { ...prev, dynamicAttributes: rest }
      }
      return {
        ...prev,
        dynamicAttributes: {
          ...currentAttrs,
          [key]: value,
        },
      }
    })
  }

  const getDynamicAttributeValue = (key: string): string | undefined => {
    return localFilters.dynamicAttributes?.[key]
  }

  const updateRentalPeriod = (period: FilterValues['rentalPeriod']) => {
    setLocalFilters((prev) => ({
      ...prev,
      rentalPeriod: period,
    }))
  }

  const updateSortBy = (sort: AdvancedSearchRequest['sortBy']) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: sort,
    }))
  }

  const updateMinPrice = React.useCallback((value: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      minPrice: value,
    }))
  }, [])

  const updateMaxPrice = React.useCallback((value: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      maxPrice: value,
    }))
  }, [])

  // Helper to render dynamic fields
  const renderDynamicField = (attrCode: PropertyAttribute) => {
    const label = ATTRIBUTE_LABELS[attrCode]
    const type = ATTRIBUTE_TYPES[attrCode]
    const currentValue = getDynamicAttributeValue(attrCode)

    if (type === 'boolean') {
      return (
        <View
          key={attrCode}
          className='flex-row items-center justify-between rounded-lg border border-grey-200 p-3 mb-3'
        >
          <View className='flex-row items-center gap-2'>
            <IconLucide name='CircleCheck' size={18} color='#7065F0' />
            <Text className='text-sm text-main-black'>{label}</Text>
          </View>
          <Switch
            value={currentValue === 'true'}
            onValueChange={(checked) =>
              updateDynamicAttribute(attrCode, checked ? 'true' : undefined)
            }
            trackColor={{ false: '#767577', true: '#7065F0' }}
            thumbColor={currentValue === 'true' ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      )
    }

    if (type === 'number') {
      return (
        <View key={attrCode} className='mb-3'>
          <Text className='text-sm font-medium text-main-black mb-1.5'>{label}</Text>
          <View className='relative flex-row items-center rounded-lg border border-grey-300 bg-white'>
            <View className='pl-3'>
              <IconLucide name='Hash' size={16} color='#9CA3AF' />
            </View>
            <TextInput
              keyboardType='numeric'
              placeholder={`Nhập số ${label.toLowerCase()}...`}
              value={currentValue || ''}
              onChangeText={(text) => {
                // Only allow numbers
                const numeric = text.replace(/[^0-9]/g, '')
                updateDynamicAttribute(attrCode, numeric || undefined)
              }}
              className='flex-1 p-3 text-base text-main-black'
              placeholderTextColor='#9CA3AF'
            />
          </View>
        </View>
      )
    }

    if (attrCode === 'DIRECTION') {
      return (
        <View key={attrCode} className='mb-3'>
          {/* Pie Chart for Direction Selection */}
          <DirectionPieChart
            selectedDirection={currentValue}
            onPress={(code) => updateDynamicAttribute(attrCode, code)}
          />
        </View>
      )
    }

    // Text inputs
    return (
      <View key={attrCode} className='mb-3'>
        <Text className='text-sm font-medium text-main-black mb-1.5'>{label}</Text>
        <View className='relative flex-row items-center rounded-lg border border-grey-300 bg-white'>
          <View className='pl-3'>
            <IconLucide name='Type' size={16} color='#9CA3AF' />
          </View>
          <TextInput
            placeholder={`Nhập ${label.toLowerCase()}...`}
            value={currentValue || ''}
            onChangeText={(text) => updateDynamicAttribute(attrCode, text || undefined)}
            className='flex-1 p-3 text-base text-main-black'
            placeholderTextColor='#9CA3AF'
          />
        </View>
      </View>
    )
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size='full' anchor='bottom'>
      <DrawerBackdrop />
      <DrawerContent
        className='rounded-t-3xl bg-white'
        style={{ maxHeight: '95%', display: 'flex', flexDirection: 'column' }}
        collapsable={false}
      >
        {/* Drag Indicator */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <View className='bg-grey-200' style={{ width: 56, height: 5, borderRadius: 32 }} />
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
              paddingHorizontal: 20,
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <IconSymbol name='xmark' size={24} color='#6C727F' />
            </TouchableOpacity>
            <Text className='font-jakarta-bold text-xl text-main-secondary'>Bộ lọc</Text>
            <View style={{ width: 28 }} />
          </View>
          <View className='bg-grey-200' style={{ height: 1 }} />
        </View>

        {/* Scrollable Body */}
        <DrawerBody style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            bounces={true}
            contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20, paddingTop: 16 }}
          >
            {/* 1. Property Category */}
            <View className='mb-6'>
              <Text className='font-jakarta-bold mb-3 text-base text-main-black'>
                Danh mục Bất động sản
              </Text>
              <View className='flex-row flex-wrap gap-2'>
                {PROPERTY_TYPES.map((category) => (
                  <TouchableOpacity
                    key={category.code}
                    onPress={() => updateCategory(category.code)}
                    className={`flex-row items-center rounded-lg border px-4 py-2 gap-2 ${
                      localFilters.propertyCategory === category.code
                        ? 'bg-brand-primary border-brand-primary'
                        : 'bg-white border-grey-300'
                    }`}
                  >
                    {category.icon && (
                      <IconLucide
                        name={category.icon as any}
                        size={18}
                        color={
                          localFilters.propertyCategory === category.code ? 'white' : '#1A1E25'
                        }
                      />
                    )}
                    <Text
                      className={`text-sm font-medium ${
                        localFilters.propertyCategory === category.code
                          ? 'text-white'
                          : 'text-main-black'
                      }`}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 2. Property Type (Dependent on Category) */}
            {localFilters.propertyCategory && (
              <View className='mb-6'>
                <Text className='font-jakarta-bold mb-3 text-base text-main-black'>
                  Loại hình cụ thể
                </Text>
                <View className='flex-row flex-wrap gap-2'>
                  {PROPERTY_TYPES.find((c) => c.code === localFilters.propertyCategory)?.types.map(
                    (type) => (
                      <TouchableOpacity
                        key={type.code}
                        onPress={() => updatePropertyType(type.code)}
                        className={`flex-row items-center rounded-lg border px-4 py-2 gap-2 ${
                          localFilters.propertyType === type.code
                            ? 'bg-brand-primary border-brand-primary'
                            : 'bg-white border-grey-300'
                        }`}
                      >
                        {type.icon && (
                          <IconLucide
                            name={type.icon as any}
                            size={16}
                            color={localFilters.propertyType === type.code ? 'white' : '#1A1E25'}
                          />
                        )}
                        <Text
                          className={`text-sm font-medium ${
                            localFilters.propertyType === type.code
                              ? 'text-white'
                              : 'text-main-black'
                          }`}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            )}

            {/* Separator */}
            <View className='bg-grey-200 mb-6' style={{ height: 1 }} />

            {/* 3. Price Range (with Chart) */}
            <Text className='font-jakarta-bold mb-2 text-base text-main-black'>Khoảng giá</Text>

            {/* Price Distribution Chart removed as per user request */}

            <RealVistaPriceRangeSlider
              minValue={MIN_PRICE}
              maxValue={maxPriceLimit}
              currentMin={localFilters.minPrice ?? MIN_PRICE}
              currentMax={localFilters.maxPrice ?? maxPriceLimit}
              onMinChange={updateMinPrice}
              onMaxChange={updateMaxPrice}
              histogramData={[]} // Custom chart handles this now
            />

            {/* Separator */}
            <View className='bg-grey-200 my-6' style={{ height: 1 }} />

            {/* 4. Dynamic Attributes */}
            {activeAttributes.length > 0 && (
              <View className='mb-6'>
                <Text className='font-jakarta-bold mb-4 text-base text-main-black'>
                  Đặc điểm & Tiện nghi
                </Text>

                {/* Render Boolean attributes first */}
                <View className='mb-4'>
                  {activeAttributes
                    .filter((attr) => ATTRIBUTE_TYPES[attr] === 'boolean')
                    .map((attr) => renderDynamicField(attr))}
                </View>

                {/* Render Number/Text attributes */}
                <View>
                  {activeAttributes
                    .filter((attr) => ATTRIBUTE_TYPES[attr] !== 'boolean')
                    .map((attr) => renderDynamicField(attr))}
                </View>
              </View>
            )}

            {/* 5. Rental Period */}
            {showLeaseTerm && (
              <View className='mt-4'>
                <View className='bg-grey-200 mb-6' style={{ height: 1 }} />
                <Text className='font-jakarta-bold mb-4 text-base text-main-black'>
                  Thời hạn thuê
                </Text>
                <View className='gap-3'>
                  {RENTAL_PERIODS.map((period) => (
                    <TouchableOpacity
                      key={period.value}
                      onPress={() => updateRentalPeriod(period.value)}
                      className='flex-row items-center gap-3'
                    >
                      <View
                        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                          localFilters.rentalPeriod === period.value
                            ? 'border-brand-primary'
                            : 'border-grey-300'
                        }`}
                      >
                        {localFilters.rentalPeriod === period.value && (
                          <View className='h-3 w-3 rounded-full bg-brand-primary' />
                        )}
                      </View>
                      <Text className='font-jakarta-medium text-base text-main-black'>
                        {period.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* 6. Sort By */}
            <View className='mt-4'>
              <View className='bg-grey-200 mb-6' style={{ height: 1 }} />
              <Text className='font-jakarta-bold mb-4 text-base text-main-black'>Sắp xếp theo</Text>
              <View className='gap-3'>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => updateSortBy(option.value as any)}
                    className='flex-row items-center gap-3'
                  >
                    <View
                      className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                        localFilters.sortBy === option.value ||
                        (!localFilters.sortBy && option.value === 'PRIORITY')
                          ? 'border-brand-primary'
                          : 'border-grey-300'
                      }`}
                    >
                      {(localFilters.sortBy === option.value ||
                        (!localFilters.sortBy && option.value === 'PRIORITY')) && (
                        <View className='h-3 w-3 rounded-full bg-brand-primary' />
                      )}
                    </View>
                    <Text className='font-jakarta-medium text-base text-main-black'>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </DrawerBody>

        {/* Footer - Sticky */}
        <DrawerFooter
          style={{
            flexDirection: 'row',
            gap: 12,
            paddingVertical: 16,
            paddingHorizontal: 20,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
          }}
        >
          <TouchableOpacity
            onPress={handleReset}
            className='bg-purple-96 flex-1 items-center justify-center rounded-lg py-4'
          >
            <Text className='font-jakarta-bold text-base text-brand-primary'>Đặt lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApply}
            className='bg-brand-primary flex-1 items-center justify-center rounded-lg py-4'
          >
            <Text className='font-jakarta-bold text-base text-white'>Áp dụng</Text>
          </TouchableOpacity>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
