'use client'
// src/components/layout/Navbar.jsx
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Flag, Bell, Plus, User, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Laporan', href: '/laporanku' },
  { label: 'Statistik', href: '/?tab=statistik' },
]

export default function Navbar() {
  const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'
  const { user, logout, loading } = useAuth()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user?.username
    ? user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <nav className="sticky top-0 z-50 bg-ink-900/95 backdrop-blur border-b border-white/8">
      <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between gap-4" style={{ height: 52 }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center">
            <Flag size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-base text-white">AduLink</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/laporan/buat" className="btn-primary text-xs py-1.5 px-3 hidden sm:inline-flex">
                <Plus size={13} /> Lapor
              </Link>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/8 transition-all relative">
                <Bell size={15} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-400 rounded-full" />
              </button>
              <div className="relative" ref={dropRef}>
                <button
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/8 transition-all"
                  onClick={() => setDropOpen(v => !v)}
                >
                  {user?.foto_profil ? (
                    <img className='"w-6 h-6 rounded-full object-cover' src={`${UPLOAD_URL}/${user?.foto_profil}`} alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-teal-400/20 flex items-center justify-center text-[10px] font-bold text-teal-300">
                      {initials}
                    </div>
                  )}  
                  <ChevronDown size={12} className={clsx('text-white/50 transition-transform', dropOpen && 'rotate-180')} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-ink-100/60 shadow-lg py-1.5 animate-fade-up">
                    <div className="px-3 py-2 border-b border-ink-100/60">
                      <div className="text-xs font-medium text-ink-900">{user.username}</div>
                      <div className="text-[10px] text-ink-400">{user.role}</div>
                    </div>
                    <Link href={
                      user.role === 'user' ?
                        "/profile" :
                        "/dashboard/profile"
                    } className="flex items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50 transition-all">
                      <User size={13} /> Profil saya
                    </Link>
                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <Link
                        href={user.role === 'super_admin' ? '/dashboard/superadmin' : '/dashboard/admin'}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-ink-50 transition-all"
                      >
                        <Flag size={13} /> Dashboard
                      </Link>
                    )}
                    <div className="border-t border-ink-100/60 mt-1 pt-1">
                      <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 transition-all">
                        <LogOut size={13} /> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/8 transition-all">Masuk</Link>
              <Link href="/register" className="btn-primary text-xs py-1.5 px-3">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
