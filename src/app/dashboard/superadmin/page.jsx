'use client'
// src/app/dashboard/superadmin/page.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, RoleBadge, Avatar, Modal, Spinner, ConfirmDialog, PageHeader } from '@/components/ui'
import { usersApi, laporanApi, kategoriApi, superAdminStatsApi } from '@/lib/api'
import { Shield, Users, FileText, CheckCircle, Plus, Pencil, Trash2, Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const ACTIVITY_CHART = [
  { day: 'Sen', laporan: 18, selesai: 12 },
  { day: 'Sel', laporan: 24, selesai: 18 },
  { day: 'Rab', laporan: 15, selesai: 10 },
  { day: 'Kam', laporan: 30, selesai: 22 },
  { day: 'Jum', laporan: 28, selesai: 20 },
  { day: 'Sab', laporan: 12, selesai: 8 },
  { day: 'Min', laporan: 20, selesai: 15 },
]

const PERM = {
  user: ['Buat laporan', 'Komentar', 'Lihat laporan'],
  admin: ['Buat laporan', 'Komentar', 'Lihat laporan', 'Kelola pengguna', 'Ubah status'],
  super_admin: ['Buat laporan', 'Komentar', 'Lihat laporan', 'Kelola pengguna', 'Kelola admin', 'Semua akses'],
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalAdmin: 0, totalLaporan: 248, selesai: 147, totalUser: 5621 })
  const [logs, setLogs] = useState([]);
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null })
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'admin' })
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await usersApi.getAll()
      const all = res.data.data || []
      const adminList = all.filter(u => u.role === 'admin' || u.role === 'super_admin')
      const logData = await superAdminStatsApi.getActivityLog()
      setAdmins(adminList)
      setLogs(logData ? logData.data.data : [])
      setStats(s => ({ ...s, totalAdmin: adminList.length, totalUser: all.filter(u => u.role === 'user').length }))
    } catch {
      setAdmins(DEMO_ADMINS)
      setStats({ totalAdmin: 3, totalLaporan: 1248, selesai: 847, totalUser: 5621 })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setForm({ username: '', email: '', password: '', role: 'admin' })
    setModal({ open: true, mode: 'create', data: null })
  }
  const openEdit = (u) => {
    setForm({ username: u.username, email: u.email, password: '', role: u.role })
    setModal({ open: true, mode: 'edit', data: u })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await usersApi.create(form)
        toast.success('Admin berhasil ditambahkan')
      } else {
        const { password, ...rest } = form
        await usersApi.update(modal.data.id, password ? form : rest)
        toast.success('Admin berhasil diupdate')
      }
      setModal(m => ({ ...m, open: false }))
      loadData()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await usersApi.delete(deleteDialog.id)
      toast.success('Admin berhasil dihapus')
      setDeleteDialog({ open: false, id: null })
      loadData()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  const timeAgo = (date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale }) }
    catch { return '—' }
  }

  return (
    <DashboardLayout title="Dasbor Super Admin" subtitle="Kelola seluruh sistem AduLink">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Shield} label="Total admin" value={stats.totalAdmin} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard icon={FileText} label="Total laporan" value={stats.totalLaporan} change="12% bulan ini" iconBg="bg-teal-50" iconColor="text-teal-600" />
        <StatCard icon={CheckCircle} label="Laporan selesai" value={stats.selesai} change="94% tingkat selesai" iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard icon={Users} label="Total pengguna" value={stats.totalUser} change="128 bulan ini" iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Chart + Permissions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-ink-900">Aktivitas laporan (7 hari terakhir)</h3>
            <div className="flex items-center gap-3 text-xs text-ink-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-teal-400 inline-block" />Masuk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />Selesai</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={ACTIVITY_CHART}>
              <defs>
                <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#378ADD" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#378ADD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#888780' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '0.5px solid #D3D1C7', boxShadow: 'none' }} />
              <Area type="monotone" dataKey="laporan" stroke="#1D9E75" strokeWidth={2} fill="url(#gTeal)" dot={false} />
              <Area type="monotone" dataKey="selesai" stroke="#378ADD" strokeWidth={2} fill="url(#gBlue)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Permissions */}
        <div className="card">
          <h3 className="text-sm font-medium text-ink-900 mb-4">Hak akses per role</h3>
          <div className="flex flex-col gap-4">
            {(['user', 'admin', 'super_admin']).map(role => (
              <div key={role}>
                <div className="flex items-center gap-2 mb-2"><RoleBadge role={role} /></div>
                <div className="flex flex-col gap-1">
                  {PERM[role].map(p => (
                    <div key={p} className="flex items-center gap-1.5 text-xs text-ink-600">
                      <CheckCircle size={11} className="text-teal-400 shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin management */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-ink-900">Manajemen admin</h3>
            <p className="text-xs text-ink-400 mt-0.5">Kelola akun admin dan super admin</p>
          </div>
          <button className="btn-primary text-xs" onClick={openCreate}>
            <Plus size={14} /> Tambah admin
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama</th><th>Email</th><th>Role</th><th>Laporan dikelola</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((u, i) => (
                  <tr key={u.id || i}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.username} size="sm" color={i % 2 === 0 ? 'teal' : 'blue'} />
                        <span className="font-medium text-xs">{u.username}</span>
                      </div>
                    </td>
                    <td className="text-xs text-ink-500">{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td className="text-xs text-ink-700">{Math.floor(Math.random() * 150) + 20}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-icon hover:bg-blue-50 text-blue-600 text-xs" onClick={() => openEdit(u)}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn-icon hover:bg-rose-50 text-rose-500 text-xs" onClick={() => setDeleteDialog({ open: true, id: u.id })}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity log */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-ink-900">Log aktivitas sistem</h3>
          <Activity size={14} className="text-ink-400" />
        </div>
        <div className="flex flex-col gap-0">
          {logs.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-ink-50 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 bg-teal-400`} />
              <div className="flex-1 text-xs text-ink-700" dangerouslySetInnerHTML={{ __html: a.activity }} />
              <span className="text-[10px] text-ink-400 shrink-0">{timeAgo(a?.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal create/edit admin */}
      <Modal
        open={modal.open}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        title={modal.mode === 'create' ? 'Tambah admin baru' : 'Edit admin'}
        footer={<>
          <button className="btn-ghost" onClick={() => setModal(m => ({ ...m, open: false }))}>Batal</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving && <Spinner size={13} className="text-white" />}
            {modal.mode === 'create' ? 'Tambah' : 'Simpan'}
          </button>
        </>}
      >
        <div className="flex flex-col gap-3">
          <div><label className="form-label">Nama lengkap</label><input className="form-input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
          <div><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div>
            <label className="form-label">Password {modal.mode === 'edit' && <span className="text-ink-400">(kosongkan jika tidak diubah)</span>}</label>
            <input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus admin"
        description="Apakah Anda yakin ingin menghapus admin ini? Tindakan ini tidak dapat dibatalkan."
      />
    </DashboardLayout>
  )
}

const DEMO_ADMINS = [
  { id: 1, username: 'Ahmad Fauzi', email: 'ahmad@laporan.com', role: 'admin' },
  { id: 2, username: 'Rini Susanti', email: 'rini@laporan.com', role: 'admin' },
  { id: 3, username: 'Hendra G.', email: 'hendra@laporan.com', role: 'admin' },
]
const ACTIVITY_LOG = [
  { color: 'bg-teal-400', text: 'Admin <b>Ahmad Fauzi</b> menyelesaikan laporan #1248', time: '2 mnt lalu' },
  { color: 'bg-blue-400', text: 'Pengguna baru terdaftar: <b>Siti Nurhaliza</b>', time: '15 mnt lalu' },
  { color: 'bg-amber-400', text: 'Admin <b>Rini Susanti</b> mengubah status laporan #1245', time: '32 mnt lalu' },
  { color: 'bg-rose-400', text: 'Laporan #1231 ditolak oleh admin <b>Hendra</b>', time: '1 jam lalu' },
  { color: 'bg-teal-400', text: 'Kategori baru <b>Banjir & Genangan</b> ditambahkan', time: '3 jam lalu' },
]
