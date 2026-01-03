import { View, Text, StyleSheet } from 'react-native';
import { useCurrentUser , useAuth } from '@/features/auth';


export function HomePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { isAuthenticated } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : isAuthenticated && user ? (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Hello, {user.name || user.email}!</Text>
        </View>
      ) : (
        <Text>You are not logged in</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  userInfoText: {
    fontSize: 16,
  },
});
