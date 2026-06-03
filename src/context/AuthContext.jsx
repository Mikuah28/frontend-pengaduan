'use client'
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token')
    const role = Cookies.get('role')
    const username = Cookies.get('username')
    const userId = Cookies.get('userId')
    if (token && role) {
      setUser({ token, role, username, id: userId })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password })
      const { token, role } = res.data
      Cookies.set('token', token, { expires: 1 })
      Cookies.set('role', role, { expires: 1 })
      setUser({ token, role })
      toast.success('Login berhasil!')
      if (role === 'super_admin') router.push('/dashboard/superadmin')
      else if (role === 'admin') router.push('/dashboard/admin')
      else router.push('/')
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
