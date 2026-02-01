import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'

interface PropertyAboutProps {
  description: string
}

export function PropertyAbout({ description }: PropertyAboutProps) {
  return (
    <Box className='mb-8'>
      <Text size='xl' bold className='mb-4 text-main-black'>
        Về ngôi nhà này
      </Text>
      <Text className='mb-2 text-gray-500'>{description}</Text>
      <Text bold className='text-main-primary'>
        Đọc thêm
      </Text>
    </Box>
  )
}
