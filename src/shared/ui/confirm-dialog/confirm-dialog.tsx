import React from 'react'
import { Modal, Pressable, View } from 'react-native'

import { Text } from '@/shared/ui/text'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal transparent animationType='fade' visible={visible} onRequestClose={onCancel}>
      {/* Backdrop */}
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}
        onPress={onCancel}
      >
        {/* Dialog card — stop press propagation */}
        <Pressable
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            gap: 8,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text bold style={{ fontSize: 18, color: '#1a1a2e', marginBottom: 4 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 14, color: '#6C727F', lineHeight: 22, marginBottom: 16 }}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Cancel */}
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: '#7065f0',
                alignItems: 'center',
              }}
            >
              <Text bold style={{ color: '#7065f0', fontSize: 14 }}>
                {cancelLabel}
              </Text>
            </Pressable>

            {/* Confirm */}
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: '#7065f0',
                alignItems: 'center',
              }}
            >
              <Text bold style={{ color: '#ffffff', fontSize: 14 }}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
