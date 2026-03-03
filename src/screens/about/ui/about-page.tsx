import { Home, Mail, MapPin, Phone, Shield, Star, Users } from 'lucide-react-native'
import { ScrollView, View } from 'react-native'
import { Text } from '@/shared/ui/text'

const STATS = [
  { value: '10.000+', label: 'Bất động sản' },
  { value: '50.000+', label: 'Người dùng' },
  { value: '5.000+', label: 'Giao dịch' },
  { value: '63', label: 'Tỉnh thành' },
]

const VALUES = [
  {
    icon: Shield,
    title: 'Uy tín',
    desc: 'Mọi bất động sản đều được xác minh kỹ lưỡng trước khi đăng tải.',
  },
  {
    icon: Star,
    title: 'Chất lượng',
    desc: 'Cung cấp thông tin chính xác và minh bạch cho người mua và người thuê.',
  },
  {
    icon: Users,
    title: 'Cộng đồng',
    desc: 'Kết nối hàng triệu người mua, người bán và nhà đầu tư trên toàn quốc.',
  },
]

export function AboutPage() {
  return (
    <View className='flex-1 bg-white'>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className='bg-main-primary px-6 py-12 items-center'>
          <View className='h-16 w-16 items-center justify-center rounded-2xl bg-white mb-4'>
            <Home size={32} color='#7065F0' />
          </View>
          <Text
            className='text-3xl text-white text-center mb-2'
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            RealVista
          </Text>
          <Text className='text-base text-white/80 text-center'>
            Nền tảng bất động sản hàng đầu Việt Nam
          </Text>
        </View>

        {/* Stats */}
        <View className='flex-row flex-wrap px-6 py-8 gap-y-4'>
          {STATS.map((stat) => (
            <View key={stat.label} className='w-1/2 items-center'>
              <Text
                className='text-2xl text-main-primary'
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                {stat.value}
              </Text>
              <Text className='text-sm text-grey-500 mt-1'>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View className='h-px bg-grey-200 mx-6' />

        {/* Về chúng tôi */}
        <View className='px-6 py-8'>
          <Text
            className='text-xl text-main-black mb-3'
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Về chúng tôi
          </Text>
          <Text className='text-sm text-grey-500 leading-6'>
            RealVista là nền tảng công nghệ bất động sản được thành lập với sứ mệnh giúp mọi người
            Việt Nam dễ dàng tìm kiếm, mua bán và cho thuê bất động sản một cách minh bạch và hiệu
            quả. Chúng tôi kết nối người mua, người bán và nhà đầu tư trên toàn quốc thông qua công
            nghệ hiện đại và dữ liệu chính xác.
          </Text>
        </View>

        <View className='h-px bg-grey-200 mx-6' />

        {/* Giá trị cốt lõi */}
        <View className='px-6 py-8'>
          <Text
            className='text-xl text-main-black mb-6'
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Giá trị cốt lõi
          </Text>
          <View className='gap-5'>
            {VALUES.map((value) => (
              <View key={value.title} className='flex-row gap-4'>
                <View className='h-10 w-10 items-center justify-center rounded-xl bg-purple-96 shrink-0'>
                  <value.icon size={20} color='#7065F0' />
                </View>
                <View className='flex-1'>
                  <Text
                    className='text-base text-main-black mb-1'
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
                  >
                    {value.title}
                  </Text>
                  <Text className='text-sm text-grey-500 leading-5'>{value.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className='h-px bg-grey-200 mx-6' />

        {/* Liên hệ */}
        <View className='px-6 py-8'>
          <Text
            className='text-xl text-main-black mb-6'
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Liên hệ
          </Text>
          <View className='gap-4'>
            <View className='flex-row items-center gap-3'>
              <MapPin size={18} color='#7065F0' />
              <Text className='text-sm text-grey-500 flex-1'>
                Tòa nhà Landmark 81, Bình Thạnh, TP. Hồ Chí Minh
              </Text>
            </View>
            <View className='flex-row items-center gap-3'>
              <Phone size={18} color='#7065F0' />
              <Text className='text-sm text-grey-500'>1800 1234 (Miễn phí)</Text>
            </View>
            <View className='flex-row items-center gap-3'>
              <Mail size={18} color='#7065F0' />
              <Text className='text-sm text-grey-500'>support@realvista.vn</Text>
            </View>
          </View>
        </View>

        {/* Footer note */}
        <View className='px-6 pb-10 items-center'>
          <Text className='text-xs text-grey-400 text-center'>
            © 2024 RealVista. Bảo lưu mọi quyền.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
