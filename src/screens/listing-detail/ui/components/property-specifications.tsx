import type { Attribute } from '@/entities/listing'
import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'
import { useState } from 'react'
import { Pressable } from 'react-native'

interface PropertySpecificationsProps {
  attributes: Attribute[]
  status: string
}

// Map attribute icon names to Lucide icon names
const iconMap: Record<string, string> = {
  bed: 'BedDouble',
  bedroom: 'BedDouble',
  bath: 'Bath',
  bathroom: 'Bath',
  area: 'Layers2',
  size: 'Layers2',
  square: 'Layers2',
  property_type: 'PaintbrushVertical',
  type: 'PaintbrushVertical',
  default: 'Info',
}

/**
 * Get Lucide icon name from attribute icon/code
 */
const getIconName = (attribute: Attribute): string => {
  const iconKey = attribute.icon?.toLowerCase() || attribute.attribute_code?.toLowerCase() || ''
  return iconMap[iconKey] || iconMap.default
}

/**
 * Render a single specification item in a card-style layout
 */
const SpecificationItem = ({
  label,
  value,
  iconName,
  unit,
}: {
  label: string
  value: string
  iconName: string
  unit?: string
}) => {
  return (
    <Box className='flex flex-1 flex-col gap-2'>
      {/* Label */}
      <Text className='text-grey-500' size='sm'>
        {label}
      </Text>

      {/* Value with icon */}
      <Box className='flex-row items-center gap-1'>
        <Box className='rounded-full bg-purple-98 p-1'>
          <IconLucide size={18} name={iconName as any} color='#00092980' />
        </Box>
        <Text size='lg' bold className='text-main-black'>
          {value}
        </Text>
      </Box>
    </Box>
  )
}

export function PropertySpecifications({ attributes = [], status }: PropertySpecificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Items per row (3 columns)
  const itemsPerRow = 3
  // Show 2 rows initially (6 items), then expand to show all
  const initialRowsToShow = 2

  // Create data rows with attributes
  const dataRows: { type: 'attribute' | 'status'; data?: Attribute; status?: string }[][] = []
  const safeAttributes = attributes || []
  for (let i = 0; i < safeAttributes.length; i += itemsPerRow) {
    const row: { type: 'attribute' | 'status'; data?: Attribute }[] = safeAttributes
      .slice(i, i + itemsPerRow)
      .map((attr) => ({ type: 'attribute' as const, data: attr }))
    dataRows.push(row)
  }

  // Calculate visible rows
  const totalRows = dataRows.length
  const visibleRows = isExpanded ? totalRows : Math.min(initialRowsToShow, totalRows)
  const hasMore = totalRows > initialRowsToShow
  const remainingCount = (totalRows - initialRowsToShow) * itemsPerRow

  return (
    <Box className='mb-6 rounded-xl border border-purple-96 bg-white p-5'>
      {/* Section Title */}
      <Text className='mb-4 text-main-black' size='lg' bold>
        Thông tin chi tiết
      </Text>

      {/* Grid of specifications */}
      <Box className='gap-5'>
        {dataRows.slice(0, visibleRows).map((row, rowIndex) => (
          <Box
            key={rowIndex}
            className={`flex-row ${rowIndex < visibleRows - 1 ? 'border-b border-purple-98 pb-5' : ''} gap-4`}
          >
            {row.map((item, itemIndex) => {
              if (item.type === 'attribute' && item.data) {
                return (
                  <SpecificationItem
                    key={`attr-${item.data.attribute_id}`}
                    label={item.data.attribute_name}
                    value={item.data.display_value}
                    iconName={getIconName(item.data)}
                    unit={item.data.unit}
                  />
                )
              }
              return null
            })}

            {/* Fill empty slots in incomplete rows */}
            {row.length < itemsPerRow &&
              Array.from({ length: itemsPerRow - row.length }).map((_, emptyIndex) => (
                <Box key={`empty-${emptyIndex}`} className='flex-1' />
              ))}
          </Box>
        ))}
      </Box>

      {/* Show More / Show Less Button */}
      {hasMore && (
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className='mt-5 flex-row items-center justify-center'
        >
          <Text className='text-brand-primary' size='sm' bold>
            {isExpanded ? `Thu gọn` : `Xem thêm ${remainingCount} thông số`}
          </Text>
          <Box className='ml-1'>
            <IconLucide size={16} name={isExpanded ? 'ChevronUp' : 'ChevronDown'} color='#7065F0' />
          </Box>
        </Pressable>
      )}
    </Box>
  )
}
