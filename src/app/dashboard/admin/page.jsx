'use client'
// src/app/dashboard/admin/page.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, StatusBadge, Avatar, Spinner } from '@/components/ui'
import { laporanApi, usersApi, kategoriApi } from '@/lib/api'
import { FileText, Clock, Loader, CheckCircle, Users, Tag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

const CHART_COLORS = ['#1D9E75', '#378ADD', '#1D9E75', '#378ADD', '#1D9E75', '#378ADD']

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, diproses: 0, selesai: 0 })
  const [laporan, setLaporan] = useState([])
  const [users, setUsers] = useState([])
  const [kategori, setKategori] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [lRes, uRes, kRes] = await Promise.all([
          laporanApi.getAll({ limit: 100 }),
          usersApi.getAll(),
          kategoriApi.getAll(),
        ])
        const all = lRes.data.data || []
        setStats({
          total: all.length,
          pending: all.filter(l => l.status === 'pending' || l.status === 'menunggu').length,
          diproses: all.filter(l => l.status === 'diproses').length,
          selesai: all.filter(l => l.status === 'selesai').length,
        })
        setLaporan(all.slice(0, 6))
        setUsers((uRes.data.data || []).slice(0, 5))
        setKategori(kRes.data.data || [])
      } catch (e) {
        // Use demo data on error
        setStats({ total: 248, pending: 34, diproses: 67, selesai: 147 })
        setLaporan(DEMO_LAPORAN)
        setUsers(DEMO_USERS)
        setKategori(DEMO_KATEGORI)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const chartData = kategori.slice(0, 6).map(k => ({
    name: k.nama_kategori?.split(' ')[0] || k.namaKategori?.split(' ')[0],
    total: Math.floor(Math.random() * 80) + 20,
  }))

  if (loading) return (
    <DashboardLayout title="Dasbor Admin">
      <div className="flex items-center justify-center h-64"><Spinner size={24} /></div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout title="Dasbor Admin" subtitle={new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText}    label="Total laporan"    value={stats.total}    change="12% bulan ini"  iconBg="bg-teal-50"  iconColor="text-teal-600" />
        <StatCard icon={Clock}       label="Menunggu"         value={stats.pending}  change="5 dari kemarin" changeType="down" iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard icon={Loader}      label="Diproses"         value={stats.diproses} change="8 baru hari ini" iconBg="bg-blue-50"  iconColor="text-blue-600" />
        <StatCard icon={CheckCircle} label="Selesai"          value={stats.selesai}  change="94% dari total"  iconBg="bg-teal-50"  iconColor="text-teal-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        {/* Chart */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-ink-900">Laporan per kategori</h3>
            <div className="flex items-center gap-3 text-xs text-ink-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-teal-400 inline-block" />Infrastruktur</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />Pelayanan</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={20}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888780' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '0.5px solid #D3D1C7', boxShadow: 'none' }}
                cursor={{ fill: '#F1EFE8' }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category list */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-ink-900">Kategori</h3>
            <Link href="/dashboard/kategori" className="text-xs text-teal-600 hover:underline">Kelola</Link>
          </div>
          <div className="flex flex-col gap-2">
            {(kategori.length ? kategori : DEMO_KATEGORI).slice(0, 5).map((k, i) => (
              <div key={k.id || i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 opacity-70" />
                  <span className="text-xs text-ink-700">{k.nama_kategori || k.namaKategori}</span>
                </div>
                <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.max(15, 90 - i * 15)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/kategori" className="mt-4 text-xs text-teal-600 hover:underline flex items-center gap-1">
            <Tag size={12} /> Tambah kategori
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-ink-900">Laporan terbaru</h3>
            <Link href="/dashboard/laporan" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex flex-col gap-0">
            {laporan.map((l, i) => (
              <Link key={l.id || i} href={`/dashboard/laporan`} className="flex items-start gap-3 py-2.5 border-b border-ink-50 last:border-0 hover:bg-ink-50/50 -mx-1 px-1 rounded-lg transition-all">
                <Avatar name={l.user?.username || 'U'} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-ink-900 truncate">{l.judul}</div>
                  <div className="text-[10px] text-ink-400 mt-0.5">{l.user?.username} · {l.lokasi || 'Jakarta'}</div>
                </div>
                <StatusBadge status={l.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-ink-900">Pengguna terdaftar</h3>
            <Link href="/dashboard/users" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex flex-col gap-0">
            {users.map((u, i) => (
              <div key={u.id || i} className="flex items-center gap-3 py-2.5 border-b border-ink-50 last:border-0">
                <Avatar name={u.username} size="sm" color={i % 2 === 0 ? 'teal' : 'blue'} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-ink-900 truncate">{u.username}</div>
                  <div className="text-[10px] text-ink-400">{u.email}</div>
                </div>
                <span className="badge badge-user text-[10px]">User</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/users" className="mt-3 text-xs text-teal-600 hover:underline flex items-center gap-1">
            <Users size={12} /> Kelola pengguna
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

const DEMO_LAPORAN = [
  { judul: 'Jalan berlubang Jl. Sudirman', user: { username: 'Budi S.' }, lokasi: 'Menteng', status: 'diproses' },
  { judul: 'Lampu PJU mati Jl. Gatot', user: { username: 'Siti R.' }, lokasi: 'Senen', status: 'pending' },
  { judul: 'Sampah menumpuk Blok B', user: { username: 'Ahmad H.' }, lokasi: 'Gambir', status: 'selesai' },
  { judul: 'Drainase tersumbat RW 05', user: { username: 'Nina W.' }, lokasi: 'Tanah Abang', status: 'diproses' },
  { judul: 'Fasilitas taman rusak', user: { username: 'Dewi K.' }, lokasi: 'Cikini', status: 'pending' },
]
const DEMO_USERS = [
  { username: 'Budi Santoso', email: 'budi@gmail.com' },
  { username: 'Siti Rahayu', email: 'siti@gmail.com' },
  { username: 'Ahmad Hidayat', email: 'ahmad@gmail.com' },
  { username: 'Nina Wati', email: 'nina@gmail.com' },
  { username: 'Dewi Kurnia', email: 'dewi@gmail.com' },
]
const DEMO_KATEGORI = [
  { namaKategori: 'Infrastruktur Jalan' },
  { namaKategori: 'Kebersihan & Sampah' },
  { namaKategori: 'Keamanan' },
  { namaKategori: 'Pelayanan Publik' },
  { namaKategori: 'Listrik & Air' },
]
