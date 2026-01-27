import { TouchableOpacity } from 'react-native'

import { Box } from '@/shared/ui/box'
import { ChevronLeftIcon, Icon } from '@/shared/ui/icon'
import { Text } from '@/shared/ui/text'

export function PropertyHeader() {
  return (
    <Box className='flex-row items-center justify-between border-b border-gray-100 bg-white pb-4'>
      <TouchableOpacity className='flex-row items-center gap-1 text-main-primary'>
        <Icon as={ChevronLeftIcon} className='w-4 h-4 text-main-primary' />
        <Text size='lg' bold className='text-main-primary'>
          Về trang chủ
        </Text>
      </TouchableOpacity>
    </Box>
  )
}
