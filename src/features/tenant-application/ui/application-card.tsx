import React from 'react'
import { Alert, TouchableOpacity } from 'react-native'
import { TenantApplication } from '@/entities/tenant-application/model/types'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'
import { Button, ButtonIcon, ButtonText } from '@/shared/ui/button'
import { IconSymbol } from '@/shared/ui/icon-symbol'

interface ApplicationCardProps {
  application: TenantApplication
  onDelete: (id: string) => void
  onPress: (app: TenantApplication) => void
}

export const ApplicationCard = ({ application, onDelete, onPress }: ApplicationCardProps) => {
  const handleDelete = () => {
    Alert.alert('Xóa đơn ứng tuyển', 'Bạn có chắc chắn muốn xóa đơn đăng ký này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => onDelete(application.tenantApplicationId),
      },
    ])
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(application)}>
      <Box
        className='w-full bg-white p-4 rounded-xl border border-gray-100 mb-4'
        style={{
          elevation: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        }}
      >
        <Box className='flex-row items-center justify-between mb-3'>
          <Text className='font-semibold text-lg text-gray-900 flex-1 mr-2'>
            {application.title}
          </Text>
          <Box
            className={`px-2 py-1 rounded ${
              application.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                application.status === 'ACTIVE' ? 'text-green-800' : 'text-gray-800'
              }`}
            >
              {application.status}
            </Text>
          </Box>
        </Box>

        <Box className='flex-col gap-2 mb-3'>
          <Box className='flex-row justify-between'>
            <Text className='text-sm text-gray-500'>Thời hạn thuê:</Text>
            <Text className='text-sm font-medium text-gray-900'>
              {application.leaseTermMonths} tháng
            </Text>
          </Box>
          <Box className='flex-row justify-between'>
            <Text className='text-sm text-gray-500'>Ngày chuyển vào:</Text>
            <Text className='text-sm font-medium text-gray-900'>
              {application.moveInDate
                ? new Date(application.moveInDate).toLocaleDateString('vi-VN')
                : 'N/A'}
            </Text>
          </Box>
          <Box className='flex-row justify-between'>
            <Text className='text-sm text-gray-500'>Thu nhập:</Text>
            <Text className='text-sm font-medium text-gray-900'>
              {application.monthlyIncome
                ? `${application.monthlyIncome.toLocaleString('vi-VN')} VNĐ`
                : 'N/A'}
            </Text>
          </Box>
        </Box>

        <Box className='flex-row justify-end mt-2'>
          <Button size='sm' variant='outline' action='negative' onPress={handleDelete}>
            <ButtonIcon as={() => <IconSymbol name='trash.fill' size={16} color='#ef4444' />} />
            <ButtonText className='ml-2 text-red-500'>Xóa</ButtonText>
          </Button>
        </Box>
      </Box>
    </TouchableOpacity>
  )
}
