import { View } from 'react-native'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import IconLucide from '@/shared/ui/icon-lucide/icon'

export function AppointmentsScreen() {
  return (
    <Box className='flex-1 items-center justify-center bg-white px-6'>
      <View className='items-center gap-4'>
        <IconLucide name='CalendarClock' size={56} color='#7065F0' />
        <Text className='text-xl font-semibold text-gray-900'>Appointments</Text>
        <Text className='text-center text-sm text-gray-500'>
          Your scheduled property tours will appear here.
        </Text>
      </View>
    </Box>
  )
}
