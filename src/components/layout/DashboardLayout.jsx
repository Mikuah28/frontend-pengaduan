'use client'
// src/components/layout/DashboardLayout.jsx
import Sidebar from './Sidebar'
import { Search, Bell } from 'lucide-react'

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-ink-100/60 px-6 h-14 flex items-center justify-between">
          <div>
            {title && <h1 className="text-sm font-medium text-ink-900">{title}</h1>}
            {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                placeholder="Cari..."
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-ink-100 bg-ink-50 outline-none focus:border-teal-400 w-44 transition-all"
              />
            </div>
            <button className="btn-icon hover:bg-ink-50 text-ink-500 relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-400 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  )
}
