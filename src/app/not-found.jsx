'use client'
// src/app/not-found.jsx
import Link from 'next/link'
import { Flag, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center mb-6">
        <Flag size={26} className="text-white" />
      </div>

      <div className="font-display font-bold text-7xl text-ink-200 mb-2">404</div>
      <h1 className="text-xl font-display font-bold text-ink-900 mb-2">Halaman tidak ditemukan</h1>
      <p className="text-sm text-ink-500 mb-8 max-w-xs">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/" className="btn-primary">
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>
        <Link href="/login" className="btn-ghost">
          Masuk
        </Link>
      </div>
    </div>
  )
}
