/**
 * Public API for Chat feature
 */

export { useSendMessage } from './api/useSendMessage'
export { useConversations, useMessages } from './api/useConversationQueries'
export { contactFormSchema, type ContactFormValues } from './model/chatSchema'
export { useChatStore } from './model/chatStore'
export { useChatWebSocket } from './hooks/useChatWebSocket'
export { ContactForm } from './ui/ContactForm'
export { ContactFormModal } from './ui/ContactFormModal'
