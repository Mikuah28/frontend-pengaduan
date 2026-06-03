// src/app/dashboard/layout.jsx
'use client'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui'

export default function DashboardRootLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }

    if(user?.role === 'user'){
      router.push('/')
    }

  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={28} />
          <span className="text-xs text-ink-400">Memuat...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
