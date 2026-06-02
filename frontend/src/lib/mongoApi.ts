import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const mongoAuthAPI = {
  register: (data: { email: string; password: string; fullName?: string }) =>
    axios.post(`${API_URL}/mongo-auth/register`, data, { withCredentials: true }),

  login: (data: { email: string; password: string }) =>
    axios.post(`${API_URL}/mongo-auth/login`, data, { withCredentials: true }),

  logout: () =>
    axios.post(`${API_URL}/mongo-auth/logout`, {}, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mongoAccessToken') : ''}` },
    }),

  getProfile: () =>
    axios.get(`${API_URL}/mongo-auth/profile`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mongoAccessToken') : ''}` },
    }),

  refreshToken: () =>
    axios.post(`${API_URL}/mongo-auth/refresh-token`, {}, { withCredentials: true }),
};
