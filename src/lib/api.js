// src/lib/api.js
import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token')
      Cookies.remove('role')
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const profileApi = {
  getMe: () => api.get('/profile/me'),
  update: (data) => api.put('/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

// ─── LAPORAN ─────────────────────────────────────────────────────────────────
export const laporanApi = {
  getAll: (params) => api.get('/laporan', { params }),
  getById: (id) => api.get(`/laporan/${id}`),
  getMyLaporan: () => api.get('/laporan/user/me'),
  create: (data) => api.post('/laporan', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/laporan/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, status) => api.patch(`/laporan/${id}/status`, { status }),
  delete: (id) => api.delete(`/laporan/${id}`),
}

// ─── KATEGORI ────────────────────────────────────────────────────────────────
export const kategoriApi = {
  getAll: () => api.get('/kategori'),
  getById: (id) => api.get(`/kategori/${id}`),
  create: (data) => api.post('/kategori', data),
  update: (id, data) => api.put(`/kategori/${id}`, data),
  delete: (id) => api.delete(`/kategori/${id}`),
}

// ─── KOMENTAR ────────────────────────────────────────────────────────────────
export const komentarApi = {
  getByLaporan: (laporan_id) => api.get('/komentar', { params: { laporan_id } }),
  create: (data) => api.post('/komentar', data),
  delete: (id) => api.delete(`/komentar/${id}`),
}

// ─── BALAS KOMENTAR ──────────────────────────────────────────────────────────
export const balasApi = {
  getByKomentar: (komentar_id) => api.get('/balas-komentar', { params: { komentar_id } }),
  create: (data) => api.post('/balas-komentar', data),
  delete: (id) => api.delete(`/balas-komentar/${id}`),
}

export default api
