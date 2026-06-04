'use client'
// src/components/layout/Navbar.jsx
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { notificationApi } from '@/lib/api'
import { Flag, Bell, Plus, User, LogOut, ChevronDown, CheckCheck, Check } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { Spinner } from '@/components/ui'

const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Laporan', href: '/laporanku' },
  { label: 'Statistik', href: '/?tab=statistik' },
]

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} mnt lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function Navbar() {
  const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5000/uploads/images'
  const { user, logout, loading } = useAuth()

  // ── User dropdown ──────────────────────────────────────────────────────────
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  // ── Notification panel ─────────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [markingId, setMarkingId] = useState(null)
  const notifRef = useRef(null)

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true)
    try {
      const res = await notificationApi.getAll()
      setNotifications(res.data.data || [])
    } catch {
      // silently ignore
    } finally {
      setNotifLoading(false)
    }
  }, [])

  // fetch on mount to populate badge count
  useEffect(() => {
    if (user) fetchNotifications()
  }, [user, fetchNotifications])

  const handleMarkRead = async (id) => {
    setMarkingId(id)
    try {
      await notificationApi.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {
      // ignore
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      await notificationApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {
      // ignore
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

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

              {/* ── Bell / Notification panel ── */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifOpen(v => !v)
                    if (!notifOpen) fetchNotifications()
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/8 transition-all relative"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 bg-rose-400 rounded-full text-[9px] text-white flex items-center justify-center font-bold leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-ink-100/60 shadow-lg animate-fade-up overflow-hidden">

                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100/60">
                      <div className="flex items-center gap-2">
                        <Bell size={13} className="text-ink-500" />
                        <span className="text-xs font-semibold text-ink-900">Notifikasi</span>
                        {unreadCount > 0 && (
                          <span className="badge bg-rose-50 text-rose-500 border border-rose-100">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          disabled={markingAll}
                          className="flex items-center gap-1 text-[10px] font-medium text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
                        >
                          {markingAll
                            ? <Spinner size={11} />
                            : <CheckCheck size={11} />
                          }
                          Baca semua
                        </button>
                      )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[340px] overflow-y-auto">
                      {notifLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Spinner size={20} />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center mb-3">
                            <Bell size={18} className="text-ink-300" />
                          </div>
                          <p className="text-xs font-medium text-ink-600">Tidak ada notifikasi</p>
                          <p className="text-[10px] text-ink-400 mt-0.5">Anda sudah up-to-date!</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={clsx(
                              'flex items-start gap-3 px-4 py-3 border-b border-ink-100/40 last:border-0 transition-colors',
                              !n.is_read ? 'bg-teal-50/50' : 'bg-white hover:bg-ink-50/40'
                            )}
                          >
                            {/* Unread indicator dot */}
                            <div className="pt-1 shrink-0">
                              <div className={clsx(
                                'w-2 h-2 rounded-full',
                                !n.is_read ? 'bg-teal-400' : 'bg-ink-200'
                              )} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className={clsx(
                                'text-xs leading-relaxed',
                                !n.is_read ? 'text-ink-900 font-medium' : 'text-ink-500'
                              )}>
                                {n.isi_notifikasi}
                              </p>
                              <p className="text-[10px] text-ink-400 mt-0.5">
                                {formatRelativeTime(n.created_at)}
                              </p>
                            </div>

                            {/* Per-item read button */}
                            {!n.is_read && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                disabled={markingId === n.id}
                                title="Tandai dibaca"
                                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-teal-500 hover:bg-teal-50 hover:text-teal-700 transition-all disabled:opacity-50"
                              >
                                {markingId === n.id
                                  ? <Spinner size={11} />
                                  : <Check size={11} />
                                }
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Panel footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-ink-100/60 bg-ink-50/40">
                        <p className="text-[10px] text-ink-400 text-center">
                          {notifications.length} notifikasi
                          {unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ' · semua sudah dibaca'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── User dropdown ── */}
              <div className="relative" ref={dropRef}>
                <button
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/8 transition-all"
                  onClick={() => setDropOpen(v => !v)}
                >
                  {user?.foto_profil ? (
                    <img className="w-6 h-6 rounded-full object-cover" src={`${UPLOAD_URL}/${user?.foto_profil}`} alt="" />
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
