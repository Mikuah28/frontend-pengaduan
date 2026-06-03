'use client'
// src/app/register/page.jsx
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Flag, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Spinner } from '@/components/ui'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Password tidak cocok'); return }
    setError('')
    setLoading(true)
    await register({ username: form.username, email: form.email, password: form.password })
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center">
            <Flag size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-ink-900">AduLink</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-ink-900 mb-1">Buat akun baru</h1>
        <p className="text-sm text-ink-500 mb-8">Bergabung dan buat perubahan</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Nama lengkap</label>
            <input className="form-input" placeholder="Budi Santoso" value={form.username} onChange={set('username')} required />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="budi@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="form-input pr-10" placeholder="Min. 6 karakter" value={form.password} onChange={set('password')} required minLength={6} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="form-label">Konfirmasi password</label>
            <input type="password" className="form-input" placeholder="Ulangi password" value={form.confirm} onChange={set('confirm')} required />
          </div>
          {error && <p className="text-xs text-rose-500 bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
          <label className="flex items-start gap-2.5 text-xs text-ink-500 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 accent-teal-400" required />
            <span>Saya setuju dengan <span className="text-teal-600 font-medium">Syarat & Ketentuan</span> dan <span className="text-teal-600 font-medium">Kebijakan Privasi</span></span>
          </label>
          <button type="submit" className="btn-primary justify-center py-2.5" disabled={loading}>
            {loading ? <Spinner size={15} className="text-white" /> : <ArrowRight size={15} />}
            {loading ? 'Mendaftar...' : 'Daftar sekarang'}
          </button>
        </form>

        <p className="text-xs text-ink-500 text-center mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-teal-600 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
