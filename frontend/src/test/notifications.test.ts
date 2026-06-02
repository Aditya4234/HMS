import axios from 'axios';
import { notificationAPI } from '@/lib/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Notification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch notifications', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [{ id: '1', title: 'Test', message: 'Hello', isRead: false }],
        unreadCount: 1,
        pagination: { total: 1, page: 1, limit: 20 },
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await notificationAPI.getAll();
    expect(result.data.unreadCount).toBe(1);
    expect(mockedAxios.get).toHaveBeenCalledWith('/notifications', { params: undefined });
  });

  it('should mark notification as read', async () => {
    mockedAxios.patch.mockResolvedValue({ data: { success: true } });

    await notificationAPI.markAsRead('1');
    expect(mockedAxios.patch).toHaveBeenCalledWith('/notifications/1/read');
  });

  it('should mark all as read', async () => {
    mockedAxios.patch.mockResolvedValue({ data: { success: true } });

    await notificationAPI.markAllAsRead();
    expect(mockedAxios.patch).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('should delete notification', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });

    await notificationAPI.delete('1');
    expect(mockedAxios.delete).toHaveBeenCalledWith('/notifications/1');
  });
});
