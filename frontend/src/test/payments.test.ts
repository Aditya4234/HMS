import axios from 'axios';
import { paymentAPI } from '@/lib/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Payment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch payments', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [
          { id: '1', amount: 200, method: 'CASH', status: 'COMPLETED' },
          { id: '2', amount: 350, method: 'STRIPE', status: 'PENDING' },
        ],
        pagination: { total: 2, page: 1, limit: 10 },
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await paymentAPI.getAll();
    expect(result.data.data).toHaveLength(2);
    expect(mockedAxios.get).toHaveBeenCalledWith('/payments', { params: undefined });
  });

  it('should create a payment', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { id: '1', amount: 200, method: 'CASH', status: 'COMPLETED' },
      },
    };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await paymentAPI.create({ bookingId: '123', method: 'CASH' });
    expect(result.data.data.method).toBe('CASH');
    expect(mockedAxios.post).toHaveBeenCalledWith('/payments', { bookingId: '123', method: 'CASH' });
  });

  it('should get payment stats', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          totalRevenue: 10000,
          completedPayments: 25,
          pendingPayments: 5,
          totalRefunded: 500,
        },
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await paymentAPI.getStats();
    expect(result.data.data.totalRevenue).toBe(10000);
    expect(mockedAxios.get).toHaveBeenCalledWith('/payments/stats');
  });

  it('should process refund', async () => {
    const mockResponse = {
      data: { success: true, message: 'Refund processed successfully' },
    };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await paymentAPI.refund('1', { amount: 100, reason: 'Cancellation' });
    expect(result.data.success).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith('/payments/1/refund', { amount: 100, reason: 'Cancellation' });
  });
});
