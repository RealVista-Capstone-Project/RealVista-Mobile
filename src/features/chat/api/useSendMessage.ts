import type { SendMessagePayload } from '@/entities/chat'
import { chatApi } from '@/entities/chat'
import { useMutation } from '@tanstack/react-query'
import { Alert } from 'react-native'
import { useChatStore } from '../model/chatStore'

export function useSendMessage() {
  const closeModal = useChatStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => chatApi.sendMessage(payload),
    onSuccess: () => {
      closeModal()
      Alert.alert('Thành công', 'Tin nhắn đã được gửi đến chủ sở hữu.')
    },
    onError: (error: Error) => {
      Alert.alert('Lỗi', error.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.')
    },
  })
}
