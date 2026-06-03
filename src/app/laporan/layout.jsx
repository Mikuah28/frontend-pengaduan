'use client'
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from 'next/navigation'

// src/app/laporan/layout.jsx
export default function LaporanLayout({ children }) {
  const { user } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (user?.role !== 'user') {
      router.push('/dashboard')
    }
  }, [router])
  return <>{children}</>
}
