import { useAuthStore, userApi } from "@/entities/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => userApi.getCurrent(),
    onSuccess: async (response) => {
      // Assuming your API returns token and user
      // Adjust this based on your actual API response
      const user = response.payload;

      // Store token
      await AsyncStorage.setItem("token", "dummy-token"); // Replace with actual token from response

      // Update Zustand store
      setUser(user);
      setToken("dummy-token"); // Replace with actual token from response
    }
  });
}
