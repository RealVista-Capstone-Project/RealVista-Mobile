import { KeyboardAvoidingView, Modal, Platform, ScrollView, TouchableOpacity } from 'react-native'

import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'
import { useChatStore } from '../model/chatStore'
import { ContactForm } from './ContactForm'

export function ContactFormModal() {
  const isOpen = useChatStore((s) => s.isContactModalOpen)
  const listing = useChatStore((s) => s.selectedListing)
  const closeModal = useChatStore((s) => s.closeModal)

  if (!listing) return null

  return (
    <Modal visible={isOpen} animationType='slide' transparent onRequestClose={closeModal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        {/* Backdrop */}
        <TouchableOpacity className='flex-1 bg-black/40' activeOpacity={1} onPress={closeModal} />

        {/* Bottom Sheet */}
        <Box className='rounded-t-3xl bg-white px-6 pb-8 pt-4'>
          {/* Handle bar */}
          <Box className='mb-4 items-center'>
            <Box className='h-1 w-10 rounded-full bg-gray-300' />
          </Box>

          {/* Header */}
          <Box className='mb-4 flex-row items-center justify-between'>
            <Text size='lg' bold className='text-main-black'>
              Liên hệ chủ sở hữu
            </Text>
            <TouchableOpacity onPress={closeModal} hitSlop={16}>
              <IconLucide name='X' size={24} color='#333' />
            </TouchableOpacity>
          </Box>

          <ScrollView showsVerticalScrollIndicator={false}>
            <ContactForm listing={listing} onClose={closeModal} />
          </ScrollView>
        </Box>
      </KeyboardAvoidingView>
    </Modal>
  )
}
