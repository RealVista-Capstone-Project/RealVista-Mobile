import { PieChart } from '@/shared/ui/bna/pie-chart'
import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'

interface FeeData {
  label: string
  value: number
}

interface PropertyCostBreakdownProps {
  data: FeeData[]
}

export function PropertyCostBreakdown({ data }: PropertyCostBreakdownProps) {
  return (
    <Box className='mb-6'>
      <Box className='mb-6 items-start justify-start gap-3'>
        <Box className='flex-row gap-2 items-center justify-start rounded-lg bg-primary/10'>
          <IconLucide size={20} name='Banknote' color='#7065F0' />
          <Text size='xl' bold className='text-main-black'>
            Chi tiết hàng tháng
          </Text>
        </Box>
        <Box>
          <Text size='sm' className='text-gray-500'>
            Xem các khoản chi phí hàng tháng của bạn
          </Text>
        </Box>
      </Box>
      <PieChart
        data={data}
        config={{
          animated: true,
          duration: 1000,
        }}
      />
    </Box>
  )
}
