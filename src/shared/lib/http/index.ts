import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiResponse, HttpError, EntityError } from '@/shared/types';

class HttpClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = __DEV__ ? 'http://localhost:4000/api' : 'https://your-api.com/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse<unknown>>) => {
        const { response } = error;

        if (response) {
          const status = response.status;
          const data = response.data;

          // Handle 401 - Unauthorized
          if (status === 401) {
            await AsyncStorage.removeItem('token');
            // Navigate to login (you might want to use a navigation service here)
          }

          // Handle 422 - Entity Error (validation errors)
          if (status === 422) {
            const entityError: EntityError = {
              status: 422,
              message: data?.message || 'Validation error',
              errors: data?.errors || {},
              name: 'EntityError',
            };
            return Promise.reject(entityError);
          }

          // Generic HTTP error
          const httpError: HttpError = {
            status,
            message: data?.message || 'An error occurred',
            code: data?.errors ? 'ENTITY_ERROR' : undefined,
            errors: data?.errors,
            name: 'HttpError',
          };
          return Promise.reject(httpError);
        }

        // Network error
        const networkError: HttpError = {
          status: 0,
          message: 'Network error. Please check your connection.',
          name: 'HttpError',
        };
        return Promise.reject(networkError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

// Create and export singleton instance
const http = new HttpClient();

export default http;
