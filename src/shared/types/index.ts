/**
 * Shared type definitions
 */

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
  errors?: Record<string, string[]>
}

export interface HttpError extends Error {
  status: number
  code?: string
  errors?: Record<string, string[]>
}

export interface EntityError extends HttpError {
  status: 422
  errors: Record<string, string[]>
}
