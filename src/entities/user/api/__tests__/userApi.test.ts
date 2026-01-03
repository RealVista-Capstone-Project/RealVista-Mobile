import { userApi } from '../index';
import http from '@/shared/lib/http';

// Mock the HTTP client
jest.mock('@/shared/lib/http');

describe('userApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrent', () => {
    it('should call GET /user/profile', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (http.get as jest.Mock).mockResolvedValue({
        status: 200,
        payload: mockUser,
      });

      await userApi.getCurrent();

      expect(http.get).toHaveBeenCalledWith('/user/profile');
      expect(http.get).toHaveBeenCalledTimes(1);
    });

    it('should return user data on success', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (http.get as jest.Mock).mockResolvedValue({
        status: 200,
        payload: mockUser,
      });

      const result = await userApi.getCurrent();

      expect(result.payload).toEqual(mockUser);
    });
  });

  describe('getById', () => {
    it('should call GET /users/:id with correct id', async () => {
      const mockUser = {
        id: '123',
        email: 'user@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (http.get as jest.Mock).mockResolvedValue({
        status: 200,
        payload: mockUser,
      });

      await userApi.getById('123');

      expect(http.get).toHaveBeenCalledWith('/users/123');
    });

    it('should return user data for specific id', async () => {
      const mockUser = {
        id: '456',
        email: 'specific@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (http.get as jest.Mock).mockResolvedValue({
        status: 200,
        payload: mockUser,
      });

      const result = await userApi.getById('456');

      expect(result.payload).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should call PUT /user/profile with data', async () => {
      const updateData = { name: 'Updated Name' };
      const mockUpdatedUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      (http.put as jest.Mock).mockResolvedValue({
        status: 200,
        payload: mockUpdatedUser,
      });

      await userApi.update(updateData);

      expect(http.put).toHaveBeenCalledWith('/user/profile', updateData);
    });

    it('should return updated user data', async () => {
      const updateData = { name: 'Updated Name', email: 'newemail@example.com' };
      const mockUpdatedUser = {
        id: '1',
        email: 'newemail@example.com',
        name: 'Updated Name',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      (http.put as jest.Mock).mockResolvedValue({
        status: 200,
        payload: mockUpdatedUser,
      });

      const result = await userApi.update(updateData);

      expect(result.payload).toEqual(mockUpdatedUser);
    });

    it('should handle partial updates', async () => {
      const partialData = { name: 'New Name Only' };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'New Name Only',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (http.put as jest.Mock).mockResolvedValue({
        status: 200,
        payload: mockUser,
      });

      await userApi.update(partialData);

      expect(http.put).toHaveBeenCalledWith('/user/profile', partialData);
    });
  });

  describe('API error handling', () => {
    it('should propagate errors from HTTP client', async () => {
      const mockError = new Error('Network error');
      (http.get as jest.Mock).mockRejectedValue(mockError);

      await expect(userApi.getCurrent()).rejects.toThrow('Network error');
    });

    it('should handle 404 errors', async () => {
      const mockError = {
        status: 404,
        message: 'User not found',
        name: 'HttpError',
      };
      (http.get as jest.Mock).mockRejectedValue(mockError);

      await expect(userApi.getById('999')).rejects.toEqual(mockError);
    });
  });
});
