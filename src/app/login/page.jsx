'use client'
// src/app/login/page.jsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Flag, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { Spinner } from '@/components/ui'
import { publicApi } from '@/lib/api'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({});

  async function loadStats() {
    try {
      const res = await publicApi.getStats()
      setStats(res.data.data || {})

    } catch { setStats({}) }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await login(form.email, form.password)
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center">
            <Flag size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">AduLink</span>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 bg-teal-400/20 border border-teal-400/30 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-200 text-xs font-medium">Platform Pengaduan Resmi</span>
          </div>
          <h2 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            Suara Anda,<br />
            <span className="text-teal-400">Perubahan Nyata</span>
          </h2>
          <p className="text-ink-400 text-sm leading-relaxed max-w-sm">
            Laporkan masalah infrastruktur, kebersihan, dan pelayanan publik. Setiap laporan ditangani dengan serius.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {[
              { label: `${stats?.laporan_ditangani || '-'} laporan ditangani`, sub: 'Sejak platform diluncurkan' },
              { label: `${stats?.persentase_penyelesaian || '-'} tingkat penyelesaian`, sub: 'Rata-rata 3 hari respons' },
              { label: `${stats?.total_user || '-gi'} pengguna aktif`, sub: 'Bergabung dan buat perubahan' },
            ].map(({ label, sub }) => (
              <div key={label} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-600">© 2026 AduLink. Hak cipta dilindungi.</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-ink-50 p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center">
              <Flag size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-ink-900">AduLink</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-ink-900 mb-1">Selamat datang</h1>
          <p className="text-sm text-ink-500 mb-8">Masuk ke akun Anda</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary justify-center py-2.5 text-sm" disabled={loading}>
              {loading ? <Spinner size={15} className="text-white" /> : <ArrowRight size={15} />}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-xs text-ink-500 text-center mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-teal-600 font-medium hover:underline">
              Daftar sekarang
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-ink-100">
            <p className="text-[10px] text-ink-400 text-center mb-3">Demo akun</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', email: 'admin@laporan.com', pw: 'admin123' },
                { label: 'Super Admin', email: 'superadmin@laporan.com', pw: 'superadmin123' },
              ].map(({ label, email, pw }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ email, password: pw })}
                  className="text-xs border border-ink-100 rounded-xl px-3 py-2 hover:bg-white hover:border-teal-400 transition-all text-left"
                >
                  <div className="font-medium text-ink-700">{label}</div>
                  <div className="text-ink-400 text-[10px] mt-0.5">{email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
