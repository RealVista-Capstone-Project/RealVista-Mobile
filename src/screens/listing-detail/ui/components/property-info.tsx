import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'

interface PropertyInfoProps {
  name: string
  address: string
}

export function PropertyInfo({ name, address }: PropertyInfoProps) {
  return (
    <Box className='gap-2 pb-4'>
      <Text size='4xl' bold className='text-main-black tracking-tighter'>
        {name}
      </Text>
      <Text className='text-main-black/50'>{address}</Text>
    </Box>
  )
}
