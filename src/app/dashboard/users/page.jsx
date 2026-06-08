'use client'
// src/app/dashboard/users/page.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { RoleBadge, Avatar, Spinner, Modal, ConfirmDialog, PageHeader, Pagination } from '@/components/ui'
import { usersApi, notificationApi } from '@/lib/api'
import { Plus, Trash2, Pencil, Filter, X, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
]

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const isSuperAdmin = currentUser?.role === 'super_admin'

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ role: '', page: 1 })
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })

  const [modal, setModal] = useState({ open: false, mode: 'create', data: null })
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' })
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })

  // --- STATE BARU UNTUK MODAL NOTIFIKASI ---
  const [notiModal, setNotiModal] = useState({ open: false, user: null })
  const [notiForm, setNotiForm] = useState({ isi_notifikasi: '', id_laporan: '', id_komentar: '' })
  const [sendingNoti, setSendingNoti] = useState(false)

  useEffect(() => { loadUsers() }, [filter])

  async function loadUsers() {
    setLoading(true)
    try {
      const params = { limit: 10, page: filter.page }
      if (filter.role) params.role = filter.role
      const res = await usersApi.getAll(params)
      setUsers(res.data.data || [])
      setMeta(res.data.meta || { total: 0, totalPages: 1 })
    } catch {
      setUsers(DEMO_USERS)
      setMeta({ total: DEMO_USERS.length, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setForm({ username: '', email: '', password: '', role: 'user' })
    setModal({ open: true, mode: 'create', data: null })
  }
  const openEdit = (u) => {
    setForm({ username: u.username, email: u.email, password: '', role: u.role?.nama_role || u.role })
    setModal({ open: true, mode: 'edit', data: u })
  }

  // --- HANDLER BARU UNTUK MODAL NOTIFIKASI ---
  const openNotification = (u) => {
    setNotiForm({ isi_notifikasi: '', id_laporan: '', id_komentar: '' })
    setNotiModal({ open: true, user: u })
  }

  const handleSendNotification = async () => {
    if (!notiForm.isi_notifikasi.trim()) {
      return toast.error('Isi notifikasi tidak boleh kosong')
    }

    setSendingNoti(true)
    try {
      const payload = {
        id_user: notiModal.user.id,
        isi_notifikasi: notiForm.isi_notifikasi,
        ...(notiForm.id_laporan && { id_laporan: Number(notiForm.id_laporan) }),
        ...(notiForm.id_komentar && { id_komentar: Number(notiForm.id_komentar) })
      }

      await notificationApi.create(payload)
      toast.success(`Notifikasi berhasil dikirim ke ${notiModal.user.username}`)
      setNotiModal({ open: false, user: null })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal mengirim notifikasi')
    } finally {
      setSendingNoti(false)
    }
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
    <DashboardLayout title="Manajemen Pengguna" subtitle="Kelola semua pengguna yang terdaftar">
      <PageHeader
        title="Pengguna"
        description={`${meta.total} pengguna terdaftar`}
        action={isSuperAdmin && (
          <button className="btn-primary text-xs" onClick={openCreate}>
            <Plus size={14} /> Tambah pengguna
          </button>
        )}
      />

      {/* Filter bar */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={14} className="text-ink-400" />
          <select
            className="form-select w-auto text-xs py-2"
            value={filter.role}
            onChange={e => setFilter(f => ({ ...f, role: e.target.value, page: 1 }))}
          >
            <option value="">Semua role</option>
            {ROLE_OPTIONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          {filter.role && (
            <button
              className="text-xs text-rose-500 flex items-center gap-1 hover:underline"
              onClick={() => setFilter({ role: '', page: 1 })}
            >
              <X size={12} /> Reset
            </button>
          )}

          <span className="text-xs text-ink-400 ml-auto">{meta.total} hasil</span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={22} /></div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Bergabung</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 5 : 4} className="text-center py-10 text-xs text-ink-400">
                        Tidak ada pengguna ditemukan
                      </td>
                    </tr>
                  ) : users.map((u, i) => (
                    <tr key={u.id || i}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.username} size="sm" color={roleColors[i % roleColors.length]} />
                          <span className="text-xs font-medium text-ink-900">{u.username}</span>
                        </div>
                      </td>
                      <td className="text-xs text-ink-500">{u.email}</td>
                      <td><RoleBadge role={u.role?.nama_role || u.role} /></td>
                      <td className="text-[10px] text-ink-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '—'}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {/* TOMBOL BARU: KIRIM NOTIFIKASI */}
                          <button
                            className="btn-icon hover:bg-amber-50 text-amber-500"
                            title="Kirim Notifikasi"
                            onClick={() => openNotification(u)}
                          >
                            <Bell size={13} />
                          </button>
                          {isSuperAdmin && (
                            <>
                              <button
                                className="btn-icon hover:bg-blue-50 text-blue-600"
                                onClick={() => openEdit(u)}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="btn-icon hover:bg-rose-50 text-rose-500"
                                onClick={() => setDeleteDialog({ open: true, id: u.id })}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 p-3 card">
              <span className="text-xs text-ink-400">Halaman {filter.page} dari {meta.totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={filter.page === 1}
                  className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center ${filter.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-ink-50 text-ink-600'}`}
                  onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))}
                >
                  <ChevronLeft size={14} />
                </button>
                <div className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center text-ink-600 font-medium`}>
                  {filter.page}
                </div>
                <button
                  disabled={filter.page === meta.totalPages}
                  className={`w-7 h-7 rounded-lg text-xs transition-all flex justify-center items-center ${filter.page === meta.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-ink-50 text-ink-600'}`}
                  onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit modal */}
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
          <div>
            <label className="form-label">Nama lengkap</label>
            <input className="form-input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">
              Password {modal.mode === 'edit' && <span className="text-ink-400">(kosongkan jika tidak diubah)</span>}
            </label>
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

      {/* --- MODAL BARU: BUAT & KIRIM NOTIFIKASI --- */}
      <Modal
        open={notiModal.open}
        onClose={() => setNotiModal({ open: false, user: null })}
        title={`Kirim Notifikasi ke ${notiModal.user?.username || ''}`}
        footer={<>
          <button className="btn-ghost" onClick={() => setNotiModal({ open: false, user: null })}>Batal</button>
          <button className="btn-primary" onClick={handleSendNotification} disabled={sendingNoti}>
            {sendingNoti && <Spinner size={13} className="text-white" />}
            Kirim Notifikasi
          </button>
        </>}
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="form-label">Isi Notifikasi</label>
            <textarea
              className="form-input min-h-[80px] py-2"
              placeholder="Tulis pesan notifikasi di sini..."
              value={notiForm.isi_notifikasi}
              onChange={e => setNotiForm(f => ({ ...f, isi_notifikasi: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">ID Laporan <span className="text-ink-400">(Opsional)</span></label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 12"
                value={notiForm.id_laporan}
                onChange={e => setNotiForm(f => ({ ...f, id_laporan: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">ID Komentar <span className="text-ink-400">(Opsional)</span></label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 45"
                value={notiForm.id_komentar}
                onChange={e => setNotiForm(f => ({ ...f, id_komentar: e.target.value }))}
              />
            </div>
          </div>
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
  { id: 1, username: 'Budi Santoso', email: 'budi@gmail.com', role: { nama_role: 'user' }, createdAt: '2024-01-15' },
  { id: 2, username: 'Siti Rahayu', email: 'siti@gmail.com', role: { nama_role: 'user' }, createdAt: '2024-02-20' },
  { id: 3, username: 'Ahmad Fauzi', email: 'ahmad@laporan.com', role: { nama_role: 'admin' }, createdAt: '2023-12-01' },
  { id: 4, username: 'Nina Wati', email: 'nina@gmail.com', role: { nama_role: 'user' }, createdAt: '2024-03-10' },
  { id: 5, username: 'Dewi Kurnia', email: 'dewi@gmail.com', role: { nama_role: 'super_admin' }, createdAt: '2024-04-05' },
]