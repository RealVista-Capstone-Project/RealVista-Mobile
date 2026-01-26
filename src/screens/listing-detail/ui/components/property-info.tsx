import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'

export function PropertyInfo() {
  return (
    <Box className='gap-2 pb-4'>
      <Text size='4xl' bold className='text-main-black tracking-tighter'>
        Beverly Springfield
      </Text>
      <Text className='text-main-black/50'>2821 Lake Sevilla, Palm Harbor, TX</Text>
    </Box>
  )
}
