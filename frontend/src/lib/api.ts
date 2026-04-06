import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = Cookies.get('refresh_token');
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: refresh });
        Cookies.set('access_token', data.access_token, { expires: 1 });
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authApi = {
  register: (data: RegisterPayload) => api.post('/auth/register', data),
  login: (data: LoginPayload) => api.post('/auth/login', data),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

// ---- Services ----
export const servicesApi = {
  list: () => api.get('/services'),
  get: (id: number) => api.get(`/services/${id}`),
};

// ---- Slots ----
export const slotsApi = {
  available: (date: string) => api.get(`/slots?date=${date}`),
};

// ---- Bookings (public) ----
export const bookingsApi = {
  create: (data: CreateBookingPayload) => api.post('/bookings', data),
};

// ---- Me (client) ----
export const meApi = {
  getProfile: () => api.get('/me/profile'),
  updateProfile: (data: Partial<UserProfile>) => api.put('/me/profile', data),
  getBookings: () => api.get('/me/bookings'),
  cancelBooking: (id: number) => api.delete(`/me/bookings/${id}`),
  getHistory: () => api.get('/me/history'),
};

// ---- Admin ----
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  // Bookings
  getBookings: (params?: Record<string, string>) => api.get('/admin/bookings', { params }),
  getBooking: (id: number) => api.get(`/admin/bookings/${id}`),
  updateBooking: (id: number, data: Partial<AdminBookingUpdate>) => api.put(`/admin/bookings/${id}`, data),
  createBooking: (data: AdminCreateBookingPayload) => api.post('/admin/bookings', data),
  // Schedule
  getSchedule: (date: string) => api.get(`/admin/schedule?date=${date}`),
  // Clients
  getClients: (params?: Record<string, string>) => api.get('/admin/clients', { params }),
  getClient: (id: number) => api.get(`/admin/clients/${id}`),
  createClient: (data: Partial<UserProfile>) => api.post('/admin/clients', data),
  // Services
  getServices: () => api.get('/admin/services'),
  createService: (data: ServicePayload) => api.post('/admin/services', data),
  updateService: (id: number, data: Partial<ServicePayload>) => api.put(`/admin/services/${id}`, data),
  deleteService: (id: number) => api.delete(`/admin/services/${id}`),
  // History
  addHistory: (data: HistoryPayload) => api.post('/admin/history', data),
};

// ---- Types ----
export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'admin';
  car_brand?: string;
  car_model?: string;
  car_year?: number;
  car_plate?: string;
}

export interface CreateBookingPayload {
  client_name: string;
  client_phone: string;
  client_email?: string;
  service_id?: number;
  custom_service?: string;
  date: string;
  time_slot: string;
  car_brand?: string;
  car_model?: string;
}

export interface AdminBookingUpdate {
  lift_id?: number;
  status?: 'new' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes?: string;
  total_price?: number;
  duration_hours?: number;
  service_description?: string;
  mileage?: number;
  cancel_reason?: string;
}

export interface AdminCreateBookingPayload extends CreateBookingPayload {
  lift_id?: number;
  user_id?: number;
}

export interface ServicePayload {
  name: string;
  description?: string;
  price_from: number;
  price_to?: number;
  duration_hours: number;
  is_active: boolean;
  sort_order: number;
}

export interface HistoryPayload {
  booking_id?: number;
  user_id: number;
  service_name: string;
  description?: string;
  price?: number;
  mileage?: number;
  completed_at: string;
}
