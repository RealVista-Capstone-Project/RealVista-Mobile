import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'

export function PropertyAbout() {
  return (
    <Box className='mb-8'>
      <Text size='xl' bold className='mb-4 text-main-black'>
        Về ngôi nhà này
      </Text>
      <Text className='mb-2 text-gray-500'>
        Hãy xem không gian giải trí sân sau tùy chỉnh! 3237sqft, 4 phòng ngủ, 2 phòng tắm nhà ven
        hồ.
      </Text>
      <Text bold className='text-main-primary'>
        Đọc thêm
      </Text>
    </Box>
  )
}
