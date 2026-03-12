import { IconSymbol } from '@/shared/ui/icon-symbol'
import { Input, InputField } from '@/shared/ui/input'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

interface NewMessageModalProps {
  visible: boolean
  onClose: () => void
}

export function NewMessageModal({ visible, onClose }: NewMessageModalProps) {
  const [email, setEmail] = useState('')

  const handleStartConversation = () => {
    // TODO: implement logic to start conversation based on email
    // Possibly look up user by email, or wait for backend support to create a conversation directly
    console.log('Start conversation with', email)
  }

  return (
    <Modal visible={visible} animationType='fade' transparent={true} onRequestClose={onClose}>
      <View className='flex-1 justify-center p-4 bg-black/50'>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className='bg-white rounded-3xl p-6 relative w-full items-center'>
            <TouchableOpacity
              onPress={onClose}
              className='absolute right-4 top-4 z-10 p-2'
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <IconSymbol name='xmark' size={24} color='#000929' />
            </TouchableOpacity>

            <View className='w-full items-center mt-2'>
              <View className='w-16 h-16 bg-[#f0effb] rounded-full items-center justify-center mb-6'>
                <IconSymbol name='person.fill' size={32} color='#7065f0' />
              </View>

              <Text className="font-['Plus_Jakarta_Sans-Bold'] text-[24px] text-[#000929] tracking-tight mb-2 text-center">
                Enter recipient&apos;s email
              </Text>
              <Text className="font-['Plus_Jakarta_Sans-Regular'] text-[16px] text-[#6c727f] mb-8 text-center leading-6">
                Please enter the email address of the person you want to message
              </Text>

              <View className='w-full mb-6'>
                <Input size='lg' className='w-full h-14 bg-[#fcfcfd] border-[#e2e4e9] rounded-lg'>
                  <InputField
                    placeholder='example@email.com'
                    placeholderTextColor='#6c727f'
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    className="font-['Plus_Jakarta_Sans-Regular'] text-[16px] text-[#000929] px-4"
                  />
                </Input>
              </View>

              <TouchableOpacity
                onPress={handleStartConversation}
                disabled={!email.includes('@')}
                style={styles.shadowButton}
                className={`w-full h-14 rounded-lg items-center justify-center flex-row ${
                  email.includes('@') ? 'bg-[#7065f0]' : 'bg-[#e0def7]'
                }`}
              >
                <Text className="font-['Plus_Jakarta_Sans-Bold'] text-white text-[16px]">
                  Start a conversation
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  shadowButton: {
    shadowColor: '#7065f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
})
