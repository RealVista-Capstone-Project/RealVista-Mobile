import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'

export function PropertyAbout() {
  return (
    <Box className='mb-8'>
      <Text size='xl' bold className='mb-4 text-[#000929]'>
        About this home
      </Text>
      <Text className='mb-2 text-[#6c727f]'>
        Check out that Custom Backyard Entertaining space! 3237sqft, 4 Bedrooms, 2 Bathrooms house
        on a Lake .
      </Text>
      <Text bold className='text-[#7065f0]'>
        Read more
      </Text>
    </Box>
  )
}
