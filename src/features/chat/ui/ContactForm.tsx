import { Image, ScrollView, TextInput, TouchableOpacity } from 'react-native'

import type { Listing } from '@/entities/listing'
import { Box } from '@/shared/ui/box'
import IconLucide from '@/shared/ui/icon-lucide/icon'
import { Text } from '@/shared/ui/text'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useSendMessage } from '../api/useSendMessage'
import { contactFormSchema, type ContactFormValues } from '../model/chatSchema'

const QUICK_REPLIES = [
  'Tôi cần tư vấn thêm về bất động sản này!',
  'Giá cả có thể thương lượng không?',
  'Tôi muốn đặt lịch xem nhà!',
  'Còn căn nào tương tự không?',
]

interface ContactFormProps {
  listing: Listing
  onClose: () => void
}

export function ContactForm({ listing, onClose }: ContactFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { content: '' },
  })

  const { mutate: sendMessage, isPending } = useSendMessage()

  const primaryImage = listing.media?.find((m) => m.is_primary) ?? listing.media?.[0]
  const thumbnailUrl = primaryImage?.media_url ?? ''

  const buildAddress = () => {
    return [
      listing.property?.street_address,
      listing.location?.district_name,
      listing.location?.city_name,
    ]
      .filter(Boolean)
      .join(', ')
  }

  const onSubmit = (values: ContactFormValues) => {
    sendMessage({
      recipient_user_id: listing.agent.user_id,
      message_type: 'LISTING_CARD',
      content: values.content,
      metadata: JSON.stringify({
        id: listing.listing_id,
        title: listing.name,
        price: listing.price,
        image: thumbnailUrl,
        currency: 'VND',
        address: buildAddress(),
        area: listing.property?.usable_size_m2,
      }),
    })
  }

  return (
    <Box className='gap-4'>
      {/* Listing card preview */}
      <Box className='flex-row gap-3 rounded-lg border border-purple-92 bg-purple-98 p-3'>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={{ width: 64, height: 64, borderRadius: 8 }}
          />
        ) : (
          <Box className='h-16 w-16 items-center justify-center rounded-lg bg-gray-200'>
            <IconLucide name='House' size={24} color='#999' />
          </Box>
        )}
        <Box className='flex-1 justify-center'>
          <Text bold className='text-main-black' size='sm' numberOfLines={2}>
            {listing.name}
          </Text>
          <Text className='mt-1 text-main-black/50' size='xs' numberOfLines={1}>
            {buildAddress() || 'N/A'}
          </Text>
        </Box>
      </Box>

      {/* Message input */}
      <Box>
        <Text bold className='mb-2 text-main-black' size='sm'>
          Nội dung tin nhắn
        </Text>

        {/* Quick reply suggestion chips */}
        <Box className='mb-3'>
          <Text className='mb-2 text-main-black/50' size='xs'>
            Gợi ý cho bạn
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {QUICK_REPLIES.map((reply) => (
              <TouchableOpacity
                key={reply}
                className='rounded-full border border-purple-92 bg-white px-3 py-1.5'
                onPress={() => setValue('content', reply, { shouldValidate: true })}
              >
                <Text className='text-main-black/70' size='xs'>
                  {reply}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Box>

        <Controller
          control={control}
          name='content'
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className='min-h-[100px] rounded-lg border border-purple-92 bg-white p-3 text-main-black'
              placeholder='Nhập tin nhắn của bạn...'
              placeholderTextColor='#999'
              multiline
              textAlignVertical='top'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={500}
            />
          )}
        />
        {errors.content && (
          <Text className='mt-1 text-red-500' size='xs'>
            {errors.content.message}
          </Text>
        )}
        <Text className='mt-1 text-right text-main-black/40' size='xs'>
          Tối đa 500 ký tự
        </Text>
      </Box>

      {/* Actions */}
      <Box className='flex-row gap-3'>
        <TouchableOpacity
          className='flex-1 items-center rounded-lg border border-purple-92 px-6 py-3'
          onPress={onClose}
          disabled={isPending}
        >
          <Text bold className='text-main-black'>
            Hủy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className='flex-1 items-center rounded-lg bg-main-secondary px-6 py-3'
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          <Text bold className='text-white'>
            {isPending ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  )
}
