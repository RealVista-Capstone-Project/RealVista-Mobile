import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'

interface PropertySpecificationsProps {
  bedrooms: number
  bathrooms: number
  usableSize: number
  propertyTypeName: string
  status: string
}

export function PropertySpecifications({
  bedrooms,
  bathrooms,
  usableSize,
  propertyTypeName,
  status,
}: PropertySpecificationsProps) {
  return (
    <Box className='mb-6 rounded-lg border border-purple-96 bg-white p-6'>
      {/* First Row: Bed, Bath, Sqft */}
      <Box className='mb-6 flex-row justify-between'>
        {/* Bed */}
        <Box className='w-20'>
          <Text className='mb-4 text-main-black/50' size='sm'>
            Phòng ngủ
          </Text>
          <Box className='flex-row items-center gap-2'>
            <IconLucide size={20} name='BedDouble' color='#808494' />
            <Text size='lg' bold className='text-main-black'>
              {bedrooms}
            </Text>
          </Box>
        </Box>

        {/* Bath */}
        <Box className='w-20'>
          <Text className='mb-4 text-main-black/50' size='sm'>
            Phòng tắm
          </Text>
          <Box className='flex-row items-center gap-2'>
            <IconLucide size={20} name='Bath' color='#808494' />
            <Text size='lg' bold className='text-main-black'>
              {bathrooms}
            </Text>
          </Box>
        </Box>

        {/* Square Area */}
        <Box className='w-24'>
          <Text className='mb-4 text-main-black/50' size='sm'>
            Diện tích
          </Text>
          <Box className='flex-row items-center gap-2'>
            <IconLucide size={20} name='Layers2' color='#808494' />
            <Text size='lg' bold className='text-main-black'>
              {usableSize} m²
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Second Row: Repair Quality, Status */}
      <Box className='flex-row gap-5'>
        <Box className='w-36'>
          <Text className='mb-4 text-main-black/50' size='sm'>
            Loại hình
          </Text>
          <Box className='flex-row items-center gap-2'>
            <IconLucide size={20} name='PaintbrushVertical' color='#808494' />
            <Text size='lg' bold className='text-main-black'>
              {propertyTypeName}
            </Text>
          </Box>
        </Box>

        {/* Status */}
        <Box className='w-28'>
          <Text className='mb-4 text-main-black/50' size='sm'>
            Trạng thái
          </Text>
          <Box className='flex-row items-center gap-2'>
            <IconLucide size={20} name='CircleCheck' color='#808494' />
            <Text size='lg' bold className='text-main-black'>
              {status === 'PUBLISHED' ? 'Hoạt động' : status}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
