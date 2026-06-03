'use client'
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from 'next/navigation'

export default function dashboardPage() {
    const { user } = useAuth()
    const router = useRouter()
    useEffect(() => {
        if (user?.role === 'user') {
            router.push('/')
        }
        if (user?.role === 'super_admin') {
            router.push('/dashboard/superadmin')
        }
        if (user?.role === 'admin') {
            router.push('/dashboard/admin')
        }

    }, [router])
}
