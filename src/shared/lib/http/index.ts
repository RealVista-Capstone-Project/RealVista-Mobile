import type { ApiResponse, EntityError, HttpError } from '@/shared/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { useAuthStore } from '@/entities/user'

const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }

  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri
    const ip = debuggerHost?.split(':')[0]

    if (ip) {
      return `http://${ip}:8080/api/v1`
    }

    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080/api/v1'
    }

    return 'http://localhost:8080/api/v1'
  }
  return 'https://your-api.com/api'
}

class HttpClient {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = getBaseUrl()) {
    this.baseURL = baseURL
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000, // 30 seconds
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        if (__DEV__) {
          console.error('[HTTP] Request Error:', error)
        }
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => {
        return response
      },
      async (error: AxiosError<ApiResponse<unknown>>) => {
        const isUnreadCountUnavailable =
          error.config?.url?.includes('/notifications/unread-count') &&
          error.response?.status === 500

        if (__DEV__) {
          const logPayload = {
            message: error.message,
            code: error.code,
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
          }

          if (!isUnreadCountUnavailable) {
            console.error('[HTTP] Response Error:', logPayload)
          }
        }
        const { response } = error

        if (response) {
          const status = response.status
          const data = response.data

          // Handle 401 - Unauthorized (token expired or invalid)
          if (status === 401) {
            // Clear token from storage
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('refresh_token')

            // Clear auth state - this will trigger route guard to redirect to login
            const { logout } = useAuthStore.getState()
            logout()

            if (__DEV__) {
              console.log('[HTTP] Token expired/invalid - user logged out')
            }
          }

          // Handle 422 - Entity Error (validation errors)
          if (status === 422) {
            const entityError: EntityError = {
              status: 422,
              message: data?.message || 'Validation error',
              errors: data?.errors || {},
              name: 'EntityError',
            }
            return Promise.reject(entityError)
          }

          // Generic HTTP error
          const httpError: HttpError = {
            status,
            message: data?.message || 'An error occurred',
            code: data?.errors ? 'ENTITY_ERROR' : undefined,
            errors: data?.errors,
            name: 'HttpError',
          }
          return Promise.reject(httpError)
        }

        // Network error details
        console.error('[HTTP] Network Error Details:', error.toJSON())

        // Network error
        const networkError: HttpError = {
          status: 0,
          message: `Network error: ${error.message}`,
          name: 'HttpError',
        }
        return Promise.reject(networkError)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data
  }
}

// Create and export singleton instance
const http = new HttpClient()

export default http
