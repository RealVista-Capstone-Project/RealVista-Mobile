import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth, useLogout } from '@/features/auth';

export function UserHeader() {
  const { user, isAuthenticated } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name || user.email}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={() => logout()}
        disabled={isPending}
      >
        <Text style={styles.logoutButtonText}>
          {isPending ? 'Logging out...' : 'Logout'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff4444',
    borderRadius: 8,
  },
  logoutButtonPressed: {
    backgroundColor: '#cc0000',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
