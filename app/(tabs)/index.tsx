import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/shared/ui/box';
import { Heading } from '@/shared/ui/heading';
import { Text } from '@/shared/ui/text';
import { HomePage } from '@/screens/home';
import { UserHeader } from '@/widgets/user-header';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <UserHeader />
      <ScrollView className="flex-1 bg-gray-950">
        <Box className="p-4">
          {/* Welcome Section */}
          <Box className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-6 shadow-lg">
            <Heading size="2xl" className="mb-2 text-white">
              Welcome Back!
            </Heading>
            <Text size="md" className="text-gray-100">
              Discover amazing features in your app
            </Text>
          </Box>

          {/* Home Page Content */}
          <HomePage />
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
