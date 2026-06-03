'use client'
// src/app/dashboard/users/page.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { RoleBadge, Avatar, Spinner, Modal, ConfirmDialog, PageHeader } from '@/components/ui'
import { usersApi } from '@/lib/api'
import { Plus, Trash2, Pencil, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const isSuperAdmin = currentUser?.role === 'super_admin'
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null })
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' })
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await usersApi.getAll()
      setUsers(res.data.data || [])
    } catch {
      setUsers(DEMO_USERS)
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setForm({ username: '', email: '', password: '', role: 'user' })
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
        toast.success('Pengguna berhasil ditambahkan')
      } else {
        const { password, ...rest } = form
        await usersApi.update(modal.data.id, password ? form : rest)
        toast.success('Pengguna berhasil diupdate')
      }
      setModal(m => ({ ...m, open: false }))
      loadUsers()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await usersApi.delete(deleteDialog.id)
      toast.success('Pengguna berhasil dihapus')
      setDeleteDialog({ open: false, id: null })
      loadUsers()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  const roleColors = ['teal', 'blue', 'amber', 'teal', 'blue']

  return (
    <DashboardLayout title="Manajemen Pengguna">
      <PageHeader
        title="Pengguna"
        description={`${users.length} pengguna terdaftar`}
        action={isSuperAdmin && (
          <button className="btn-primary text-xs" onClick={openCreate}>
            <Plus size={14} /> Tambah pengguna
          </button>
        )}
      />

      <div className="card">
        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              className="form-input pl-8 text-xs py-2"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button className="text-xs text-rose-500 flex items-center gap-1" onClick={() => setSearch('')}>
              <X size={12} /> Hapus
            </button>
          )}
          <span className="text-xs text-ink-400 ml-auto">{filtered.length} hasil</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={22} /></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Pengguna</th><th>Email</th><th>Role</th><th>Bergabung</th>{isSuperAdmin && <th>Aksi</th>}</tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id || i}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.username} size="sm" color={roleColors[i % roleColors.length]} />
                        <span className="text-xs font-medium text-ink-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="text-xs text-ink-500">{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td className="text-[10px] text-ink-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '—'}</td>
                    {isSuperAdmin && (
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="btn-icon hover:bg-blue-50 text-blue-600" onClick={() => openEdit(u)}><Pencil size={13} /></button>
                          <button className="btn-icon hover:bg-rose-50 text-rose-500" onClick={() => setDeleteDialog({ open: true, id: u.id })}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        title={modal.mode === 'create' ? 'Tambah pengguna' : 'Edit pengguna'}
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
          {isSuperAdmin && (
            <div>
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus pengguna"
        description="Pengguna ini beserta semua laporannya akan dihapus permanen."
      />
    </DashboardLayout>
  )
}

const DEMO_USERS = [
  { id: 1, username: 'Budi Santoso',  email: 'budi@gmail.com',  role: 'user',  createdAt: '2024-01-15' },
  { id: 2, username: 'Siti Rahayu',   email: 'siti@gmail.com',  role: 'user',  createdAt: '2024-02-20' },
  { id: 3, username: 'Ahmad Fauzi',   email: 'ahmad@laporan.com', role: 'admin', createdAt: '2023-12-01' },
  { id: 4, username: 'Nina Wati',     email: 'nina@gmail.com',  role: 'user',  createdAt: '2024-03-10' },
  { id: 5, username: 'Dewi Kurnia',   email: 'dewi@gmail.com',  role: 'user',  createdAt: '2024-04-05' },
]
