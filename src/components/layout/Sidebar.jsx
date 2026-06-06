'use client'
// src/components/layout/Sidebar.jsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, FileText, Users, Tag, MessageSquare,
  LogOut, ChevronRight, Flag, Shield, Bell
} from 'lucide-react'
import clsx from 'clsx'

const adminNav = [
  { label: 'Dasbor', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Laporan', href: '/dashboard/laporan', icon: FileText },
  { label: 'Komentar', href: '/dashboard/komentar', icon: MessageSquare },
  { label: 'Pengguna', href: '/dashboard/users', icon: Users },
  { label: 'Kategori', href: '/dashboard/kategori', icon: Tag },
]

const superNav = [
  { label: 'Dasbor', href: '/dashboard/superadmin', icon: LayoutDashboard },
  { label: 'Laporan', href: '/dashboard/laporan', icon: FileText },
  { label: 'Komentar', href: '/dashboard/komentar', icon: MessageSquare },
  { label: 'Pengguna', href: '/dashboard/users', icon: Users },
  { label: 'Kategori', href: '/dashboard/kategori', icon: Tag },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const isSuperAdmin = user?.role === 'super_admin'
  const navItems = isSuperAdmin ? superNav : adminNav

  const initials = user?.username
    ? user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-ink-100/60 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-ink-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center">
            <Flag size={16} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-base text-ink-900 leading-none">AduLink</div>
            <div className="text-[10px] text-ink-400 mt-0.5">
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-ink-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-xs font-medium text-teal-800">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-ink-900 truncate">{user?.username || 'Pengguna'}</div>
            <div className={clsx('text-[10px]', isSuperAdmin ? 'text-purple-600' : 'text-blue-600')}>
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </div>
          </div>
          <Bell size={14} className="text-ink-400 shrink-0" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
        <div className="text-[10px] font-medium text-ink-400 uppercase tracking-wider px-3 mb-1">Menu</div>
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx('sidebar-item group', pathname === href && 'active')}
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {pathname === href && <ChevronRight size={12} className="opacity-40" />}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-ink-100/60">
        <button
          onClick={logout}
          className="sidebar-item w-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
