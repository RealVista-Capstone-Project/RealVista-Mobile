import type { ConversationListItem } from '@/entities/chat'
import { useAuthStore } from '@/entities/user'
import { useChatWebSocket, useConversations } from '@/features/chat'
import { IMAGES } from '@/shared/assets/images'
import { Href, Redirect, useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function formatTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()

  // So sánh ngày hôm nay
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()

  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // So sánh ngày hôm qua
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()

  if (isYesterday) return 'Hôm qua'

  // Tính khoảng cách ngày cho các trường hợp > 1 ngày
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 0 && diffDays < 7) {
    return `${diffDays} ngày trước`
  }

  return d.toLocaleDateString('vi-VN')
}

function ConversationItem({ item, onPress }: { item: ConversationListItem; onPress: () => void }) {
  const initials = item.other_user.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const isUnread = item.unread_count > 0

  return (
    <TouchableOpacity
      onPress={onPress}
      className='flex-row items-center px-6 py-4 bg-white'
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View className='w-14 h-14 bg-[#f0effb] rounded-full items-center justify-center mr-4'>
        <Text className="font-['Plus_Jakarta_Sans-Bold'] text-[#7065f0] text-[16px]">
          {initials}
        </Text>
      </View>

      {/* Content */}
      <View className='flex-1 justify-center'>
        <View className='flex-row justify-between items-center mb-1'>
          <Text
            className={`font-['Plus_Jakarta_Sans-Bold'] text-[16px] ${isUnread ? 'text-[#000929]' : 'text-[#878e9a]'}`}
            numberOfLines={1}
          >
            {item.other_user.name}
          </Text>
          <Text className="font-['Plus_Jakarta_Sans-Regular'] text-[14px] text-[#878e9a]">
            {formatTime(item.last_message_time)}
          </Text>
        </View>
        <View className='flex-row justify-between items-center'>
          <Text
            className={`font-['Plus_Jakarta_Sans-Regular'] text-[14px] flex-1 mr-2 ${isUnread ? 'text-[#000929]' : 'text-[#878e9a]'}`}
            numberOfLines={1}
          >
            {item.last_message || 'Bắt đầu cuộc trò chuyện'}
          </Text>
          {isUnread && <View className='w-2 h-2 rounded-full bg-[#7065f0] ml-2' />}
        </View>
      </View>
    </TouchableOpacity>
  )
}

function EmptyState({ onGoBack }: { onGoBack: () => void }) {
  return (
    <View className='flex-1 items-center justify-center p-8 bg-white'>
      <Image source={IMAGES.CHAT_EMPTY} className='w-[200px] h-[200px] mb-8' resizeMode='contain' />
      <Text className="font-['Plus_Jakarta_Sans-Bold'] text-[#000929] text-[24px] tracking-tight mb-2">
        Chưa có tin nhắn
      </Text>
      <Text className="font-['Plus_Jakarta_Sans-Regular'] text-[#6c727f] text-[16px] text-center leading-6 mb-8 px-4">
        Hộp thư của bạn hiện đang trống. Hãy bắt đầu trò chuyện với chủ nhà hoặc người tìm thuê ngay
        nhé!
      </Text>
      <TouchableOpacity
        onPress={onGoBack}
        className='bg-[#7065f0] px-6 py-3 rounded-lg flex-row items-center justify-center'
        activeOpacity={0.8}
      >
        <Text className="font-['Plus_Jakarta_Sans-Bold'] text-white text-[16px]">
          Bắt đầu khám phá
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default function MessagesScreen() {
  const { data, isLoading, refetch } = useConversations()
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  // Enable WebSocket for real-time updates
  useChatWebSocket()

  const conversations = data?.data ?? []

  if (!isAuthenticated) {
    return <Redirect href='/(auth)/login' />
  }

  return (
    <SafeAreaView className='flex-1 bg-white' edges={['bottom']}>
      <View className='flex-1'>
        {isLoading ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color='#7065f0' />
          </View>
        ) : conversations.length === 0 ? (
          <EmptyState onGoBack={() => router.push('/(tabs)/explore' as Href)} />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.conversation_id}
            renderItem={({ item }) => (
              <ConversationItem
                item={item}
                onPress={() => router.push(`/messages/${item.conversation_id}` as Href)}
              />
            )}
            ItemSeparatorComponent={() => <View className='h-px bg-[#e2e4e9] ml-[96px]' />}
            onRefresh={refetch}
            refreshing={isLoading}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
