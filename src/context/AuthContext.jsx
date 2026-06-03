'use client'
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { authApi, profileApi } from '@/lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  async function fetchAndSetProfile() {
    try {
      const token = Cookies.get('token');
      console.log("Token yang terbaca di cookies:", token);

      if (token) {
        const res = await profileApi.getMe();
        console.log("Hasil mentah res dari API:", res);

        if (res) {
          const profileData = res.data?.data || res.data || res;
          console.log("Data profil yang akan dimasukkan ke state:", profileData);

          setUser({
            ...profileData,
            token,
          });
        }
      } else {
        console.log("Fetch tidak dijalankan karena token tidak ditemukan di cookies");
      }
    } catch (err) {
      console.error('Gagal mengambil data profil (Masuk blok catch):', err);
      Cookies.remove('token');
      Cookies.remove('role');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAndSetProfile();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password })
      const { token, role } = res.data
      Cookies.set('token', token, { expires: 1 })
      setUser({ token, role })
      toast.success('Login berhasil!')
      if (role === 'super_admin') router.push('/dashboard/superadmin')
      else if (role === 'admin') router.push('/dashboard/admin')
      else router.push('/')
      fetchAndSetProfile();
      return { ok: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal'
      toast.error(msg)
      return { ok: false, message: msg }
    }
  }

  const register = async (data) => {
    try {
      await authApi.register(data)
      toast.success('Registrasi berhasil! Silakan login.')
      router.push('/login')
      return { ok: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registrasi gagal'
      toast.error(msg)
      return { ok: false, message: msg }
    }
  }

  const logout = () => {
    Cookies.remove('token')
    Cookies.remove('role')
    Cookies.remove('username')
    Cookies.remove('userId')
    setUser(null)
    router.push('/login')
    toast.success('Berhasil keluar')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
