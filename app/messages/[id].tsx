import { chatApi, chatKeys, type MessageResponse, type SendMessagePayload } from '@/entities/chat'
import { useAuthStore } from '@/entities/user'
import { useChatWebSocket, useConversations, useMessages } from '@/features/chat'
import { formatVND } from '@/shared/lib/format-currency'
import { IconSymbol } from '@/shared/ui/icon-symbol'
import { TopNav } from '@/widgets/top-nav'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { House, MapPin, Maximize2 } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function MessageBubble({ item, isMe }: { item: MessageResponse; isMe: boolean }) {
  return (
    <View className={`mb-3 max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
      {/* Sender name for received messages */}
      {!isMe && <Text className='text-xs text-gray-500 mb-1 ml-1'>{item.sender.name}</Text>}

      {item.message_type === 'LISTING_CARD' && item.metadata && (
        <View className={item.content ? 'mb-2' : ''}>
          <ListingCardBubble metadata={item.metadata} isMe={isMe} />
        </View>
      )}

      {!!item.content && (
        <View
          className={`px-4 py-2.5 rounded-2xl ${
            isMe ? 'bg-[#7065f0] rounded-br-sm' : 'bg-gray-100 rounded-bl-sm'
          }`}
        >
          <Text className={`text-[15px] leading-5 ${isMe ? 'text-white' : 'text-gray-900'}`}>
            {item.content}
          </Text>
        </View>
      )}

      <Text className='text-[10px] text-gray-400 mt-1 mx-1'>
        {new Date(item.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  )
}

function ListingCardBubble({ metadata, isMe }: { metadata: string; isMe: boolean }) {
  const router = useRouter()
  try {
    const data = JSON.parse(metadata)

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/listing/${data.id}` as any)}
        className='w-[240px] p-3 rounded-2xl bg-white border border-[#e2e4e9] shadow-sm'
      >
        {data.image ? (
          <Image
            source={{ uri: data.image }}
            className='w-full h-[140px] rounded-xl mb-3'
            resizeMode='cover'
          />
        ) : (
          <View className='w-full h-[140px] items-center justify-center rounded-xl bg-gray-50 mb-3'>
            <House size={32} color='#9ca3af' />
          </View>
        )}

        <View className='px-1'>
          <Text
            className="font-['Plus_Jakarta_Sans-Bold'] text-sm mb-1 text-[#000929]"
            numberOfLines={2}
          >
            {data.title || 'Bất động sản'}
          </Text>

          {data.price && (
            <Text className="font-['Plus_Jakarta_Sans-Bold'] text-base mb-2 text-[#7065f0]">
              {formatVND(Number(data.price))}
            </Text>
          )}

          {data.address && (
            <View className='flex-row items-center mb-1.5'>
              <MapPin size={14} color='#6b7280' />
              <Text className='text-xs ml-1.5 flex-1 text-[#878e9a]' numberOfLines={1}>
                {data.address}
              </Text>
            </View>
          )}

          {data.area && (
            <View className='flex-row items-center'>
              <Maximize2 size={14} color='#6b7280' />
              <Text className='text-xs ml-1.5 text-[#878e9a]'>{data.area} m²</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  } catch {
    return <Text className='text-gray-500'>[Listing Card]</Text>
  }
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: messagesData, isLoading: isMessagesLoading } = useMessages(id)
  const { data: convData } = useConversations()
  const { userId } = useAuthStore()
  const queryClient = useQueryClient()
  const [inputText, setInputText] = useState('')

  // Enable real-time updates
  useChatWebSocket()

  const messages = messagesData?.data?.messages ?? []

  // Find the recipient user ID
  const conversation = convData?.data?.find((c) => c.conversation_id === id)
  const otherUserFromMessages = messages.find((m) => m.sender.user_id !== userId)?.sender
  const recipientUserId = conversation?.other_user.user_id || otherUserFromMessages?.user_id

  const sendMutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => chatApi.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(id) })
      queryClient.invalidateQueries({ queryKey: chatKeys.list() })
    },
  })

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !id || !recipientUserId) return

    sendMutation.mutate({
      recipient_user_id: recipientUserId,
      message_type: 'TEXT',
      content: inputText.trim(),
    })

    setInputText('')
  }, [inputText, id, recipientUserId, sendMutation])

  return (
    <SafeAreaView className='flex-1 bg-white' edges={['bottom']}>
      <TopNav showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
        keyboardVerticalOffset={90}
      >
        {isMessagesLoading ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color='#7065f0' />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.message_id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            renderItem={({ item }) => (
              <MessageBubble item={item} isMe={item.sender.user_id === userId} />
            )}
            inverted={true}
          />
        )}

        {/* Input Area */}
        <View className='flex-row items-end px-4 py-3 border-t border-gray-100 bg-white'>
          <TextInput
            multiline
            placeholder='Viết tin nhắn...'
            placeholderTextColor='#9CA3AF'
            value={inputText}
            onChangeText={setInputText}
            className='flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 mr-3 max-h-32 text-gray-900 text-[15px]'
            style={{ minHeight: 40 }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || sendMutation.isPending || !recipientUserId}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              inputText.trim() && recipientUserId ? 'bg-[#7065f0]' : 'bg-gray-200'
            }`}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size='small' color='white' />
            ) : (
              <IconSymbol name='paperplane.fill' size={18} color='white' />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
