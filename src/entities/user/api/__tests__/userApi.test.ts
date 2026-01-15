import http from '@/shared/lib/http'
import { userApi } from '../index'

// Mock the HTTP client
jest.mock('@/shared/lib/http')

describe('userApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrent', () => {
    it('should call GET /user/profile', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }

      ;(http.get as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockUser,
        timestamp: '2024-01-01',
      })

      await userApi.getCurrent()

      expect(http.get).toHaveBeenCalledWith('/user/profile')
      expect(http.get).toHaveBeenCalledTimes(1)
    })

    it('should return user data on success', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }

      ;(http.get as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockUser,
        timestamp: '2024-01-01',
      })

      const result = await userApi.getCurrent()

      expect(result.data).toEqual(mockUser)
    })
  })

  describe('getById', () => {
    it('should call GET /users/:id with correct id', async () => {
      const mockUser = {
        id: 123,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }

      ;(http.get as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockUser,
        timestamp: '2024-01-01',
      })

      await userApi.getById('123')

      expect(http.get).toHaveBeenCalledWith('/users/123')
    })

    it('should return user data for specific id', async () => {
      const mockUser = {
        id: 456,
        email: 'specific@example.com',
        firstName: 'Specific',
        lastName: 'User',
        fullName: 'Specific User',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }

      ;(http.get as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockUser,
        timestamp: '2024-01-01',
      })

      const result = await userApi.getById('456')

      expect(result.data).toEqual(mockUser)
    })
  })

  describe('update', () => {
    it('should call PUT /user/profile with data', async () => {
      const updateData = { firstName: 'Updated Name' }
      const mockUpdatedUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Updated Name',
        lastName: 'User',
        fullName: 'Updated Name User',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      }

      ;(http.put as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockUpdatedUser,
        timestamp: '2024-01-01',
      })

      await userApi.update(updateData)

      expect(http.put).toHaveBeenCalledWith('/user/profile', updateData)
    })

    it('should return updated user data', async () => {
      const updateData = { firstName: 'Updated Name', email: 'newemail@example.com' }
      const mockUpdatedUser = {
        id: 1,
        email: 'newemail@example.com',
        firstName: 'Updated Name',
        lastName: 'User',
        fullName: 'Updated Name User',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      }

      ;(http.put as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockUpdatedUser,
        timestamp: '2024-01-01',
      })

      const result = await userApi.update(updateData)

      expect(result.data).toEqual(mockUpdatedUser)
    })

    it('should handle partial updates', async () => {
      const partialData = { firstName: 'New Name Only' }
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'New Name Only',
        lastName: 'User',
        fullName: 'New Name Only User',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }

      ;(http.put as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Success',
        data: mockUser,
        timestamp: '2024-01-01',
      })

      await userApi.update(partialData)

      expect(http.put).toHaveBeenCalledWith('/user/profile', partialData)
    })
  })

  describe('API error handling', () => {
    it('should propagate errors from HTTP client', async () => {
      const mockError = new Error('Network error')
      ;(http.get as jest.Mock).mockRejectedValue(mockError)

      await expect(userApi.getCurrent()).rejects.toThrow('Network error')
    })

    it('should handle 404 errors', async () => {
      const mockError = {
        status: 404,
        message: 'User not found',
        name: 'HttpError',
      }
      ;(http.get as jest.Mock).mockRejectedValue(mockError)

      await expect(userApi.getById('999')).rejects.toEqual(mockError)
    })
  })
})
