import { Box } from '@/shared/ui/box'
import { Text } from 'react-native'

export default function ManagePostsScreen() {
  return (
    <Box className='flex-1 items-center justify-center bg-white px-6'>
      <Text className='text-center text-lg font-semibold text-[#111827]'>Quản lý bài đăng</Text>
      <Text className='mt-2 text-center text-sm text-[#6B7280]'>
        Màn hình quản lý bài đăng sẽ được cập nhật trong bước tiếp theo.
      </Text>
    </Box>
  )
}
