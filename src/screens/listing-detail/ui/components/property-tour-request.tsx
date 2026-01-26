import { TouchableOpacity } from 'react-native'

import { DatePicker } from '@/shared/ui/bna/date-picker'
import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'

export function PropertyTourRequest() {
  return (
    <Box className='mb-6 rounded-lg border border-purple-92 bg-white p-6'>
      <Text size='lg' bold className='mb-6 text-main-black'>
        Yêu cầu xem nhà
      </Text>

      {/* Date Picker */}
      <DatePicker label='Chọn ngày' placeholder='Chọn ngày tham quan' />

      {/* Request Button */}
      <TouchableOpacity className='my-4 flex-row items-center justify-center gap-2 rounded-lg bg-main-secondary px-8 py-4'>
        <IconLucide size={24} name='MapPin' color='#fff' />
        <Text bold className='text-white'>
          Yêu cầu tham quan
        </Text>
      </TouchableOpacity>

      <Text className='text-center text-gray-500' size='xs'>
        Miễn phí, không bắt buộc - hủy bất cứ lúc nào.
      </Text>
    </Box>
  )
}
