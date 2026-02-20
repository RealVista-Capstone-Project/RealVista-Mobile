import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantApplicationApi } from '@/entities/tenant-application/api'
import { tenantApplicationKeys } from '@/entities/tenant-application/api/keys'
import { Alert } from 'react-native'

export const useDeleteApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tenantApplicationApi.softDeleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantApplicationKeys.all })
      Alert.alert('Thành công', 'Đã xóa đơn ứng tuyển thành công')
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', 'Xóa đơn ứng tuyển thất bại: ' + (error?.message || ''))
    },
  })
}
