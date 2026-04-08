import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { X } from 'lucide-react-native'
import { useUpdateRoomName } from '@/entities/property'

interface RenameRoomModalProps {
  visible: boolean
  propertyId: string
  operationId: string
  currentName: string
  onClose: () => void
  onSuccess?: (newName: string) => void
}

export function RenameRoomModal({
  visible,
  propertyId,
  operationId,
  currentName,
  onClose,
  onSuccess,
}: RenameRoomModalProps) {
  const [value, setValue] = useState(currentName)
  const inputRef = useRef<TextInput>(null)
  const mutation = useUpdateRoomName(propertyId)

  // Reset value when modal opens with the current name
  useEffect(() => {
    if (visible) {
      setValue(currentName)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [visible, currentName])

  const handleClose = () => {
    if (mutation.isPending) return
    const trimmed = value.trim()
    if (trimmed && trimmed !== currentName) {
      Alert.alert('Bỏ thay đổi?', 'Tên phòng chưa được lưu. Bạn có muốn bỏ qua không?', [
        { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
        {
          text: 'Bỏ qua',
          style: 'destructive',
          onPress: onClose,
        },
      ])
    } else {
      onClose()
    }
  }

  const handleSave = async () => {
    const trimmed = value.trim()
    if (!trimmed) {
      Alert.alert('Tên không hợp lệ', 'Tên phòng không được để trống.')
      return
    }
    if (trimmed === currentName) {
      onClose()
      return
    }
    try {
      await mutation.mutateAsync({ operationId, roomName: trimmed })
      onSuccess?.(trimmed)
      onClose()
    } catch {
      Alert.alert('Lỗi', 'Không thể đổi tên phòng. Vui lòng thử lại.')
    }
  }

  return (
    <Modal visible={visible} transparent animationType='slide' onRequestClose={handleClose}>
      <TouchableOpacity className='flex-1 bg-black/40' activeOpacity={1} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='absolute bottom-0 left-0 right-0'
      >
        <View className='bg-white rounded-t-3xl px-5 pt-5 pb-8'>
          {/* Handle bar */}
          <View className='w-10 h-1 bg-gray-200 rounded-full self-center mb-5' />

          {/* Header */}
          <View className='flex-row items-center justify-between mb-5'>
            <Text
              className='text-lg text-gray-900'
              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
            >
              Đổi tên phòng
            </Text>
            <TouchableOpacity
              className='w-9 h-9 rounded-xl bg-gray-100 items-center justify-center'
              onPress={handleClose}
              activeOpacity={0.75}
              disabled={mutation.isPending}
            >
              <X size={18} color='#6B7280' />
            </TouchableOpacity>
          </View>

          {/* Input */}
          <View className='mb-5'>
            <Text
              className='text-xs text-gray-500 mb-2'
              style={{ fontFamily: 'PlusJakartaSans_500Medium' }}
            >
              Tên phòng
            </Text>
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={setValue}
              placeholder='Nhập tên phòng...'
              placeholderTextColor='#9CA3AF'
              className='border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 bg-gray-50'
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 15 }}
              editable={!mutation.isPending}
              returnKeyType='done'
              onSubmitEditing={handleSave}
            />
          </View>

          {/* Actions */}
          <View className='flex-row gap-3'>
            <TouchableOpacity
              className='flex-1 py-3.5 rounded-2xl bg-gray-100 items-center'
              onPress={handleClose}
              activeOpacity={0.75}
              disabled={mutation.isPending}
            >
              <Text
                className='text-sm text-gray-600'
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='flex-1 py-3.5 rounded-2xl bg-main-primary items-center'
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator size='small' color='#FFFFFF' />
              ) : (
                <Text
                  className='text-sm text-white'
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
                >
                  Lưu
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
