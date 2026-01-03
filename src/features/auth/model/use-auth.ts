import { useAuthStore } from '@/entities/user';

/**
 * Authentication hook with business logic
 */
export function useAuth() {
  const { user, isAuthenticated, token } = useAuthStore();

  return {
    user,
    isAuthenticated,
    token,
    hasRole: (role: string) => {
      // Add role checking logic here if needed
      return true;
    },
  };
}
