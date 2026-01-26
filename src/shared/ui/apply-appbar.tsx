import { TouchableOpacity } from 'react-native'

import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'

interface ApplyAppBarProps {
  price?: string
  onPress?: () => void
  buttonLabel?: string
}

export function ApplyAppBar({
  price = '$2,700',
  onPress,
  buttonLabel = 'Apply Now',
}: ApplyAppBarProps) {
  return (
    <Box
      className='absolute bottom-0 left-0 right-0 bg-white'
      style={{
        height: 100,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: -2 },
        elevation: 10,
        paddingBottom: 28,
        paddingTop: 16,
        paddingHorizontal: 24,
      }}
    >
      <Box className='flex-row items-center justify-between'>
        {/* Price Section */}
        <Box className='flex-col gap-1'>
          <Text className='text-main-black/50' size='sm'>
            Rent price
          </Text>
          <Box className='flex-row items-end gap-0.5'>
            <Text
              size='xl'
              bold
              className='text-brand-primary'
              style={{
                letterSpacing: -1,
                lineHeight: 30,
              }}
            >
              {price}
            </Text>
            <Text className='text-main-black/50 pb-1' size='sm' style={{ lineHeight: 20 }}>
              /month
            </Text>
          </Box>
        </Box>

        {/* Apply Button */}
        <TouchableOpacity
          className='flex-row items-center gap-2 rounded-lg bg-brand-primary px-6 py-3'
          onPress={onPress}
          accessibilityRole='button'
          accessibilityLabel={buttonLabel}
        >
          <IconLucide size={24} name='FileText' color='#FFFFFF' />
          <Text bold className='text-white'>
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  )
}
