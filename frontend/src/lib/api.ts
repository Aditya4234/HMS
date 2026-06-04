import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resendOTP: (data: any) => api.post('/auth/resend-otp', data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  resendVerification: (data: any) => api.post('/auth/resend-verification', data),
  deleteAccount: () => api.delete('/auth/account'),
  getCsrfToken: () => api.get('/csrf-token'),
};

const publicApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const roomAPI = {
  getAll: (params?: any) => api.get('/rooms', { params }),
  getById: (id: string) => api.get(`/rooms/${id}`),
  getPublic: (id: string) => publicApi.get(`/rooms/public/${id}`),
  create: (data: any) => api.post('/rooms', data),
  update: (id: string, data: any) => api.put(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/rooms/${id}/status`, { status }),
  getAvailable: (params?: any) => api.get('/rooms/available', { params }),
  search: (params?: any) => api.get('/rooms/search', { params }),
};

export const bookingAPI = {
  getAll: (params?: any) => api.get('/bookings', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  updateStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`),
  getStats: () => api.get('/bookings/stats'),
};

export const customerAPI = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

export const staffAPI = {
  getAll: (params?: any) => api.get('/staff', { params }),
  getById: (id: string) => api.get(`/staff/${id}`),
  create: (data: any) => api.post('/staff', data),
  update: (id: string, data: any) => api.put(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenueChart: (params?: any) => api.get('/dashboard/revenue-chart', { params }),
  getBookingChart: (params?: any) => api.get('/dashboard/booking-chart', { params }),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
  getTopRooms: () => api.get('/dashboard/top-rooms'),
};

export const notificationAPI = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const hotelAPI = {
  getAll: () => api.get('/hotels'),
  getById: (id: string) => api.get(`/hotels/${id}`),
  update: (data: any) => api.put('/hotels', data),
  getSettings: () => api.get('/hotels/settings/info'),
};

export const reviewAPI = {
  getAll: (params?: any) => api.get('/reviews', { params }),
  getById: (id: string) => api.get(`/reviews/${id}`),
  create: (data: any) => api.post('/reviews', data),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

export const googleAuthAPI = {
  login: (credential: string) => api.post('/auth/google', { credential }),
};

export const invoiceAPI = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getById: (id: string) => api.get(`/invoices/${id}`),
};
